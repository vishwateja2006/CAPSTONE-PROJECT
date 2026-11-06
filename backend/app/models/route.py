import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from app.core.database import Base

class RoutePlan(Base):
    __tablename__ = "route_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=True)
    vehicle_id = Column(String, ForeignKey("relief_vehicles.id"), nullable=False)
    relief_center_id = Column(String, ForeignKey("relief_centers.id"), nullable=True)
    total_distance_km = Column(Float, default=0.0)
    estimated_duration_mins = Column(Float, default=0.0)
    status = Column(String, default="GENERATED")  # GENERATED, DISPATCHED, COMPLETED, CANCELLED
    waypoints_json = Column(Text, default="[]")  # Ordered list of waypoints with lat, lon, action, and target sos_id
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class AllocationTask(Base):
    __tablename__ = "allocation_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=True)
    relief_center_id = Column(String, ForeignKey("relief_centers.id"), nullable=False)
    sos_request_id = Column(String, ForeignKey("sos_requests.id"), nullable=False)
    item_category = Column(String, nullable=False)
    quantity_allocated = Column(Integer, default=1)
    fairness_score = Column(Float, default=1.0)
    status = Column(String, default="PENDING")  # PENDING, IN_TRANSIT, DELIVERED
    created_at = Column(DateTime, default=datetime.utcnow)

