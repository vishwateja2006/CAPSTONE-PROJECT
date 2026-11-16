from datetime import datetime, timedelta
from typing import Any, Union, Optional, List
from jose import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 6 Canonical Roles from Phase 1 & 3 specification
ROLE_ADMIN = "ADMIN"
ROLE_DISASTER_AUTHORITY = "DISASTER_AUTHORITY"
ROLE_NGO_DONOR = "NGO_DONOR"
ROLE_WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER"
ROLE_VOLUNTEER = "VOLUNTEER"
ROLE_BENEFICIARY = "BENEFICIARY"

ALL_ROLES = [
    ROLE_ADMIN,
    ROLE_DISASTER_AUTHORITY,
    ROLE_NGO_DONOR,
    ROLE_WAREHOUSE_MANAGER,
    ROLE_VOLUNTEER,
    ROLE_BENEFICIARY
]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    # 1. Constant-time SHA-256 check
    import hashlib
    import hmac
    sha_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if hmac.compare_digest(sha_hash, hashed_password):
        return True
    # 2. Bcrypt check
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass
    return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None

def verify_role_permission(user_role: str, allowed_roles: List[str]) -> bool:
    """Verifies if a user role is authorized; ADMIN role bypasses and has full global access."""
    if user_role == ROLE_ADMIN:
        return True
    return user_role in allowed_roles

from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_bearer = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)):
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return payload

def require_admin(current_user: dict = Depends(get_current_user)):
    role = (current_user.get("role") or "").upper()
    if role not in (ROLE_ADMIN, ROLE_DISASTER_AUTHORITY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user

def require_authority(current_user: dict = Depends(get_current_user)):
    role = (current_user.get("role") or "").upper()
    if role not in (ROLE_ADMIN, ROLE_DISASTER_AUTHORITY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Disaster Authority privileges required."
        )
    return current_user

def require_volunteer(current_user: dict = Depends(get_current_user)):
    role = (current_user.get("role") or "").upper()
    if role not in (ROLE_ADMIN, ROLE_VOLUNTEER, ROLE_DISASTER_AUTHORITY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Volunteer privileges required."
        )
    return current_user

def require_warehouse_manager(current_user: dict = Depends(get_current_user)):
    role = (current_user.get("role") or "").upper()
    if role not in (ROLE_ADMIN, ROLE_WAREHOUSE_MANAGER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Warehouse Manager privileges required."
        )
    return current_user

def require_ngo(current_user: dict = Depends(get_current_user)):
    role = (current_user.get("role") or "").upper()
    if role not in (ROLE_ADMIN, ROLE_NGO_DONOR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. NGO Donor privileges required."
        )
    return current_user
