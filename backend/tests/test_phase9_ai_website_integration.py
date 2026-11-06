import unittest
import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.model_registry import ModelRegistry
from app.services.decision_engine import UnifiedDecisionEngine

class TestPhase9AIWebsiteIntegration(unittest.TestCase):
    """
    Phase 9: AI and Website Integration Test Suite.
    Validates that FastAPI endpoints, ModelRegistry, and frontend payload contracts
    harmoniously execute, return compliant JSON schemas, and support human-in-the-loop approval.
    """

    def test_01_models_catalog_metadata(self):
        """Verify models catalog endpoint returns 5 active AI models with valid training datasets."""
        catalog = ModelRegistry.get_models_metadata()
        self.assertEqual(len(catalog), 5)
        model_names = [m["name"] for m in catalog]
        self.assertIn("Resource Demand Prediction", model_names)
        self.assertIn("Disaster Damage Detection", model_names)
        self.assertIn("Emergency Message Classification", model_names)
        self.assertIn("Intelligent Route Optimization", model_names)
        self.assertIn("Fair Resource Allocation", model_names)

        for m in catalog:
            self.assertEqual(m["status"], "ONLINE")
            self.assertTrue(len(m["dataset"]) > 0)

    def test_02_model1_demand_prediction_integration(self):
        """Verify Model 1 contract for frontend demand prediction slider interactions."""
        res = ModelRegistry.demand_forecaster.predict_demand(
            displaced_population=850,
            disaster_type="FLOOD",
            forecast_horizon_days=3,
            weather_severity_multiplier=1.2
        )
        self.assertIn("projected_demands", res)
        demands = res["projected_demands"]
        self.assertIn("WATER_LITERS", demands)
        self.assertIn("FOOD_RATIONS", demands)
        self.assertIn("MEDICAL_KITS", demands)
        self.assertIn("HYGIENE_KITS", demands)
        self.assertEqual(len(res["time_series_projections"]), 3)

    def test_03_model2_damage_vision_integration(self):
        """Verify Model 2 contract for satellite segmentation and road blockage detection."""
        res = ModelRegistry.damage_detector.analyze_satellite_frame({
            "tile_id": "SENTINEL-2B-CHENNAI-T14",
            "center_lat": 13.0600,
            "center_lon": 80.2500,
            "spectral_water_index_mean": 0.48,
            "cloud_cover_percent": 5.0
        }, ndwi_threshold=0.3)

        self.assertTrue(res["water_detected"])
        self.assertGreater(res["estimated_flood_area_sqkm"], 0.0)
        self.assertIn("segmented_flood_polygon", res)
        self.assertGreaterEqual(len(res["impassable_road_segments"]), 1)

    def test_04_model3_nlp_distress_classification_integration(self):
        """Verify Model 3 contract for parsing incoming SOS distress messages into Appen 36 categories."""
        text = "Water reached 4 feet inside the ground floor. Grandmother is diabetic and needs insulin urgently."
        res = ModelRegistry.message_classifier.classify_message(text=text)

        self.assertIn("detected_categories", res)
        self.assertIn("medical_help", res["detected_categories"])
        self.assertIn("water", res["detected_categories"])
        self.assertGreaterEqual(res["urgency_score"], 80.0)
        self.assertEqual(res["urgency_level"], "CRITICAL")

    def test_05_model4_route_optimization_integration(self):
        """Verify Model 4 contract for OR-Tools CVRP dispatch with hazard detour waypoints."""
        depot = {"id": "WH-1", "name": "Central Depot", "latitude": 13.0827, "longitude": 80.2707}
        vehicles = [{"id": "V-1", "code": "TRUCK-4X4", "capacity_kg": 1500.0, "speed_kmh": 40.0}]
        requests = [
            {"id": "REQ-1", "victim_name": "Family A", "latitude": 13.0450, "longitude": 80.2400, "people_count": 4, "urgency_score": 90.0}
        ]
        res = ModelRegistry.route_optimizer.solve_cvrp_mission(depot, vehicles, requests)
        self.assertEqual(res["vehicles_utilized"], 1)
        self.assertGreater(res["total_distance_km"], 0.0)
        self.assertEqual(len(res["routes"]), 1)
        self.assertGreaterEqual(len(res["routes"][0]["waypoints"]), 3)

    def test_06_model5_fair_allocation_integration(self):
        """Verify Model 5 contract for Max-Min resource allocation and Gini verification."""
        inventory = {"WATER": 500, "FOOD": 300, "MEDICINE": 50}
        demands = [
            {"id": "REQ-1", "recipient": "Shelter Alpha", "people_count": 20, "urgency_score": 90.0, "needs": ["WATER", "FOOD"]},
            {"id": "REQ-2", "recipient": "Shelter Beta", "people_count": 30, "urgency_score": 70.0, "needs": ["WATER", "FOOD"]}
        ]
        res = ModelRegistry.fair_allocator.solve_fair_allocation(inventory, demands)
        self.assertEqual(res["total_served"], 2)
        self.assertLessEqual(res["gini_coefficient"], 0.35)
        self.assertEqual(len(res["allocations"]), 2)

    def test_07_unified_action_plan_decision_pipeline(self):
        """Verify full 5-model synthesis and human-in-the-loop authorization pipeline."""
        disaster = {
            "id": "DIS-01", "name": "Chennai Floods", "disaster_type": "FLOOD", "severity": "CRITICAL",
            "epicenter_lat": 13.0600, "epicenter_lon": 80.2500
        }
        warehouse = {
            "id": "WH-01", "name": "Central Base", "latitude": 13.0827, "longitude": 80.2707
        }
        inventory = {"WATER": 1000, "FOOD": 1000, "MEDICINE": 100}
        vehicles = [{"id": "V-1", "code": "TRUCK-1", "capacity_kg": 1500.0, "speed_kmh": 40.0}]
        requests = [
            {
                "id": "REQ-1", "victim_name": "Citizen A", "people_count": 5, "urgency_score": 90.0,
                "category_needs": ["WATER", "FOOD"], "description": "Need food urgently",
                "latitude": 13.0500, "longitude": 80.2600
            }
        ]

        action_plan = UnifiedDecisionEngine.synthesize_recommendation_package(
            disaster=disaster, warehouse=warehouse, available_inventory=inventory,
            fleet_vehicles=vehicles, incoming_distress_requests=requests
        )

        self.assertEqual(action_plan["status"], "PENDING_AUTHORITY_APPROVAL")
        self.assertIn("step1_demand_forecast", action_plan)
        self.assertIn("step2_damage_intelligence", action_plan)
        self.assertIn("step3_nlp_triage_summary", action_plan)
        self.assertIn("step4_fair_allocation_plan", action_plan)
        self.assertIn("step5_route_dispatch_plan", action_plan)

if __name__ == "__main__":
    unittest.main()
