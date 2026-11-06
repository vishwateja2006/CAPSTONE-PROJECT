from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# ----------------- 1. Disasters & Locations -----------------
class LocationBase(BaseModel):
    name: str
    district: str
    state: str
    risk_level: str = "RED"  # RED, ORANGE, YELLOW
    boundary_geojson: str
    is_accessible: bool = True
    road_blockage_notes: Optional[str] = None

class LocationCreate(LocationBase):
    disaster_id: str

class LocationOut(LocationBase):
    id: str
    disaster_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class DisasterBase(BaseModel):
    name: str
    disaster_type: str  # FLOOD, CYCLONE, EARTHQUAKE, LANDSLIDE, WILDFIRE, DROUGHT
    severity: str = "HIGH"  # CRITICAL, HIGH, MODERATE, LOW
    status: str = "ACTIVE"  # ALERT, ACTIVE, RECOVERY, RESOLVED, CLOSED
    epicenter_lat: float
    epicenter_lon: float
    radius_km: float = 25.0
    description: Optional[str] = None

class DisasterCreate(DisasterBase):
    pass

class DisasterUpdate(BaseModel):
    name: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None

class DisasterOut(DisasterBase):
    id: str
    declared_at: datetime
    updated_at: datetime
    locations: List[LocationOut] = []
    class Config:
        from_attributes = True


# ----------------- 2. Warehouses & Resources -----------------
class WarehouseBase(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    contact_phone: Optional[str] = None
    capacity_sqft: float = 10000.0
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    disaster_id: Optional[str] = None
    manager_id: Optional[str] = None

class WarehouseOut(WarehouseBase):
    id: str
    disaster_id: Optional[str] = None
    manager_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    warehouse_id: str
    item_category: str  # WATER, FOOD, MEDICAL, SHELTER, SANITATION, COMMUNICATION
    item_name: str
    quantity_available: int = 0
    quantity_reserved: int = 0
    unit: str = "units"
    minimum_threshold: int = 100
    expiry_date: Optional[datetime] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    quantity_available: Optional[int] = None
    quantity_reserved: Optional[int] = None

class ResourceOut(ResourceBase):
    id: str
    updated_at: datetime
    class Config:
        from_attributes = True


# ----------------- 3. Beneficiaries -----------------
class BeneficiaryBase(BaseModel):
    head_of_household: str
    contact_phone: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    household_size: int = 1
    infants_count: int = 0
    elderly_count: int = 0
    disabled_or_injured_count: int = 0
    medical_conditions: Optional[str] = "[]"
    is_verified: bool = False

class BeneficiaryCreate(BeneficiaryBase):
    user_id: Optional[str] = None

class BeneficiaryOut(BeneficiaryBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ----------------- 4. Requests (Aid Distress Beacons) -----------------
class RequestBase(BaseModel):
    beneficiary_id: str
    disaster_id: str
    requested_categories: Optional[str] = "[\"FOOD\", \"WATER\"]"
    urgency_level: Optional[str] = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    urgency_score: Optional[float] = 50.0
    description: Optional[str] = None

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, VERIFIED, ALLOCATED, DISPATCHED, DELIVERED, CANCELLED
    assigned_warehouse_id: Optional[str] = None
    urgency_score: Optional[float] = None

class RequestOut(RequestBase):
    id: str
    status: str
    assigned_warehouse_id: Optional[str] = None
    requested_at: datetime
    fulfilled_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# ----------------- 5. Vehicles -----------------
class VehicleBase(BaseModel):
    vehicle_code: str
    vehicle_type: str = "TRUCK"  # TRUCK, BOAT, 4X4, DRONE, HELICOPTER
    capacity_kg: float = 1000.0
    current_lat: float
    current_lon: float
    status: str = "IDLE"  # IDLE, EN_ROUTE, RETURNING, MAINTENANCE
    average_speed_kmh: float = 40.0

class VehicleCreate(VehicleBase):
    assigned_driver_id: Optional[str] = None

class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    status: Optional[str] = None

class VehicleOut(VehicleBase):
    id: str
    assigned_driver_id: Optional[str] = None
    updated_at: datetime
    class Config:
        from_attributes = True


# ----------------- 6. Deliveries -----------------
class DeliveryCreate(BaseModel):
    disaster_id: str
    vehicle_id: str
    warehouse_id: str
    total_distance_km: float = 0.0
    estimated_duration_mins: float = 0.0
    waypoints_json: str = "[]"

class DeliveryOut(BaseModel):
    id: str
    disaster_id: str
    vehicle_id: str
    warehouse_id: str
    total_distance_km: float
    estimated_duration_mins: float
    status: str
    waypoints_json: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True


# ----------------- 7. Predictions -----------------
class PredictionCreate(BaseModel):
    disaster_id: str
    model_type: str  # DEMAND_FORECAST, DAMAGE_DETECTION, NLP_TRIAGE, ROUTE_OPTIMIZER, FAIR_ALLOCATION
    input_payload: str  # JSON
    prediction_output: str  # JSON
    accuracy_or_fairness_metric: Optional[float] = None
    is_simulation: bool = False

class PredictionOut(PredictionCreate):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True


# ----------------- 8. Routes (Optimization) -----------------
class RouteOptimizationInput(BaseModel):
    disaster_id: str
    warehouse_id: str
    vehicle_ids: List[str]
    avoid_hazard_zones: bool = True

class RouteOptimizationOut(BaseModel):
    vehicle_id: str
    vehicle_code: str
    total_distance_km: float
    estimated_duration_mins: float
    cargo_payload_kg: float
    hazard_detours_inserted: int
    waypoints: List[Dict[str, Any]]


# ----------------- 9. Alerts -----------------
class AlertCreate(BaseModel):
    disaster_id: str
    title: str
    message: str
    severity: str = "WARNING"  # CRITICAL, HIGH, WARNING, INFO
    target_area_district: Optional[str] = None
    broadcast_channel: Optional[str] = "ALL"  # ALL, SMS, PUSH, WEBSOCKET

class AlertOut(AlertCreate):
    id: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True
