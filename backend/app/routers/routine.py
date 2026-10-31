from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import RoutineStep
from app.schemas import RoutineStepOut, RoutineStepUpdate

router = APIRouter(prefix="/routine", tags=["routine"])


@router.get("", response_model=list[RoutineStepOut])
def list_routine(db: Session = Depends(get_db)) -> list[RoutineStep]:
    return list(db.scalars(select(RoutineStep).order_by(RoutineStep.time)))


@router.patch("/{step_id}", response_model=RoutineStepOut)
def update_step(
    step_id: int, body: RoutineStepUpdate, db: Session = Depends(get_db)
) -> RoutineStep:
    step = db.get(RoutineStep, step_id)
    if step is None:
        raise HTTPException(status_code=404, detail="Routine step not found")
    step.done = body.done
    db.commit()
    db.refresh(step)
    return step
