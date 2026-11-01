"""Email the caregiver when the Lost button is pressed. Uses the standard library only.

Two ways to send:
- Resend (web API): used when RESEND_API_KEY is set. Works on Render's free plan.
- Gmail SMTP: used otherwise (fine on your laptop; Render's free plan blocks it).
"""

import json
import logging
import smtplib
import urllib.error
import urllib.request
from datetime import datetime, timezone
from email.message import EmailMessage
from urllib.parse import quote

from app.config import settings
from app.schemas import LostIn

log = logging.getLogger("uvicorn.error")

try:
    from zoneinfo import ZoneInfo

    LOCAL_TZ = ZoneInfo("America/Toronto")
except Exception:  # timezone data missing: fall back to UTC
    LOCAL_TZ = timezone.utc


def email_enabled() -> bool:
    if not settings.caregiver_email:
        return False
    return bool(settings.resend_api_key or (settings.smtp_user and settings.smtp_password))


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


def _send_with_resend(subject: str, body: str) -> None:
    payload = {
        # Resend's shared test sender. Without your own domain, Resend only delivers
        # to the email address you signed up to Resend with.
        "from": "BrainBridge <onboarding@resend.dev>",
        "to": [settings.caregiver_email],
        "subject": subject,
        "text": body,
    }
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
            "User-Agent": "BrainBridge/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")[:300]
        raise RuntimeError(f"Resend said {error.code}: {detail}") from None


def _send_with_smtp(subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_user
    msg["To"] = settings.caregiver_email
    msg.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.starttls()
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)


def send_lost_email(
    created_at: datetime, name: str, home_address: str, location: LostIn | None = None
) -> None:
    """Send the alert email. Runs as a background task; logs failures instead of raising."""
    if not email_enabled():
        log.info("Lost email skipped: email settings not filled in")
        return

    if created_at.tzinfo is None:  # SQLite drops tzinfo; values are stored as UTC
        created_at = created_at.replace(tzinfo=timezone.utc)
    when = created_at.astimezone(LOCAL_TZ).strftime("%I:%M %p on %b %d").lstrip("0")

    subject = f"{name} pressed \"I'm Lost\" and needs help"
    body = (
        f"{name} pressed the \"I'm Lost\" button at {when}.\n\n"
        f"Please call or go find them.\n\n"
        f"{location_text(name, location)}\n"
        f"Home address: {home_address}\n\n"
        "Sent by BrainBridge."
    )

    try:
        if settings.resend_api_key:
            _send_with_resend(subject, body)
        else:
            _send_with_smtp(subject, body)
        log.info("Lost email sent to %s", settings.caregiver_email)
    except Exception:
        log.exception("Lost email failed to send")