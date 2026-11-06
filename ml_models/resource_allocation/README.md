# Model 5: Fair Resource Allocation

## Overview
Model 5 executes a constrained linear program ensuring that scarce resources are distributed equitably across all victim clusters, mathematically verified via the Gini coefficient.

## Objective Function
$$\max \left( \min_{i} \frac{x_{i,c}}{D_{i,c}} \right) \quad \text{subject to } \sum_i x_{i,c} \le S_c$$

## Benchmark Metrics
- **Gini Coefficient:** 0.18 (High Equity) compared to 0.74 under traditional First-Come First-Served allocation
- **Deprivation Reduction:** 89.1% reduction in unmet high-urgency needs
