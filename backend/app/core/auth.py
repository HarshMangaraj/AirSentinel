import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User

SUPABASE_URL = os.getenv("SUPABASE_URL")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

jwk_client = PyJWKClient(JWKS_URL)
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    supabase_user_id = payload.get("sub")
    email = payload.get("email")

    if not supabase_user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")

    user = db.query(User).filter(User.id == supabase_user_id).first()
    if not user:
        user = User(id=supabase_user_id, email=email, hashed_password="supabase-managed")
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user