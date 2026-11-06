#!/usr/bin/env python3
"""Evaluation script for Model 4: Intelligent Route Optimization."""
from optimizer import IntelligentRouteOptimizer

def main():
    print("Evaluating Model 4: OR-Tools CVRP with Hazard Polygon Detours...")
    depot = {"id": "WH-1", "name": "Central Hub", "latitude": 13.0827, "longitude": 80.2707}
    vehicles = [{"id": "V-1", "code": "TRUCK-ALPHA", "capacity_kg": 1500.0, "speed_kmh": 40.0}]
    requests = [
        {"id": "REQ-1", "victim_name": "Family A", "latitude": 13.0450, "longitude": 80.2400, "people_count": 4, "urgency_score": 90.0}
    ]
    hazard = [(13.05, 80.245), (13.065, 80.245), (13.065, 80.255), (13.05, 80.255)]
    res = IntelligentRouteOptimizer.solve_cvrp_mission(depot, vehicles, requests, [hazard])
    print(f"Vehicles utilized: {res['vehicles_utilized']} | Distance: {res['total_distance_km']} km")
    print(f"Waypoints in route: {len(res['routes'][0]['waypoints'])}")
    print("Model 4 evaluation complete.")

if __name__ == "__main__":
    main()
