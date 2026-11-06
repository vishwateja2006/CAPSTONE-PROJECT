import re
from typing import List, Dict, Any, Tuple
from datetime import datetime

class DisasterAIEngine:
    """
    AI/ML module for Disaster Triage & Demand Forecasting.
    - Urgency Scoring NLP & Multi-Signal Assessment
    - Resource Demand Forecasting
    """

    CRITICAL_KEYWORDS = {
        "heart", "oxygen", "trapped", "collapsed", "pregnant", "bleeding", "unconscious",
        "drowning", "infant", "newborn", "stroke", "insulin", "amputation", "fire", "hypothermia",
        "critical", "dying", "suffocating", "crushed"
    }

    HIGH_KEYWORDS = {
        "elderly", "asthma", "injured", "fracture", "cut", "fever", "diabetic",
        "rising water", "roof", "no food", "dehydrated", "wheelchair", "disabled", "child"
    }

    MODERATE_KEYWORDS = {
        "water", "food", "ration", "shelter", "medicine", "dry clothes", "blanket", "battery"
    }

    @classmethod
    def calculate_urgency_score(
        cls,
        people_count: int,
        special_needs: List[str],
        category_needs: List[str],
        description: str = "",
        hours_elapsed: float = 0.0
    ) -> Tuple[float, str]:
        """
        Calculates an AI urgency score (0.0 to 100.0) and assigns an Urgency Level.
        Combines semantic NLP signals with demographic and temporal vulnerabilities.
        """
        score = 30.0  # Base score for an emergency request

        desc_lower = (description or "").lower()
        
        # 1. Keyword semantic scoring (NLP)
        critical_hits = sum(1 for kw in cls.CRITICAL_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', desc_lower))
        high_hits = sum(1 for kw in cls.HIGH_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', desc_lower))
        moderate_hits = sum(1 for kw in cls.MODERATE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', desc_lower))

        score += min(critical_hits * 18.0, 36.0)
        score += min(high_hits * 8.0, 20.0)
        score += min(moderate_hits * 3.0, 9.0)

        # 2. Demographic vulnerability scoring
        special_needs_lower = [s.lower() for s in special_needs]
        for need in special_needs_lower:
            if any(term in need for term in ["infant", "baby", "pregnant", "insulin", "oxygen", "trauma"]):
                score += 15.0
            elif any(term in need for term in ["elderly", "disabled", "child", "injury"]):
                score += 10.0
            else:
                score += 5.0

        # 3. Scale by affected headcount
        if people_count > 10:
            score += 15.0
        elif people_count > 5:
            score += 10.0
        elif people_count > 1:
            score += 5.0

        # 4. Medical / Evacuation critical need tags
        cat_upper = [c.upper() for c in category_needs]
        if "MEDICAL" in cat_upper or "EVACUATION" in cat_upper:
            score += 12.0

        # 5. Temporal decay / urgency escalation
        # The longer a victim waits, the higher the urgency becomes
        time_penalty = min(hours_elapsed * 1.5, 15.0)
        score += time_penalty

        # Clamp between 10.0 and 100.0
        final_score = round(min(max(score, 10.0), 100.0), 1)

        # Determine level
        if final_score >= 80.0:
            level = "CRITICAL"
        elif final_score >= 60.0:
            level = "HIGH"
        elif final_score >= 40.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return final_score, level

    @classmethod
    def forecast_resource_demand(
        cls,
        displaced_population: int,
        days_ahead: int = 2,
        weather_severity_multiplier: float = 1.2
    ) -> Dict[str, Any]:
        """
        Forecasting resource depletion and procurement needs for relief centers.
        Calculations based on Sphere Humanitarian Standards:
        - 3.0 Liters clean drinking water per person / day
        - 2,100 kcal / 2 food ration kits per person / day
        - 1 medical emergency kit per 50 people
        - 1 hygiene / sanitation kit per 5 people
        """
        base_water_liters_per_day = 3.5 * displaced_population * weather_severity_multiplier
        base_food_rations_per_day = 2 * displaced_population
        medical_kits_per_day = max(1, int((displaced_population / 40) * weather_severity_multiplier))
        hygiene_kits_per_day = max(1, int(displaced_population / 5))

        total_water = round(base_water_liters_per_day * days_ahead, 1)
        total_food = int(base_food_rations_per_day * days_ahead)
        total_medical = int(medical_kits_per_day * days_ahead)
        total_hygiene = int(hygiene_kits_per_day * days_ahead)

        return {
            "forecast_horizon_days": days_ahead,
            "projected_displaced_people": displaced_population,
            "projected_demands": {
                "WATER_LITERS": total_water,
                "FOOD_RATIONS": total_food,
                "MEDICAL_KITS": total_medical,
                "HYGIENE_KITS": total_hygiene
            },
            "burn_rate_per_day": {
                "water_liters_daily": round(base_water_liters_per_day, 1),
                "food_rations_daily": round(base_food_rations_per_day, 1),
                "medical_kits_daily": medical_kits_per_day
            }
        }
