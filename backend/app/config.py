from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./zombie.db"

    # Sign-in (Clerk). The backend only answers people signed in to BrainBridge.
    # CLERK_ISSUER looks like https://xxxx.clerk.accounts.dev (from the Clerk dashboard).
    clerk_issuer: str = ""
    # Website addresses allowed to talk to the backend, separated by commas.
    frontend_origins: str = "http://localhost:3000"

    # Email alert to the caregiver when the Lost button is pressed.
    # Leave smtp_user / smtp_password / caregiver_email empty to turn email off.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    caregiver_email: str = ""
        # Online (Render free plan blocks Gmail's SMTP), so send through Resend's web API instead.
    # When RESEND_API_KEY is set, it is used; otherwise the Gmail SMTP settings above are used.
    resend_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()