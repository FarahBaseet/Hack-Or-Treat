from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Person
from app.schemas import PersonCreate, PersonOut

router = APIRouter(prefix="/people", tags=["people"])


@router.get("", response_model=list[PersonOut])
def list_people(db: Session = Depends(get_db)) -> list[Person]:
    return list(db.scalars(select(Person).order_by(Person.id)))


@router.post("", response_model=PersonOut, status_code=201)
def create_person(body: PersonCreate, db: Session = Depends(get_db)) -> Person:
    person = Person(**body.model_dump())
    db.add(person)
    db.commit()
    db.refresh(person)
    return person
