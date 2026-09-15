from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from app.core.database import SessionLocal
from app.models.models import City

CITIES = [
    ("Delhi", "Delhi", 28.6139, 77.2090),
    ("Mumbai", "Maharashtra", 19.0760, 72.8777),
    ("Bangalore", "Karnataka", 12.9716, 77.5946),
    ("Kolkata", "West Bengal", 22.5726, 88.3639),
    ("Chennai", "Tamil Nadu", 13.0827, 80.2707),
    ("Hyderabad", "Telangana", 17.3850, 78.4867),
    ("Pune", "Maharashtra", 18.5204, 73.8567),
    ("Ahmedabad", "Gujarat", 23.0225, 72.5714),
    ("Jaipur", "Rajasthan", 26.9124, 75.7873),
    ("Lucknow", "Uttar Pradesh", 26.8467, 80.9462),
    ("Bhubaneswar", "Odisha", 20.2961, 85.8245),
    ("Sambalpur", "Odisha", 21.4669, 83.9756),
]

def seed():
    db = SessionLocal()
    for name, state, lat, lon in CITIES:
        exists = db.query(City).filter(City.name == name).first()
        if exists:
            continue
        city = City(
            name=name,
            state=state,
            country="India",
            location=from_shape(Point(lon, lat), srid=4326),
        )
        db.add(city)
    db.commit()
    db.close()
    print("Cities seeded.")

if __name__ == "__main__":
    seed()