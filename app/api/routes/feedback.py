from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import pandas as pd
import io

from app.db.database import get_db
from app.services.excel_processor import process_excel_with_llm

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])

@router.post("/upload")
async def upload_excel(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only Excel files are supported")
    
    try:
        contents = await file.read()
        xls = pd.ExcelFile(io.BytesIO(contents))
        
        total_added = 0
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            if not df.empty:
                added = process_excel_with_llm(df, db, background_tasks)
                total_added += added
            
        return {
            "status": "success", 
            "message": f"AI extracted and saved {total_added} records. Background embedding pipeline triggered."
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")