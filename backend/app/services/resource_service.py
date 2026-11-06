from typing import List, Dict, Any, Optional
from datetime import datetime

class ResourceManagementService:
    """
    Business logic for inventory tracking, donations, stock allocation,
    and beneficiary request lifecycles.
    """

    @staticmethod
    def record_inbound_donation(
        current_inventory: Dict[str, Dict[str, Any]],
        warehouse_id: str,
        category: str,
        item_name: str,
        quantity: int,
        unit: str = "units",
        threshold: int = 100
    ) -> Dict[str, Any]:
        """
        Processes an incoming donor pledge or supplier delivery, updating warehouse stock.
        """
        cat = category.upper()
        item_key = f"{warehouse_id}_{cat}_{item_name.lower()}"

        if item_key in current_inventory:
            current_inventory[item_key]["quantity_available"] += quantity
        else:
            current_inventory[item_key] = {
                "warehouse_id": warehouse_id,
                "item_category": cat,
                "item_name": item_name,
                "quantity_available": quantity,
                "quantity_reserved": 0,
                "unit": unit,
                "minimum_threshold": threshold,
                "updated_at": datetime.utcnow()
            }

        return current_inventory[item_key]

    @staticmethod
    def record_outbound_distribution(
        inventory_item: Dict[str, Any],
        quantity_to_distribute: int
    ) -> Dict[str, Any]:
        """
        Deducts stock when aid items are loaded and distributed via relief vehicles.
        """
        available = inventory_item.get("quantity_available", 0)
        if quantity_to_distribute > available:
            raise ValueError(f"Insufficient stock: requested {quantity_to_distribute}, only {available} available.")

        inventory_item["quantity_available"] -= quantity_to_distribute
        inventory_item["quantity_reserved"] = max(0, inventory_item.get("quantity_reserved", 0) - quantity_to_distribute)
        inventory_item["updated_at"] = datetime.utcnow()

        return inventory_item

    @staticmethod
    def check_low_stock_alerts(inventory_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans inventory and returns alerts for items below their safety threshold.
        """
        low_stock = []
        for item in inventory_items:
            if item.get("quantity_available", 0) <= item.get("minimum_threshold", 100):
                low_stock.append({
                    "item_name": item.get("item_name"),
                    "warehouse_id": item.get("warehouse_id"),
                    "category": item.get("item_category"),
                    "quantity_available": item.get("quantity_available"),
                    "threshold": item.get("minimum_threshold"),
                    "shortage": item.get("minimum_threshold", 100) - item.get("quantity_available", 0)
                })
        return low_stock

    @staticmethod
    def evaluate_beneficiary_urgency(
        household_size: int,
        infants: int,
        elderly: int,
        injured: int,
        special_conditions: List[str]
    ) -> Dict[str, Any]:
        """
        Calculates demographic vulnerability score (0-100) and urgency level.
        """
        score = 30.0  # Base emergency intake score
        score += min(infants * 18.0, 36.0)
        score += min(elderly * 12.0, 24.0)
        score += min(injured * 20.0, 40.0)

        for cond in special_conditions:
            c_low = cond.lower()
            if any(k in c_low for k in ["insulin", "oxygen", "pregnant", "trauma"]):
                score += 15.0
            else:
                score += 5.0

        if household_size > 6:
            score += 10.0

        final_score = round(min(max(score, 10.0), 100.0), 1)

        if final_score >= 80.0:
            level = "CRITICAL"
        elif final_score >= 60.0:
            level = "HIGH"
        elif final_score >= 40.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "urgency_score": final_score,
            "urgency_level": level,
            "vulnerability_breakdown": {
                "infants": infants,
                "elderly": elderly,
                "injured": injured,
                "conditions_count": len(special_conditions)
            }
        }
