from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    verify_role_permission,
    ROLE_ADMIN,
    ROLE_DISASTER_AUTHORITY,
    ROLE_NGO_DONOR,
    ROLE_WAREHOUSE_MANAGER,
    ROLE_VOLUNTEER,
    ROLE_BENEFICIARY
)
from app.models.supabase_models import Profile
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

class ProfileCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = ROLE_BENEFICIARY
    phone: Optional[str] = None
    organization: Optional[str] = None

class ProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    organization: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: ProfileOut

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Profile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(Profile).filter(Profile.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: Profile = Depends(get_current_user)) -> Profile:
        if not verify_role_permission(current_user.role, allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {allowed_roles}. Current role: {current_user.role}"
            )
        return current_user
    return role_checker

# Granular RBAC dependencies
require_admin = require_role([ROLE_ADMIN])
require_authority = require_role([ROLE_ADMIN, ROLE_DISASTER_AUTHORITY])
require_warehouse_manager = require_role([ROLE_ADMIN, ROLE_WAREHOUSE_MANAGER])
require_volunteer = require_role([ROLE_ADMIN, ROLE_VOLUNTEER, ROLE_DISASTER_AUTHORITY])
require_ngo = require_role([ROLE_ADMIN, ROLE_NGO_DONOR])

@router.post("/register", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def register(profile_in: ProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.email == profile_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed_pwd = get_password_hash(profile_in.password)
    profile = Profile(
        email=profile_in.email,
        hashed_password=hashed_pwd,
        full_name=profile_in.full_name,
        role=profile_in.role.upper(),
        phone=profile_in.phone,
        organization=profile_in.organization
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identifier = form_data.username.strip()
    user = db.query(Profile).filter(
        or_(
            Profile.email.ilike(identifier),
            Profile.username.ilike(identifier)
        )
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password.")
    
    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=ProfileOut)
def read_current_user_profile(current_user: Profile = Depends(get_current_user)):
    return current_user
