from sqlalchemy import Column, String, Date, Boolean, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class FeedbackRaw(Base):
    __tablename__ = 'feedback_raw'
    id = Column(String, primary_key=True) 
    source = Column(String)
    segment = Column(String)
    customer_id = Column(String)
    date = Column(Date)
    raw_text = Column(String)
    metadata_col = Column("metadata", JSONB) 
    processed = Column(Boolean, default=False)

class FeedbackProcessed(Base):
    __tablename__ = 'feedback_processed'
    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(String, index=True)
    clean_text = Column(String)
    intents = Column(JSONB)
    sentiment_score = Column(Float, default=0.0)
    urgency_keyword_score = Column(Float, default=0.0)
    arr = Column(Float, default=0.0)
    embedding = Column(String)