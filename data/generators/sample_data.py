"""
Sample data generator for creating realistic test data.
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from faker import Faker
import json

from config.settings import settings

# Initialize Faker
fake = Faker()

class SampleDataGenerator:
    """Generates realistic sample data for testing and development."""
    
    def __init__(self):
        self.fake = fake
        self.industries = [
            "Technology", "Healthcare", "Finance", "Retail", "Manufacturing",
            "Education", "Real Estate", "Consulting", "Media", "Transportation"
        ]
        self.regions = [
            "North America", "Europe", "Asia Pacific", "Latin America", "Middle East"
        ]
        self.contract_types = [
            "Software License", "Professional Services", "Support Agreement",
            "Consulting", "Training", "Partnership", "Reseller"
        ]
        self.metric_categories = [
            "Financial", "Operational", "Customer", "Product", "Market"
        ]
        self.metric_names = {
            "Financial": ["Revenue", "Profit Margin", "Cost per Customer", "LTV"],
            "Operational": ["Uptime", "Response Time", "Support Tickets", "Utilization"],
            "Customer": ["Satisfaction Score", "Engagement", "Retention Rate", "NPS"],
            "Product": ["Feature Usage", "Adoption Rate", "Performance", "Reliability"],
            "Market": ["Market Share", "Competition", "Growth Rate", "Penetration"]
        }
    
    def generate_customers(self, count: int = None) -> List[Dict[str, Any]]:
        count = count or settings.SAMPLE_CUSTOMERS_COUNT
        customers = []
        for i in range(count):
            company = fake.company()
            industry = random.choice(self.industries)
            region = random.choice(self.regions)
            total_spend = random.uniform(1000, 50000)
            lifetime_value = total_spend * random.uniform(1.2, 2.5)
            mrr = total_spend / random.uniform(12, 48)
            last_activity = fake.date_time_between(
                start_date=datetime.now() - timedelta(days=365),
                end_date=datetime.now()
            )
            engagement_score = random.uniform(0.1, 1.0)
            support_tickets = random.randint(0, 50)
            churn_risk = self._calculate_churn_risk(engagement_score, support_tickets, last_activity)
            growth_potential = random.uniform(0.1, 1.0)
            customer_segment = self._determine_segment(lifetime_value, engagement_score)
            customer = {
                "customer_id": f"CUST_{str(uuid.uuid4())[:8].upper()}",
                "name": fake.name(),
                "email": fake.email(),
                "phone": fake.phone_number(),
                "company": company,
                "industry": industry,
                "company_size": random.choice(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
                "job_title": fake.job(),
                "region": region,
                "country": fake.country(),
                "city": fake.city(),
                "subscription_tier": random.choice(["basic", "professional", "enterprise"]),
                "total_spend": round(total_spend, 4),
                "lifetime_value": round(lifetime_value, 4),
                "monthly_recurring_revenue": round(mrr, 4),
                "last_activity": last_activity,
                "engagement_score": round(engagement_score, 4),
                "support_tickets_count": support_tickets,
                "churn_risk_score": round(churn_risk, 4),
                "growth_potential_score": round(growth_potential, 4),
                "customer_segment": customer_segment,
                "ai_insights": self._generate_customer_insights(industry, engagement_score, churn_risk),
                "status": "active",
                "source": random.choice(["website", "referral", "cold_outreach", "partnership"])
            }
            customers.append(customer)
        return customers

    def generate_contracts(self, customers: List[Dict], count: int = None) -> List[Dict[str, Any]]:
        count = count or settings.SAMPLE_CONTRACTS_COUNT
        contracts = []
        for i in range(count):
            customer = random.choice(customers)
            contract_type = random.choice(self.contract_types)
            start_date = fake.date_time_between(
                start_date=datetime.now() - timedelta(days=2*365),
                end_date=datetime.now() - timedelta(days=180)
            )
            duration_months = random.randint(6, 36)
            end_date = start_date + timedelta(days=duration_months * 30)
            signed_date = start_date - timedelta(days=random.randint(1, 30))
            renewal_date = end_date - timedelta(days=random.randint(30, 90))
            contract_value = random.uniform(5000, 100000)
            billing_frequency = random.choice(["monthly", "quarterly", "annually"])
            renewal_probability = self._calculate_renewal_probability(
                customer.get("engagement_score", 0.5),
                customer.get("churn_risk_score", 0.5)
            )
            legal_risk_score = random.uniform(0.1, 0.9)
            compliance_status = "compliant" if legal_risk_score < 0.7 else "review_needed"
            contract = {
                "contract_id": f"CONT_{str(uuid.uuid4())[:8].upper()}",
                "customer_id": customer["customer_id"],
                "contract_type": contract_type,
                "contract_name": f"{contract_type} Agreement - {customer['company']}",
                "start_date": start_date,
                "end_date": end_date,
                "signed_date": signed_date,
                "renewal_date": renewal_date,
                "contract_value": round(contract_value, 2),
                "currency": "USD",
                "billing_frequency": billing_frequency,
                "payment_terms": "Net 30",
                "status": "active" if end_date > datetime.now() else "expired",
                "terms": f"Standard {contract_type} terms and conditions",
                "special_conditions": random.choice([None, "Custom SLA", "Extended support", "Training included"]),
                "renewal_probability": round(renewal_probability, 3),
                "legal_risk_score": round(legal_risk_score, 3),
                "compliance_status": compliance_status,
                "ai_analysis": self._generate_contract_analysis(contract_type, renewal_probability, legal_risk_score),
                "performance_score": round(random.uniform(0.5, 1.0), 3),
                "satisfaction_score": round(random.uniform(0.6, 1.0), 3),
                "utilization_rate": round(random.uniform(0.3, 1.0), 3)
            }
            contracts.append(contract)
        return contracts

    def generate_analysis(self, customers: List[Dict], contracts: List[Dict], count: int = None) -> List[Dict[str, Any]]:
        count = count or settings.SAMPLE_ANALYSIS_COUNT
        analyses = []
        for i in range(count):
            customer = random.choice(customers)
            contract = random.choice(contracts) if contracts else None
            category = random.choice(self.metric_categories)
            metric_name = random.choice(self.metric_names[category])
            metric_value = self._generate_metric_value(metric_name)
            analysis_date = fake.date_time_between(
                start_date=datetime.now() - timedelta(days=90),
                end_date=datetime.now()
            )
            period_start = analysis_date - timedelta(days=30)
            period_end = analysis_date
            previous_value = metric_value * random.uniform(0.8, 1.2)
            change_percentage = ((metric_value - previous_value) / previous_value) * 100
            trend_direction = "increasing" if change_percentage > 0 else "decreasing" if change_percentage < 0 else "stable"
            confidence_score = random.uniform(0.6, 1.0)
            risk_level = self._determine_risk_level(change_percentage, confidence_score)
            analysis = {
                "analysis_id": f"ANAL_{str(uuid.uuid4())[:8].upper()}",
                "customer_id": customer["customer_id"],
                "contract_id": contract["contract_id"] if contract else None,
                "metric_name": metric_name,
                "metric_value": round(metric_value, 2),
                "metric_unit": self._get_metric_unit(metric_name),
                "metric_category": category,
                "analysis_date": analysis_date,
                "period_start": period_start,
                "period_end": period_end,
                "trend_direction": trend_direction,
                "trend_magnitude": round(abs(change_percentage), 2),
                "previous_value": round(previous_value, 2),
                "change_percentage": round(change_percentage, 2),
                "confidence_score": round(confidence_score, 3),
                "ai_insights": self._generate_analysis_insights(metric_name, change_percentage, trend_direction),
                "recommendations": self._generate_recommendations(metric_name, change_percentage, risk_level),
                "risk_level": risk_level,
                "data_source": random.choice(["internal_system", "api", "manual_entry", "ai_generated"]),
                "analysis_type": random.choice(["real-time", "batch", "predictive"]),
                "tags": json.dumps([category, metric_name, customer["industry"]])
            }
            analyses.append(analysis)
        return analyses

    def _calculate_churn_risk(self, engagement_score: float, support_tickets: int, last_activity: datetime) -> float:
        days_inactive = (datetime.now() - last_activity).days
        inactivity_risk = min(days_inactive / 365, 1.0)
        support_risk = min(support_tickets / 50, 1.0)
        churn_risk = (
            (1 - engagement_score) * 0.4 +
            inactivity_risk * 0.3 +
            support_risk * 0.3
        )
        return min(churn_risk, 1.0)

    def _determine_segment(self, lifetime_value: float, engagement_score: float) -> str:
        if lifetime_value > 50000 and engagement_score > 0.8:
            return "enterprise"
        elif lifetime_value > 20000 or engagement_score > 0.7:
            return "professional"
        elif lifetime_value > 5000:
            return "standard"
        else:
            return "basic"

    def _calculate_renewal_probability(self, engagement_score: float, churn_risk: float) -> float:
        base_probability = 0.7
        engagement_bonus = engagement_score * 0.2
        churn_penalty = churn_risk * 0.3
        probability = base_probability + engagement_bonus - churn_penalty
        return max(0.1, min(probability, 1.0))

    def _generate_metric_value(self, metric_name: str) -> float:
        if "Revenue" in metric_name:
            return random.uniform(10000, 1000000)
        elif "Margin" in metric_name:
            return random.uniform(10, 80)
        elif "Score" in metric_name or "Rate" in metric_name:
            return random.uniform(0, 100)
        elif "Time" in metric_name:
            return random.uniform(0.1, 10)
        elif "Count" in metric_name or "Tickets" in metric_name:
            return random.randint(1, 100)
        else:
            return random.uniform(1, 1000)

    def _get_metric_unit(self, metric_name: str) -> str:
        if "Revenue" in metric_name or "Value" in metric_name:
            return "USD"
        elif "Score" in metric_name or "Rate" in metric_name:
            return "percentage"
        elif "Time" in metric_name:
            return "seconds"
        elif "Count" in metric_name or "Tickets" in metric_name:
            return "count"
        else:
            return "units"

    def _determine_risk_level(self, change_percentage: float, confidence_score: float) -> str:
        if abs(change_percentage) > 50 and confidence_score > 0.8:
            return "critical"
        elif abs(change_percentage) > 25 and confidence_score > 0.7:
            return "high"
        elif abs(change_percentage) > 10:
            return "medium"
        else:
            return "low"

    def _generate_customer_insights(self, industry: str, engagement_score: float, churn_risk: float) -> str:
        insights = []
        if engagement_score > 0.8:
            insights.append("High engagement indicates strong product-market fit")
        elif engagement_score < 0.3:
            insights.append("Low engagement suggests need for onboarding improvement")
        if churn_risk > 0.7:
            insights.append("High churn risk - recommend proactive outreach")
        elif churn_risk < 0.3:
            insights.append("Low churn risk - opportunity for expansion")
        insights.append(f"Industry: {industry} - typical patterns observed")
        return "; ".join(insights)

    def _generate_contract_analysis(self, contract_type: str, renewal_probability: float, legal_risk: float) -> str:
        analysis = []
        if renewal_probability > 0.8:
            analysis.append("High renewal likelihood based on performance metrics")
        elif renewal_probability < 0.4:
            analysis.append("Low renewal probability - intervention recommended")
        if legal_risk > 0.7:
            analysis.append("Legal review recommended due to risk factors")
        analysis.append(f"Contract type: {contract_type} - standard terms applied")
        return "; ".join(analysis)

    def _generate_analysis_insights(self, metric_name: str, change_percentage: float, trend_direction: str) -> str:
        if abs(change_percentage) > 20:
            return f"Significant {trend_direction} trend in {metric_name} requires attention"
        elif abs(change_percentage) > 10:
            return f"Moderate {trend_direction} trend in {metric_name} - monitor closely"
        else:
            return f"Stable {metric_name} performance within normal range"

    def _generate_recommendations(self, metric_name: str, change_percentage: float, risk_level: str) -> str:
        if risk_level == "critical":
            return f"Immediate action required for {metric_name} - investigate root cause"
        elif risk_level == "high":
            return f"Review {metric_name} trends and consider intervention strategies"
        elif change_percentage > 0:
            return f"Positive {metric_name} trend - consider scaling successful initiatives"
        else:
            return f"Monitor {metric_name} for stabilization or improvement"

# Global generator instance
data_generator = SampleDataGenerator() 