"""
Predictive analyzer for AI-powered business predictions.
"""
import logging
import json
import sys
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import psycopg2

# Add the parent directory to the Python path to allow imports from config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config.settings import settings
from ai.models.llm_config import llm_config
from langchain.schema import HumanMessage
from database import get_connection_context

logger = logging.getLogger(__name__)

class PredictiveAnalyzer:
    """
    AI-powered predictive analyzer for business forecasting.
    This class provides methods to predict customer churn, revenue forecasts, and customer lifetime value using AI and database data.
    """
    
    def __init__(self):
        # Initialize the language model for predictions
        self.llm = llm_config.get_prediction_llm()
        
    def get_connection(self):
        """
        Get a connection from the connection pool.
        Note: This method is deprecated. Use get_connection_context() instead.
        """
        from database import get_connection
        return get_connection()
    
    def predict_customer_churn(self, customer_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Predict customer churn risk and provide recommendations.
        If customer_id is provided, analyze a single customer; otherwise, analyze all customers.
        """
        logger.info(f"Predicting churn risk for customer: {customer_id or 'all'}")
        
        try:
            with get_connection_context() as conn:
                cursor = conn.cursor()
                try:
                    if customer_id:
                        # Analyze a specific customer by ID
                        cursor.execute("""
                            SELECT 
                                customer_id, name, company, lifetime_value, engagement_score,
                                churn_risk_score, support_tickets_count, last_activity,
                                customer_segment, ai_insights
                            FROM customers
                            WHERE customer_id = %s
                        """, (customer_id,))
                        
                        customer_data = cursor.fetchone()
                        if not customer_data:
                            return {"error": "Customer not found"}
                        
                        # Get customer's contracts
                        cursor.execute("""
                            SELECT contract_id, contract_type, contract_value, renewal_probability,
                                   performance_score, satisfaction_score
                            FROM contracts
                            WHERE customer_id = %s AND status = 'active'
                        """, (customer_id,))
                        
                        contracts = cursor.fetchall()
                        
                        # Get recent analysis for customer
                        cursor.execute("""
                            SELECT metric_name, metric_value, trend_direction, risk_level
                            FROM analysis
                            WHERE customer_id = %s
                            ORDER BY analysis_date DESC
                            LIMIT 10
                        """, (customer_id,))
                        
                        analysis = cursor.fetchall()
                        
                        # Prepare all relevant data for AI prediction
                        prediction_data = {
                            "customer": {
                                "id": customer_data[0],
                                "name": customer_data[1],
                                "company": customer_data[2],
                                "lifetime_value": float(customer_data[3]),
                                "engagement_score": float(customer_data[4]),
                                "churn_risk_score": float(customer_data[5]),
                                "support_tickets": customer_data[6],
                                "last_activity": customer_data[7].isoformat() if customer_data[7] else None,
                                "segment": customer_data[8],
                                "current_insights": customer_data[9]
                            },
                            "contracts": [{"id": c[0], "type": c[1], "value": float(c[2]), 
                                         "renewal_prob": float(c[3]), "performance": float(c[4]), 
                                         "satisfaction": float(c[5])} for c in contracts],
                            "recent_analysis": [{"metric": a[0], "value": float(a[1]), 
                                               "trend": a[2], "risk": a[3]} for a in analysis]
                        }
                    else:
                        # Analyze all customers for churn risk
                        cursor.execute("""
                            SELECT 
                                customer_id, name, company, lifetime_value, engagement_score,
                                churn_risk_score, support_tickets_count, customer_segment
                            FROM customers
                            WHERE status = 'active'
                            ORDER BY churn_risk_score DESC
                            LIMIT 20
                        """)
                        
                        high_risk_customers = cursor.fetchall()
                        
                        # Prepare data for AI prediction
                        prediction_data = {
                            "high_risk_customers": [{"id": c[0], "name": c[1], "company": c[2], 
                                                   "lifetime_value": float(c[3]), "engagement": float(c[4]),
                                                   "churn_risk": float(c[5]), "support_tickets": c[6],
                                                   "segment": c[7]} for c in high_risk_customers]
                        }
                finally:
                    cursor.close()
            
            
            # Generate AI predictions using the helper method
            predictions = self._generate_churn_predictions(prediction_data)
            
            # Calculate overall churn risk and risk segments for summary
            overall_churn_risk = 0
            risk_segments = []
            high_risk_count = 0
            
            if "high_risk_customers" in prediction_data:
                customers = prediction_data["high_risk_customers"]
                if customers:
                    # Calculate average churn risk
                    total_risk = sum(c.get('churn_risk', 0) for c in customers)
                    overall_churn_risk = total_risk / len(customers)
                    
                    # Count high risk customers
                    high_risk_count = len([c for c in customers if c.get('churn_risk', 0) > 0.7])
                    
                    # Create risk segments for visualization
                    low_risk = len([c for c in customers if c.get('churn_risk', 0) <= 0.3])
                    medium_risk = len([c for c in customers if 0.3 < c.get('churn_risk', 0) <= 0.7])
                    high_risk = len([c for c in customers if c.get('churn_risk', 0) > 0.7])
                    
                    risk_segments = [
                        {"risk_level": "Low", "count": low_risk},
                        {"risk_level": "Medium", "count": medium_risk},
                        {"risk_level": "High", "count": high_risk}
                    ]
            
            # Get insights from AI predictions
            insights = predictions.get("predictions", [])
            if not insights or "error" in predictions:
                # Provide basic insights if AI prediction fails
                insights = [
                    "Monitor high-risk customers closely",
                    "Focus on improving engagement scores",
                    "Address support ticket issues promptly"
                ]
            
            # Return all results in a dictionary
            return {
                "overall_churn_risk": overall_churn_risk,
                "churn_trend": 0.05,  # Placeholder trend
                "high_risk_count": high_risk_count,
                "risk_trend": 0.02,  # Placeholder trend
                "risk_segments": risk_segments,
                "high_risk_customers": prediction_data.get("high_risk_customers", []),
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting customer churn: {e}")
            return {"error": str(e)}
    
    def predict_revenue_forecast(self, months: int = 12) -> Dict[str, Any]:
        """
        Predict revenue forecast for the next N months.
        Gathers historical revenue, contract renewals, and customer segment data, then uses AI to forecast future revenue.
        """
        logger.info(f"Predicting revenue forecast for next {months} months")
        
        try:
            with get_connection_context() as conn:
                cursor = conn.cursor()
                try:
                    # Get historical revenue data for the last 12 months
                    cursor.execute("""
                        SELECT 
                            DATE_TRUNC('month', analysis_date) as month,
                            SUM(CASE WHEN metric_name LIKE '%Revenue%' THEN metric_value ELSE 0 END) as revenue,
                            COUNT(DISTINCT customer_id) as active_customers
                        FROM analysis
                        WHERE analysis_date >= CURRENT_DATE - INTERVAL '12 months'
                        GROUP BY DATE_TRUNC('month', analysis_date)
                        ORDER BY month
                    """)
                    
                    historical_data = cursor.fetchall()
                    
                    # Get contract renewal data for active contracts
                    cursor.execute("""
                        SELECT 
                            renewal_probability,
                            contract_value,
                            end_date
                        FROM contracts
                        WHERE status = 'active' AND end_date >= CURRENT_DATE
                        ORDER BY end_date
                    """)
                    
                    renewal_data = cursor.fetchall()
                    
                    # Get customer growth trends by segment
                    cursor.execute("""
                        SELECT 
                            customer_segment,
                            COUNT(*) as count,
                            AVG(lifetime_value) as avg_value
                        FROM customers
                        WHERE status = 'active'
                        GROUP BY customer_segment
                    """)
                    
                    segment_data = cursor.fetchall()
                finally:
                    cursor.close()
            
            
            # Prepare all relevant data for AI forecast
            forecast_data = {
                "historical_revenue": [{"month": h[0].strftime("%Y-%m"), "revenue": float(h[1]), 
                                      "customers": h[2]} for h in historical_data],
                "renewal_data": [{"probability": float(r[0]), "value": float(r[1]), 
                                "end_date": r[2].strftime("%Y-%m-%d")} for r in renewal_data],
                "segment_data": [{"segment": s[0], "count": s[1], "avg_value": float(s[2])} 
                               for s in segment_data]
            }
            
            # Generate AI forecast using the helper method
            forecast = self._generate_revenue_forecast(forecast_data, months)
            
            # Generate monthly forecast data for frontend display
            monthly_forecast = []
            total_projected_revenue = 0
            
            if (
                forecast
                and isinstance(forecast, dict)
                and "monthly_forecast" in forecast
                and isinstance(forecast["monthly_forecast"], list)
                and forecast["monthly_forecast"] is not None
                and len(forecast["monthly_forecast"]) > 0
            ):
                for i, month_data in enumerate(forecast["monthly_forecast"][:6]):  # First 6 months
                    projected = month_data.get("revenue", 0)
                    total_projected_revenue += projected
                    monthly_forecast.append({
                        "projected_revenue": projected,
                        "actual_revenue": None,  # No actual data for future months
                        "growth_rate": month_data.get("growth_rate", 0)
                    })
            else:
                # Fallback forecast if AI prediction fails
                base_revenue = 100000  # Placeholder
                for i in range(6):
                    projected = base_revenue * (1 + (i * 0.05))  # 5% growth per month
                    total_projected_revenue += projected
                    monthly_forecast.append({
                        "projected_revenue": projected,
                        "actual_revenue": None,
                        "growth_rate": 0.05
                    })
            
            # Return all results in a dictionary
            return {
                "total_projected_revenue": total_projected_revenue,
                "revenue_growth": 0.15,  # Placeholder growth rate
                "prediction_accuracy": 0.85,  # Placeholder accuracy
                "forecast": monthly_forecast,
                "insights": forecast.get("key_factors", []),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting revenue forecast: {e}")
            return {"error": str(e)}
    
    def predict_customer_lifetime_value(self, customer_id: str) -> Dict[str, Any]:
        """
        Predict customer lifetime value and growth potential for a specific customer.
        Gathers customer data, spending history, and similar customers, then uses AI to predict future LTV.
        """
        logger.info(f"Predicting LTV for customer: {customer_id}")
        
        try:
            with get_connection_context() as conn:
                cursor = conn.cursor()
                try:
                    # Get customer data by ID
                    cursor.execute("""
                        SELECT 
                            name, company, lifetime_value, engagement_score, growth_potential_score,
                            total_spend, monthly_recurring_revenue, customer_segment
                        FROM customers
                        WHERE customer_id = %s
                    """, (customer_id,))
                    
                    customer = cursor.fetchone()
                    if not customer:
                        return {"error": "Customer not found"}
                    
                    # Get customer's spending history (revenue metrics)
                    cursor.execute("""
                        SELECT 
                            metric_name, metric_value, analysis_date, trend_direction
                        FROM analysis
                        WHERE customer_id = %s AND metric_name LIKE '%Revenue%'
                        ORDER BY analysis_date DESC
                        LIMIT 20
                    """, (customer_id,))
                    
                    revenue_history = cursor.fetchall()
                    
                    # Get similar customers for comparison
                    cursor.execute("""
                        SELECT 
                            customer_id, name, company, lifetime_value, engagement_score
                        FROM customers
                        WHERE customer_segment = %s AND status = 'active'
                        ORDER BY lifetime_value DESC
                        LIMIT 10
                    """, (customer[7],))  # customer_segment
                    
                    similar_customers = cursor.fetchall()
                finally:
                    cursor.close()
            
            
            # Prepare all relevant data for AI prediction
            prediction_data = {
                "customer": {
                    "name": customer[0],
                    "company": customer[1],
                    "current_ltv": float(customer[2]),
                    "engagement": float(customer[3]),
                    "growth_potential": float(customer[4]),
                    "total_spend": float(customer[5]),
                    "mrr": float(customer[6]),
                    "segment": customer[7]
                },
                "revenue_history": [{"metric": r[0], "value": float(r[1]), 
                                   "date": r[2].strftime("%Y-%m-%d"), "trend": r[3]} 
                                  for r in revenue_history],
                "similar_customers": [{"id": s[0], "name": s[1], "company": s[2], 
                                     "ltv": float(s[3]), "engagement": float(s[4])} 
                                    for s in similar_customers]
            }
            
            # Generate AI prediction using the helper method
            prediction = self._generate_ltv_prediction(prediction_data)
            
            # Return all results in a dictionary
            return {
                "data": prediction_data,
                "prediction": prediction,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting customer LTV: {e}")
            return {"error": str(e)}
    
    def _generate_churn_predictions(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build a prompt and call the language model to get AI churn predictions.
        Handles the response format (string, list, or dict).
        """
        if not self.llm:
            return {"error": "AI predictions not available - OpenAI API key required"}
        
        try:
            if "customer" in data:
                # Single customer analysis
                customer = data["customer"]
                prompt = f"""
                Analyze this customer's churn risk and provide predictions:
                
                Customer: {customer['name']} ({customer['company']})
                Current LTV: ${customer['lifetime_value']:,.2f}
                Engagement Score: {customer['engagement_score']:.3f}
                Current Churn Risk: {customer['churn_risk_score']:.3f}
                Support Tickets: {customer['support_tickets']}
                Segment: {customer['segment']}
                
                Contracts: {len(data['contracts'])} active contracts
                Recent Analysis: {len(data['recent_analysis'])} recent metrics
                
                Provide:
                1. Predicted churn probability (0-1)
                2. Time to churn (in months)
                3. Key risk factors
                4. Recommended retention strategies
                5. Expected revenue impact if churned
                
                Format as JSON with these exact keys: churn_probability, months_to_churn, risk_factors, retention_strategies, revenue_impact
                """
            else:
                # Multiple customers analysis
                high_risk = data["high_risk_customers"]
                prompt = f"""
                Analyze churn risk for {len(high_risk)} high-risk customers:
                
                High Risk Customers:
                {json.dumps(high_risk[:5], indent=2)}
                
                Provide:
                1. Overall churn risk trend
                2. Top 3 risk factors across customers
                3. Recommended retention programs
                4. Expected revenue at risk
                5. Priority customers to focus on
                
                Format as JSON with these exact keys: risk_trend, top_risk_factors, retention_programs, revenue_at_risk, priority_customers
                """
            
            # Call the LLM and handle response content which might be string, list, or dict
            response = self.llm.invoke([HumanMessage(content=prompt)])
            # BEGINNER NOTE: Sometimes the LLM returns a dict, a string, or a list of strings/dicts. json.loads only works on strings.
            content = response.content
            if isinstance(content, dict):
                return content
            if isinstance(content, list):
                content = content[0] if content else "{}"
            if isinstance(content, dict):
                return content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error generating churn predictions: {e}")
            return {"error": f"Error generating predictions: {str(e)}"}
    
    def _generate_revenue_forecast(self, data: Dict[str, Any], months: int) -> Dict[str, Any]:
        """
        Build a prompt and call the language model to get AI revenue forecast.
        Handles the response format (string, list, or dict).
        """
        if not self.llm:
            return {"error": "AI predictions not available - OpenAI API key required"}
        
        try:
            prompt = f"""
            Generate a {months}-month revenue forecast based on this data:
            
            Historical Revenue (Last 12 months):
            {json.dumps(data['historical_revenue'], indent=2)}
            
            Contract Renewal Data:
            {json.dumps(data['renewal_data'][:10], indent=2)}
            
            Customer Segments:
            {json.dumps(data['segment_data'], indent=2)}
            
            Provide:
            1. Monthly revenue forecast for next {months} months
            2. Growth rate predictions
            3. Key factors influencing forecast
            4. Confidence level for predictions
            5. Risk factors that could impact forecast
            
            Format as JSON with these exact keys: monthly_forecast, growth_rate, key_factors, confidence_level, risk_factors
            """
            
            # Call the LLM and handle response content which might be string, list, or dict
            response = self.llm.invoke([HumanMessage(content=prompt)])
            # BEGINNER NOTE: Sometimes the LLM returns a dict, a string, or a list of strings/dicts. json.loads only works on strings.
            content = response.content
            if isinstance(content, dict):
                return content
            if isinstance(content, list):
                content = content[0] if content else "{}"
            if isinstance(content, dict):
                return content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error generating revenue forecast: {e}")
            return {"error": f"Error generating forecast: {str(e)}"}
    
    def _generate_ltv_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build a prompt and call the language model to get AI LTV prediction.
        Handles the response format (string, list, or dict).
        """
        if not self.llm:
            return {"error": "AI predictions not available - OpenAI API key required"}
        
        try:
            customer = data["customer"]
            prompt = f"""
            Predict customer lifetime value for:
            
            Customer: {customer['name']} ({customer['company']})
            Current LTV: ${customer['current_ltv']:,.2f}
            Engagement: {customer['engagement']:.3f}
            Growth Potential: {customer['growth_potential']:.3f}
            MRR: ${customer['mrr']:,.2f}
            Segment: {customer['segment']}
            
            Revenue History:
            {json.dumps(data['revenue_history'][:5], indent=2)}
            
            Similar Customers:
            {json.dumps(data['similar_customers'][:3], indent=2)}
            
            Provide:
            1. Predicted LTV in 12 months
            2. Predicted LTV in 24 months
            3. Growth rate prediction
            4. Key growth drivers
            5. Upselling opportunities
            
            Format as JSON with these exact keys: ltv_12_months, ltv_24_months, growth_rate, growth_drivers, upselling_opportunities
            """
            
            # Call the LLM and handle response content which might be string, list, or dict
            response = self.llm.invoke([HumanMessage(content=prompt)])
            # BEGINNER NOTE: Sometimes the LLM returns a dict, a string, or a list of strings/dicts. json.loads only works on strings.
            content = response.content
            if isinstance(content, dict):
                return content
            if isinstance(content, list):
                content = content[0] if content else "{}"
            if isinstance(content, dict):
                return content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error generating LTV prediction: {e}")
            return {"error": f"Error generating prediction: {str(e)}"}

# Global predictive analyzer instance
predictive_analyzer = PredictiveAnalyzer() 