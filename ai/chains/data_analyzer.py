"""
Data analyzer chain for AI-powered analysis of business data.
"""
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import psycopg2

from config.settings import settings
from ai.models.llm_config import llm_config
from ai.templates.prompt_templates import prompt_templates
from langchain.schema import HumanMessage
from database import get_connection_context

logger = logging.getLogger(__name__)

class DataAnalyzer:
    """
    AI-powered data analyzer for business intelligence.
    This class provides methods to analyze customer health, contract performance, and business metrics using AI and database data.
    """
    
    def __init__(self):
        # Initialize language models for analysis and insights
        self.llm = llm_config.get_analysis_llm()
        self.insight_llm = llm_config.get_insight_llm()
        
    def get_connection(self):
        """
        Get a connection from the connection pool.
        Note: This method is deprecated. Use get_connection_context() instead.
        """
        # This method is kept for backward compatibility but should not be used
        # for new code. Use get_connection_context() instead.
        from database import get_connection
        return get_connection()
    
    def analyze_customer_health(self, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze overall customer health and provide insights.
        Gathers customer metrics, segments, and industry data, then uses AI to generate insights.
        """
        logger.info("Analyzing customer health...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                    # Get customer health metrics from the database
                    cursor.execute("""
                        SELECT 
                            COUNT(*) as total_customers,
                            AVG(lifetime_value) as avg_lifetime_value,
                            AVG(engagement_score) as avg_engagement,
                            AVG(churn_risk_score) as avg_churn_risk,
                            COUNT(CASE WHEN churn_risk_score > 0.7 THEN 1 END) as high_risk_customers,
                            COUNT(CASE WHEN lifetime_value > 50000 THEN 1 END) as high_value_customers,
                            AVG(support_tickets_count) as avg_support_tickets
                        FROM customers
                        WHERE status = 'active'
                    """)
                    
                    metrics = cursor.fetchone()
                
                    # Get customer segments
                    cursor.execute("""
                        SELECT customer_segment, COUNT(*) as count, AVG(lifetime_value) as avg_value
                        FROM customers
                        WHERE status = 'active'
                        GROUP BY customer_segment
                        ORDER BY avg_value DESC
                    """)
                    
                    segments = cursor.fetchall()
                    
                    # Get industry performance
                    cursor.execute("""
                        SELECT industry, COUNT(*) as count, AVG(lifetime_value) as avg_value
                        FROM customers
                        WHERE status = 'active'
                        GROUP BY industry
                        ORDER BY avg_value DESC
                        LIMIT 5
                    """)
                    
                    industries = cursor.fetchall()
            
            # Prepare data for AI analysis
            analysis_data = {
                "total_customers": metrics[0] if metrics and metrics[0] else 0,
                "avg_lifetime_value": float(metrics[1]) if metrics and metrics[1] else 0,
                "avg_engagement": float(metrics[2]) if metrics and metrics[2] else 0,
                "avg_churn_risk": float(metrics[3]) if metrics and metrics[3] else 0,
                "high_risk_customers": metrics[4] if metrics and metrics[4] else 0,
                "high_value_customers": metrics[5] if metrics and metrics[5] else 0,
                "avg_support_tickets": float(metrics[6]) if metrics and metrics[6] else 0,
                "segments": [{"segment": s[0], "count": s[1], "avg_value": float(s[2]) if s[2] else 0} for s in segments],
                "top_industries": [{"industry": i[0], "count": i[1], "avg_value": float(i[2]) if i[2] else 0} for i in industries]
            }
            
            # Generate AI insights only if requested
            insights = self._generate_customer_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            # Return all results in a dictionary
            return {
                "metrics": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing customer health: {e}")
            return {"error": str(e)}
    
    def analyze_contract_performance(self, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze contract performance and renewal risks.
        Gathers contract metrics, contract types, and expiring contracts, then uses AI to generate insights.
        """
        logger.info("Analyzing contract performance...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                    # Get contract metrics from the database
                    cursor.execute("""
                        SELECT 
                            COUNT(*) as total_contracts,
                            AVG(contract_value) as avg_contract_value,
                            SUM(contract_value) as total_contract_value,
                            AVG(renewal_probability) as avg_renewal_probability,
                            COUNT(CASE WHEN renewal_probability < 0.4 THEN 1 END) as low_renewal_risk,
                            COUNT(CASE WHEN renewal_probability > 0.8 THEN 1 END) as high_renewal_confidence,
                            AVG(performance_score) as avg_performance,
                            AVG(satisfaction_score) as avg_satisfaction
                        FROM contracts
                        WHERE status = 'active'
                    """)
                    
                    metrics = cursor.fetchone()
                    
                    # Get contract types performance
                    cursor.execute("""
                        SELECT contract_type, COUNT(*) as count, AVG(contract_value) as avg_value,
                               AVG(renewal_probability) as avg_renewal_prob
                        FROM contracts
                        WHERE status = 'active'
                        GROUP BY contract_type
                        ORDER BY avg_value DESC
                    """)
                    
                    contract_types = cursor.fetchall()
                
                    # Get expiring contracts
                    cursor.execute("""
                        SELECT COUNT(*) as expiring_soon
                        FROM contracts
                        WHERE status = 'active' 
                        AND end_date BETWEEN CURRENT_DATE AND DATEADD(day, 90, CURRENT_DATE)
                    """)
                    
                    expiring = cursor.fetchone()
            
            # Prepare data for AI analysis
            analysis_data = {
                "total_contracts": metrics[0] if metrics and metrics[0] else 0,
                "avg_contract_value": float(metrics[1]) if metrics and metrics[1] else 0,
                "total_contract_value": float(metrics[2]) if metrics and metrics[2] else 0,
                "avg_renewal_probability": float(metrics[3]) if metrics and metrics[3] else 0,
                "low_renewal_risk": metrics[4] if metrics and metrics[4] else 0,
                "high_renewal_confidence": metrics[5] if metrics and metrics[5] else 0,
                "avg_performance": float(metrics[6]) if metrics and metrics[6] else 0,
                "avg_satisfaction": float(metrics[7]) if metrics and metrics[7] else 0,
                "expiring_soon": expiring[0] if expiring and expiring[0] else 0,
                "contract_types": [{"type": c[0], "count": c[1], "avg_value": float(c[2]) if c[2] else 0, "avg_renewal": float(c[3]) if c[3] else 0} for c in contract_types]
            }
            
            # Generate AI insights only if requested
            insights = self._generate_contract_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            # Return all results in a dictionary
            return {
                "metrics": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing contract performance: {e}")
            return {"error": str(e)}
    
    def analyze_business_metrics(self, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze business metrics and trends.
        Gathers recent analysis data, then uses AI to generate business insights.
        """
        logger.info("Analyzing business metrics...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                    # Get recent analysis data from the database
                    cursor.execute("""
                        SELECT 
                            metric_category,
                            metric_name,
                            AVG(metric_value) as avg_value,
                            AVG(change_percentage) as avg_change,
                            COUNT(CASE WHEN trend_direction = 'increasing' THEN 1 END) as increasing_trends,
                            COUNT(CASE WHEN trend_direction = 'decreasing' THEN 1 END) as decreasing_trends,
                            AVG(confidence_score) as avg_confidence
                        FROM analysis
                        WHERE analysis_date >= DATEADD(day, -30, CURRENT_DATE)
                        GROUP BY metric_category, metric_name
                        ORDER BY avg_change DESC
                    """)
                    
                    metrics = cursor.fetchall()
                    
                    # Get risk analysis
                    cursor.execute("""
                        SELECT 
                            risk_level,
                            COUNT(*) as count,
                            AVG(confidence_score) as avg_confidence
                        FROM analysis
                        WHERE analysis_date >= DATEADD(day, -30, CURRENT_DATE)
                        GROUP BY risk_level
                        ORDER BY count DESC
                    """)
                    
                    risks = cursor.fetchall()
            
            analysis_data = {
                "metrics": [{"category": m[0], "name": m[1], "avg_value": float(m[2]) if m[2] else 0, "avg_change": float(m[3]) if m[3] else 0, 
                           "increasing": m[4], "decreasing": m[5], "confidence": float(m[6]) if m[6] else 0} for m in metrics],
                "risks": [{"level": r[0], "count": r[1], "confidence": float(r[2]) if r[2] else 0} for r in risks]
            }
            
            insights = self._generate_business_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            return {
                "metrics": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing business metrics: {e}")
            return {"error": str(e)}
    
    def _generate_customer_insights(self, data: Dict[str, Any]) -> List[str]:
        """
        Build a prompt and call the language model to get AI-generated customer insights.
        Handles the response format (string, list, or dict).
        """
        if not self.insight_llm:
            return ["AI insights not available - OpenAI API key required"]
        
        try:
            # Use optimized prompt template
            prompt = prompt_templates.get_customer_analysis_prompt(
                data=data,
                insight_count=4,
                focus_areas=["retention", "revenue", "risk", "growth"]
            )
            
            response = self.insight_llm.invoke([HumanMessage(content=prompt)])
            content = str(response.content) if hasattr(response, 'content') else str(response)
            return content.split('\n')
            
        except Exception as e:
            logger.error(f"Error generating customer insights: {e}")
            return [f"Error generating insights: {str(e)}"]
    
    def _generate_contract_insights(self, data: Dict[str, Any]) -> List[str]:
        """
        Build a prompt and call the language model to get AI-generated contract insights.
        Handles the response format (string, list, or dict).
        """
        if not self.insight_llm:
            return ["AI insights not available - OpenAI API key required"]
        
        try:
            # Use optimized prompt template
            prompt = prompt_templates.get_contract_analysis_prompt(
                data=data,
                insight_count=4
            )
            
            response = self.insight_llm.invoke([HumanMessage(content=prompt)])
            content = str(response.content) if hasattr(response, 'content') else str(response)
            return content.split('\n')
            
        except Exception as e:
            logger.error(f"Error generating contract insights: {e}")
            return [f"Error generating insights: {str(e)}"]
    
    def _generate_business_insights(self, data: Dict[str, Any]) -> List[str]:
        """
        Build a prompt and call the language model to get AI-generated business insights.
        Handles the response format (string, list, or dict).
        """
        if not self.insight_llm:
            return ["AI insights not available - OpenAI API key required"]
        
        try:
            prompt = f"""
            Analyze the following business metrics and provide 3-5 key insights:
            
            Recent Metrics (Last 30 Days):
            {json.dumps(data['metrics'], indent=2)}
            
            Risk Analysis:
            {json.dumps(data['risks'], indent=2)}
            
            Provide actionable insights focusing on:
            1. Performance trends and opportunities
            2. Risk management recommendations
            3. Strategic priorities based on metrics
            4. Areas requiring immediate attention
            
            Format as a numbered list of clear, actionable insights.
            """
            
            response = self.insight_llm.invoke([HumanMessage(content=prompt)])
            content = str(response.content) if hasattr(response, 'content') else str(response)
            return content.split('\n')
            
        except Exception as e:
            logger.error(f"Error generating business insights: {e}")
            return [f"Error generating insights: {str(e)}"]

# Global analyzer instance
data_analyzer = DataAnalyzer() 