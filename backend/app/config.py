"""Central settings, loaded from environment / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    deepseek_api_key: str = ""
    llm_provider_order: str = "gemini,deepseek,template"
    vision_provider_order: str = "gemini,tesseract"

    wa_phone_number_id: str = ""
    wa_access_token: str = ""
    wa_verify_token: str = ""
    wa_app_secret: str = ""

    turso_database_url: str = ""
    turso_auth_token: str = ""
    local_replica_path: str = "./data/khusela.db"

    jwt_secret: str = "change-me"
    dashboard_origin: str = "http://localhost:5173"
    raw_image_ttl_hours: int = 24
    store_raw_images: bool = False


settings = Settings()
