from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import feedback, dashboard

from db.database import engine, Base
from db import models 


app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(dashboard.router)
app.include_router(feedback.router)

@app.get("/")
def root():
    return {"message": "VOC Hub API is running. Check /docs for Swagger UI."}