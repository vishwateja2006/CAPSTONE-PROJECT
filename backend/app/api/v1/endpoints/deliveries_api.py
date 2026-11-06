from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Delivery, Vehicle
from app.schemas.api_schemas import DeliveryCreate, DeliveryOut
from app.core.security import require_volunteer, require_authority

router = APIRouter()

@router.get("/", response_model=List[DeliveryOut])
def list_deliveries(
    disaster_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all delivery missions and dispatch routes."""
    query = db.query(Delivery)
    if disaster_id:
        query = query.filter(Delivery.disaster_id == disaster_id)
    if vehicle_id:
        query = query.filter(Delivery.vehicle_id == vehicle_id)
    if status_filter:
        query = query.filter(Delivery.status == status_filter.upper())
    return query.order_by(Delivery.created_at.desc()).all()

@router.post("/", response_model=DeliveryOut, status_code=status.HTTP_201_CREATED)
def create_delivery_mission(
    delivery_in: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Stage a new delivery mission for a vehicle (Authority or Admin)."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == delivery_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Assigned vehicle not found.")

    delivery = Delivery(**delivery_in.dict(), status="STAGED", started_at=datetime.utcnow())
    db.add(delivery)
    vehicle.status = "EN_ROUTE"
    db.commit()
    db.refresh(delivery)
    return delivery

@router.get("/{delivery_id}", response_model=DeliveryOut)
def get_delivery_details(delivery_id: str, db: Session = Depends(get_db)):
    """Retrieve delivery mission details and sequential waypoints."""
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery mission not found.")
    return d

@router.patch("/{delivery_id}/status", response_model=DeliveryOut)
def update_delivery_status(
    delivery_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    """Update mission progress status (Volunteer or Authority)."""
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Delivery mission not found.")

    d.status = status.upper()
    if d.status == "COMPLETED":
        d.completed_at = datetime.utcnow()
        # Reset vehicle to IDLE
        veh = db.query(Vehicle).filter(Vehicle.id == d.vehicle_id).first()
        if veh:
            veh.status = "IDLE"

    db.commit()
    db.refresh(d)
    return d

