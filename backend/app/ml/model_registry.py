from app.ml.model1_demand_forecaster import ResourceDemandForecaster
from app.ml.model2_damage_detector import DisasterDamageDetector
from app.ml.model3_message_classifier import EmergencyMessageClassifier
from app.ml.model4_route_optimizer import IntelligentRouteOptimizer
from app.ml.model5_fair_allocator import FairResourceAllocator

class ModelRegistry:
    """
    Central AI/ML Engine Model Registry for ResQLink.
    Exposes all 5 primary intelligence models.
    """

    demand_forecaster = ResourceDemandForecaster
    damage_detector = DisasterDamageDetector
    message_classifier = EmergencyMessageClassifier
    route_optimizer = IntelligentRouteOptimizer
    fair_allocator = FairResourceAllocator

    @classmethod
    def get_models_metadata(cls):
        return [
            {
                "id": 1,
                "name": "Resource Demand Prediction",
                "type": "TIME_SERIES_FORECASTING",
                "algorithm": "LSTM & Sphere Standards",
                "dataset": "FEMA Disaster Declarations & Housing Assistance",
                "status": "ONLINE"
            },
            {
                "id": 2,
                "name": "Disaster Damage Detection",
                "type": "COMPUTER_VISION",
                "algorithm": "CNN / UNet & Spectral NDWI",
                "dataset": "ML4Floods & xView2",
                "status": "ONLINE"
            },
            {
                "id": 3,
                "name": "Emergency Message Classification",
                "type": "NATURAL_LANGUAGE_PROCESSING",
                "algorithm": "Transformer / DistilBERT",
                "dataset": "Appen / Figure Eight 30k Crisis Messages",
                "status": "ONLINE"
            },
            {
                "id": 4,
                "name": "Intelligent Route Optimization",
                "type": "OPERATIONS_RESEARCH",
                "algorithm": "Google OR-Tools CVRP & Dijkstra Detours",
                "dataset": "OpenStreetMap Road Network Graph",
                "status": "ONLINE"
            },
            {
                "id": 5,
                "name": "Fair Resource Allocation",
                "type": "CONSTRAINED_OPTIMIZATION",
                "algorithm": "Max-Min Proportional Linear Programming",
                "dataset": "Mathematical Equity & Gini Index Benchmark",
                "status": "ONLINE"
            }
        ]

