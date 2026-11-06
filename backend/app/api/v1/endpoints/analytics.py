import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.disaster import Disaster
from app.models.resource import ReliefCenter, InventoryItem, ReliefVehicle
from app.models.sos import SOSRequest
from app.models.route import RoutePlan
from app.services.ai_model import DisasterAIEngine

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(disaster_id: Optional[str] = None, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns high-level situational awareness metrics for the Operations Dashboard.
    """
    sos_query = db.query(SOSRequest)
    if disaster_id:
        sos_query = sos_query.filter(SOSRequest.disaster_id == disaster_id)

    total_sos = sos_query.count()
    critical_sos = sos_query.filter(SOSRequest.urgency_level == "CRITICAL").count()
    high_sos = sos_query.filter(SOSRequest.urgency_level == "HIGH").count()
    pending_sos = sos_query.filter(SOSRequest.status == "PENDING").count()
    delivered_sos = sos_query.filter(SOSRequest.status.in_(["DELIVERED", "RESOLVED"])).count()

    total_affected_people = db.query(func.sum(SOSRequest.people_count)).scalar() or 0

    # Fleet metrics
    total_vehicles = db.query(ReliefVehicle).count()
    active_vehicles = db.query(ReliefVehicle).filter(ReliefVehicle.status == "EN_ROUTE").count()
    idle_vehicles = db.query(ReliefVehicle).filter(ReliefVehicle.status == "IDLE").count()

    # Inventory totals
    items = db.query(
        InventoryItem.item_category,
        func.sum(InventoryItem.quantity_available).label("total_stock")
    ).group_by(InventoryItem.item_category).all()
    inventory_summary = {cat: (stock or 0) for cat, stock in items}

    # Route missions
    total_missions = db.query(RoutePlan).count()

    resolution_rate = round((delivered_sos / total_sos * 100), 1) if total_sos > 0 else 0.0

    return {
        "disaster_id": disaster_id,
        "metrics": {
            "total_sos_requests": total_sos,
            "critical_pending_sos": critical_sos,
            "high_pending_sos": high_sos,
            "pending_dispatch": pending_sos,
            "delivered_count": delivered_sos,
            "resolution_rate_percent": resolution_rate,
            "estimated_affected_people": total_affected_people
        },
        "fleet": {
            "total_vehicles": total_vehicles,
            "en_route": active_vehicles,
            "idle": idle_vehicles
        },
        "inventory_stock": inventory_summary,
        "missions_executed": total_missions
    }

@router.get("/forecast")
def get_resource_demand_forecast(
    displaced_population: int = Query(500, ge=1),
    days_ahead: int = Query(3, ge=1, le=14),
    severity_multiplier: float = Query(1.2, ge=1.0, le=2.5)
) -> Dict[str, Any]:
    """
    Generates AI/ML demand forecasting for food, water, medical supplies based on displaced count.
    """
    return DisasterAIEngine.forecast_resource_demand(
        displaced_population=displaced_population,
        days_ahead=days_ahead,
        weather_severity_multiplier=severity_multiplier
    )
