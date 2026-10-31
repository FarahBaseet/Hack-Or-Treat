from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./zombie.db"

    # Email alert to the caregiver when the Lost button is pressed.
    # Leave smtp_user / smtp_password / caregiver_email empty to turn email off.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    caregiver_email: str = ""

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
