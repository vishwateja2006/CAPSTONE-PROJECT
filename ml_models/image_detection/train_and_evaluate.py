#!/usr/bin/env python3
"""Evaluation script for Model 2: Satellite Disaster Damage Detection."""
from detector import DisasterDamageDetector

def main():
    print("Evaluating Model 2 on ML4Floods Sentinel-2 Tiles...")
    tile = {
        "tile_id": "TEST-SENTINEL-ADYAR",
        "center_lat": 13.0600,
        "center_lon": 80.2500,
        "spectral_water_index_mean": 0.48
    }
    res = DisasterDamageDetector.analyze_satellite_frame(tile, ndwi_threshold=0.30)
    print(f"Tile: {res['tile_id']} -> Water: {res['water_detected']} | Area: {res['estimated_flood_area_sqkm']} sq km")
    print(f"Blocked Road Segments: {len(res['impassable_road_segments'])}")
    print("Model 2 evaluation complete.")

if __name__ == "__main__":
    main()

