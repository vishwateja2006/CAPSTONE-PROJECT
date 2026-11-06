import math
from typing import List, Dict, Any

class FairAllocationSolver:
    """
    Operations Research / Algorithmic module for Equitable Humanitarian Resource Allocation.
    Prevents hoarding and starvation through Max-Min Urgency-Weighted Fair Division.
    """

    @staticmethod
    def calculate_gini(values: List[float]) -> float:
        """
        Calculates the Gini Coefficient (0.0 = perfect equality, 1.0 = total inequality).
        Used to mathematically evaluate allocation fairness across relief recipients.
        """
        if not values or all(v == 0 for v in values):
            return 0.0
        n = len(values)
        sorted_vals = sorted(values)
        total = sum(sorted_vals)
        if total == 0:
            return 0.0
        cumulative_sum = sum((i + 1) * val for i, val in enumerate(sorted_vals))
        gini = (2.0 * cumulative_sum) / (n * total) - (n + 1) / n
        return round(max(0.0, min(gini, 1.0)), 4)

    @classmethod
    def allocate_supplies(
        cls,
        inventory_available: Dict[str, int],
        sos_requests: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Allocates available stock across pending SOS requests fairly.
        
        inventory_available: e.g. {"FOOD": 120, "WATER": 300, "MEDICAL": 25}
        sos_requests: list of dicts with:
          - id: str
          - victim_name: str
          - people_count: int
          - urgency_score: float (10-100)
          - category_needs: List[str] e.g. ["FOOD", "WATER"]
        """
        if not sos_requests:
            return {
                "allocations": [],
                "unmet_demands": inventory_available,
                "gini_fairness_coefficient": 0.0,
                "total_sos_served": 0
            }

        allocations: Dict[str, Dict[str, Any]] = {
            req["id"]: {
                "sos_id": req["id"],
                "victim_name": req.get("victim_name", "Anonymous"),
                "people_count": req.get("people_count", 1),
                "urgency_score": req.get("urgency_score", 50.0),
                "allocated_items": {},
                "satisfaction_ratio": 0.0
            }
            for req in sos_requests
        }

        unmet_summary: Dict[str, int] = {}
        total_delivered_per_capita: List[float] = []

        # Iterate category by category (e.g. FOOD, WATER, MEDICAL)
        for category, total_stock in inventory_available.items():
            if total_stock <= 0:
                unmet_summary[category] = sum(
                    req.get("people_count", 1) for req in sos_requests if category in req.get("category_needs", [])
                )
                continue

            # Filter requests needing this category
            candidate_reqs = [
                req for req in sos_requests if category in req.get("category_needs", [])
            ]
            if not candidate_reqs:
                continue

            # Standard standard per-person baseline need
            nominal_multiplier = 2 if category == "WATER" else 1
            total_demanded = sum(req.get("people_count", 1) * nominal_multiplier for req in candidate_reqs)

            if total_stock >= total_demanded:
                # Plentiful stock: full fulfillment
                for req in candidate_reqs:
                    qty = req.get("people_count", 1) * nominal_multiplier
                    allocations[req["id"]]["allocated_items"][category] = qty
                unmet_summary[category] = 0
            else:
                # Scarcity: Max-Min Proportional Fairness with Urgency Weighting
                # Compute weight: w_i = (urgency_score / 50.0) * (people_count ** 0.85)
                weights = []
                for req in candidate_reqs:
                    u_weight = (req.get("urgency_score", 50.0) / 50.0)
                    headcount_factor = math.pow(req.get("people_count", 1), 0.85)
                    weights.append(u_weight * headcount_factor)

                sum_weights = sum(weights)
                stock_left = total_stock

                # Stage 1: Survival Guarantee (at least 1 item if stock allows)
                for req in candidate_reqs:
                    if stock_left > 0:
                        allocations[req["id"]]["allocated_items"][category] = 1
                        stock_left -= 1
                    else:
                        allocations[req["id"]]["allocated_items"][category] = 0

                # Stage 2: Distribute remaining stock according to urgency weights
                if stock_left > 0 and sum_weights > 0:
                    for i, req in enumerate(candidate_reqs):
                        portion = int(math.floor(stock_left * (weights[i] / sum_weights)))
                        allocations[req["id"]]["allocated_items"][category] += portion

                unmet_summary[category] = max(0, total_demanded - total_stock)

        # Calculate per-person satisfaction and fairness index
        allocation_list = []
        for req in sos_requests:
            res = allocations[req["id"]]
            total_items = sum(res["allocated_items"].values())
            per_person = total_items / max(1, res["people_count"])
            total_delivered_per_capita.append(per_person)
            res["fairness_index"] = round(per_person, 2)
            allocation_list.append(res)

        gini = cls.calculate_gini(total_delivered_per_capita)

        return {
            "allocations": allocation_list,
            "total_sos_served": sum(1 for a in allocation_list if sum(a["allocated_items"].values()) > 0),
            "unmet_demand_summary": unmet_summary,
            "gini_fairness_coefficient": gini
        }

