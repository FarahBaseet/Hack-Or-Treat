from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import require_user
from app.config import settings
from app.db import Base, engine
from app.routers import alerts, people, profile, routine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrainBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Every route below needs a signed-in user.
for module in (profile, routine, people, alerts):
    app.include_router(module.router, dependencies=[Depends(require_user)])


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok"}