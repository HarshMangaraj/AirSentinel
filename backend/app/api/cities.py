from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape

from app.core.database import get_db
from app.models.models import City

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("")
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(City).order_by(City.name).all()
    result = []
    for c in cities:
        point = to_shape(c.location)
        result.append({
            "id": c.id,
            "name": c.name,
            "state": c.state,
            "lat": point.y,
            "lon": point.x,
        })
    return result