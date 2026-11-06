from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Inventory Item Schemas
class InventoryItemBase(BaseModel):
    item_category: str  # FOOD, WATER, MEDICAL, SHELTER, SANITATION
    item_name: str
    quantity_available: int
    quantity_reserved: int = 0
    unit: str = "units"
    expiry_date: Optional[datetime] = None

class InventoryItemCreate(InventoryItemBase):
    relief_center_id: str

class InventoryItemUpdate(BaseModel):
    quantity_available: Optional[int] = None
    quantity_reserved: Optional[int] = None

class InventoryItemOut(InventoryItemBase):
    id: str
    relief_center_id: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Relief Center Schemas
class ReliefCenterBase(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    capacity_people: int = 500
    current_occupancy: int = 0

class ReliefCenterCreate(ReliefCenterBase):
    disaster_id: Optional[str] = None

class ReliefCenterOut(ReliefCenterBase):
    id: str
    disaster_id: Optional[str] = None
    inventory_items: List[InventoryItemOut] = []

    class Config:
        from_attributes = True

# Relief Vehicle Schemas
class ReliefVehicleBase(BaseModel):
    vehicle_code: str
    vehicle_type: str = "TRUCK"  # TRUCK, 4X4, BOAT, DRONE, HELICOPTER
    capacity_kg: float = 1000.0
    current_lat: float
    current_lon: float
    status: str = "IDLE"  # IDLE, EN_ROUTE, RETURNING, MAINTENANCE
    assigned_driver: Optional[str] = None
    contact_phone: Optional[str] = None
    speed_kmh: float = 40.0

class ReliefVehicleCreate(ReliefVehicleBase):
    pass

class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    status: Optional[str] = None

class ReliefVehicleOut(ReliefVehicleBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True

