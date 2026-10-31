from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import alerts, people, profile, routine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zombie App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(routine.router)
app.include_router(people.router)
app.include_router(alerts.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "braaains"}
