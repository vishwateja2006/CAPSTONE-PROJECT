from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Beneficiary
from app.schemas.api_schemas import BeneficiaryCreate, BeneficiaryOut
from app.core.security import require_volunteer, get_current_user

router = APIRouter()

@router.get("/", response_model=List[BeneficiaryOut])
def list_beneficiaries(
    verified_only: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    """List all registered affected households (Volunteers, Authorities, Admins)."""
    query = db.query(Beneficiary)
    if verified_only is not None:
        query = query.filter(Beneficiary.is_verified == verified_only)
    return query.order_by(Beneficiary.created_at.desc()).all()

@router.post("/", response_model=BeneficiaryOut, status_code=status.HTTP_201_CREATED)
def register_beneficiary(
    beneficiary_in: BeneficiaryCreate,
    db: Session = Depends(get_db)
):
    """Register an affected household or citizen with location coordinates & vulnerability profile."""
    beneficiary = Beneficiary(
        user_id=beneficiary_in.user_id,
        head_of_household=beneficiary_in.head_of_household,
        contact_phone=beneficiary_in.contact_phone,
        address=beneficiary_in.address,
        latitude=beneficiary_in.latitude,
        longitude=beneficiary_in.longitude,
        household_size=beneficiary_in.household_size,
        infants_count=beneficiary_in.infants_count,
        elderly_count=beneficiary_in.elderly_count,
        disabled_or_injured_count=beneficiary_in.disabled_or_injured_count,
        medical_conditions=beneficiary_in.medical_conditions or "[]",
        is_verified=False
    )
    db.add(beneficiary)
    db.commit()
    db.refresh(beneficiary)
    return beneficiary

@router.get("/{beneficiary_id}", response_model=BeneficiaryOut)
def get_beneficiary_details(beneficiary_id: str, db: Session = Depends(get_db)):
    """Retrieve full household profile and aid history."""
    b = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Beneficiary household not found.")
    return b

@router.patch("/{beneficiary_id}/verify", response_model=BeneficiaryOut)
def verify_beneficiary(
    beneficiary_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    """Mark a beneficiary household as ground-verified (Field Volunteer action)."""
    b = db.query(Beneficiary).filter(Beneficiary.id == beneficiary_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Beneficiary household not found.")
    b.is_verified = True
    db.commit()
    db.refresh(b)
    return b
