"""Email the caregiver when the Lost button is pressed. Uses the standard library only."""

import logging
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from urllib.parse import quote

from app.config import settings
from app.schemas import LostIn

log = logging.getLogger("uvicorn.error")


def email_enabled() -> bool:
    return bool(settings.smtp_user and settings.smtp_password and settings.caregiver_email)


def location_text(name: str, location: LostIn | None) -> str:
    if location is None:
        return "Their location could not be found, so it is not included.\n"
    ll = f"{location.lat:.6f},{location.lng:.6f}"
    accuracy = f" (accurate to about {round(location.accuracy)} m)" if location.accuracy is not None else ""
    return (
        f"Where they were when they pressed it{accuracy}:\n"
        f"Google Maps: https://www.google.com/maps?q={ll}\n"
        f"Apple Maps:  https://maps.apple.com/?ll={ll}&q={quote(name)}\n"
    )


def send_lost_email(
    created_at: datetime, name: str, home_address: str, location: LostIn | None = None
) -> None:
    """Send the alert email. Runs as a background task; logs failures instead of raising."""
    if not email_enabled():
        log.info("Lost email skipped: SMTP settings not filled in in .env")
        return

    if created_at.tzinfo is None:  # SQLite drops tzinfo; values are stored as UTC
        created_at = created_at.replace(tzinfo=timezone.utc)
    when = created_at.astimezone().strftime("%I:%M %p on %b %d").lstrip("0")

    msg = EmailMessage()
    msg["Subject"] = f"{name} pressed \"I'm Lost\" and needs help"
    msg["From"] = settings.smtp_user
    msg["To"] = settings.caregiver_email
    msg.set_content(
        f"{name} pressed the \"I'm Lost\" button at {when}.\n\n"
        f"Please call or go find them.\n\n"
        f"{location_text(name, location)}\n"
        f"Home address: {home_address}\n\n"
        "Sent by the Zombie App."
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.starttls()
            smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
        log.info("Lost email sent to %s", settings.caregiver_email)
    except Exception:
        log.exception("Lost email failed to send")
