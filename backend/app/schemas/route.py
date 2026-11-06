from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class Waypoint(BaseModel):
    sequence: int
    latitude: float
    longitude: float
    action: str  # "DEPOT_START", "DELIVER", "EVACUATE", "DEPOT_END"
    sos_id: Optional[str] = None
    victim_name: Optional[str] = None
    demand_kg: float = 0.0
    eta_mins: float = 0.0

class RouteOptimizationRequest(BaseModel):
    disaster_id: Optional[str] = None
    relief_center_id: str
    vehicle_ids: List[str]
    max_travel_time_mins: Optional[float] = 240.0
    avoid_hazard_zones: bool = True

class RoutePlanOut(BaseModel):
    id: str
    disaster_id: Optional[str] = None
    vehicle_id: str
    vehicle_code: Optional[str] = None
    relief_center_id: Optional[str] = None
    total_distance_km: float
    estimated_duration_mins: float
    status: str
    waypoints: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class FairAllocationRequest(BaseModel):
    disaster_id: Optional[str] = None
    relief_center_id: str
    target_categories: Optional[List[str]] = ["FOOD", "WATER", "MEDICAL"]

class AllocationResult(BaseModel):
    sos_id: str
    victim_name: str
    people_count: int
    allocated_items: Dict[str, int]
    fairness_index: float
    urgency_score: float

class FairAllocationResponse(BaseModel):
    disaster_id: Optional[str] = None
    relief_center_id: str
    allocations: List[AllocationResult]
    total_sos_served: int
    unmet_demand_summary: Dict[str, int]
    gini_fairness_coefficient: float

