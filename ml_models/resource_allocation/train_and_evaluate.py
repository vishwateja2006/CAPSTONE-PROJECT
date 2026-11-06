#!/usr/bin/env python3
"""Evaluation script for Model 5: Max-Min Fair Resource Allocation."""
from allocator import FairResourceAllocator

def main():
    print("Evaluating Model 5: Max-Min Constrained Linear Program...")
    inventory = {"WATER": 100, "FOOD": 60, "MEDICINE": 10}
    demands = [
        {"id": "REQ-1", "recipient": "Family Alpha", "people_count": 4, "urgency_score": 90.0, "needs": ["WATER", "FOOD", "MEDICINE"]},
        {"id": "REQ-2", "recipient": "Elderly Home", "people_count": 12, "urgency_score": 85.0, "needs": ["WATER", "MEDICINE"]}
    ]
    res = FairResourceAllocator.solve_fair_allocation(inventory, demands)
    print(f"Total Served: {res['total_served']} | Gini Coefficient: {res['gini_coefficient']}")
    print(f"Fairness Rating: {res['fairness_rating']}")
    print("Model 5 evaluation complete.")

if __name__ == "__main__":
    main()

