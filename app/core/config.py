from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "VOC Hub Backend"
    DATABASE_URL: str
    GROQ_API_KEY: str
    HF_TOKEN: str = ""  # Hugging Face API token for embeddings (optional, will work without it)
    
    # This tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()