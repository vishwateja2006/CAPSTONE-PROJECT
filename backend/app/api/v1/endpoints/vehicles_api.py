from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Vehicle
from app.schemas.api_schemas import VehicleCreate, VehicleOut, VehicleLocationUpdate
from app.core.security import require_authority, require_volunteer
from app.services.alert_service import alert_manager

router = APIRouter()

@router.get("/", response_model=List[VehicleOut])
def list_vehicles(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """List all logistics fleet vehicles and their current telemetry positions."""
    query = db.query(Vehicle)
    if status_filter:
        query = query.filter(Vehicle.status == status_filter.upper())
    return query.all()

@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def register_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Register a new emergency relief vehicle in the fleet (Authority or Admin)."""
    existing = db.query(Vehicle).filter(Vehicle.vehicle_code == vehicle_in.vehicle_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle code already registered.")

    vehicle = Vehicle(**vehicle_in.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle_details(vehicle_id: str, db: Session = Depends(get_db)):
    """Get single vehicle status, payload limits, and location."""
    veh = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    return veh

@router.patch("/{vehicle_id}/location", response_model=VehicleOut)
async def update_vehicle_location(
    vehicle_id: str,
    loc_in: VehicleLocationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    """Update live vehicle GPS coordinates and operational status."""
    veh = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    veh.current_lat = loc_in.latitude
    veh.current_lon = loc_in.longitude
    if loc_in.status:
        veh.status = loc_in.status.upper()

    db.commit()
    db.refresh(veh)

    # Broadcast live vehicle movement over WebSocket
    await alert_manager.broadcast({
        "type": "VEHICLE_MOVED",
        "data": {
            "vehicle_id": veh.id,
            "vehicle_code": veh.vehicle_code,
            "latitude": veh.current_lat,
            "longitude": veh.current_lon,
            "status": veh.status
        }
    })

    return veh

