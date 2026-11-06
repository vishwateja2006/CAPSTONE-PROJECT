import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Warehouse, Vehicle, Request, Location, Delivery, Resource
from app.schemas.api_schemas import RouteOptimizationInput, RouteOptimizationOut, DeliveryOut
from app.services.route_optimizer import RouteOptimizer
from app.services.allocation_solver import FairAllocationSolver
from app.services.alert_service import alert_manager
from app.core.security import require_authority

router = APIRouter()

@router.post("/optimize", response_model=List[RouteOptimizationOut])
async def compute_optimized_routes(
    input_data: RouteOptimizationInput,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """
    Execute Model 4: Dynamic Vehicle Routing Problem (CVRP) with spatial hazard polygon avoidance.
    """
    depot = db.query(Warehouse).filter(Warehouse.id == input_data.warehouse_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Relief warehouse not found.")

    vehicles = db.query(Vehicle).filter(Vehicle.id.in_(input_data.vehicle_ids)).all()
    if not vehicles:
        raise HTTPException(status_code=400, detail="No registered vehicles provided for dispatch.")

    # Pending aid requests for this disaster
    requests = db.query(Request).filter(
        Request.disaster_id == input_data.disaster_id,
        Request.status.in_(["PENDING", "VERIFIED", "ALLOCATED"])
    ).all()

    if not requests:
        return []

    # Hazard polygons
    locations = db.query(Location).filter(
        Location.disaster_id == input_data.disaster_id,
        Location.is_accessible == False
    ).all()
    hazard_zones = [
        {"name": loc.name, "is_passable": loc.is_accessible, "boundary_geojson": loc.boundary_geojson}
        for loc in locations
    ]

    depot_dict = {
        "id": depot.id,
        "name": depot.name,
        "latitude": depot.latitude,
        "longitude": depot.longitude
    }

    vehicle_dicts = [
        {
            "id": v.id,
            "code": v.vehicle_code,
            "capacity_kg": v.capacity_kg,
            "speed_kmh": v.average_speed_kmh
        }
        for v in vehicles
    ]

    request_dicts = []
    for r in requests:
        b = r.beneficiary
        request_dicts.append({
            "id": r.id,
            "victim_name": b.head_of_household if b else "Citizen",
            "latitude": b.latitude if b else 13.0600,
            "longitude": b.longitude if b else 80.2500,
            "people_count": b.household_size if b else 1,
            "demand_kg": float((b.household_size if b else 1) * 15),
            "urgency_score": r.urgency_score
        })

    # Run Route Optimizer
    routes = RouteOptimizer.optimize_routes(
        depot=depot_dict,
        vehicles=vehicle_dicts,
        sos_requests=request_dicts,
        hazard_zones=hazard_zones if input_data.avoid_hazard_zones else []
    )

    # Save created deliveries in database
    for r in routes:
        delivery = Delivery(
            disaster_id=input_data.disaster_id,
            vehicle_id=r["vehicle_id"],
            warehouse_id=depot.id,
            total_distance_km=r["total_distance_km"],
            estimated_duration_mins=r["estimated_duration_mins"],
            status="IN_TRANSIT",
            waypoints_json=json.dumps(r["waypoints"])
        )
        db.add(delivery)

        # Update vehicle status
        v_rec = db.query(Vehicle).filter(Vehicle.id == r["vehicle_id"]).first()
        if v_rec:
            v_rec.status = "EN_ROUTE"

        # Update requests status to DISPATCHED
        for wp in r["waypoints"]:
            if wp.get("sos_id"):
                req_rec = db.query(Request).filter(Request.id == wp["sos_id"]).first()
                if req_rec:
                    req_rec.status = "DISPATCHED"
                    req_rec.assigned_warehouse_id = depot.id

    db.commit()

    # Broadcast dispatch alert
    await alert_manager.broadcast({
        "type": "ROUTES_DISPATCHED",
        "data": {
            "disaster_id": input_data.disaster_id,
            "warehouse_id": depot.id,
            "missions_count": len(routes)
        }
    })

    return routes

@router.post("/fair-allocation")
def compute_fair_allocation(
    warehouse_id: str,
    disaster_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
) -> Dict[str, Any]:
    """
    Execute Model 5: Max-Min Fair Resource Allocation.
    Prevents hoarding and guarantees baseline survival supplies across all affected clusters.
    """
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found.")

    resources = db.query(Resource).filter(Resource.warehouse_id == warehouse_id).all()
    inventory_map = {res.item_category: res.quantity_available for res in resources}

    requests = db.query(Request).filter(
        Request.disaster_id == disaster_id,
        Request.status.in_(["PENDING", "VERIFIED", "ALLOCATED"])
    ).all()

    sos_data = []
    for r in requests:
        b = r.beneficiary
        cat_needs = ["FOOD", "WATER"]
        try:
            cat_needs = json.loads(r.requested_categories or "[]")
        except Exception:
            pass
        sos_data.append({
            "id": r.id,
            "victim_name": b.head_of_household if b else "Citizen",
            "people_count": b.household_size if b else 1,
            "urgency_score": r.urgency_score,
            "category_needs": cat_needs
        })

    allocation_result = FairAllocationSolver.allocate_supplies(
        inventory_available=inventory_map,
        sos_requests=sos_data
    )

    return allocation_result
