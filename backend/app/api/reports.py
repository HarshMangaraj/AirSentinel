import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point

from app.core.database import get_db
from app.models.models import Report, User, City

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportIn(BaseModel):
    description: str | None = None
    category: str | None = None
    media_url: str | None = None
    lat: float
    lon: float


class ReportStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None
    assigned_department: Optional[str] = None


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


def _get_or_create_guest_user(db: Session) -> User:
    guest_id = "00000000-0000-0000-0000-000000000001"
    user = db.query(User).filter(User.id == guest_id).first()
    if not user:
        user = User(
            id=guest_id,
            email="citizen@airsentinel.gov.in",
            hashed_password="guest-citizen-auth",
            full_name="Citizen Reporter",
            role="citizen",
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).first()
    return user


@router.post("")
def create_report(payload: ReportIn, db: Session = Depends(get_db)):
    city = db.query(City).first()
    guest_user = _get_or_create_guest_user(db)

    report = Report(
        id=str(uuid.uuid4()),
        user_id=guest_user.id if guest_user else None,
        city_id=city.id if city else None,
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


@router.get("")
def list_reports(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List citizen reports for Government Command Center with status & category filters."""
    query = db.query(Report)
    if status and status.lower() != "all":
        query = query.filter(Report.status.ilike(status))
    if category and category.lower() != "all":
        query = query.filter(Report.category.ilike(category))

    reports = query.order_by(Report.created_at.desc()).limit(limit).all()
    return {"reports": [_serialize(r) for r in reports]}


@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    """Summary metrics of citizen pollution reports for the Gov dashboard KPIs."""
    reports = db.query(Report).all()
    total = len(reports)
    pending = sum(1 for r in reports if (r.status or "").lower() == "pending")
    investigating = sum(1 for r in reports if (r.status or "").lower() in ["investigating", "under_review", "assigned"])
    resolved = sum(1 for r in reports if (r.status or "").lower() == "resolved")
    today = sum(
        1 for r in reports
        if r.created_at and r.created_at.date() == datetime.utcnow().date()
    )

    categories = {}
    for r in reports:
        cat = r.category or "Other"
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "total": total,
        "pending": pending,
        "investigating": investigating,
        "resolved": resolved,
        "today_new": today,
        "by_category": categories,
    }


@router.patch("/{report_id}")
def update_report_status(
    report_id: str,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
):
    """Government official action to transition report status and log dispatch/investigation."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = payload.status
    report.status_updated_at = datetime.utcnow()
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
def my_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(50).all()
    return [_serialize(r) for r in reports]


@router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _serialize(report)