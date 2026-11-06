import unittest
import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.tracking_and_analytics_service import (
    TrackingAndAnalyticsService,
    CryptographicAuditLedger
)

class TestPhase10TrackingNotificationsAnalytics(unittest.TestCase):
    """
    Phase 10: Tracking, Notifications, and Analytics Test Suite.
    Validates delivery telemetry, cryptographic PoD receipts, low-stock threshold triggers,
    hash-chain audit ledger integrity, and offline sync reconciliation.
    """

    def setUp(self):
        # Clear or reset ledger for predictable test counts
        CryptographicAuditLedger._chain = []

    def test_01_cryptographic_proof_of_delivery(self):
        """Test generation and cryptographic signature of Proof-of-Delivery (PoD)."""
        pod = TrackingAndAnalyticsService.generate_proof_of_delivery(
            delivery_id="DEL-CHENNAI-001",
            waypoint_id="WP-VELACHERY-178",
            beneficiary_id="BEN-KAVITHA-01",
            delivered_items={"WATER": 10, "FOOD": 5, "MEDICINE": 1},
            agent_id="AGENT-VIKRAM",
            confirmation_code="OTP-8492"
        )

        self.assertIn("receipt_id", pod)
        self.assertTrue(pod["receipt_id"].startswith("POD-"))
        self.assertIn("pod_hash", pod)
        self.assertEqual(len(pod["pod_hash"]), 64) # SHA-256 hex length
        self.assertEqual(pod["status"], "VERIFIED_DELIVERED")
        self.assertEqual(pod["receipt_data"]["agent_id"], "AGENT-VIKRAM")

    def test_02_cryptographic_audit_ledger_integrity(self):
        """Test tamper-evident hash-chain integrity and block verification."""
        # Record 3 distinct blocks
        b1 = CryptographicAuditLedger.record_entry("AGENT-1", "VOLUNTEER", "DISPATCH", "DEL-01", {"status": "EN_ROUTE"})
        b2 = CryptographicAuditLedger.record_entry("AGENT-2", "VOLUNTEER", "DELIVERED", "DEL-01", {"status": "COMPLETED"})
        b3 = CryptographicAuditLedger.record_entry("AUTHORITY", "ADMIN", "CLOSE_MISSION", "DEL-01", {"status": "ARCHIVED"})

        self.assertEqual(b1["block_index"], 1)
        self.assertEqual(b2["block_index"], 2)
        self.assertEqual(b3["block_index"], 3)
        self.assertEqual(b2["prev_hash"], b1["block_hash"])
        self.assertEqual(b3["prev_hash"], b2["block_hash"])

        # Mathematical verification
        status = CryptographicAuditLedger.verify_integrity()
        self.assertTrue(status["valid"])
        self.assertEqual(status["total_blocks"], 3)
        self.assertIn("latest_hash", status)

    def test_03_tamper_detection_in_audit_ledger(self):
        """Verify that any modification to a historical block breaks cryptographic integrity."""
        b1 = CryptographicAuditLedger.record_entry("ACTOR", "ROLE", "ACTION_1", "E-1", {"val": 100})
        b2 = CryptographicAuditLedger.record_entry("ACTOR", "ROLE", "ACTION_2", "E-2", {"val": 200})

        # Malicious actor alters historical payload in block 1
        CryptographicAuditLedger._chain[0]["payload"]["val"] = 999
        CryptographicAuditLedger._chain[0]["payload_hash"] = "tampered_hash_value"

        tamper_status = CryptographicAuditLedger.verify_integrity()
        self.assertFalse(tamper_status["valid"])
        self.assertEqual(tamper_status["tampered_block"], 1)

    def test_04_low_stock_threshold_alerts(self):
        """Verify automated alert generation when warehouse stock drops below critical limits."""
        inventory = [
            {"category": "WATER", "quantity": 40, "min_threshold": 100}, # Critical deficit (40 <= 30% of 100? No, 40%) -> HIGH
            {"category": "MEDICINE", "quantity": 10, "min_threshold": 50}, # Critical deficit (10 <= 15) -> CRITICAL
            {"category": "FOOD", "quantity": 500, "min_threshold": 200} # Adequate
        ]

        alerts = TrackingAndAnalyticsService.check_low_stock_thresholds(
            warehouse_id="WH-CENTRAL",
            warehouse_name="Central Base Alpha",
            inventory=inventory
        )

        self.assertEqual(len(alerts), 2)
        categories = [a["item_category"] for a in alerts]
        self.assertIn("WATER", categories)
        self.assertIn("MEDICINE", categories)
        self.assertNotIn("FOOD", categories)

        med_alert = next(a for a in alerts if a["item_category"] == "MEDICINE")
        self.assertEqual(med_alert["severity"], "CRITICAL")
        self.assertEqual(med_alert["deficit"], 40)

    def test_05_offline_sync_batch_reconciliation(self):
        """Verify field sync reconciliation when volunteers reconnect after offline operation."""
        offline_batch = [
            {
                "record_type": "PROOF_OF_DELIVERY",
                "delivery_id": "DEL-OFFLINE-01",
                "waypoint_id": "WP-10",
                "beneficiary_id": "BEN-55",
                "items": {"FOOD": 4, "WATER": 8},
                "confirmation_code": "OFFLINE_SIGNATURE_OK"
            },
            {
                "record_type": "PROOF_OF_DELIVERY",
                "delivery_id": "DEL-OFFLINE-02",
                "waypoint_id": "WP-11",
                "beneficiary_id": "BEN-56",
                "items": {"MEDICINE": 2},
                "confirmation_code": "OFFLINE_SIGNATURE_OK"
            }
        ]

        sync_res = TrackingAndAnalyticsService.process_offline_sync_batch(
            agent_id="AGENT-PRIYA-FIELD",
            offline_records=offline_batch
        )

        self.assertEqual(sync_res["sync_status"], "COMPLETED")
        self.assertEqual(sync_res["total_submitted"], 2)
        self.assertEqual(sync_res["processed_successfully"], 2)
        self.assertEqual(sync_res["failed"], 0)

    def test_06_system_analytics_summary(self):
        """Verify multi-metric humanitarian operational analytics output."""
        summary = TrackingAndAnalyticsService.get_system_analytics_summary()
        self.assertIn("kpis", summary)
        kpis = summary["kpis"]
        self.assertGreaterEqual(kpis["demand_fulfillment_rate_percent"], 90.0)
        self.assertLessEqual(kpis["gini_fairness_index"], 0.25)
        self.assertIn("delivery_history_summary", summary)
        self.assertIn("warehouse_stock_levels", summary)
        self.assertIn("audit_ledger_status", summary)
        self.assertTrue(summary["audit_ledger_status"]["ledger_valid"])

if __name__ == "__main__":
    unittest.main()

