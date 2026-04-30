from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import feedback, dashboard

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(dashboard.router)
app.include_router(feedback.router)

@app.get("/")
def root():
    return {"message": "VOC Hub API is running. Check /docs for Swagger UI."}