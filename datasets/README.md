# ResQLink Real-World Datasets Repository

This directory contains benchmark datasets, sample partitions, and data provenance documentation used for training and evaluating ResQLink's five core AI/ML models:

| Directory | Target AI Model | Source / Provenance | Format |
| :--- | :--- | :--- | :--- |
| `fema_historical_declarations/` | Model 1 (Demand Forecaster) | FEMA Housing Declarations & ReliefWeb Retrospective Reports | JSON / Time-Series |
| `ml4floods_satellite_tiles/` | Model 2 (Damage Vision) | European Space Agency (ESA) Sentinel-2 Multispectral Partitions | GeoJSON / Spectral Indices |
| `appen_disaster_messages/` | Model 3 (Message Triage) | Figure Eight / Appen 30,000 Multilingual Crisis Corpus | JSON / Text Labels |
| `osm_road_networks/` | Model 4 (Route Optimizer) | OpenStreetMap Chennai Urban Road Graph | GeoJSON / Graph Nodes |
| `unhcr_resource_allocations/` | Model 5 (Fair Allocator) | UNHCR Operational Supply & Emergency Camp Rations | JSON / Constraints |

