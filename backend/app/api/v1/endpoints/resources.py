from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.resource import ReliefCenter, InventoryItem, ReliefVehicle
from app.schemas.resource import (
    ReliefCenterCreate, ReliefCenterOut,
    InventoryItemBase, InventoryItemCreate, InventoryItemOut, InventoryItemUpdate,
    ReliefVehicleCreate, ReliefVehicleOut, VehicleLocationUpdate
)
from app.services.alert_service import alert_manager

router = APIRouter()

# --- Relief Centers ---
@router.get("/centers", response_model=List[ReliefCenterOut])
def get_all_relief_centers(disaster_id: str = None, db: Session = Depends(get_db)):
    query = db.query(ReliefCenter)
    if disaster_id:
        query = query.filter(ReliefCenter.disaster_id == disaster_id)
    return query.all()

@router.post("/centers", response_model=ReliefCenterOut, status_code=status.HTTP_201_CREATED)
def create_relief_center(center_in: ReliefCenterCreate, db: Session = Depends(get_db)):
    center = ReliefCenter(**center_in.dict())
    db.add(center)
    db.commit()
    db.refresh(center)
    return center

# --- Inventory Items ---
@router.post("/centers/{center_id}/inventory", response_model=InventoryItemOut, status_code=status.HTTP_201_CREATED)
def add_inventory_item(center_id: str, item_in: InventoryItemBase, db: Session = Depends(get_db)):
    center = db.query(ReliefCenter).filter(ReliefCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Relief center not found.")
    
    # Check if category already exists for this center
    existing = db.query(InventoryItem).filter(
        InventoryItem.relief_center_id == center_id,
        InventoryItem.item_category == item_in.item_category,
        InventoryItem.item_name == item_in.item_name
    ).first()

    if existing:
        existing.quantity_available += item_in.quantity_available
        db.commit()
        db.refresh(existing)
        return existing

    item = InventoryItem(
        relief_center_id=center_id,
        item_category=item_in.item_category,
        item_name=item_in.item_name,
        quantity_available=item_in.quantity_available,
        quantity_reserved=item_in.quantity_reserved,
        unit=item_in.unit,
        expiry_date=item_in.expiry_date
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/inventory/{item_id}", response_model=InventoryItemOut)
def update_inventory_stock(item_id: str, update_in: InventoryItemUpdate, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
    
    if update_in.quantity_available is not None:
        item.quantity_available = update_in.quantity_available
    if update_in.quantity_reserved is not None:
        item.quantity_reserved = update_in.quantity_reserved
    
    db.commit()
    db.refresh(item)
    return item

# --- Relief Vehicles ---
@router.get("/vehicles", response_model=List[ReliefVehicleOut])
def get_all_vehicles(db: Session = Depends(get_db)):
    return db.query(ReliefVehicle).all()

@router.post("/vehicles", response_model=ReliefVehicleOut, status_code=status.HTTP_201_CREATED)
def register_vehicle(vehicle_in: ReliefVehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(ReliefVehicle).filter(ReliefVehicle.vehicle_code == vehicle_in.vehicle_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle code already registered.")
    
    vehicle = ReliefVehicle(**vehicle_in.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.patch("/vehicles/{vehicle_id}/location", response_model=ReliefVehicleOut)
async def update_vehicle_location(vehicle_id: str, loc_update: VehicleLocationUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(ReliefVehicle).filter(ReliefVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    
    vehicle.current_lat = loc_update.latitude
    vehicle.current_lon = loc_update.longitude
    if loc_update.status:
        vehicle.status = loc_update.status
    
    db.commit()
    db.refresh(vehicle)

    # Broadcast vehicle movement in real time
    await alert_manager.broadcast({
        "type": "VEHICLE_MOVED",
        "data": {
            "vehicle_id": vehicle.id,
            "vehicle_code": vehicle.vehicle_code,
            "latitude": vehicle.current_lat,
            "longitude": vehicle.current_lon,
            "status": vehicle.status
        }
    })
    return vehicle
