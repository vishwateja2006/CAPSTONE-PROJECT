import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.resource_service import ResourceManagementService

class TestPhase6ResourceAndBeneficiaryManagement(unittest.TestCase):

    def test_01_inbound_donation_recording(self):
        """Verify that logging inbound donations creates or increments stock in the warehouse."""
        inventory = {}
        warehouse_id = "wh-alpha"

        # Record first donation: 500 cans of Water
        item = ResourceManagementService.record_inbound_donation(
            current_inventory=inventory,
            warehouse_id=warehouse_id,
            category="WATER",
            item_name="Purified Water Cans",
            quantity=500,
            unit="cans",
            threshold=150
        )
        self.assertEqual(item["quantity_available"], 500)
        self.assertEqual(item["item_category"], "WATER")

        # Record second donation of the same item: 300 cans added
        updated = ResourceManagementService.record_inbound_donation(
            current_inventory=inventory,
            warehouse_id=warehouse_id,
            category="WATER",
            item_name="Purified Water Cans",
            quantity=300
        )
        self.assertEqual(updated["quantity_available"], 800)

    def test_02_outbound_distribution_and_deduction(self):
        """Verify stock deduction on aid distribution, and prevent over-deduction."""
        inventory_item = {
            "item_name": "Emergency Food Rations",
            "quantity_available": 100,
            "quantity_reserved": 20
        }

        # Valid distribution of 40 units
        res = ResourceManagementService.record_outbound_distribution(inventory_item, 40)
        self.assertEqual(res["quantity_available"], 60)

        # Over-distribution: requesting 80 units when only 60 are available should raise ValueError
        with self.assertRaises(ValueError):
            ResourceManagementService.record_outbound_distribution(inventory_item, 80)

    def test_03_low_stock_threshold_alerts(self):
        """Verify that items with quantity <= minimum_threshold are flagged as low stock."""
        items = [
            {"item_name": "Water Cans", "warehouse_id": "wh-1", "item_category": "WATER", "quantity_available": 500, "minimum_threshold": 200},
            {"item_name": "First Aid Kits", "warehouse_id": "wh-1", "item_category": "MEDICAL", "quantity_available": 25, "minimum_threshold": 100},
            {"item_name": "Blankets", "warehouse_id": "wh-1", "item_category": "SHELTER", "quantity_available": 50, "minimum_threshold": 50}
        ]

        alerts = ResourceManagementService.check_low_stock_alerts(items)
        self.assertEqual(len(alerts), 2)  # First Aid Kits (25 <= 100) and Blankets (50 <= 50)
        flagged_names = [a["item_name"] for a in alerts]
        self.assertIn("First Aid Kits", flagged_names)
        self.assertIn("Blankets", flagged_names)
        self.assertNotIn("Water Cans", flagged_names)

    def test_04_beneficiary_urgency_evaluation(self):
        """Verify demographic vulnerability scoring and urgency tier classification."""
        # High vulnerability: 1 infant, 1 elderly, insulin condition
        eval_crit = ResourceManagementService.evaluate_beneficiary_urgency(
            household_size=5,
            infants=1,
            elderly=1,
            injured=1,
            special_conditions=["insulin-dependent"]
        )
        self.assertEqual(eval_crit["urgency_level"], "CRITICAL")
        self.assertGreaterEqual(eval_crit["urgency_score"], 80.0)

        # Moderate household: no infants, no injuries, no medical alerts
        eval_mod = ResourceManagementService.evaluate_beneficiary_urgency(
            household_size=3,
            infants=0,
            elderly=0,
            injured=0,
            special_conditions=[]
        )
        self.assertIn(eval_mod["urgency_level"], ["MEDIUM", "LOW"])
        self.assertLess(eval_mod["urgency_score"], 50.0)

if __name__ == "__main__":
    unittest.main()

