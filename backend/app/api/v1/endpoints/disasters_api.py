import json
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Disaster, Location, Alert
from app.schemas.api_schemas import (
    DisasterCreate, DisasterUpdate, DisasterOut,
    LocationCreate, LocationOut, AlertOut
)
from app.services.disaster_service import DisasterManagementService
from app.core.security import require_authority, require_admin
from app.services.alert_service import alert_manager

router = APIRouter()

class DisasterWithVillagesCreate(BaseModel):
    name: str
    disaster_type: str  # FLOOD, CYCLONE, EARTHQUAKE, LANDSLIDE, WILDFIRE, DROUGHT
    district: str
    affected_villages: List[str]
    severity: str = "CRITICAL"  # CRITICAL, HIGH, MODERATE, LOW
    epicenter_lat: float = 13.0827
    epicenter_lon: float = 80.2707
    radius_km: float = 25.0
    description: Optional[str] = None

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

@router.post("/register-with-villages", response_model=DisasterOut, status_code=status.HTTP_201_CREATED)
async def register_disaster_with_villages(
    payload: DisasterWithVillagesCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """
    Phase 5 Scenario Endpoint:
    Admin/Authority registers a disaster (e.g. Flood), marks affected villages,
    generates hazard polygons, and broadcasts an emergency alert automatically.
    """
    # 1. Create Disaster Record
    disaster = Disaster(
        name=payload.name,
        disaster_type=payload.disaster_type.upper(),
        severity=payload.severity.upper(),
        status="ACTIVE",
        epicenter_lat=payload.epicenter_lat,
        epicenter_lon=payload.epicenter_lon,
        radius_km=payload.radius_km,
        description=payload.description or f"Severe {payload.disaster_type} affecting {payload.district} district.",
        declared_by=current_user.id
    )
    db.add(disaster)
    db.commit()
    db.refresh(disaster)

    # 2. Generate Village Hazard Locations
    loc_dicts = DisasterManagementService.generate_village_hazard_locations(
        disaster_id=disaster.id,
        district=payload.district,
        villages=payload.affected_villages,
        base_lat=payload.epicenter_lat,
        base_lon=payload.epicenter_lon,
        risk_level="RED" if payload.severity.upper() in ["CRITICAL", "HIGH"] else "ORANGE"
    )
    for loc_data in loc_dicts:
        loc_obj = Location(**loc_data)
        db.add(loc_obj)

    # 3. Draft & Save Emergency Alert
    alert_data = DisasterManagementService.draft_emergency_alert(
        disaster_name=disaster.name,
        disaster_type=disaster.disaster_type,
        severity=disaster.severity,
        district=payload.district,
        villages=payload.affected_villages
    )
    alert = Alert(disaster_id=disaster.id, **alert_data, is_active=True)
    db.add(alert)
    db.commit()
    db.refresh(disaster)

    # 4. Broadcast Real-time Push Alert via WebSocket
    await alert_manager.broadcast({
        "type": "CRITICAL_DISASTER_DECLARED",
        "data": {
            "disaster_id": disaster.id,
            "name": disaster.name,
            "district": payload.district,
            "severity": disaster.severity,
            "affected_villages": payload.affected_villages,
            "alert": alert_data
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

@router.patch("/{disaster_id}/transition-status", response_model=DisasterOut)
def transition_disaster_status(
    disaster_id: str,
    new_status: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Transition disaster lifecycle: ALERT -> ACTIVE -> RECOVERY -> RESOLVED -> CLOSED."""
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster event not found.")

    if not DisasterManagementService.validate_status_transition(disaster.status, new_status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {disaster.status} to {new_status.upper()}."
        )

    disaster.status = new_status.upper()
    db.commit()
    db.refresh(disaster)
    return disaster
