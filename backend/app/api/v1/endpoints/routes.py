import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.resource import ReliefCenter, ReliefVehicle, InventoryItem
from app.models.sos import SOSRequest
from app.models.disaster import HazardZone
from app.models.route import RoutePlan, AllocationTask
from app.schemas.route import (
    RouteOptimizationRequest, RoutePlanOut,
    FairAllocationRequest, FairAllocationResponse
)
from app.services.route_optimizer import RouteOptimizer
from app.services.allocation_solver import FairAllocationSolver
from app.services.alert_service import alert_manager

router = APIRouter()

@router.post("/optimize", response_model=List[RoutePlanOut])
async def trigger_route_optimization(req: RouteOptimizationRequest, db: Session = Depends(get_db)):
    """
    Solves Dynamic Vehicle Routing (CVRP) for relief dispatch.
    Avoids impassable hazard zones and prioritizes critical victims.
    """
    depot = db.query(ReliefCenter).filter(ReliefCenter.id == req.relief_center_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Relief center (depot) not found.")

    vehicles = db.query(ReliefVehicle).filter(ReliefVehicle.id.in_(req.vehicle_ids)).all()
    if not vehicles:
        raise HTTPException(status_code=400, detail="No valid vehicles specified for dispatch.")

    # Fetch pending SOS requests
    sos_query = db.query(SOSRequest).filter(SOSRequest.status.in_(["PENDING", "ASSIGNED"]))
    if req.disaster_id:
        sos_query = sos_query.filter(SOSRequest.disaster_id == req.disaster_id)
    pending_sos = sos_query.all()

    if not pending_sos:
        return []

    # Fetch hazard zones
    hazard_zones = db.query(HazardZone).filter(HazardZone.is_passable == False).all()
    hz_data = [
        {"name": hz.name, "risk_level": hz.risk_level, "is_passable": hz.is_passable}
        for hz in hazard_zones
    ]

    depot_data = {
        "id": depot.id,
        "name": depot.name,
        "latitude": depot.latitude,
        "longitude": depot.longitude
    }

    vehicle_data = [
        {
            "id": v.id,
            "code": v.vehicle_code,
            "capacity_kg": v.capacity_kg,
            "speed_kmh": v.speed_kmh
        }
        for v in vehicles
    ]

    sos_data = [
        {
            "id": s.id,
            "victim_name": s.victim_name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "people_count": s.people_count,
            "demand_kg": float(s.people_count * 15),
            "urgency_score": s.urgency_score
        }
        for s in pending_sos
    ]

    # Run Route Optimizer
    optimized_plans = RouteOptimizer.optimize_routes(
        depot=depot_data,
        vehicles=vehicle_data,
        sos_requests=sos_data,
        hazard_zones=hz_data
    )

    created_plans = []
    for plan in optimized_plans:
        route_db = RoutePlan(
            disaster_id=req.disaster_id,
            vehicle_id=plan["vehicle_id"],
            relief_center_id=req.relief_center_id,
            total_distance_km=plan["total_distance_km"],
            estimated_duration_mins=plan["estimated_duration_mins"],
            status="GENERATED",
            waypoints_json=json.dumps(plan["waypoints"])
        )
        db.add(route_db)
        db.commit()
        db.refresh(route_db)

        # Update vehicle status
        v_obj = db.query(ReliefVehicle).filter(ReliefVehicle.id == plan["vehicle_id"]).first()
        if v_obj:
            v_obj.status = "EN_ROUTE"

        # Update assigned SOS requests
        for wp in plan["waypoints"]:
            if wp.get("sos_id"):
                sos_record = db.query(SOSRequest).filter(SOSRequest.id == wp["sos_id"]).first()
                if sos_record:
                    sos_record.status = "ASSIGNED"
                    sos_record.assigned_vehicle_id = plan["vehicle_id"]

        db.commit()

        created_plans.append(RoutePlanOut(
            id=route_db.id,
            disaster_id=route_db.disaster_id,
            vehicle_id=route_db.vehicle_id,
            vehicle_code=plan["vehicle_code"],
            relief_center_id=route_db.relief_center_id,
            total_distance_km=route_db.total_distance_km,
            estimated_duration_mins=route_db.estimated_duration_mins,
            status=route_db.status,
            waypoints=plan["waypoints"],
            created_at=route_db.created_at
        ))

    # Broadcast dispatch alert
    await alert_manager.broadcast({
        "type": "ROUTES_OPTIMIZED_AND_DISPATCHED",
        "data": {
            "depot_id": req.relief_center_id,
            "total_routes": len(created_plans)
        }
    })

    return created_plans

@router.post("/allocate", response_model=FairAllocationResponse)
def trigger_fair_allocation(req: FairAllocationRequest, db: Session = Depends(get_db)):
    """
    Calculates Max-Min equitable distribution of scarce items.
    """
    depot = db.query(ReliefCenter).filter(ReliefCenter.id == req.relief_center_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Relief center not found.")

    # Get available inventory
    inventory = db.query(InventoryItem).filter(InventoryItem.relief_center_id == req.relief_center_id).all()
    inventory_map = {item.item_category: item.quantity_available for item in inventory}

    # Get pending SOS
    sos_query = db.query(SOSRequest).filter(SOSRequest.status.in_(["PENDING", "ASSIGNED"]))
    if req.disaster_id:
        sos_query = sos_query.filter(SOSRequest.disaster_id == req.disaster_id)
    requests = sos_query.all()

    sos_data = [
        {
            "id": s.id,
            "victim_name": s.victim_name,
            "people_count": s.people_count,
            "urgency_score": s.urgency_score,
            "category_needs": json.loads(s.category_needs) if s.category_needs else ["FOOD", "WATER"]
        }
        for s in requests
    ]

    result = FairAllocationSolver.allocate_supplies(
        inventory_available=inventory_map,
        sos_requests=sos_data
    )

    return FairAllocationResponse(
        disaster_id=req.disaster_id,
        relief_center_id=req.relief_center_id,
        allocations=result["allocations"],
        total_sos_served=result["total_sos_served"],
        unmet_demand_summary=result["unmet_demand_summary"],
        gini_fairness_coefficient=result["gini_fairness_coefficient"]
    )

@router.get("/plans", response_model=List[RoutePlanOut])
def list_route_plans(disaster_id: str = None, db: Session = Depends(get_db)):
    query = db.query(RoutePlan)
    if disaster_id:
        query = query.filter(RoutePlan.disaster_id == disaster_id)
    plans = query.order_by(RoutePlan.created_at.desc()).all()

    out = []
    for p in plans:
        v = db.query(ReliefVehicle).filter(ReliefVehicle.id == p.vehicle_id).first()
        waypoints = json.loads(p.waypoints_json) if p.waypoints_json else []
        out.append(RoutePlanOut(
            id=p.id,
            disaster_id=p.disaster_id,
            vehicle_id=p.vehicle_id,
            vehicle_code=v.vehicle_code if v else None,
            relief_center_id=p.relief_center_id,
            total_distance_km=p.total_distance_km,
            estimated_duration_mins=p.estimated_duration_mins,
            status=p.status,
            waypoints=waypoints,
            created_at=p.created_at
        ))
    return out

