from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Disaster, Location
from app.schemas.api_schemas import (
    DisasterCreate, DisasterUpdate, DisasterOut,
    LocationCreate, LocationOut
)
from app.core.security import require_authority, require_admin
from app.services.alert_service import alert_manager

router = APIRouter()

@router.get("/", response_model=List[DisasterOut])
def list_disasters(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """List all declared disaster events, optionally filtered by status."""
    query = db.query(Disaster)
    if status_filter:
        query = query.filter(Disaster.status == status_filter.upper())
    return query.order_by(Disaster.declared_at.desc()).all()

@router.post("/", response_model=DisasterOut, status_code=status.HTTP_201_CREATED)
async def create_disaster(
    disaster_in: DisasterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Declare a new disaster incident (Authority or Admin only)."""
    disaster = Disaster(**disaster_in.dict(), declared_by=current_user.id)
    db.add(disaster)
    db.commit()
    db.refresh(disaster)

    # Broadcast real-time alert
    await alert_manager.broadcast({
        "type": "DISASTER_DECLARED",
        "data": {
            "id": disaster.id,
            "name": disaster.name,
            "type": disaster.disaster_type,
            "severity": disaster.severity,
            "epicenter": [disaster.epicenter_lat, disaster.epicenter_lon]
        }
    })
    return disaster

@router.get("/{disaster_id}", response_model=DisasterOut)
def get_disaster_by_id(disaster_id: str, db: Session = Depends(get_db)):
    """Get single disaster event details with associated locations."""
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster event not found.")
    return disaster

@router.patch("/{disaster_id}", response_model=DisasterOut)
def update_disaster(
    disaster_id: str,
    update_in: DisasterUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Update disaster severity, status, or description (Authority or Admin only)."""
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster event not found.")
    
    for field, val in update_in.dict(exclude_unset=True).items():
        setattr(disaster, field, val)
    
    db.commit()
    db.refresh(disaster)
    return disaster

@router.post("/{disaster_id}/locations", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
async def add_location_to_disaster(
    disaster_id: str,
    location_in: LocationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Add affected district/ward or hazard zone polygon to a disaster."""
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster event not found.")

    location = Location(
        disaster_id=disaster_id,
        name=location_in.name,
        district=location_in.district,
        state=location_in.state,
        risk_level=location_in.risk_level.upper(),
        boundary_geojson=location_in.boundary_geojson,
        is_accessible=location_in.is_accessible,
        road_blockage_notes=location_in.road_blockage_notes
    )
    db.add(location)
    db.commit()
    db.refresh(location)

    await alert_manager.broadcast({
        "type": "HAZARD_ZONE_UPDATED",
        "data": {
            "disaster_id": disaster_id,
            "location_id": location.id,
            "name": location.name,
            "risk_level": location.risk_level
        }
    })
    return location
