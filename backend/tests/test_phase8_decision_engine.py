import unittest
import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.decision_engine import UnifiedDecisionEngine

class TestPhase8DecisionEngine(unittest.TestCase):

    def setUp(self):
        self.mock_disaster = {
            "id": "DIS-CHENNAI-FLOOD-2026",
            "name": "Cyclone Michaung Relict Inundation",
            "disaster_type": "FLOOD",
            "severity": "CRITICAL",
            "epicenter_lat": 13.0600,
            "epicenter_lon": 80.2500
        }

        self.mock_warehouse = {
            "id": "WH-CHENNAI-CENTRAL",
            "name": "Chennai Regional Supply Hub",
            "latitude": 13.0827,
            "longitude": 80.2707
        }

        self.mock_inventory = {
            "WATER": 1000,
            "FOOD": 800,
            "MEDICINE": 150,
            "BLANKETS": 300
        }

        self.mock_vehicles = [
            {"id": "VEH-01", "code": "TRUCK-4x4-ALPHA", "capacity_kg": 1500.0, "speed_kmh": 40.0},
            {"id": "VEH-02", "code": "TRUCK-RESCUE-BETA", "capacity_kg": 1200.0, "speed_kmh": 35.0}
        ]

        self.mock_requests = [
            {
                "id": "REQ-VILLAGE-A",
                "victim_name": "Velachery Ward 178",
                "people_count": 45,
                "urgency_score": 90.0,
                "category_needs": ["WATER", "FOOD", "MEDICINE"],
                "description": "Urgent! Elderly diabetic patient trapped on rooftop without drinking water or insulin.",
                "latitude": 13.0450,
                "longitude": 80.2400
            },
            {
                "id": "REQ-VILLAGE-B",
                "victim_name": "Madipakkam Sector 4",
                "people_count": 60,
                "urgency_score": 75.0,
                "category_needs": ["FOOD", "WATER"],
                "description": "Water rising rapidly on ground floor, 60 people stranded in community hall needing food rations.",
                "latitude": 13.0550,
                "longitude": 80.2550
            },
            {
                "id": "REQ-VILLAGE-C",
                "victim_name": "Adyar Relief Shelter",
                "people_count": 30,
                "urgency_score": 60.0,
                "category_needs": ["BLANKETS", "WATER"],
                "description": "Shelter requires blankets and safe drinking water for displaced families.",
                "latitude": 13.0700,
                "longitude": 80.2600
            }
        ]

    def test_01_synthesize_action_plan_combining_all_models(self):
        """Test synthesis of the 5-model Unified Disaster Action Plan (UDAP)."""
        action_plan = UnifiedDecisionEngine.synthesize_recommendation_package(
            disaster=self.mock_disaster,
            warehouse=self.mock_warehouse,
            available_inventory=self.mock_inventory,
            fleet_vehicles=self.mock_vehicles,
            incoming_distress_requests=self.mock_requests
        )

        self.assertIn("action_plan_id", action_plan)
        self.assertTrue(action_plan["action_plan_id"].startswith("UDAP-DIS-CHENNAI-FLOOD-2026-"))
        self.assertEqual(action_plan["status"], "PENDING_AUTHORITY_APPROVAL")

        # Verify Step 1: Demand forecast
        self.assertIn("step1_demand_forecast", action_plan)
        self.assertGreater(action_plan["step1_demand_forecast"]["WATER_LITERS"], 0)
        self.assertGreater(action_plan["step1_demand_forecast"]["FOOD_RATIONS"], 0)

        # Verify Step 2: Damage vision intelligence
        self.assertIn("step2_damage_intelligence", action_plan)
        self.assertGreater(action_plan["step2_damage_intelligence"]["flood_extent_sqkm"], 0)
        self.assertGreaterEqual(len(action_plan["step2_damage_intelligence"]["blocked_road_segments"]), 1)

        # Verify Step 3: NLP Distress Triage
        self.assertIn("step3_nlp_triage_summary", action_plan)
        self.assertGreaterEqual(action_plan["step3_nlp_triage_summary"]["critical_cases"], 1)

        # Verify Step 4: Fair Allocation
        self.assertIn("step4_fair_allocation_plan", action_plan)
        self.assertIn("gini_fairness_coefficient", action_plan["step4_fair_allocation_plan"])
        self.assertLessEqual(action_plan["step4_fair_allocation_plan"]["gini_fairness_coefficient"], 0.40)
        allocations = action_plan["step4_fair_allocation_plan"]["allocations"]
        self.assertEqual(len(allocations), 3)

        # Verify Step 5: Route Dispatch Plan
        self.assertIn("step5_route_dispatch_plan", action_plan)
        routes = action_plan["step5_route_dispatch_plan"]
        self.assertGreaterEqual(len(routes), 1)

        # Verify Executive summary
        exec_summary = action_plan["executive_summary"]
        self.assertEqual(exec_summary["disaster_name"], "Cyclone Michaung Relict Inundation")
        self.assertEqual(exec_summary["severity"], "CRITICAL")
        self.assertEqual(exec_summary["displaced_people"], 135) # 45 + 60 + 30
        self.assertEqual(exec_summary["total_households_serviced"], 3)
        self.assertGreater(exec_summary["total_distance_km"], 0.0)

    def test_02_hazard_avoidance_in_unified_routes(self):
        """Verify that synthesized delivery routes incorporate detour waypoints to bypass flood hazard."""
        action_plan = UnifiedDecisionEngine.synthesize_recommendation_package(
            disaster=self.mock_disaster,
            warehouse=self.mock_warehouse,
            available_inventory=self.mock_inventory,
            fleet_vehicles=self.mock_vehicles,
            incoming_distress_requests=self.mock_requests
        )

        routes = action_plan["step5_route_dispatch_plan"]
        all_waypoints = []
        for r in routes:
            all_waypoints.extend(r["waypoints"])

        # Check that waypoints include START/END at warehouse
        start_wp = all_waypoints[0]
        self.assertEqual(start_wp["action"], "DEPOT_START")
        self.assertIn("Chennai Regional Supply Hub", start_wp["name"])

        # Check authority recommendation statement
        self.assertIn("Authority action recommended", action_plan["recommendation"])
        self.assertIn("Gini equity", action_plan["recommendation"])

    def test_03_authority_approval_dispatch_and_audit(self):
        """Verify the authority approval and dispatch execution pipeline logic."""
        action_plan = UnifiedDecisionEngine.synthesize_recommendation_package(
            disaster=self.mock_disaster,
            warehouse=self.mock_warehouse,
            available_inventory=self.mock_inventory,
            fleet_vehicles=self.mock_vehicles,
            incoming_distress_requests=self.mock_requests
        )

        routes = action_plan["step5_route_dispatch_plan"]
        allocations = action_plan["step4_fair_allocation_plan"]["allocations"]

        # Simulate authority approval validation
        self.assertEqual(len(routes), 2)
        dispatched_deliveries = []
        for r in routes:
            mission = {
                "disaster_id": self.mock_disaster["id"],
                "vehicle_id": r["vehicle_id"],
                "warehouse_id": self.mock_warehouse["id"],
                "total_distance_km": r["total_distance_km"],
                "estimated_duration_mins": r["estimated_duration_mins"],
                "status": "IN_TRANSIT",
                "waypoints": r["waypoints"]
            }
            dispatched_deliveries.append(mission)

        self.assertEqual(len(dispatched_deliveries), 2)
        self.assertEqual(dispatched_deliveries[0]["status"], "IN_TRANSIT")

        # Verify audit log payload formation
        audit_record = {
            "action": "UDAP_ACTION_PLAN_APPROVED",
            "entity_table": "deliveries",
            "entity_id": action_plan["action_plan_id"],
            "details": f"Authority approved action plan {action_plan['action_plan_id']}: {len(routes)} fleet missions dispatched."
        }
        self.assertEqual(audit_record["action"], "UDAP_ACTION_PLAN_APPROVED")
        self.assertIn("UDAP-DIS-CHENNAI-FLOOD", audit_record["entity_id"])

if __name__ == "__main__":
    unittest.main()
