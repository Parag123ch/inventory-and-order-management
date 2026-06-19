from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Inventory and Order Management API"
    database_url: str = "postgresql+psycopg2://inventory:inventory@db:5432/inventory"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    cors_origin_regex: str | None = r"https://.*\.vercel\.app"
    seed_demo_data: bool = True
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
