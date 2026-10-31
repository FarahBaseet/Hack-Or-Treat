from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ProfileOut(ORMModel):
    id: int
    name: str
    home_address: str
    emergency_contact_name: str
    emergency_contact_phone: str


class PlaceOut(ORMModel):
    id: int
    name: str
    address: str


class RoutineStepOut(ORMModel):
    id: int
    time: str
    task: str
    done: bool


class RoutineStepUpdate(BaseModel):
    done: bool


class PersonCreate(BaseModel):
    name: str = Field(min_length=1)
    relationship: str = Field(min_length=1)
    descriptor: list[float] = Field(min_length=128, max_length=128)


class PersonOut(ORMModel):
    id: int
    name: str
    relationship: str
    descriptor: list[float]


class AlertOut(ORMModel):
    id: int
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        # SQLite drops tzinfo on read; values are always stored as UTC.
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
