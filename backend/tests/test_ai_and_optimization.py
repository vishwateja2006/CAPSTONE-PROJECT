import unittest
import math
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai_model import DisasterAIEngine
from app.services.allocation_solver import FairAllocationSolver
from app.services.route_optimizer import RouteOptimizer, haversine_distance_km

class TestDisasterAIAndOptimization(unittest.TestCase):

    def test_haversine_distance(self):
        # Distance between Chennai Central (13.0837, 80.2785) and Marina Beach (13.0500, 80.2824)
        dist = haversine_distance_km(13.0837, 80.2785, 13.0500, 80.2824)
        self.assertGreater(dist, 3.5)
        self.assertLess(dist, 4.5)

    def test_ai_urgency_scoring_critical(self):
        # High-risk victim: infant, trapped, rising water, insulin
        score, level = DisasterAIEngine.calculate_urgency_score(
            people_count=4,
            special_needs=["infant", "insulin-dependent"],
            category_needs=["FOOD", "WATER", "MEDICAL"],
            description="Water level rising rapidly, family trapped on roof. Baby crying, mother needs insulin.",
            hours_elapsed=2.0
        )
        self.assertEqual(level, "CRITICAL")
        self.assertGreaterEqual(score, 80.0)

    def test_ai_urgency_scoring_moderate(self):
        # Moderate-risk request: dry clothes and water
        score, level = DisasterAIEngine.calculate_urgency_score(
            people_count=2,
            special_needs=[],
            category_needs=["WATER"],
            description="We need clean drinking water bottles and blankets.",
            hours_elapsed=0.5
        )
        self.assertIn(level, ["MEDIUM", "LOW"])
        self.assertLess(score, 60.0)

    def test_demand_forecasting(self):
        # Forecasting for 100 displaced people over 2 days
        forecast = DisasterAIEngine.forecast_resource_demand(
            displaced_population=100,
            days_ahead=2,
            weather_severity_multiplier=1.0
        )
        self.assertEqual(forecast["forecast_horizon_days"], 2)
        # 3.5 liters * 100 * 2 = 700 liters
        self.assertEqual(forecast["projected_demands"]["WATER_LITERS"], 700.0)
        # 2 rations * 100 * 2 = 400 rations
        self.assertEqual(forecast["projected_demands"]["FOOD_RATIONS"], 400)

    def test_gini_coefficient_calculation(self):
        # Perfect equality
        equal_vals = [10.0, 10.0, 10.0, 10.0]
        self.assertAlmostEqual(FairAllocationSolver.calculate_gini(equal_vals), 0.0, places=2)

        # High inequality
        unequal_vals = [0.0, 0.0, 0.0, 100.0]
        gini = FairAllocationSolver.calculate_gini(unequal_vals)
        self.assertGreater(gini, 0.6)

    def test_fair_resource_allocation(self):
        # 3 requests competing for scarce food
        inventory = {"FOOD": 15, "WATER": 30}
        sos_requests = [
            {
                "id": "req-1",
                "victim_name": "Critical Family",
                "people_count": 5,
                "urgency_score": 90.0,
                "category_needs": ["FOOD", "WATER"]
            },
            {
                "id": "req-2",
                "victim_name": "Medium Family",
                "people_count": 3,
                "urgency_score": 50.0,
                "category_needs": ["FOOD", "WATER"]
            },
            {
                "id": "req-3",
                "victim_name": "Low Family",
                "people_count": 2,
                "urgency_score": 30.0,
                "category_needs": ["FOOD", "WATER"]
            }
        ]

        result = FairAllocationSolver.allocate_supplies(inventory, sos_requests)
        self.assertEqual(len(result["allocations"]), 3)
        self.assertEqual(result["total_sos_served"], 3)
        # Total food allocated should not exceed stock
        total_food_allocated = sum(
            a["allocated_items"].get("FOOD", 0) for a in result["allocations"]
        )
        self.assertLessEqual(total_food_allocated, 15)
        # The critical family should receive more food than the low family
        self.assertGreater(
            result["allocations"][0]["allocated_items"]["FOOD"],
            result["allocations"][2]["allocated_items"]["FOOD"]
        )

    def test_route_optimizer(self):
        depot = {
            "id": "depot-1",
            "name": "Central Relief Hub",
            "latitude": 13.0827,
            "longitude": 80.2707
        }
        vehicles = [
            {
                "id": "veh-1",
                "code": "TRUCK-A",
                "capacity_kg": 500.0,
                "speed_kmh": 40.0
            }
        ]
        sos_requests = [
            {
                "id": "sos-1",
                "victim_name": "Victim 1",
                "latitude": 13.0600,
                "longitude": 80.2500,
                "demand_kg": 50.0,
                "urgency_score": 95.0,
                "people_count": 3
            },
            {
                "id": "sos-2",
                "victim_name": "Victim 2",
                "latitude": 13.0700,
                "longitude": 80.2600,
                "demand_kg": 40.0,
                "urgency_score": 75.0,
                "people_count": 2
            }
        ]

        routes = RouteOptimizer.optimize_routes(depot, vehicles, sos_requests)
        self.assertEqual(len(routes), 1)
        plan = routes[0]
        self.assertEqual(plan["vehicle_id"], "veh-1")
        # 1 start depot + 2 deliveries + 1 return depot = 4 waypoints
        self.assertEqual(len(plan["waypoints"]), 4)
        self.assertEqual(plan["waypoints"][0]["action"], "DEPOT_START")
        self.assertEqual(plan["waypoints"][-1]["action"], "DEPOT_RETURN")
        self.assertGreater(plan["total_distance_km"], 0.0)

if __name__ == "__main__":
    unittest.main()
