import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Disaster, Warehouse, Vehicle, Request, Resource, Delivery, AuditLog
from app.services.decision_engine import UnifiedDecisionEngine
from app.core.security import require_authority
from app.services.alert_service import alert_manager

router = APIRouter()

class SynthesizePlanInput(BaseModel):
    disaster_id: str
    warehouse_id: str
    vehicle_ids: List[str]

class ApprovePlanInput(BaseModel):
    action_plan_id: str
    disaster_id: str
    warehouse_id: str
    routes: List[Dict[str, Any]]
    allocations: List[Dict[str, Any]]

@router.post("/synthesize-action-plan")
def synthesize_disaster_action_plan(
    payload: SynthesizePlanInput,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
) -> Dict[str, Any]:
    """
    Phase 8: Synthesize the Unified Disaster Action Plan (UDAP) combining all 5 AI models:
    Demand Forecasting -> Damage Vision -> NLP Triage -> Fair Allocation -> Route Optimization.
    """
    disaster = db.query(Disaster).filter(Disaster.id == payload.disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster event not found.")

    warehouse = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found.")

    vehicles = db.query(Vehicle).filter(Vehicle.id.in_(payload.vehicle_ids)).all()
    if not vehicles:
        raise HTTPException(status_code=400, detail="No valid vehicles specified.")

    resources = db.query(Resource).filter(Resource.warehouse_id == payload.warehouse_id).all()
    inventory_map = {res.item_category: res.quantity_available for res in resources}

    requests = db.query(Request).filter(
        Request.disaster_id == payload.disaster_id,
        Request.status.in_(["PENDING", "VERIFIED", "ALLOCATED"])
    ).all()

    disaster_dict = {
        "id": disaster.id,
        "name": disaster.name,
        "disaster_type": disaster.disaster_type,
        "severity": disaster.severity,
        "epicenter_lat": disaster.epicenter_lat,
        "epicenter_lon": disaster.epicenter_lon
    }

    warehouse_dict = {
        "id": warehouse.id,
        "name": warehouse.name,
        "latitude": warehouse.latitude,
        "longitude": warehouse.longitude
    }

    vehicle_dicts = [
        {"id": v.id, "code": v.vehicle_code, "capacity_kg": v.capacity_kg, "speed_kmh": v.average_speed_kmh}
        for v in vehicles
    ]

    request_dicts = []
    for r in requests:
        b = r.beneficiary
        cat_needs = ["FOOD", "WATER"]
        try:
            cat_needs = json.loads(r.requested_categories or "[]")
        except Exception:
            pass

        request_dicts.append({
            "id": r.id,
            "victim_name": b.head_of_household if b else "Citizen",
            "people_count": b.household_size if b else 1,
            "category_needs": cat_needs,
            "urgency_score": r.urgency_score,
            "description": r.description or "",
            "latitude": b.latitude if b else 13.0600,
            "longitude": b.longitude if b else 80.2500
        })

    # Execute Unified Decision Engine
    action_plan = UnifiedDecisionEngine.synthesize_recommendation_package(
        disaster=disaster_dict,
        warehouse=warehouse_dict,
        available_inventory=inventory_map,
        fleet_vehicles=vehicle_dicts,
        incoming_distress_requests=request_dicts
    )

    return action_plan

@router.post("/approve-and-dispatch")
async def approve_and_dispatch_action_plan(
    payload: ApprovePlanInput,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """
    Phase 8: One-Click Authority Approval & Automated Execution.
    Commits delivery missions, updates vehicle and request statuses, logs an immutable audit trail,
    and broadcasts emergency dispatch notification over WebSockets.
    """
    # 1. Commit Delivery Missions
    created_deliveries = []
    for r in payload.routes:
        delivery = Delivery(
            disaster_id=payload.disaster_id,
            vehicle_id=r["vehicle_id"],
            warehouse_id=payload.warehouse_id,
            total_distance_km=r["total_distance_km"],
            estimated_duration_mins=r["estimated_duration_mins"],
            status="IN_TRANSIT",
            waypoints_json=json.dumps(r["waypoints"])
        )
        db.add(delivery)

        # Update vehicle status
        veh = db.query(Vehicle).filter(Vehicle.id == r["vehicle_id"]).first()
        if veh:
            veh.status = "EN_ROUTE"

        # Update waypoint request statuses to DISPATCHED
        for wp in r.get("waypoints", []):
            if wp.get("sos_id"):
                req = db.query(Request).filter(Request.id == wp["sos_id"]).first()
                if req:
                    req.status = "DISPATCHED"
                    req.assigned_warehouse_id = payload.warehouse_id

        created_deliveries.append(delivery)

    # 2. Immutable Audit Log Entry
    audit = AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="UDAP_ACTION_PLAN_APPROVED",
        entity_table="deliveries",
        entity_id=payload.action_plan_id,
        details=f"Authority approved action plan {payload.action_plan_id}: {len(payload.routes)} fleet missions dispatched."
    )
    db.add(audit)
    db.commit()

    # 3. Broadcast Alert
    await alert_manager.broadcast({
        "type": "ACTION_PLAN_DISPATCHED",
        "data": {
            "action_plan_id": payload.action_plan_id,
            "disaster_id": payload.disaster_id,
            "missions_count": len(created_deliveries)
        }
    })

    return {
        "status": "DISPATCH_AUTHORIZED",
        "action_plan_id": payload.action_plan_id,
        "missions_created": len(created_deliveries),
        "message": f"Successfully executed dispatch for {len(created_deliveries)} relief missions."
    }
