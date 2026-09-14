from fastapi import FastAPI, Depends
from app.core.auth import get_current_user, require_admin
from app.models.models import User

app = FastAPI(title="AirSentinel API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "airsentinel-backend"}


@app.get("/auth/me")
def read_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}


@app.get("/admin/ping")
def admin_ping(user: User = Depends(require_admin)):
    return {"message": f"Welcome, admin {user.email}"}