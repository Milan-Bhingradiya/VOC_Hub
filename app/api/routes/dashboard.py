import uuid
import random
from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import and_, case, extract, func, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    FeedbackProcessed, FeedbackRaw, Opportunity, Theme, ThemeWeeklyCount, ThemeItem
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])
BUG_BUCKETS         = {"bug_report", "process_complaint"}
FEATURE_BUCKETS     = {"feature_request"}
PAIN_POINT_BUCKETS  = {"bug_report", "usability_complaint", "process_complaint"}

MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec']


def _sentiment_label(score: float | None) -> str:
    if score is None:
        return "Neutral"
    if score > 0.1:
        return "Positive"
    if score < -0.1:
        return "Negative"
    return "Neutral"


def _alignment_status(score: float | None) -> str:
    """
    Map RAG alignment_score → human-readable roadmap status.
    These labels intentionally match what the RAG stage will write
    so the frontend gets consistent strings before and after RAG runs.
    """
    if score is None:
        return "Unreviewed"
    if score > 0.7:
        return "In Progress"
    if score > 0.3:
        return "Planned"
    return "Backlog"


@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    """
    Returns everything the Overview page needs in one call:
      - 4 KPI cards
      - Monthly feedback + sentiment trend (last 6 months)
      - Sentiment distribution (donut)
      - Categorical breakdown table (per intent bucket)
    """

    total_feedback = (
        db.execute(select(func.count()).select_from(FeedbackRaw)).scalar() or 0
    )
    total_processed = (
        db.execute(select(func.count()).select_from(FeedbackProcessed)).scalar() or 0
    )
    positive_count = (
        db.execute(
            select(func.count())
            .select_from(FeedbackProcessed)
            .where(FeedbackProcessed.sentiment_score > 0.2)
        ).scalar() or 0
    )
    positive_sentiment_pct = round(
        (positive_count / total_processed * 100) if total_processed > 0 else 0.0, 1
    )
    active_issues = (
        db.execute(
            select(func.count())
            .select_from(Opportunity)
            .where(Opportunity.intent_bucket.in_(BUG_BUCKETS))
        ).scalar() or 0
    )
    feature_requests_count = (
        db.execute(
            select(func.count())
            .select_from(Opportunity)
            .where(Opportunity.intent_bucket.in_(FEATURE_BUCKETS))
        ).scalar() or 0
    )

    six_months_ago = date.today().replace(day=1) - timedelta(days=150)

    monthly_rows = db.execute(
        select(
            extract("year",  FeedbackRaw.date).label("year"),
            extract("month", FeedbackRaw.date).label("month"),
            func.count().label("count"),
            func.avg(FeedbackProcessed.sentiment_score).label("avg_sentiment"),
        )
        .join(FeedbackProcessed, FeedbackProcessed.feedback_id == FeedbackRaw.id, isouter=True)
        .where(FeedbackRaw.date >= six_months_ago)
        .group_by("year", "month")
        .order_by("year", "month")
    ).all()

    monthly_trend = [
        {
            "month":     MONTH_NAMES[int(r.month) - 1],
            "feedback":  r.count,
            # Sentiment scaled to 0–100 for dual-axis chart readability
            "sentiment": round(((r.avg_sentiment or 0.0) + 1.0) / 2.0 * 100, 1),
        }
        for r in monthly_rows
    ]

    dist = db.execute(
        select(
            func.count(case((FeedbackProcessed.sentiment_score >  0.2, 1))).label("positive"),
            func.count(case((FeedbackProcessed.sentiment_score < -0.2, 1))).label("negative"),
            func.count(case((
                and_(
                    FeedbackProcessed.sentiment_score >= -0.2,
                    FeedbackProcessed.sentiment_score <=  0.2,
                ),
                1,
            ))).label("neutral"),
        ).select_from(FeedbackProcessed)
    ).one()

    sentiment_distribution = {
        "positive": dist.positive or 0,
        "negative": dist.negative or 0,
        "neutral":  dist.neutral  or 0,
    }

    cat_rows = db.execute(
        select(
            Opportunity.intent_bucket,
            func.sum(Opportunity.frequency).label("count"),
            func.avg(Opportunity.avg_sentiment).label("avg_sentiment"),
        )
        .group_by(Opportunity.intent_bucket)
        .order_by(func.sum(Opportunity.frequency).desc())
    ).all()

    categorical_breakdown = [
        {
            "category":  r.intent_bucket.replace("_", " ").title(),
            "count":     int(r.count or 0),
            "sentiment": _sentiment_label(r.avg_sentiment),
            "change":    None,
        }
        for r in cat_rows
    ]

    return {
        "kpis": {
            "total_feedback":        total_feedback,
            "positive_sentiment_pct": positive_sentiment_pct,
            "active_issues":         active_issues,
            "feature_requests":      feature_requests_count,
        },
        "monthly_trend":        monthly_trend,
        "sentiment_distribution": sentiment_distribution,
        "categorical_breakdown": categorical_breakdown,
    }

@router.get("/pain-points")
def get_pain_points(db: Session = Depends(get_db)):
    """
    Returns everything the Pain Points page needs:
      - 4 KPI cards
      - Bar chart: pain points by theme (top 6)
      - Donut: top categories
      - Multi-series trend chart: top 3 themes week-over-week (last 8 weeks)
      - Issue inventory table (top 20)
    """

    pain_opps = db.execute(
        select(Opportunity)
        .where(Opportunity.intent_bucket.in_(PAIN_POINT_BUCKETS))
    ).scalars().all()

    total_pain_points = sum(o.frequency   for o in pain_opps)
    critical_issues   = sum(1             for o in pain_opps if o.priority_label == "Critical")
    total_arr_pain    = sum(o.total_arr   for o in pain_opps)

    total_arr_all = (
        db.execute(select(func.sum(FeedbackProcessed.arr))).scalar() or 1.0
    )
    customer_impact_pct = round((total_arr_pain / total_arr_all) * 100, 1)

    top_theme_rows = db.execute(
        select(
            Theme.name,
            Opportunity.frequency,
            Opportunity.priority_label,
            Opportunity.opportunity_score,
        )
        .join(Opportunity, Opportunity.theme_id == Theme.id)
        .where(Opportunity.intent_bucket.in_(PAIN_POINT_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(6)
    ).all()

    pain_by_category = [
        {
            "category": r.name,
            "count":    r.frequency,
            "priority": r.priority_label,
        }
        for r in top_theme_rows
    ]

    eight_weeks_ago = date.today() - timedelta(weeks=8)

    top_3_ids = db.execute(
        select(Opportunity.theme_id)
        .join(Theme, Theme.id == Opportunity.theme_id)
        .where(Opportunity.intent_bucket.in_(PAIN_POINT_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(3)
    ).scalars().all()

    id_to_name: dict[int, str] = {}
    if top_3_ids:
        id_to_name = {
            r.id: r.name
            for r in db.execute(
                select(Theme.id, Theme.name).where(Theme.id.in_(top_3_ids))
            ).all()
        }

    trend_map: dict = defaultdict(dict)
    if top_3_ids:
        for r in db.execute(
            select(
                ThemeWeeklyCount.theme_id,
                ThemeWeeklyCount.week_start,
                ThemeWeeklyCount.count,
            )
            .where(ThemeWeeklyCount.theme_id.in_(top_3_ids))
            .where(ThemeWeeklyCount.week_start >= eight_weeks_ago)
            .order_by(ThemeWeeklyCount.week_start)
        ).all():
            label = id_to_name.get(r.theme_id, f"Theme {r.theme_id}")
            trend_map[r.week_start][label] = r.count

    pain_trend = [
        {"week": str(week), **counts}
        for week, counts in sorted(trend_map.items())
    ]

    table_rows = db.execute(
        select(
            Theme.name,
            Opportunity.intent_bucket,
            Opportunity.priority_label,
            Opportunity.frequency,
            Opportunity.total_arr,
            Opportunity.opportunity_score,
        )
        .join(Theme, Theme.id == Opportunity.theme_id)
        .where(Opportunity.intent_bucket.in_(PAIN_POINT_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(20)
    ).all()

    top_pain_points = [
        {
            "issue":      r.name,
            "category":   r.intent_bucket.replace("_", " ").title(),
            "priority":   r.priority_label,
            "mentions":   r.frequency,
            "arr_at_risk": round(r.total_arr, 0),
        }
        for r in table_rows
    ]

    return {
        "kpis": {
            "total_pain_points":  total_pain_points,
            "critical_issues":    critical_issues,
            "avg_resolution_time": None,
            "customer_impact_pct": customer_impact_pct,
        },
        "pain_by_category": pain_by_category,
        "pain_trend":       pain_trend,
        "top_pain_points":  top_pain_points,
    }


@router.get("/features")
def get_features(db: Session = Depends(get_db)):
    """
    Returns everything the Features page needs:
      - 4 KPI cards
      - Monthly bar chart: feature request volume (last 6 months)
      - Top feature requests table (top 20 by opportunity score)
    """

    feature_opps = db.execute(
        select(Opportunity)
        .where(Opportunity.intent_bucket.in_(FEATURE_BUCKETS))
    ).scalars().all()

    total_requests = sum(o.frequency for o in feature_opps)
    high_priority  = sum(1 for o in feature_opps if o.priority_label == "High")
    in_development = sum(
        1 for o in feature_opps
        if o.alignment_score is not None and o.alignment_score > 0.7
    )

    six_months_ago = date.today() - timedelta(days=180)

    feature_theme_ids = [o.theme_id for o in feature_opps]

    monthly_trend_rows = []
    if feature_theme_ids:
        monthly_trend_rows = db.execute(
            select(
                extract("year",  ThemeWeeklyCount.week_start).label("year"),
                extract("month", ThemeWeeklyCount.week_start).label("month"),
                func.sum(ThemeWeeklyCount.count).label("count"),
            )
            .where(ThemeWeeklyCount.theme_id.in_(feature_theme_ids))
            .where(ThemeWeeklyCount.week_start >= six_months_ago)
            .group_by("year", "month")
            .order_by("year", "month")
        ).all()

    feature_trend = [
        {
            "month":    MONTH_NAMES[int(r.month) - 1],
            "requests": int(r.count or 0),
            "priority": 0,
            "planned":  0,
        }
        for r in monthly_trend_rows
    ]

    top_rows = db.execute(
        select(
            Theme.name,
            Theme.keywords,
            Opportunity.frequency,
            Opportunity.priority_label,
            Opportunity.alignment_score,
            Opportunity.alignment_reason,
            Opportunity.opportunity_score,
            Opportunity.total_arr,
        )
        .join(Theme, Theme.id == Opportunity.theme_id)
        .where(Opportunity.intent_bucket.in_(FEATURE_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(20)
    ).all()

    top_feature_requests = [
        {
            "feature":           r.name,
            "votes":             r.frequency,
            "status":            _alignment_status(r.alignment_score),
            "category":          (
                r.keywords[0].replace("_", " ").title()
                if r.keywords else "General"
            ),
            "arr_demand":        round(r.total_arr, 0),
            "priority":          r.priority_label,
            "opportunity_score": r.opportunity_score,
            "alignment_reason":  r.alignment_reason,
        }
        for r in top_rows
    ]

    return {
        "kpis": {
            "feature_requests": total_requests,
            "high_priority":    high_priority,
            "in_development":   in_development,
            "community_votes":  total_requests,
        },
        "feature_trend":       feature_trend,
        "top_feature_requests": top_feature_requests,
    }


@router.get("/bugs")
def get_bugs(db: Session = Depends(get_db)):
    """
    Returns everything the Bugs page needs:
      - 4 KPI cards
      - Line chart: weekly bug volume trend (last 8 weeks, top 5 themes aggregated)
      - Bar chart: bugs by severity
      - Open issues table (top 20)
    """

    bug_opps = db.execute(
        select(Opportunity)
        .where(Opportunity.intent_bucket.in_(BUG_BUCKETS))
    ).scalars().all()

    total_bugs  = sum(o.frequency for o in bug_opps)
    open_issues = len(bug_opps)   # treated as open until closed-loop tracking exists

    severity_counts: dict[str, int] = defaultdict(int)
    for o in bug_opps:
        severity_counts[o.priority_label] += 1

    bugs_by_severity = [
        {"severity": label, "count": severity_counts.get(label, 0)}
        for label in ["Critical", "High", "Medium", "Low"]
    ]

    eight_weeks_ago = date.today() - timedelta(weeks=8)

    top_bug_ids = db.execute(
        select(Opportunity.theme_id)
        .join(Theme, Theme.id == Opportunity.theme_id)
        .where(Opportunity.intent_bucket.in_(BUG_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(5)
    ).scalars().all()

    resolution_trend = []
    if top_bug_ids:
        weekly_agg = db.execute(
            select(
                ThemeWeeklyCount.week_start,
                func.sum(ThemeWeeklyCount.count).label("open"),
            )
            .where(ThemeWeeklyCount.theme_id.in_(top_bug_ids))
            .where(ThemeWeeklyCount.week_start >= eight_weeks_ago)
            .group_by(ThemeWeeklyCount.week_start)
            .order_by(ThemeWeeklyCount.week_start)
        ).all()

        resolution_trend = [
            {
                "week":        str(r.week_start),
                "open":        int(r.open or 0),
                # resolved / in_progress require closed-loop status tracking
                "resolved":    0,
                "in_progress": 0,
            }
            for r in weekly_agg
        ]

    open_rows = db.execute(
        select(
            Theme.id,
            Theme.name,
            Opportunity.priority_label,
            Opportunity.frequency,
            Opportunity.total_arr,
            Opportunity.opportunity_score,
        )
        .join(Theme, Theme.id == Opportunity.theme_id)
        .where(Opportunity.intent_bucket.in_(BUG_BUCKETS))
        .where(Theme.is_outlier == False)
        .order_by(Opportunity.opportunity_score.desc())
        .limit(20)
    ).all()

    open_bugs = [
        {
            "id":          f"BUG-{str(r.id).zfill(3)}",
            "title":       r.name,
            "severity":    r.priority_label,
            "status":      "Open",
            "reports":     r.frequency,
            "arr_at_risk": round(r.total_arr, 0),
        }
        for r in open_rows
    ]

    return {
        "kpis": {
            "total_bugs":    total_bugs,
            "open_issues":   open_issues,
            # Both require closed-loop tracking (theme resolved_at timestamp)
            "resolved_this_month":  0,
            "avg_resolution_time":  None,
        },
        "bugs_by_severity":    bugs_by_severity,
        "bug_resolution_trend": resolution_trend,
        "open_bugs":           open_bugs,
    }


@router.post("/fake-data")
def generate_fake_data(db: Session = Depends(get_db)):
    """
    Automatically generates 10 fake entries in all tables for testing.
    """
    intent_buckets = list(BUG_BUCKETS | FEATURE_BUCKETS | PAIN_POINT_BUCKETS)
    priorities = ["Critical", "High", "Medium", "Low"]
    
    # Generate Themes
    themes = []
    for i in range(10):
        theme = Theme(
            intent_bucket=random.choice(intent_buckets),
            name=f"Fake Theme {i}",
            keywords=["fake", "test", f"keyword_{i}"],
            description=f"This is a fake theme description for theme {i}",
            first_seen=date.today() - timedelta(days=random.randint(10, 100)),
            last_seen=date.today(),
            item_count=random.randint(1, 20),
            is_outlier=False
        )
        db.add(theme)
        themes.append(theme)
    db.flush() # flush to get theme ids
    
    for i, theme in enumerate(themes):
        # Generate FeedbackRaw
        raw_id = str(uuid.uuid4())
        raw = FeedbackRaw(
            id=raw_id,
            source=random.choice(["Zendesk", "Intercom", "Jira", "Survey"]),
            segment=random.choice(["Enterprise", "Mid-Market", "SMB"]),
            customer_id=f"CUST-{random.randint(1000, 9999)}",
            date=date.today() - timedelta(days=random.randint(0, 150)),
            raw_text=f"This is a fake feedback message {i} for {theme.name}",
            metadata_col={"fake": True},
            processed=True
        )
        db.add(raw)
        db.flush() # flush to avoid foreign key violation
        
        # Generate FeedbackProcessed
        processed = FeedbackProcessed(
            feedback_id=raw_id,
            clean_text=f"Cleaned fake feedback message {i}",
            intents=[theme.intent_bucket],
            sentiment_score=random.uniform(-1.0, 1.0),
            urgency_keyword_score=random.uniform(0.0, 1.0),
            arr=random.uniform(1000, 50000),
            embedding=[0.0] * 384 # Fake embedding
        )
        db.add(processed)
        
        # Generate ThemeItem linking FeedbackRaw and Theme
        theme_item = ThemeItem(
            theme_id=theme.id,
            feedback_id=raw_id
        )
        db.add(theme_item)
        
        # Generate ThemeWeeklyCount
        week_start = date.today() - timedelta(days=date.today().weekday())
        weekly_count = ThemeWeeklyCount(
            theme_id=theme.id,
            week_start=week_start,
            count=random.randint(1, 10)
        )
        db.add(weekly_count)
        
        # Generate Opportunity
        opp = Opportunity(
            theme_id=theme.id,
            intent_bucket=theme.intent_bucket,
            frequency=theme.item_count,
            total_arr=random.uniform(5000, 100000),
            avg_sentiment=random.uniform(-1.0, 1.0),
            avg_urgency=random.uniform(0.0, 1.0),
            avg_source_weight=random.uniform(0.5, 1.5),
            velocity=random.uniform(-10.0, 10.0),
            alignment_score=random.uniform(0.0, 1.0),
            alignment_reason="Fake alignment reason",
            opportunity_score=random.uniform(0.0, 100.0),
            priority_label=random.choice(priorities),
            updated_at=date.today()
        )
        db.add(opp)
        
    db.commit()
    return {"message": "Successfully generated 10 fake entries in all tables."}