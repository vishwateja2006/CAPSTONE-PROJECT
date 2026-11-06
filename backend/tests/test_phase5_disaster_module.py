import unittest
import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.disaster_service import DisasterManagementService

class TestPhase5DisasterManagementModule(unittest.TestCase):

    def test_01_village_hazard_locations_generation(self):
        """Verify that registering a flood in a district with 3 villages generates correct polygons and risk levels."""
        disaster_id = "dis-flood-01"
        district = "Kanchipuram District"
        villages = ["Village Alpha", "Village Beta", "Village Gamma"]
        base_lat = 12.8342
        base_lon = 79.7036

        locations = DisasterManagementService.generate_village_hazard_locations(
            disaster_id=disaster_id,
            district=district,
            villages=villages,
            base_lat=base_lat,
            base_lon=base_lon,
            risk_level="RED"
        )

        self.assertEqual(len(locations), 3)
        for i, loc in enumerate(locations):
            self.assertEqual(loc["disaster_id"], disaster_id)
            self.assertEqual(loc["district"], district)
            self.assertIn(villages[i], loc["name"])
            self.assertEqual(loc["risk_level"], "RED")
            self.assertFalse(loc["is_accessible"])  # RED risk level is marked inaccessible

            # Verify GeoJSON Polygon structure
            geo = json.loads(loc["boundary_geojson"])
            self.assertEqual(geo["type"], "Polygon")
            self.assertEqual(len(geo["coordinates"][0]), 5)  # Closed ring

    def test_02_disaster_lifecycle_state_machine_transitions(self):
        """Verify valid and invalid state transitions: ALERT -> ACTIVE -> RECOVERY -> RESOLVED -> CLOSED."""
        # Valid forward transitions
        self.assertTrue(DisasterManagementService.validate_status_transition("ALERT", "ACTIVE"))
        self.assertTrue(DisasterManagementService.validate_status_transition("ACTIVE", "RECOVERY"))
        self.assertTrue(DisasterManagementService.validate_status_transition("RECOVERY", "RESOLVED"))
        self.assertTrue(DisasterManagementService.validate_status_transition("RESOLVED", "CLOSED"))

        # Valid abort / skip to closed
        self.assertTrue(DisasterManagementService.validate_status_transition("ACTIVE", "CLOSED"))

        # Invalid backwards or illegal skips
        self.assertFalse(DisasterManagementService.validate_status_transition("ALERT", "RESOLVED"))
        self.assertFalse(DisasterManagementService.validate_status_transition("CLOSED", "ACTIVE"))
        self.assertFalse(DisasterManagementService.validate_status_transition("RESOLVED", "ACTIVE"))

    def test_03_emergency_alert_generation(self):
        """Verify automated emergency alert drafting on critical flood declaration."""
        alert = DisasterManagementService.draft_emergency_alert(
            disaster_name="Flash Flood Surge",
            disaster_type="FLOOD",
            severity="CRITICAL",
            district="Chengalpattu",
            villages=["Tambaram Ward 5", "Mudichur Basin"]
        )

        self.assertIn("EMERGENCY CRITICAL WARNING", alert["title"])
        self.assertIn("Chengalpattu", alert["message"])
        self.assertIn("Mudichur Basin", alert["message"])
        self.assertEqual(alert["severity"], "CRITICAL")
        self.assertEqual(alert["broadcast_channel"], "ALL")

if __name__ == "__main__":
    unittest.main()

