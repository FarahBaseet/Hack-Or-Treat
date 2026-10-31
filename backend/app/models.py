from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    home_address: Mapped[str] = mapped_column(String)
    emergency_contact_name: Mapped[str] = mapped_column(String)
    emergency_contact_phone: Mapped[str] = mapped_column(String)


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    address: Mapped[str] = mapped_column(String)


class RoutineStep(Base):
    __tablename__ = "routine_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    time: Mapped[str] = mapped_column(String)  # "HH:MM", 24-hour, so string sort == time sort
    task: Mapped[str] = mapped_column(String)
    done: Mapped[bool] = mapped_column(Boolean, default=False)


class Person(Base):
    __tablename__ = "people"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    relationship: Mapped[str] = mapped_column(String)
    descriptor: Mapped[list[float]] = mapped_column(JSON)  # 128 floats from face-api


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # Location at the moment Lost was pressed. Empty if the browser could not get one.
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)  # meters
