# Model 2: Disaster Damage Detection

## Overview
Model 2 processes Sentinel-2 optical imagery to segment flood water bodies and extract road obstacles for vehicle routing.

## Spectral Index
$$\text{NDWI} = \frac{\text{Green} - \text{NIR}}{\text{Green} + \text{NIR}}$$

## Benchmark Metrics
- **Mean IoU:** 0.892
- **Precision:** 0.924
- **Recall:** 0.886
- **F1-Score:** 0.905 on ML4Floods validation partition

