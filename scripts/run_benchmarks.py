#!/usr/bin/env python3
"""
ResQLink: Academic Benchmark Suite & LaTeX Table Generator.
Computes and formats formal academic evaluation tables for research papers and thesis defense.
"""

import sys
import os
import json

# Bulletproof backend import path resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
for path in [BACKEND_DIR, PROJECT_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

from app.services.evaluation_engine import (
    HistoricalBacktestingEngine,
    DiscreteEventSimulationEngine,
    ShadowModeValidationEngine
)

def format_latex_table(headers, rows, caption="Evaluation Metrics", label="tab:metrics"):
    col_spec = "|" + " c |" * len(headers)
    latex = []
    latex.append("\\begin{table}[htbp]")
    latex.append("  \\centering")
    latex.append(f"  \\caption{{{caption}}}")
    latex.append(f"  \\label{{{label}}}")
    latex.append(f"  \\begin{{tabular}}{{{col_spec}}}")
    latex.append("    \\hline")
    latex.append("    " + " & ".join(f"\\textbf{{{h}}}" for h in headers) + " \\\\")
    latex.append("    \\hline")
    for r in rows:
        latex.append("    " + " & ".join(str(cell) for cell in r) + " \\\\")
    latex.append("    \\hline")
    latex.append("  \\end{tabular}")
    latex.append("\\end{table}")
    return "\n".join(latex)

def main():
    print("=" * 78)
    print("  RESQLINK: ACADEMIC BENCHMARKS & RESEARCH EVALUATION SUITE")
    print("=" * 78)

    # 1. Demand Forecasting
    print("\n[BENCHMARK 1] Model 1: Resource Demand Forecasting (LSTM & Sphere)")
    demand_res = HistoricalBacktestingEngine.run_demand_forecasting_backtest()
    print(f"  Overall MAPE: {demand_res['mape_percent']}% | RMSE: {demand_res['rmse_liters']} Liters")
    print(f"  Accuracy:     {demand_res['accuracy_percent']}%")
    print("  Case Breakdown:")
    for c in demand_res["case_breakdown"]:
        print(f"    - {c['disaster']:<22} | Pop: {c['affected_pop']:>5} | Act: {c['actual_water_l']:>6}L | Pred: {c['predicted_water_l']:>6}L | Error: {c['percentage_error']}%")

    # 2. Damage Vision
    print("\n[BENCHMARK 2] Model 2: Disaster Damage Detection (Spectral NDWI & UNet)")
    vision_res = HistoricalBacktestingEngine.run_damage_vision_backtest()
    v_metrics = vision_res["metrics"]
    print(f"  Tiles Evaluated:  {vision_res['total_tiles_evaluated']}")
    print(f"  Mean IoU:         {v_metrics['mean_intersection_over_union_iou']}")
    print(f"  Precision:        {v_metrics['precision']} | Recall: {v_metrics['recall']} | F1-Score: {v_metrics['f1_score']}")
    print(f"  False Positives:  {v_metrics['false_positive_rate_percent']}%")

    # 3. NLP Distress Triage
    print("\n[BENCHMARK 3] Model 3: Emergency Distress NLP Classification (DistilBERT)")
    nlp_res = HistoricalBacktestingEngine.run_nlp_triage_backtest()
    n_metrics = nlp_res["metrics"]
    print(f"  Test Partition:   {nlp_res['test_partition_samples']} crisis messages")
    print(f"  Overall Accuracy: {n_metrics['overall_accuracy_percent']}%")
    print(f"  Macro F1-Score:   {n_metrics['macro_f1_score']}")
    print("  Per-Category Performance:")
    for cat in nlp_res["category_performance"]:
        print(f"    - {cat['category']:<18} | Precision: {cat['precision']} | Recall: {cat['recall']} | F1: {cat['f1']}")

    # 4. Shadow Mode Comparison
    print("\n[BENCHMARK 4] Shadow-Mode Empirical Validation (Traditional vs ResQLink)")
    shadow_res = ShadowModeValidationEngine.get_shadow_mode_comparisons()
    headers = ["Evaluation Metric", "Traditional Manual", "ResQLink Platform", "Improvement"]
    rows = []
    for comp in shadow_res["comparisons"]:
        rows.append([comp["metric"], comp["traditional_manual"], comp["resqlink_ai"], comp["improvement"]])
        print(f"  - {comp['metric']:<32} : {comp['traditional_manual']} vs {comp['resqlink_ai']} ({comp['improvement']})")

    # 5. Output LaTeX code for thesis paper
    print("\n" + "=" * 78)
    print("  LATEX CODE FOR CAPSTONE THESIS TABLE (COPY-PASTE READY)")
    print("=" * 78)
    print(format_latex_table(headers, rows, caption="Empirical Comparison between Traditional Relief and ResQLink AI", label="tab:shadow_mode"))
    print("\n[SUCCESS] Benchmark suite execution complete.\n")

if __name__ == "__main__":
    main()

