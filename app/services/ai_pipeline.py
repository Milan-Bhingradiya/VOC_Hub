import json
from sentence_transformers import SentenceTransformer
from sqlalchemy import select, text
from groq import Groq

from app.db.database import SessionLocal
from app.db.models import FeedbackRaw
from app.core.config import settings


print("Loading embedding model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')
client = Groq(api_key=settings.GROQ_API_KEY)

def run_ai_pipeline(feedback_id: str):
    """
    Background worker: Extracts from raw, calls Groq LLM to classify, embeds, and saves to processed.
    """
    db = SessionLocal() 
    try:
        print(f"[AI PIPELINE] Waking up for {feedback_id}...")
        
        raw_record = db.execute(select(FeedbackRaw).where(FeedbackRaw.id == feedback_id)).scalar_one_or_none()
        if not raw_record or not raw_record.raw_text:
            print(f"[AI PIPELINE] Aborted: No text found for {feedback_id}")
            return
            
        if raw_record.processed:
            print(f"[AI PIPELINE] {feedback_id} already processed. Skipping.")
            return

        system_prompt = """
        You are an AI data classifier for a B2B SaaS platform. 
        Analyze the customer feedback text and output ONLY a JSON object with:
        1. "clean_text": The feedback rewritten into clear, professional sentences. Remove shorthand or typos.
        2. "intents": A list of applicable categories from exactly this list: ["bug_report", "feature_request", "usability_complaint", "pricing_commercial", "process_complaint", "competitive_mention", "praise", "unclear"].
        """
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Raw Text: {raw_record.raw_text}"}
            ],
            response_format={ "type": "json_object" }
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        clean_text = ai_result.get("clean_text", raw_record.raw_text)
        intents = ai_result.get("intents", ["unclear"])

        embedding_vector = embedder.encode(clean_text).tolist()

        meta = raw_record.metadata_col or {}
        arr_value = float(meta.get("deal_amount_usd", meta.get("deal_amount", 0.0)))
        
        insert_query = text("""
            INSERT INTO feedback_processed 
            (feedback_id, clean_text, intents, sentiment_score, urgency_keyword_score, arr, embedding)
            VALUES (:f_id, :c_text, :ints, :sent, :urg, :arr, :emb)
        """)
        
        db.execute(insert_query, {
            "f_id": feedback_id,
            "c_text": clean_text,
            "ints": json.dumps(intents),
            "sent": 0.0,
            "urg": 0.5,
            "arr": arr_value,
            "emb": str(embedding_vector) 
        })
        
        raw_record.processed = True
        db.commit()
        
        print(f"[AI PIPELINE] Success! {feedback_id} classified as {intents}.")

    except Exception as e:
        db.rollback()
        print(f"[AI PIPELINE] Error processing {feedback_id}: {str(e)}")
    finally:
        db.close()