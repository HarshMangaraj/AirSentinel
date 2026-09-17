import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
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
    category: str | None = None
    media_url: str | None = None
    lat: float
    lon: float


def _serialize(r: Report):
    point = to_shape(r.location)
    return {
        "id": r.id,
        "description": r.description,
        "category": r.category,
        "media_url": r.media_url,
        "lat": point.y,
        "lon": point.x,
        "status": r.status,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "status_updated_at": r.status_updated_at.isoformat() if r.status_updated_at else None,
    }


@router.post("")
def create_report(payload: ReportIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = Report(
        id=str(uuid.uuid4()),
        user_id=user.id,
        description=payload.description,
        category=payload.category,
        media_url=payload.media_url,
        location=from_shape(Point(payload.lon, payload.lat), srid=4326),
        status="pending",
        created_at=datetime.utcnow(),
        status_updated_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return _serialize(report)


@router.get("/nearby")
def nearby_reports(lat: float, lon: float, radius_km: float = 50, db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(200).all()
    result = []
    for r in reports:
        point = to_shape(r.location)
        dist_km = ((point.y - lat) ** 2 + (point.x - lon) ** 2) ** 0.5 * 111
        if dist_km <= radius_km:
            entry = _serialize(r)
            entry["distance_km"] = round(dist_km, 1)
            result.append(entry)
    return result


@router.get("/mine")
def my_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reports = db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()
    return [_serialize(r) for r in reports]


@router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _serialize(report)