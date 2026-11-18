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
import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    identifier: Optional[str] = None
    password: str
    portal: Optional[str] = None

class ProfileCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    username: str
    role: str = ROLE_BENEFICIARY
    phone: Optional[str] = None
    organization: Optional[str] = None

class ProfileOut(BaseModel):
    id: str
    username: Optional[str] = None
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
    email_val = (profile_in.email or "").strip().lower()
    if not EMAIL_REGEX.match(email_val):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validation error: Please provide a complete and valid email address ending with a valid domain (e.g. yourname@gmail.com)."
        )

    uname = (profile_in.username or "").strip()
    if not uname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Validation error: Username is required for signing into your account."
        )

    existing = db.query(Profile).filter(Profile.email == profile_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    existing_user = db.query(Profile).filter(Profile.username == uname).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{uname}' is already taken. Please choose another username for sign-in."
        )
    
    hashed_pwd = get_password_hash(profile_in.password)
    profile = Profile(
        username=uname,
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
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    ident = (login_data.identifier or login_data.username or login_data.email or "").strip()
    pwd = (login_data.password or "").strip()
    portal = (login_data.portal or "").strip().upper()

    if not ident:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Validation error: Username or email is required.")
    if not pwd:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Validation error: Password is required.")

    user = db.query(Profile).filter(
        or_(
            Profile.email.ilike(ident),
            Profile.username.ilike(ident)
        )
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password.")

    if hasattr(user, "is_active") and user.is_active is not None and not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is inactive. Please contact the administrator.")

    if not verify_password(pwd, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password.")

    is_admin_user = (user.role or "").upper() in ("ADMIN", "DISASTER_AUTHORITY")
    if portal == "ADMIN" and not is_admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Normal user accounts are not authorized to log in through the Admin Portal."
        )
    if portal == "USER" and is_admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin credentials cannot be used in User Portal. Please use the Admin Portal."
        )

    effective_role = "ADMIN" if is_admin_user else "USER"
    token = create_access_token({"sub": user.email, "role": effective_role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=TokenResponse)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return login(LoginRequest(identifier=form_data.username, password=form_data.password), db=db)

@router.get("/verify")
def verify_token(current_user: Profile = Depends(get_current_user)):
    is_admin_user = (current_user.role or "").upper() in ("ADMIN", "DISASTER_AUTHORITY")
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": "ADMIN" if is_admin_user else "USER",
            "db_role": current_user.role
        }
    }

@router.get("/me", response_model=ProfileOut)
def read_current_user_profile(current_user: Profile = Depends(get_current_user)):
    return current_user
