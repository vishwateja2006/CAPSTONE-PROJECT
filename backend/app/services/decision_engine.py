import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.ml.model_registry import ModelRegistry

class UnifiedDecisionEngine:
    """
    Phase 8: Optimization and Decision Engine.
    Synthesizes the outputs of all 5 AI/ML models into a single, cohesive,
    actionable Disaster Recommendation Package for Authority review and approval.
    """

    @classmethod
    def synthesize_recommendation_package(
        cls,
        disaster: Dict[str, Any],
        warehouse: Dict[str, Any],
        available_inventory: Dict[str, int],
        fleet_vehicles: List[Dict[str, Any]],
        incoming_distress_requests: List[Dict[str, Any]],
        satellite_imagery_tile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full 5-model synthesis workflow:
        1. Demand Forecasting (Model 1)
        2. Damage Detection & Road Blockages (Model 2)
        3. Emergency Message Classification (Model 3)
        4. Fair Resource Allocation (Model 5)
        5. Hazard-Aware Route Optimization (Model 4)
        """
        total_people = sum(r.get("people_count", 1) for r in incoming_distress_requests)
        disaster_type = disaster.get("disaster_type", "FLOOD")
        disaster_severity = disaster.get("severity", "CRITICAL")

        # -------------------------------------------------------------
        # STEP 1: Model 1 - Resource Demand Prediction
        # -------------------------------------------------------------
        demand_forecast = ModelRegistry.demand_forecaster.predict_demand(
            displaced_population=max(10, total_people),
            disaster_type=disaster_type,
            forecast_horizon_days=3,
            weather_severity_multiplier=1.2 if disaster_severity in ["CRITICAL", "HIGH"] else 1.0
        )

        # -------------------------------------------------------------
        # STEP 2: Model 2 - Satellite / Aerial Damage Detection
        # -------------------------------------------------------------
        if satellite_imagery_tile:
            damage_analysis = ModelRegistry.damage_detector.analyze_satellite_frame(satellite_imagery_tile)
        else:
            # Default simulated satellite tile over disaster epicenter
            damage_analysis = ModelRegistry.damage_detector.analyze_satellite_frame({
                "tile_id": f"COPERNICUS-{disaster.get('id', 'DIS-01')}",
                "center_lat": disaster.get("epicenter_lat", 13.0600),
                "center_lon": disaster.get("epicenter_lon", 80.2500),
                "spectral_water_index_mean": 0.48
            })

        # Extract hazard polygons and blocked road coordinates
        hazard_polygon_coords = damage_analysis["segmented_flood_polygon"]["coordinates"][0]
        # Convert [lon, lat] -> (lat, lon) for geometric intersection checks
        poly_lat_lon = [(c[1], c[0]) for c in hazard_polygon_coords]

        # -------------------------------------------------------------
        # STEP 3: Model 3 - Emergency Message NLP Triage
        # -------------------------------------------------------------
        triaged_requests = []
        for req in incoming_distress_requests:
            nlp_result = ModelRegistry.message_classifier.classify_message(req.get("description", ""))
            
            # Fuse NLP score with demographic factors
            fused_score = max(req.get("urgency_score", 50.0), nlp_result["urgency_score"])
            triaged_requests.append({
                "id": req["id"],
                "recipient": req.get("victim_name", "Beneficiary"),
                "people_count": req.get("people_count", 1),
                "urgency_score": fused_score,
                "urgency_level": nlp_result["urgency_level"],
                "needs": req.get("category_needs", ["FOOD", "WATER"]),
                "latitude": req.get("latitude", 13.0600),
                "longitude": req.get("longitude", 80.2500)
            })

        # -------------------------------------------------------------
        # STEP 4: Model 5 - Max-Min Fair Resource Allocation
        # -------------------------------------------------------------
        allocation_result = ModelRegistry.fair_allocator.solve_fair_allocation(
            available_inventory=available_inventory,
            demands=triaged_requests
        )

        # -------------------------------------------------------------
        # STEP 5: Model 4 - Intelligent CVRP Route Optimization
        # -------------------------------------------------------------
        depot_dict = {
            "id": warehouse["id"],
            "name": warehouse["name"],
            "latitude": warehouse["latitude"],
            "longitude": warehouse["longitude"]
        }

        routing_requests = []
        for r in triaged_requests:
            routing_requests.append({
                "id": r["id"],
                "victim_name": r["recipient"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "people_count": r["people_count"],
                "demand_kg": float(r["people_count"] * 15),
                "urgency_score": r["urgency_score"]
            })

        cvrp_routes = ModelRegistry.route_optimizer.solve_cvrp_mission(
            depot=depot_dict,
            vehicles=fleet_vehicles,
            requests=routing_requests,
            hazard_polygons=[poly_lat_lon]
        )

        # -------------------------------------------------------------
        # STEP 6: Synthesize Unified Disaster Action Plan (UDAP)
        # -------------------------------------------------------------
        action_plan_id = f"UDAP-{disaster.get('id', 'DIS')}-{int(datetime.utcnow().timestamp())}"
        
        return {
            "action_plan_id": action_plan_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "PENDING_AUTHORITY_APPROVAL",
            "executive_summary": {
                "disaster_name": disaster.get("name"),
                "severity": disaster_severity,
                "displaced_people": total_people,
                "total_households_serviced": allocation_result["total_served"],
                "total_distance_km": cvrp_routes["total_distance_km"],
                "vehicles_dispatched": cvrp_routes["vehicles_utilized"],
                "gini_fairness_coefficient": allocation_result["gini_coefficient"],
                "inaccessible_road_blocks_identified": len(damage_analysis["impassable_road_segments"])
            },
            "step1_demand_forecast": demand_forecast["projected_demands"],
            "step2_damage_intelligence": {
                "flood_extent_sqkm": damage_analysis["estimated_flood_area_sqkm"],
                "blocked_road_segments": damage_analysis["impassable_road_segments"]
            },
            "step3_nlp_triage_summary": {
                "critical_cases": sum(1 for r in triaged_requests if r["urgency_level"] == "CRITICAL"),
                "high_cases": sum(1 for r in triaged_requests if r["urgency_level"] == "HIGH")
            },
            "step4_fair_allocation_plan": {
                "allocations": allocation_result["allocations"],
                "unmet_demand_summary": allocation_result["unmet_demand_summary"],
                "gini_fairness_coefficient": allocation_result["gini_coefficient"]
            },
            "step5_route_dispatch_plan": cvrp_routes["routes"],
            "recommendation": (
                f"Authority action recommended: Authorize dispatch of {cvrp_routes['vehicles_utilized']} vehicles "
                f"from {warehouse.get('name')}. Supplies allocated proportionally with verified Gini equity "
                f"({allocation_result['gini_coefficient']}). Bypasses {len(damage_analysis['impassable_road_segments'])} flooded road obstacles."
            )
        }

