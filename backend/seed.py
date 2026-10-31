"""Create tables and insert zombie-themed demo data. Safe to re-run: wipes and reseeds."""

from app import models
from app.db import Base, SessionLocal, engine


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        db.add(
            models.Profile(
                name="Zed Shambles",
                home_address="13 Graveyard Lane, Hollow Creek, OR 97013",
                emergency_contact_name="Mort Shambles (brother)",
                emergency_contact_phone="+1-555-013-1031",
            )
        )
        db.add_all(
            [
                models.Place(name="Home (the crypt with the blue door)", address="13 Graveyard Lane, Hollow Creek, OR 97013"),
                models.Place(name="Brainy Bites Cafe", address="42 Cerebellum St, Hollow Creek, OR 97013"),
                models.Place(name="Hollow Creek Library", address="7 Moonlight Ave, Hollow Creek, OR 97013"),
                models.Place(name="St. Lazarus Clinic", address="100 Revival Rd, Hollow Creek, OR 97013"),
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
