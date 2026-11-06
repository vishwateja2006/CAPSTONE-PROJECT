import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.model_registry import ModelRegistry

class TestPhase7AIModelDevelopment(unittest.TestCase):

    def test_01_model1_demand_prediction(self):
        """Test Model 1: Resource Demand Prediction (LSTM & Sphere Standards)."""
        pred = ModelRegistry.demand_forecaster.predict_demand(
            displaced_population=1000,
            disaster_type="FLOOD",
            forecast_horizon_days=3,
            weather_severity_multiplier=1.2
        )
        self.assertEqual(pred["model_name"], "LSTM-Sphere-DemandForecaster-v1")
        self.assertEqual(pred["horizon_days"], 3)
        # 1000 people * 3.5 L * 1.3 flood * 1.2 weather * 3 days = 16,380 L
        self.assertAlmostEqual(pred["projected_demands"]["WATER_LITERS"], 16380.0, places=1)
        # 1000 * 2 * 3 = 6000 rations
        self.assertEqual(pred["projected_demands"]["FOOD_RATIONS"], 6000)
        self.assertEqual(len(pred["time_series_projections"]), 3)

    def test_02_model2_damage_detection(self):
        """Test Model 2: Disaster Damage Detection (CNN / UNet & Spectral NDWI)."""
        metadata = {
            "tile_id": "TEST-SENTINEL2-TILE",
            "center_lat": 13.0600,
            "center_lon": 80.2500,
            "spectral_water_index_mean": 0.52,
            "cloud_cover_percent": 5.0
        }
        res = ModelRegistry.damage_detector.analyze_satellite_frame(metadata, ndwi_threshold=0.3)
        self.assertTrue(res["water_detected"])
        self.assertGreater(res["estimated_flood_area_sqkm"], 0.5)
        self.assertEqual(len(res["impassable_road_segments"]), 1)
        self.assertEqual(res["impassable_road_segments"][0]["status"], "IMPASSABLE_FLOOD_3FT")

    def test_03_model3_emergency_message_classification(self):
        """Test Model 3: Emergency Message Classification (DistilBERT Appen 36 categories)."""
        msg = "Our house is surrounded by water. We need baby food for the infant and insulin for grandmother."
        nlp_out = ModelRegistry.message_classifier.classify_message(msg)
        self.assertEqual(nlp_out["model_name"], "DistilBERT-DisasterNLP-Classifier-v3")
        self.assertIn("water", nlp_out["detected_categories"])
        self.assertIn("medical_help", nlp_out["detected_categories"])
        self.assertIn("child_or_infant", nlp_out["detected_categories"])
        self.assertEqual(nlp_out["urgency_level"], "CRITICAL")
        self.assertGreaterEqual(nlp_out["urgency_score"], 80.0)

    def test_04_model4_intelligent_route_optimization(self):
        """Test Model 4: Intelligent Route Optimization (CVRP with hazard avoidance)."""
        depot = {"id": "wh-1", "name": "Central Depot", "latitude": 13.0800, "longitude": 80.2500}
        vehicles = [{"id": "v-1", "code": "TRUCK-1", "capacity_kg": 1000.0, "speed_kmh": 40.0}]
        requests = [
            {"id": "s-1", "victim_name": "Critical Family", "latitude": 13.0000, "longitude": 80.2500, "people_count": 4, "urgency_score": 95.0}
        ]
        # Hazard polygon blocking direct path
        flood_poly = [
            (13.030, 80.240),
            (13.050, 80.240),
            (13.050, 80.260),
            (13.030, 80.260)
        ]

        result = ModelRegistry.route_optimizer.solve_cvrp_mission(
            depot=depot,
            vehicles=vehicles,
            requests=requests,
            hazard_polygons=[flood_poly]
        )
        self.assertEqual(len(result["routes"]), 1)
        route = result["routes"][0]
        # Verify detour was inserted
        self.assertGreater(route["hazard_detours_inserted"], 0)
        actions = [wp["action"] for wp in route["waypoints"]]
        self.assertIn("HAZARD_BYPASS", actions)

    def test_05_model5_fair_resource_allocation(self):
        """Test Model 5: Fair Resource Allocation (Max-Min Constrained Optimization & Gini)."""
        inventory = {"FOOD": 15, "WATER": 30}
        demands = [
            {"id": "r1", "recipient": "Critical Family", "people_count": 4, "urgency_score": 90.0, "needs": ["FOOD", "WATER"]},
            {"id": "r2", "recipient": "Moderate Family", "people_count": 2, "urgency_score": 50.0, "needs": ["FOOD", "WATER"]},
            {"id": "r3", "recipient": "Low Family", "people_count": 2, "urgency_score": 30.0, "needs": ["FOOD", "WATER"]}
        ]

        res = ModelRegistry.fair_allocator.solve_fair_allocation(inventory, demands)
        self.assertEqual(res["total_served"], 3)
        self.assertLessEqual(res["gini_coefficient"], 0.25)
        self.assertEqual(res["fairness_rating"], "EXCELLENT_EQUITY")

        # Verify critical family received more or equal to others
        self.assertGreaterEqual(
            res["allocations"][0]["allocated"]["FOOD"],
            res["allocations"][2]["allocated"]["FOOD"]
        )

    def test_06_model_registry_metadata(self):
        """Verify all 5 models are registered and reported online."""
        meta = ModelRegistry.get_models_metadata()
        self.assertEqual(len(meta), 5)
        model_names = [m["name"] for m in meta]
        self.assertIn("Resource Demand Prediction", model_names)
        self.assertIn("Disaster Damage Detection", model_names)
        self.assertIn("Emergency Message Classification", model_names)
        self.assertIn("Intelligent Route Optimization", model_names)
        self.assertIn("Fair Resource Allocation", model_names)

if __name__ == "__main__":
    unittest.main()

