import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # ADMIN, DISASTER_AUTHORITY, NGO_DONOR, WAREHOUSE_MANAGER, VOLUNTEER, BENEFICIARY
    phone = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    declared_disasters = relationship("Disaster", back_populates="declarer")
    managed_warehouses = relationship("Warehouse", back_populates="manager")
    assigned_vehicles = relationship("Vehicle", back_populates="driver")
    beneficiary_record = relationship("Beneficiary", back_populates="profile", uselist=False)


class Disaster(Base):
    __tablename__ = "disasters"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    disaster_type = Column(String, nullable=False)  # FLOOD, CYCLONE, EARTHQUAKE, LANDSLIDE, WILDFIRE, DROUGHT
    severity = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MODERATE, LOW
    status = Column(String, default="ACTIVE", nullable=False)  # ALERT, ACTIVE, RECOVERY, RESOLVED, CLOSED
    epicenter_lat = Column(Float, nullable=False)
    epicenter_lon = Column(Float, nullable=False)
    radius_km = Column(Float, default=25.0)
    description = Column(Text, nullable=True)
    declared_by = Column(String, ForeignKey("profiles.id"), nullable=True)
    declared_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    declarer = relationship("Profile", back_populates="declared_disasters")
    locations = relationship("Location", back_populates="disaster", cascade="all, delete-orphan")
    warehouses = relationship("Warehouse", back_populates="disaster")
    requests = relationship("Request", back_populates="disaster", cascade="all, delete-orphan")
    deliveries = relationship("Delivery", back_populates="disaster")
    predictions = relationship("Prediction", back_populates="disaster", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="disaster", cascade="all, delete-orphan")
    hazard_zones = relationship("HazardZone", back_populates="disaster", cascade="all, delete-orphan")
    relief_centers = relationship("ReliefCenter", back_populates="disaster", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    risk_level = Column(String, default="RED", nullable=False)  # RED, ORANGE, YELLOW
    boundary_geojson = Column(Text, nullable=False)  # GeoJSON Polygon string
    is_accessible = Column(Boolean, default=True)
    road_blockage_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("Disaster", back_populates="locations")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=True)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    manager_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    contact_phone = Column(String, nullable=True)
    capacity_sqft = Column(Float, default=10000.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("Disaster", back_populates="warehouses")
    manager = relationship("Profile", back_populates="managed_warehouses")
    resources = relationship("Resource", back_populates="warehouse", cascade="all, delete-orphan")
    deliveries = relationship("Delivery", back_populates="warehouse")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    warehouse_id = Column(String, ForeignKey("warehouses.id"), nullable=False)
    item_category = Column(String, nullable=False)  # WATER, FOOD, MEDICAL, SHELTER, SANITATION, COMMUNICATION
    item_name = Column(String, nullable=False)
    quantity_available = Column(Integer, default=0, nullable=False)
    quantity_reserved = Column(Integer, default=0, nullable=False)
    unit = Column(String, default="units")
    minimum_threshold = Column(Integer, default=100)
    expiry_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="resources")


class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    head_of_household = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    household_size = Column(Integer, default=1, nullable=False)
    infants_count = Column(Integer, default=0)
    elderly_count = Column(Integer, default=0)
    disabled_or_injured_count = Column(Integer, default=0)
    medical_conditions = Column(Text, default="[]")  # JSON Array string
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="beneficiary_record")
    requests = relationship("Request", back_populates="beneficiary", cascade="all, delete-orphan")


class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    beneficiary_id = Column(String, ForeignKey("beneficiaries.id"), nullable=False)
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    requested_categories = Column(Text, default="[\"FOOD\", \"WATER\"]")  # JSON Array
    urgency_level = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    urgency_score = Column(Float, default=50.0)
    description = Column(Text, nullable=True)
    status = Column(String, default="PENDING", nullable=False)  # PENDING, VERIFIED, ALLOCATED, DISPATCHED, DELIVERED, CANCELLED
    assigned_warehouse_id = Column(String, ForeignKey("warehouses.id"), nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow)
    fulfilled_at = Column(DateTime, nullable=True)

    beneficiary = relationship("Beneficiary", back_populates="requests")
    disaster = relationship("Disaster", back_populates="requests")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_code = Column(String, unique=True, nullable=False)
    vehicle_type = Column(String, default="TRUCK", nullable=False)  # TRUCK, BOAT, 4X4, DRONE, HELICOPTER
    capacity_kg = Column(Float, default=1000.0)
    current_lat = Column(Float, nullable=False)
    current_lon = Column(Float, nullable=False)
    status = Column(String, default="IDLE", nullable=False)  # IDLE, EN_ROUTE, RETURNING, MAINTENANCE
    assigned_driver_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    average_speed_kmh = Column(Float, default=40.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    driver = relationship("Profile", back_populates="assigned_vehicles")
    deliveries = relationship("Delivery", back_populates="vehicle")


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    warehouse_id = Column(String, ForeignKey("warehouses.id"), nullable=False)
    total_distance_km = Column(Float, default=0.0)
    estimated_duration_mins = Column(Float, default=0.0)
    status = Column(String, default="STAGED", nullable=False)  # STAGED, IN_TRANSIT, COMPLETED, ABORTED
    waypoints_json = Column(Text, default="[]")  # JSON Array of Waypoints
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("Disaster", back_populates="deliveries")
    vehicle = relationship("Vehicle", back_populates="deliveries")
    warehouse = relationship("Warehouse", back_populates="deliveries")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    model_type = Column(String, nullable=False)  # DEMAND_FORECAST, DAMAGE_DETECTION, NLP_TRIAGE, ROUTE_OPTIMIZER, FAIR_ALLOCATION
    input_payload = Column(Text, nullable=False)  # JSON
    prediction_output = Column(Text, nullable=False)  # JSON
    accuracy_or_fairness_metric = Column(Float, nullable=True)
    is_simulation = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("Disaster", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="WARNING", nullable=False)  # CRITICAL, HIGH, WARNING, INFO
    target_area_district = Column(String, nullable=True)
    broadcast_channel = Column(String, default="ALL")  # ALL, SMS, PUSH, WEBSOCKET
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disaster = relationship("Disaster", back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    actor_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_table = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)  # JSON
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

