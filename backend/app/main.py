from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import get_current_user, require_admin
from app.models.models import User
from app.api import cities, aqi, reports

app = FastAPI(title="AirSentinel API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cities.router)
app.include_router(aqi.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "airsentinel-backend"}


@app.get("/auth/me")
def read_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}


@app.get("/admin/ping")
def admin_ping(user: User = Depends(require_admin)):
    return {"message": f"Welcome, admin {user.email}"}