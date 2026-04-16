from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "MetyAmiko"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/metyamiko"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_BUCKET: str = "cv-uploads"

    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL_PARSING: str = "claude-haiku-4-5-20251001"
    CLAUDE_MODEL_MATCHING: str = "claude-sonnet-4-6"

    REDIS_URL: str = "redis://localhost:6379"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@metyamiko.com"

    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "info"

    class Config:
        env_file = ".env"


settings = Settings()
