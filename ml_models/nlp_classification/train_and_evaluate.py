#!/usr/bin/env python3
"""Evaluation script for Model 3: Emergency Distress Message NLP Classification."""
from classifier import EmergencyMessageClassifier

def main():
    print("Evaluating Model 3 on Appen Crisis Message Samples...")
    samples = [
        "We are trapped on the roof. The infant needs milk and grandmother needs insulin immediately.",
        "Road blocked by fallen trees near canal bridge. Need power restoration."
    ]
    for s in samples:
        res = EmergencyMessageClassifier.classify_message(s)
        print(f"Text: \"{s[:50]}...\"")
        print(f"  -> Categories: {res['detected_categories']}")
        print(f"  -> Urgency: {res['urgency_score']}/100 [{res['urgency_level']}]")
    print("Model 3 evaluation complete.")

if __name__ == "__main__":
    main()
