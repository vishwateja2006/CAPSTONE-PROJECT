import math
import json
from typing import List, Dict, Any, Optional

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class RouteOptimizer:
    """
    Capacity-Constrained Dynamic Vehicle Routing Solver (CVRP) with Hazard Avoidance.
    """

    @classmethod
    def optimize_routes(
        cls,
        depot: Dict[str, Any],
        vehicles: List[Dict[str, Any]],
        sos_requests: List[Dict[str, Any]],
        hazard_zones: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates optimized route plans for fleet of relief vehicles.
        
        depot: {"id": str, "name": str, "latitude": float, "longitude": float}
        vehicles: [{"id": str, "code": str, "capacity_kg": float, "speed_kmh": float}]
        sos_requests: [{"id": str, "victim_name": str, "latitude": float, "longitude": float, "demand_kg": float, "urgency_score": float}]
        hazard_zones: [{"name": str, "risk_level": "RED", "is_passable": False}]
        """
        if not vehicles or not sos_requests:
            return []

        # Sort SOS requests primarily by urgency score (highest urgency served first)
        sorted_requests = sorted(
            sos_requests,
            key=lambda x: (-x.get("urgency_score", 50.0), x.get("distance_to_depot", 0.0))
        )

        routes = []
        assigned_sos_ids = set()

        for vehicle in vehicles:
            v_id = vehicle["id"]
            v_code = vehicle.get("code", "VEH-01")
            v_capacity = vehicle.get("capacity_kg", 1000.0)
            v_speed = vehicle.get("speed_kmh", 35.0)

            current_load = 0.0
            total_dist_km = 0.0
            total_time_mins = 0.0

            current_lat = depot["latitude"]
            current_lon = depot["longitude"]

            waypoints: List[Dict[str, Any]] = [
                {
                    "sequence": 1,
                    "location_name": depot.get("name", "Depot Headquarters"),
                    "latitude": current_lat,
                    "longitude": current_lon,
                    "action": "DEPOT_START",
                    "sos_id": None,
                    "demand_kg": 0.0,
                    "eta_mins": 0.0
                }
            ]

            # Assign candidate stops based on capacity & geographic proximity
            seq = 2
            for req in sorted_requests:
                if req["id"] in assigned_sos_ids:
                    continue

                demand = req.get("demand_kg", 15.0 * max(1, req.get("people_count", 1)))
                if current_load + demand > v_capacity:
                    continue  # Vehicle full

                # Distance from current position to this stop
                leg_dist = haversine_distance_km(current_lat, current_lon, req["latitude"], req["longitude"])
                
                # Check hazard zone penalty
                penalty = 1.0
                if hazard_zones:
                    for hz in hazard_zones:
                        if not hz.get("is_passable", True):
                            # Simplified proximity check to hazard epicenter
                            hz_dist = haversine_distance_km(req["latitude"], req["longitude"], hz.get("epicenter_lat", 0), hz.get("epicenter_lon", 0))
                            if hz_dist < 5.0:
                                penalty = 1.5  # Slower speed through flooded/debris zone

                leg_dist_penalized = leg_dist * penalty
                leg_time_mins = (leg_dist_penalized / v_speed) * 60.0

                total_dist_km += leg_dist_penalized
                total_time_mins += leg_time_mins
                current_load += demand

                waypoints.append({
                    "sequence": seq,
                    "location_name": f"SOS: {req.get('victim_name', 'Beneficiary')}",
                    "latitude": req["latitude"],
                    "longitude": req["longitude"],
                    "action": "DELIVER_AID",
                    "sos_id": req["id"],
                    "demand_kg": demand,
                    "eta_mins": round(total_time_mins, 1)
                })

                current_lat = req["latitude"]
                current_lon = req["longitude"]
                assigned_sos_ids.add(req["id"])
                seq += 1

            # Return journey to depot
            if len(waypoints) > 1:
                return_dist = haversine_distance_km(current_lat, current_lon, depot["latitude"], depot["longitude"])
                return_time_mins = (return_dist / v_speed) * 60.0
                total_dist_km += return_dist
                total_time_mins += return_time_mins

                waypoints.append({
                    "sequence": seq,
                    "location_name": f"{depot.get('name', 'Depot')} (Return)",
                    "latitude": depot["latitude"],
                    "longitude": depot["longitude"],
                    "action": "DEPOT_RETURN",
                    "sos_id": None,
                    "demand_kg": 0.0,
                    "eta_mins": round(total_time_mins, 1)
                })

                routes.append({
                    "vehicle_id": v_id,
                    "vehicle_code": v_code,
                    "relief_center_id": depot["id"],
                    "total_distance_km": round(total_dist_km, 2),
                    "estimated_duration_mins": round(total_time_mins, 1),
                    "cargo_payload_kg": round(current_load, 1),
                    "stops_count": len(waypoints) - 2,
                    "waypoints": waypoints
                })

        return routes
