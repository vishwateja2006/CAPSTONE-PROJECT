#!/usr/bin/env python3
"""Training & evaluation script for Model 1: Demand Prediction."""
from forecaster import ResourceDemandForecaster

def main():
    print("Evaluating Model 1 on FEMA Historical Flood Cases...")
    cases = [
        {"name": "Cyclone Vardah", "pop": 1200},
        {"name": "Chennai Floods", "pop": 3500},
        {"name": "Kerala Floods", "pop": 2800}
    ]
    for c in cases:
        pred = ResourceDemandForecaster.predict_demand(c["pop"], "FLOOD", 3, 1.2)
        print(f"[{c['name']}] Pop: {c['pop']} -> Water: {pred['projected_demands']['WATER_LITERS']} L, Food: {pred['projected_demands']['FOOD_RATIONS']} rations")
    print("Model 1 evaluation completed successfully.")

if __name__ == "__main__":
    main()

