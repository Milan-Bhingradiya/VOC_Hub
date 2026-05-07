from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from db.database import SessionLocal
from db.models import (
    FeedbackProcessed, FeedbackRaw, Theme, ThemeItem, Opportunity, ThemeWeeklyCount
)

SOURCE_WEIGHTS = {
    "sales_call_note":  1.0,
    "support_ticket":   0.9,
    "crm_note":         0.85,
    "installer_report": 0.8,
    "email":            0.75,
    "survey":           0.65,
    "chat_message":     0.5,
    "unknown":          0.6,
}

BUG_LIKE_BUCKETS = {"bug_report", "process_complaint"}

FEATURE_LIKE_BUCKETS = {
    "feature_request",
    "usability_complaint",
    "pricing_commercial",
    "competitive_mention",
    "praise"
}


def _priority_label(score: float, intent_bucket: str) -> str:
    """
    Convert final score to human-readable priority label.
    Bugs use stricter thresholds since they block customers.
    """
    if intent_bucket in BUG_LIKE_BUCKETS:
        if score >= 0.75: return "Critical"
        if score >= 0.50: return "High"
        if score >= 0.25: return "Medium"
        return "Low"
    else:
        if score >= 0.70: return "High"
        if score >= 0.40: return "Medium"
        return "Low"


def _normalize(values: list[float]) -> list[float]:
    """
    Min-max normalize a list of floats to 0.0–1.0.
    If all values are equal (including all zero), return list of 0.0s.
    """
    min_val = min(values)
    max_val = max(values)
    if max_val == min_val:
        return [0.0] * len(values)
    return [(v - min_val) / (max_val - min_val) for v in values]


def _compute_velocity(theme_id: int, db: Session) -> float:
    """
    Computes week-over-week growth rate for a theme.

    velocity = (freq_last_4_weeks - freq_prev_4_weeks) / max(freq_prev_4_weeks, 1)

    Windows (relative to this Monday):
      last_4_weeks : weeks -1 through -4  (most recent completed weeks)
      prev_4_weeks : weeks -5 through -8  (baseline window before that)

    Returns 0.0 if the theme has fewer than 2 weeks of data — not enough
    history to compute a meaningful trend.

    Capped at 3.0 to prevent a single spike week from dominating normalization
    across all themes. Floor at -1.0 (complete drop-off).

    Examples:
      prev=4, last=8  → velocity = 1.0   (doubled, flagged as Rising)
      prev=2, last=40 → velocity = 3.0   (capped, flagged as Rising)
      prev=10, last=5 → velocity = -0.5  (declining)
      prev=0, last=5  → velocity = 0.0   (brand new theme, no baseline)
    """
    today = date.today()
    this_monday = today - timedelta(days=today.weekday())

    rows = db.execute(
        select(ThemeWeeklyCount.week_start, ThemeWeeklyCount.count)
        .where(ThemeWeeklyCount.theme_id == theme_id)
        .order_by(ThemeWeeklyCount.week_start.desc())
    ).all()

    if not rows or len(rows) < 2:
        return 0.0

    week_map = {r.week_start: r.count for r in rows}

    # last 4 completed weeks (week -1 = last week, week -4 = 4 weeks ago)
    last_4 = sum(
        week_map.get(this_monday - timedelta(weeks=i), 0)
        for i in range(1, 5)
    )
    # 4 weeks before that (weeks -5 through -8)
    prev_4 = sum(
        week_map.get(this_monday - timedelta(weeks=i), 0)
        for i in range(5, 9)
    )

    if prev_4 == 0:
        # No prior baseline — theme either brand new or all data in recent window
        return 0.0

    velocity = (last_4 - prev_4) / prev_4
    return round(min(3.0, max(-1.0, velocity)), 4)


def _aggregate_theme_signals(theme: Theme, db: Session) -> dict | None:
    """
    For a given theme, pull all linked feedback items and
    aggregate signals needed for scoring.
    Returns None if no feedback rows found.
    """
    feedback_ids = db.execute(
        select(ThemeItem.feedback_id).where(ThemeItem.theme_id == theme.id)
    ).scalars().all()

    if not feedback_ids:
        return None

    rows = db.execute(
        select(
            FeedbackProcessed.sentiment_score,
            FeedbackProcessed.urgency_keyword_score,
            FeedbackProcessed.arr,
            FeedbackRaw.source
        )
        .join(FeedbackRaw, FeedbackProcessed.feedback_id == FeedbackRaw.id)
        .where(FeedbackProcessed.feedback_id.in_(feedback_ids))
    ).all()

    if not rows:
        return None

    sentiments = [r.sentiment_score or 0.0 for r in rows]
    urgencies  = [r.urgency_keyword_score or 0.0 for r in rows]
    arrs       = [r.arr or 0.0 for r in rows]
    weights    = [SOURCE_WEIGHTS.get(r.source, 0.6) for r in rows]

    # Invert normalized sentiment so that negative feedback = higher urgency signal
    sentiment_urgency = sum((1.0 - ((s + 1.0) / 2.0)) for s in sentiments) / len(sentiments)

    return {
        "frequency":         len(rows),
        "total_arr":         sum(arrs),
        "avg_sentiment":     sum(sentiments) / len(sentiments),
        "avg_urgency":       sum(urgencies) / len(urgencies),
        "avg_source_weight": sum(weights) / len(weights),
        "sentiment_urgency": sentiment_urgency,
    }


def _score_bug(signals: dict, normalized: dict) -> float:
    """
    Bug scoring formula (no RAG modifier):
    raw_score = (0.30 × freq) + (0.30 × revenue) +
                (0.20 × sentiment_urgency) + (0.20 × keyword_urgency)
    """
    return (
        0.30 * normalized["freq_score"] +
        0.30 * normalized["revenue_score"] +
        0.20 * normalized["sentiment_urgency_score"] +
        0.20 * normalized["urgency_score"]
    )


def _score_feature(signals: dict, normalized: dict) -> float:
    """
    Feature scoring formula with gap multiplier.

    raw_score = (0.25 × freq) + (0.25 × revenue) + (0.15 × sentiment_urgency)
              + (0.10 × keyword_urgency) + (0.15 × velocity) + (0.10 × source_weight)

    gap_multiplier = 1.0 + (1.0 - alignment_score) × 0.5
    final_score    = min(1.0, raw_score × gap_multiplier)

    alignment_score defaults to 0.5 (neutral) until the RAG stage runs.
    gap_multiplier at 0.5 alignment = 1.25 — slight boost for unverified features.
    RAG stage will overwrite alignment_score on the opportunity row with real values.
    """
    raw_score = (
        0.25 * normalized["freq_score"] +
        0.25 * normalized["revenue_score"] +
        0.15 * normalized["sentiment_urgency_score"] +
        0.10 * normalized["urgency_score"] +
        0.15 * normalized["velocity_score"] +
        0.10 * normalized["source_weight_score"]
    )

    alignment_score = 0.5  # placeholder until RAG overwrites
    gap_multiplier = 1.0 + (1.0 - alignment_score) * 0.5

    return min(1.0, raw_score * gap_multiplier)


def run_scoring_pipeline():
    """
    Main entry point. Called after clustering completes.

    For each intent bucket:
      1. Pull all themes in that bucket
      2. Aggregate signals per theme
      3. Compute velocity per theme from ThemeWeeklyCount
      4. Normalize all signals within bucket (scores comparable within bucket only)
      5. Compute final score per theme
      6. Write to opportunities table
    """
    db = SessionLocal()
    try:
        print("[SCORING] Starting scoring pipeline...")
        db.execute(delete(Opportunity))
        db.commit()
        print("[SCORING] Cleared existing opportunities.")

        all_buckets = list(BUG_LIKE_BUCKETS | FEATURE_LIKE_BUCKETS)

        for bucket in all_buckets:
            themes = db.execute(
                select(Theme).where(Theme.intent_bucket == bucket)
            ).scalars().all()

            if not themes:
                print(f"[SCORING] No themes found for {bucket}, skipping.")
                continue

            print(f"[SCORING] Scoring {len(themes)} themes in bucket: {bucket}")

            theme_signals = []
            for theme in themes:
                signals = _aggregate_theme_signals(theme, db)
                if signals:
                    theme_signals.append((theme, signals))

            if not theme_signals:
                continue

            # Compute real velocity for every theme in this bucket
            velocity_vals = [_compute_velocity(theme.id, db) for theme, _ in theme_signals]

            freq_vals      = [s["frequency"]         for _, s in theme_signals]
            revenue_vals   = [s["total_arr"]          for _, s in theme_signals]
            sent_urg_vals  = [s["sentiment_urgency"]  for _, s in theme_signals]
            urgency_vals   = [s["avg_urgency"]        for _, s in theme_signals]
            source_wt_vals = [s["avg_source_weight"]  for _, s in theme_signals]

            freq_norm      = _normalize(freq_vals)
            revenue_norm   = _normalize(revenue_vals)
            sent_urg_norm  = _normalize(sent_urg_vals)
            urgency_norm   = _normalize(urgency_vals)
            source_wt_norm = _normalize(source_wt_vals)
            velocity_norm  = _normalize(velocity_vals)

            for i, (theme, signals) in enumerate(theme_signals):
                normalized = {
                    "freq_score":              freq_norm[i],
                    "revenue_score":           revenue_norm[i],
                    "sentiment_urgency_score": sent_urg_norm[i],
                    "urgency_score":           urgency_norm[i],
                    "source_weight_score":     source_wt_norm[i],
                    "velocity_score":          velocity_norm[i],
                }

                if bucket in BUG_LIKE_BUCKETS:
                    final_score = _score_bug(signals, normalized)
                else:
                    final_score = _score_feature(signals, normalized)

                final_score = round(final_score, 4)
                raw_velocity = velocity_vals[i]

                opportunity = Opportunity(
                    theme_id=theme.id,
                    intent_bucket=bucket,
                    frequency=signals["frequency"],
                    total_arr=round(signals["total_arr"], 2),
                    avg_sentiment=round(signals["avg_sentiment"], 3),
                    avg_urgency=round(signals["avg_urgency"], 3),
                    avg_source_weight=round(signals["avg_source_weight"], 3),
                    velocity=raw_velocity,          # real value, not 0.0
                    alignment_score=None,           # RAG stage overwrites this
                    alignment_reason=None,
                    opportunity_score=final_score,
                    priority_label=_priority_label(final_score, bucket),
                    updated_at=date.today()
                )
                db.add(opportunity)

            db.commit()
            print(f"[SCORING] {bucket} — {len(theme_signals)} opportunities written.")

        print("[SCORING] Scoring pipeline complete.")

    except Exception as e:
        db.rollback()
        print(f"[SCORING] Fatal error: {str(e)}")
        raise
    finally:
        db.close()