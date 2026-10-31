from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Alert
from app.schemas import AlertOut
from app.ws_manager import caregiver_manager

router = APIRouter(tags=["alerts"])


@router.post("/lost", response_model=AlertOut, status_code=201)
async def report_lost(db: Session = Depends(get_db)) -> AlertOut:
    alert = Alert()
    db.add(alert)
    db.commit()
    db.refresh(alert)
    out = AlertOut.model_validate(alert)
    await caregiver_manager.broadcast({"type": "lost", "alert": out.model_dump(mode="json")})
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
