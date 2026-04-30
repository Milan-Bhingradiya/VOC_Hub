import json
import uuid
import pandas as pd
from fastapi import BackgroundTasks
from sqlalchemy import select
from sqlalchemy.orm import Session
from groq import Groq

from app.db.models import FeedbackRaw
from app.core.config import settings
from app.services.ai_pipeline import run_ai_pipeline

client = Groq(api_key=settings.GROQ_API_KEY)

def process_excel_with_llm(df: pd.DataFrame, db: Session, background_tasks: BackgroundTasks) -> int:
    df = df.head(50) 
    csv_data = df.to_csv(index=False)
    
    print(f"🧠 Sending {len(df)} rows to Groq for full extraction...")

    prompt = f"""
    You are an intelligent data extraction pipeline for a B2B SaaS platform.
    Read the following CSV data (which came from an Excel upload).
    Convert each row into a standardized JSON record.

    Rules for extraction:
    1. 'source': Guess the data source based on columns (must be one of: 'support_ticket', 'sales_data', 'marketing_lead', 'calling_entry', 'survey', or 'unknown').
    2. 'segment': Extract or guess ('SME', 'Enterprise', 'Channel Partner', or 'Unknown').
    3. 'customer_id': Extract the CRM Number, Deal ID, Email, or Phone. If none, use 'Unknown'.
    4. 'date': Extract the date in YYYY-MM-DD format. If none is present, use null.
    5. 'raw_text': Combine ALL remarks, problem descriptions, case diagnoses, and notes into a single string. DO NOT LEAVE THIS BLANK.
    6. 'metadata': Put all remaining specific fields (company name, POC name, deal amount, resolution type, etc.) inside a nested JSON object.

    Respond ONLY with a JSON object containing a single key "records" which is an array of these extracted objects.

    CSV Data to parse:
    {csv_data}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        extracted_data = json.loads(response.choices[0].message.content)
        records = extracted_data.get("records", [])
        print(f"✅ Groq successfully extracted {len(records)} records.")
        
    except Exception as e:
        print(f"❌ LLM Extraction failed: {e}")
        raise ValueError("Failed to extract data using AI.")

    records_added = 0
    
    for record in records:
        f_id = f"UPL-{uuid.uuid4().hex[:8]}"
        
        raw_text = record.get("raw_text", "")
        if not raw_text or len(str(raw_text).strip()) < 5:
            continue 
            
        record_date = None
        if record.get("date"):
            try:
                record_date = pd.to_datetime(record.get("date")).date()
            except:
                pass

        stmt = select(FeedbackRaw).where(FeedbackRaw.id == f_id)
        if not db.execute(stmt).scalar_one_or_none():
            db_record = FeedbackRaw(
                id=f_id,
                source=record.get("source", "unknown"),
                segment=record.get("segment", "Unknown"),
                customer_id=str(record.get("customer_id", "Unknown")),
                date=record_date,
                raw_text=str(raw_text),
                metadata_col=record.get("metadata", {})
            )
            db.add(db_record)
            db.commit()
            
            background_tasks.add_task(run_ai_pipeline, f_id)
            
            records_added += 1

    return records_added