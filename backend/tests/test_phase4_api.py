import unittest
import sys
import os
import re

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai_model import DisasterAIEngine
from app.services.allocation_solver import FairAllocationSolver
from app.services.route_optimizer import RouteOptimizer

class TestPhase4BackendAPIDevelopment(unittest.TestCase):

    def setUp(self):
        self.api_file = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "app", "api", "v1", "api.py")
        )
        self.schemas_file = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "app", "schemas", "api_schemas.py")
        )

    def test_01_all_9_phase4_apis_mounted_on_router(self):
        """Verify that all 9 required Phase 4 API endpoints are declared in api.py."""
        with open(self.api_file, "r") as f:
            content = f.read()

        required_apis = [
            "/disasters",
            "/resources",
            "/beneficiaries",
            "/requests",
            "/vehicles",
            "/deliveries",
            "/predictions",
            "/routes",
            "/alerts"
        ]

        for api in required_apis:
            pattern = re.compile(rf'prefix="{re.escape(api)}"', re.IGNORECASE)
            self.assertIsNotNone(
                pattern.search(content),
                f"API router for '{api}' must be mounted in api.py"
            )

    def test_02_endpoint_modules_exist(self):
        """Verify that each of the 9 endpoint modules exists on disk."""
        endpoints_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "app", "api", "v1", "endpoints")
        )
        expected_modules = [
            "disasters_api.py",
            "resources_api.py",
            "beneficiaries_api.py",
            "requests_api.py",
            "vehicles_api.py",
            "deliveries_api.py",
            "predictions_api.py",
            "routes_api.py",
            "alerts_api.py"
        ]
        for mod in expected_modules:
            p = os.path.join(endpoints_dir, mod)
            self.assertTrue(os.path.exists(p), f"Module {mod} must exist in endpoints/")

    def test_03_pydantic_schemas_declared(self):
        """Verify that all Pydantic request/response schemas are declared in api_schemas.py."""
        with open(self.schemas_file, "r") as f:
            content = f.read()

        expected_schemas = [
            "DisasterCreate",
            "DisasterOut",
            "ResourceCreate",
            "ResourceOut",
            "BeneficiaryCreate",
            "BeneficiaryOut",
            "RequestCreate",
            "RequestOut",
            "VehicleCreate",
            "VehicleOut",
            "DeliveryCreate",
            "DeliveryOut",
            "PredictionCreate",
            "PredictionOut",
            "RouteOptimizationInput",
            "AlertCreate",
            "AlertOut"
        ]
        for s in expected_schemas:
            self.assertIn(f"class {s}", content, f"Schema {s} must be defined in api_schemas.py")

    def test_04_predictions_demand_forecast_service(self):
        """Verify demand forecast calculation for Model 1 endpoint (/predictions/demand-forecast)."""
        forecast = DisasterAIEngine.forecast_resource_demand(
            displaced_population=500,
            days_ahead=3,
            weather_severity_multiplier=1.2
        )
        # 3.5 * 500 * 3 * 1.2 = 6300 L
        self.assertAlmostEqual(forecast["projected_demands"]["WATER_LITERS"], 6300.0, places=1)
        # 2 * 500 * 3 = 3000 rations
        self.assertEqual(forecast["projected_demands"]["FOOD_RATIONS"], 3000)

    def test_05_predictions_nlp_triage_service(self):
        """Verify NLP triage calculation for Model 3 endpoint (/requests and /predictions/nlp-triage)."""
        score, level = DisasterAIEngine.calculate_urgency_score(
            people_count=4,
            special_needs=["infant", "insulin-dependent"],
            category_needs=["FOOD", "WATER", "MEDICAL"],
            description="Water level rising rapidly, family trapped on roof. Baby crying, mother needs insulin."
        )
        self.assertEqual(level, "CRITICAL")
        self.assertGreaterEqual(score, 80.0)

    def test_06_routes_cvrp_optimization_service(self):
        """Verify route optimization CVRP computation for Model 4 endpoint (/routes/optimize)."""
        depot = {"id": "wh-01", "name": "Central Hub", "latitude": 13.0837, "longitude": 80.2785}
        vehicles = [{"id": "v-01", "code": "TRUCK-1", "capacity_kg": 1000.0, "speed_kmh": 40.0}]
        requests = [
            {"id": "r-01", "victim_name": "Victim 1", "latitude": 13.0650, "longitude": 80.2550, "people_count": 4, "urgency_score": 90.0, "demand_kg": 60.0}
        ]
        routes = RouteOptimizer.optimize_routes(depot, vehicles, requests)
        self.assertEqual(len(routes), 1)
        self.assertEqual(routes[0]["vehicle_id"], "v-01")
        self.assertGreater(routes[0]["total_distance_km"], 0.0)

    def test_07_fair_resource_allocation_service(self):
        """Verify Max-Min fair allocation computation for Model 5 endpoint (/routes/fair-allocation)."""
        inventory = {"FOOD": 20, "WATER": 40}
        requests = [
            {"id": "s-1", "victim_name": "Family 1", "people_count": 4, "urgency_score": 95.0, "category_needs": ["FOOD", "WATER"]},
            {"id": "s-2", "victim_name": "Family 2", "people_count": 2, "urgency_score": 50.0, "category_needs": ["FOOD", "WATER"]}
        ]
        result = FairAllocationSolver.allocate_supplies(inventory, requests)
        self.assertEqual(len(result["allocations"]), 2)
        self.assertLessEqual(result["gini_fairness_coefficient"], 0.3)

if __name__ == "__main__":
    unittest.main()
