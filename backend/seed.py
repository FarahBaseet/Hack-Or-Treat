"""Create tables and insert demo data. Safe to re-run: wipes and reseeds."""

from app import models
from app.db import Base, SessionLocal, engine


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        db.add(
            models.Profile(
                name="Zed Shambles",
                home_address="7 Hart House Circle, Toronto, ON",
                emergency_contact_name="Farah Baseet (caregiver)",
                emergency_contact_phone="+1 (647) 454-5200",
            )
        )
        db.add_all(
            [
                models.Place(name="Home (Hart House)", address="7 Hart House Circle, Toronto, ON"),
                models.Place(name="Robarts Library", address="130 St George St, Toronto, ON"),
                models.Place(name="Bahen Centre", address="40 St George St, Toronto, ON"),
                models.Place(name="Toronto General Hospital", address="200 Elizabeth St, Toronto, ON"),
            ]
        )
        db.add_all(
            [
                models.RoutineStep(time="08:00", task="Rise from your coffin and stretch those stiff limbs"),
                models.RoutineStep(time="08:30", task="Eat breakfast (cauliflower 'brains' are in the fridge)"),
                models.RoutineStep(time="10:00", task="Shamble around the block and wave at the neighbors"),
                models.RoutineStep(time="12:30", task="Lunch at Brainy Bites Cafe"),
                models.RoutineStep(time="15:00", task="Take your medicine (the green pills)"),
                models.RoutineStep(time="17:00", task="Call Mort to say you're still undead"),
                models.RoutineStep(time="19:00", task="Dinner, then moisturize that decaying skin"),
                models.RoutineStep(time="21:30", task="Back to the coffin. Lights out!"),
            ]
        )
        # People are enrolled from the camera (POST /people), so none are seeded.
        db.commit()

    print("Seeded zombie.db")


if __name__ == "__main__":
    seed()