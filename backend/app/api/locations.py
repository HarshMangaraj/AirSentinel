import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import SavedLocation, User

router = APIRouter(prefix="/locations", tags=["locations"])


class LocationIn(BaseModel):
    label: str
    lat: float
    lon: float


@router.post("")
def add_location(payload: LocationIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loc = SavedLocation(
        id=str(uuid.uuid4()),
        user_id=user.id,
        label=payload.label,
        lat=payload.lat,
        lon=payload.lon,
        created_at=datetime.utcnow(),
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return {"id": loc.id, "label": loc.label, "lat": loc.lat, "lon": loc.lon}


@router.get("/mine")
def my_locations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    locs = db.query(SavedLocation).filter(SavedLocation.user_id == user.id).order_by(SavedLocation.created_at.desc()).all()
    return [{"id": l.id, "label": l.label, "lat": l.lat, "lon": l.lon} for l in locs]


@router.delete("/{location_id}")
def delete_location(location_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    loc = db.query(SavedLocation).filter(SavedLocation.id == location_id, SavedLocation.user_id == user.id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(loc)
    db.commit()
    return {"deleted": True}