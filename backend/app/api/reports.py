import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Report, User

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportIn(BaseModel):
    description: str | None = None
    media_url: str | None = None
    lat: float
    lon: float


@router.post("")
def create_report(payload: ReportIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = Report(
        id=str(uuid.uuid4()),
        user_id=user.id,
        description=payload.description,
        media_url=payload.media_url,
        location=from_shape(Point(payload.lon, payload.lat), srid=4326),
        status="pending",
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"id": report.id, "status": report.status}


@router.get("/nearby")
def nearby_reports(lat: float, lon: float, radius_km: float = 50, db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(200).all()
    result = []
    for r in reports:
        point = to_shape(r.location)
        dist_km = ((point.y - lat) ** 2 + (point.x - lon) ** 2) ** 0.5 * 111
        if dist_km <= radius_km:
            result.append({
                "id": r.id,
                "description": r.description,
                "media_url": r.media_url,
                "lat": point.y,
                "lon": point.x,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })
    return result