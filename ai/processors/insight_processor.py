"""
Insight processor for automatically generating and updating AI insights.
"""
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import psycopg2

from config.settings import settings
from ai.models.llm_config import llm_config
from ai.chains.data_analyzer import data_analyzer
from langchain.schema import HumanMessage

logger = logging.getLogger(__name__)

class InsightProcessor:
    """Processor for generating and updating AI insights automatically."""
    
    def __init__(self):
        self.llm = llm_config.get_insight_llm()
        
    def get_connection(self):
        """Get database connection."""
        return psycopg2.connect(
            host=settings.REDSHIFT_HOST,
            port=settings.REDSHIFT_PORT,
            database=settings.REDSHIFT_DATABASE,
            user=settings.REDSHIFT_USERNAME,
            password=settings.REDSHIFT_PASSWORD
        )
    
    def update_customer_insights(self) -> Dict[str, Any]:
        """Update AI insights for all customers."""
        logger.info("Updating customer insights...")
        
        try:
            conn = self.get_connection()
            updated_count = 0
            
            with conn.cursor() as cursor:
                # Get customers without recent insights or with high churn risk
                cursor.execute("""
                    SELECT 
                        customer_id, name, company, lifetime_value, engagement_score,
                        churn_risk_score, support_tickets_count, customer_segment,
                        ai_insights, updated_at
                    FROM customers
                    WHERE status = 'active'
                    AND (ai_insights IS NULL 
                         OR updated_at < DATEADD(day, -7, CURRENT_DATE)
                         OR churn_risk_score > 0.7)
                    ORDER BY churn_risk_score DESC
                    LIMIT 50
                """)
                
                customers = cursor.fetchall()
                
                for customer in customers:
                    # Generate new insights for each customer
                    insight = self._generate_customer_insight(customer)
                    
                    if insight:
                        cursor.execute("""
                            UPDATE customers 
                            SET ai_insights = %s, updated_at = CURRENT_TIMESTAMP
                            WHERE customer_id = %s
                        """, (insight, customer[0]))
                        updated_count += 1
            
            conn.commit()
            conn.close()
            
            logger.info(f"Updated insights for {updated_count} customers")
            return {"updated_count": updated_count, "status": "success"}
            
        except Exception as e:
            logger.error(f"Error updating customer insights: {e}")
            return {"error": str(e)}
    
    def update_contract_insights(self) -> Dict[str, Any]:
        """Update AI insights for contracts."""
        logger.info("Updating contract insights...")
        
        try:
            conn = self.get_connection()
            updated_count = 0
            
            with conn.cursor() as cursor:
                # Get contracts needing insight updates
                cursor.execute("""
                    SELECT 
                        c.contract_id, c.contract_type, c.contract_value, c.renewal_probability,
                        c.legal_risk_score, c.performance_score, c.satisfaction_score,
                        c.ai_analysis, c.updated_at,
                        cust.name, cust.company, cust.customer_segment
                    FROM contracts c
                    JOIN customers cust ON c.customer_id = cust.customer_id
                    WHERE c.status = 'active'
                    AND (c.ai_analysis IS NULL 
                         OR c.updated_at < DATEADD(day, -7, CURRENT_DATE)
                         OR c.renewal_probability < 0.4)
                    ORDER BY c.renewal_probability ASC
                    LIMIT 30
                """)
                
                contracts = cursor.fetchall()
                
                for contract in contracts:
                    # Generate new insights for each contract
                    insight = self._generate_contract_insight(contract)
                    
                    if insight:
                        cursor.execute("""
                            UPDATE contracts 
                            SET ai_analysis = %s, updated_at = CURRENT_TIMESTAMP
                            WHERE contract_id = %s
                        """, (insight, contract[0]))
                        updated_count += 1
            
            conn.commit()
            conn.close()
            
            logger.info(f"Updated insights for {updated_count} contracts")
            return {"updated_count": updated_count, "status": "success"}
            
        except Exception as e:
            logger.error(f"Error updating contract insights: {e}")
            return {"error": str(e)}
    
    def generate_daily_insights(self) -> Dict[str, Any]:
        """Generate daily business insights summary."""
        logger.info("Generating daily insights...")
        
        try:
            # Get comprehensive analysis
            customer_analysis = data_analyzer.analyze_customer_health()
            contract_analysis = data_analyzer.analyze_contract_performance()
            business_analysis = data_analyzer.analyze_business_metrics()
            
            # Combine insights
            daily_summary = self._generate_daily_summary({
                "customer_health": customer_analysis,
                "contract_performance": contract_analysis,
                "business_metrics": business_analysis
            })
            
            # Store daily insights
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO analysis (
                        analysis_id, metric_name, metric_value, metric_unit, metric_category,
                        analysis_date, ai_insights, analysis_type, data_source
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    f"DAILY_{datetime.now().strftime('%Y%m%d')}",
                    "Daily Business Insights",
                    1.0,
                    "summary",
                    "Executive",
                    datetime.now(),
                    daily_summary,
                    "batch",
                    "ai_generated"
                ))
            
            conn.commit()
            conn.close()
            
            return {
                "summary": daily_summary,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error generating daily insights: {e}")
            return {"error": str(e)}
    
    def _generate_customer_insight(self, customer_data: tuple) -> Optional[str]:
        """Generate AI insight for a specific customer."""
        if not self.llm:
            return None
        
        try:
            prompt = f"""
            Generate a concise business insight for this customer:
            
            Customer: {customer_data[1]} ({customer_data[2]})
            Lifetime Value: ${customer_data[3]:,.2f}
            Engagement Score: {customer_data[4]:.3f}
            Churn Risk: {customer_data[5]:.3f}
            Support Tickets: {customer_data[6]}
            Segment: {customer_data[7]}
            
            Provide 1-2 actionable insights focusing on:
            - Risk assessment and mitigation
            - Growth opportunities
            - Retention strategies
            
            Keep it concise (2-3 sentences maximum).
            """
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating customer insight: {e}")
            return None
    
    def _generate_contract_insight(self, contract_data: tuple) -> Optional[str]:
        """Generate AI insight for a specific contract."""
        if not self.llm:
            return None
        
        try:
            prompt = f"""
            Generate a concise business insight for this contract:
            
            Contract: {contract_data[1]} - {contract_data[9]} ({contract_data[10]})
            Value: ${contract_data[2]:,.2f}
            Renewal Probability: {contract_data[3]:.3f}
            Legal Risk: {contract_data[4]:.3f}
            Performance: {contract_data[5]:.3f}
            Satisfaction: {contract_data[6]:.3f}
            Customer Segment: {contract_data[11]}
            
            Provide 1-2 actionable insights focusing on:
            - Renewal risk assessment
            - Performance optimization
            - Relationship management
            
            Keep it concise (2-3 sentences maximum).
            """
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating contract insight: {e}")
            return None
    
    def _generate_daily_summary(self, analysis_data: Dict[str, Any]) -> str:
        """Generate daily business summary."""
        if not self.llm:
            return "AI insights not available"
        
        try:
            prompt = f"""
            Generate a daily business summary based on this analysis:
            
            Customer Health:
            - Total customers: {analysis_data['customer_health'].get('metrics', {}).get('total_customers', 0)}
            - High-risk customers: {analysis_data['customer_health'].get('metrics', {}).get('high_risk_customers', 0)}
            - Average engagement: {analysis_data['customer_health'].get('metrics', {}).get('avg_engagement', 0):.3f}
            
            Contract Performance:
            - Total contracts: {analysis_data['contract_performance'].get('metrics', {}).get('total_contracts', 0)}
            - Average renewal probability: {analysis_data['contract_performance'].get('metrics', {}).get('avg_renewal_probability', 0):.3f}
            - Expiring soon: {analysis_data['contract_performance'].get('metrics', {}).get('expiring_soon', 0)}
            
            Key Insights:
            {json.dumps(analysis_data['customer_health'].get('insights', [])[:3], indent=2)}
            
            Provide a concise executive summary (3-4 sentences) highlighting:
            1. Key business metrics
            2. Critical risks or opportunities
            3. Recommended actions for today
            
            Format as a clear, actionable summary.
            """
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating daily summary: {e}")
            return f"Error generating summary: {str(e)}"

# Global insight processor instance
insight_processor = InsightProcessor() 