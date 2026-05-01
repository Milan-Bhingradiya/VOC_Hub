from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import feedback, dashboard

from app.db.database import engine, Base
from app.db import models 


app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(dashboard.router)
app.include_router(feedback.router)

@app.get("/")
def root():
    return {"message": "VOC Hub API is running. Check /docs for Swagger UI."}