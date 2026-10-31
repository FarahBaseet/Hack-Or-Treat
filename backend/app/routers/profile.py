from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Place, Profile
from app.schemas import PlaceOut, ProfileOut

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    profile = db.scalars(select(Profile).order_by(Profile.id)).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="No profile. Run seed.py.")
    return profile


@router.get("/places", response_model=list[PlaceOut])
def list_places(db: Session = Depends(get_db)) -> list[Place]:
    return list(db.scalars(select(Place).order_by(Place.id)))
