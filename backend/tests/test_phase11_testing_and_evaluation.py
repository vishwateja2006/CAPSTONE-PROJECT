import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.evaluation_engine import (
    HistoricalBacktestingEngine,
    DiscreteEventSimulationEngine,
    ShadowModeValidationEngine
)

class TestPhase11TestingAndEvaluation(unittest.TestCase):
    """
    Phase 11: Formal Academic Testing & Evaluation Test Suite.
    Validates historical backtesting, discrete-event stochastic simulations,
    and shadow-mode validation benchmarking against manual relief operations.
    """

    def test_01_demand_forecasting_historical_backtesting(self):
        """Verify Model 1 historical backtesting metrics (MAPE & RMSE)."""
        res = HistoricalBacktestingEngine.run_demand_forecasting_backtest()
        self.assertIn("mape_percent", res)
        self.assertIn("rmse_liters", res)
        # Verify acceptable error bounds
        self.assertLess(res["mape_percent"], 15.0, "MAPE should be below 15%")
        self.assertGreater(res["accuracy_percent"], 85.0)
        self.assertEqual(res["historical_evaluations_count"], 5)
        self.assertEqual(len(res["case_breakdown"]), 5)

    def test_02_damage_vision_historical_backtesting(self):
        """Verify Model 2 satellite damage detection metrics on benchmark partitions."""
        res = HistoricalBacktestingEngine.run_damage_vision_backtest()
        metrics = res["metrics"]
        self.assertGreaterEqual(metrics["mean_intersection_over_union_iou"], 0.85)
        self.assertGreaterEqual(metrics["f1_score"], 0.88)
        self.assertLessEqual(metrics["false_positive_rate_percent"], 5.0)
        self.assertEqual(res["total_tiles_evaluated"], 120)

    def test_03_nlp_triage_historical_backtesting(self):
        """Verify Model 3 NLP triage metrics against 30k Appen crisis partition."""
        res = HistoricalBacktestingEngine.run_nlp_triage_backtest()
        metrics = res["metrics"]
        self.assertGreaterEqual(metrics["overall_accuracy_percent"], 90.0)
        self.assertGreaterEqual(metrics["macro_f1_score"], 0.90)
        self.assertEqual(res["test_partition_samples"], 4500)
        self.assertEqual(len(res["category_performance"]), 4)

    def test_04_discrete_event_simulation_resilience(self):
        """Verify system dynamic adaptation during road closures and vehicle failures."""
        sim = DiscreteEventSimulationEngine.run_disruption_simulation(
            road_closure_active=True,
            vehicle_failure_active=True,
            unexpected_sos_influx=40
        )
        self.assertEqual(sim["performance_under_disruption"]["unserved_casualties"], 0)
        self.assertGreaterEqual(sim["performance_under_disruption"]["mission_success_rate_percent"], 95.0)
        self.assertLessEqual(sim["performance_under_disruption"]["final_gini_fairness"], 0.25)
        self.assertGreaterEqual(len(sim["timeline"]), 5)

    def test_05_shadow_mode_comparative_superiority(self):
        """Verify statistical superiority of ResQLink AI over traditional manual FCFS operations."""
        shadow = ShadowModeValidationEngine.get_shadow_mode_comparisons()
        comparisons = {c["metric"]: c for c in shadow["comparisons"]}

        # Delivery time improvement
        time_metric = comparisons["Average Relief Delivery Time"]
        self.assertIn("Faster Delivery", time_metric["improvement"])

        # Unmet demand improvement
        unmet_metric = comparisons["Unmet High-Urgency Demand"]
        self.assertIn("Reduction in Unmet Needs", unmet_metric["improvement"])

        # Gini fairness improvement
        gini_metric = comparisons["Fairness Gini Index (0=Fair, 1=Hoarded)"]
        self.assertIn("0.18", gini_metric["resqlink_ai"])
        self.assertIn("0.74", gini_metric["traditional_manual"])

        # Hazard avoidance
        hazard_metric = comparisons["Submerged Vehicle Incidents"]
        self.assertIn("100% Hazard Avoidance", hazard_metric["improvement"])

if __name__ == "__main__":
    unittest.main()

