from app.api.v1.endpoints import (
    auth,
    disasters_api as disasters,
    resources_api as resources,
    beneficiaries_api as beneficiaries,
    requests_api as requests,
    vehicles_api as vehicles,
    deliveries_api as deliveries,
    predictions_api as predictions,
    routes_api as routes,
    alerts_api as alerts,
    decision_api as decision,
    analytics_api as analytics,
    evaluation_api as evaluation
)

__all__ = [
    "auth",
    "disasters",
    "resources",
    "beneficiaries",
    "requests",
    "vehicles",
    "deliveries",
    "predictions",
    "routes",
    "alerts",
    "decision",
    "analytics",
    "evaluation"
]
