from fastapi import APIRouter, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.email_alert import send_lost_email
from app.models import Alert, Profile
from app.schemas import AlertOut, LostIn
from app.ws_manager import caregiver_manager

router = APIRouter(tags=["alerts"])


@router.post("/lost", response_model=AlertOut, status_code=201)
async def report_lost(
    background: BackgroundTasks,
    location: LostIn | None = None,  # optional: the alert still works without a location
    db: Session = Depends(get_db),
) -> AlertOut:
    alert = Alert(**location.model_dump()) if location else Alert()
    db.add(alert)
    db.commit()
    db.refresh(alert)
    out = AlertOut.model_validate(alert)
    await caregiver_manager.broadcast({"type": "lost", "alert": out.model_dump(mode="json")})

    # Email runs after the response is sent, so the Lost modal never waits on it.
    profile = db.scalars(select(Profile).order_by(Profile.id)).first()
    background.add_task(
        send_lost_email,
        alert.created_at,
        profile.name if profile else "Your zombie",
        profile.home_address if profile else "unknown",
        location,
    )
    return out


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(db: Session = Depends(get_db)) -> list[Alert]:
    query = select(Alert).order_by(Alert.created_at.desc(), Alert.id.desc()).limit(20)
    return list(db.scalars(query))


@router.websocket("/ws/caregiver")
async def caregiver_socket(websocket: WebSocket) -> None:
    await caregiver_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep the connection open; client messages are ignored
    except WebSocketDisconnect:
        caregiver_manager.disconnect(websocket)
