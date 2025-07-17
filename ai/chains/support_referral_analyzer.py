"""
Support and Referral Analyzer chain for AI-powered analysis of support tickets and referral calls.
"""
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import psycopg2

from config.settings import settings
from ai.models.llm_config import llm_config
from langchain.schema import HumanMessage
from database import get_connection_context

logger = logging.getLogger(__name__)

class SupportReferralAnalyzer:
    """
    AI-powered analyzer for support tickets and referral calls.
    This class provides methods to analyze support ticket patterns, customer satisfaction,
    referral call effectiveness, and negotiation outcomes using AI and database data.
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
        from database import get_connection
        return get_connection()
    
    def analyze_support_tickets(self, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze support ticket patterns and customer satisfaction.
        Gathers ticket metrics, resolution times, and customer feedback, then uses AI to generate insights.
        """
        logger.info("Analyzing support tickets...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                # Get support ticket metrics
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_tickets,
                        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
                        AVG(first_response_time_minutes) as avg_first_response,
                        AVG(resolution_time_minutes) as avg_resolution_time,
                        AVG(customer_satisfaction_score) as avg_satisfaction,
                        AVG(sentiment_score) as avg_sentiment,
                        AVG(urgency_score) as avg_urgency,
                        AVG(complexity_score) as avg_complexity,
                        COUNT(CASE WHEN escalation_count > 0 THEN 1 END) as escalated_tickets,
                        AVG(interaction_count) as avg_interactions
                    FROM support_tickets
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                """)
                
                metrics = cursor.fetchone()
                
                # Get ticket categories performance
                cursor.execute("""
                    SELECT category, COUNT(*) as count, 
                           AVG(resolution_time_minutes) as avg_resolution,
                           AVG(customer_satisfaction_score) as avg_satisfaction
                    FROM support_tickets
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    GROUP BY category
                    ORDER BY count DESC
                    LIMIT 10
                """)
                
                categories = cursor.fetchall()
                
                # Get customer satisfaction trends
                cursor.execute("""
                    SELECT DATE(created_at) as date, 
                           AVG(customer_satisfaction_score) as avg_satisfaction,
                           COUNT(*) as ticket_count
                    FROM support_tickets
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    AND customer_satisfaction_score IS NOT NULL
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                    LIMIT 30
                """)
                
                satisfaction_trends = cursor.fetchall()
                
                # Get high-priority tickets analysis
                cursor.execute("""
                    SELECT priority, COUNT(*) as count,
                           AVG(resolution_time_minutes) as avg_resolution,
                           AVG(customer_satisfaction_score) as avg_satisfaction
                    FROM support_tickets
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    GROUP BY priority
                    ORDER BY 
                        CASE priority 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                        END
                """)
                
                priority_analysis = cursor.fetchall()
            
            
            # Prepare data for AI analysis
            analysis_data = {
                "total_tickets": metrics[0] if metrics and metrics[0] else 0,
                "open_tickets": metrics[1] if metrics and metrics[1] else 0,
                "resolved_tickets": metrics[2] if metrics and metrics[2] else 0,
                "avg_first_response": float(metrics[3]) if metrics and metrics[3] else 0,
                "avg_resolution_time": float(metrics[4]) if metrics and metrics[4] else 0,
                "avg_satisfaction": float(metrics[5]) if metrics and metrics[5] else 0,
                "avg_sentiment": float(metrics[6]) if metrics and metrics[6] else 0,
                "avg_urgency": float(metrics[7]) if metrics and metrics[7] else 0,
                "avg_complexity": float(metrics[8]) if metrics and metrics[8] else 0,
                "escalated_tickets": metrics[9] if metrics and metrics[9] else 0,
                "avg_interactions": float(metrics[10]) if metrics and metrics[10] else 0,
                "categories": [{"category": c[0], "count": c[1], "avg_resolution": float(c[2]) if c[2] else 0, "avg_satisfaction": float(c[3]) if c[3] else 0} for c in categories],
                "satisfaction_trends": [{"date": str(s[0]), "avg_satisfaction": float(s[1]) if s[1] else 0, "ticket_count": s[2]} for s in satisfaction_trends],
                "priority_analysis": [{"priority": p[0], "count": p[1], "avg_resolution": float(p[2]) if p[2] else 0, "avg_satisfaction": float(p[3]) if p[3] else 0} for p in priority_analysis]
            }
            
            # Generate AI insights only if requested
            insights = self._generate_support_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            return {
                "metrics": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing support tickets: {e}")
            return {"error": str(e)}
    
    def analyze_referral_calls(self, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze referral call effectiveness and negotiation outcomes.
        Gathers call metrics, conversion rates, and negotiation patterns, then uses AI to generate insights.
        """
        logger.info("Analyzing referral calls...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                # Get referral call metrics
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_calls,
                        COUNT(CASE WHEN call_status = 'completed' THEN 1 END) as completed_calls,
                        COUNT(CASE WHEN call_status = 'scheduled' THEN 1 END) as scheduled_calls,
                        AVG(duration_minutes) as avg_duration,
                        AVG(probability_of_conversion) as avg_conversion_probability,
                        AVG(estimated_deal_value) as avg_deal_value,
                        AVG(sentiment_score) as avg_sentiment,
                        AVG(urgency_score) as avg_urgency,
                        COUNT(CASE WHEN decision_makers_present = TRUE THEN 1 END) as decision_maker_calls,
                        COUNT(CASE WHEN budget_discussed = TRUE THEN 1 END) as budget_discussions,
                        COUNT(CASE WHEN timeline_discussed = TRUE THEN 1 END) as timeline_discussions
                    FROM referral_calls
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                """)
                
                metrics = cursor.fetchone()
                
                # Get call type performance
                cursor.execute("""
                    SELECT call_type, COUNT(*) as count,
                           AVG(probability_of_conversion) as avg_conversion,
                           AVG(estimated_deal_value) as avg_deal_value
                    FROM referral_calls
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    GROUP BY call_type
                    ORDER BY avg_deal_value DESC
                """)
                
                call_types = cursor.fetchall()
                
                # Get negotiation stage analysis
                cursor.execute("""
                    SELECT negotiation_stage, COUNT(*) as count,
                           AVG(probability_of_conversion) as avg_conversion,
                           AVG(estimated_deal_value) as avg_deal_value
                    FROM referral_calls
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    AND negotiation_stage IS NOT NULL
                    GROUP BY negotiation_stage
                    ORDER BY avg_deal_value DESC
                """)
                
                negotiation_stages = cursor.fetchall()
                
                # Get conversion probability trends
                cursor.execute("""
                    SELECT DATE(created_at) as date,
                           AVG(probability_of_conversion) as avg_conversion,
                           COUNT(*) as call_count
                    FROM referral_calls
                    WHERE created_at >= DATEADD(day, -30, CURRENT_DATE)
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                    LIMIT 30
                """)
                
                conversion_trends = cursor.fetchall()
            
            
            # Prepare data for AI analysis
            analysis_data = {
                "total_calls": metrics[0] if metrics and metrics[0] else 0,
                "completed_calls": metrics[1] if metrics and metrics[1] else 0,
                "scheduled_calls": metrics[2] if metrics and metrics[2] else 0,
                "avg_duration": float(metrics[3]) if metrics and metrics[3] else 0,
                "avg_conversion_probability": float(metrics[4]) if metrics and metrics[4] else 0,
                "avg_deal_value": float(metrics[5]) if metrics and metrics[5] else 0,
                "avg_sentiment": float(metrics[6]) if metrics and metrics[6] else 0,
                "avg_urgency": float(metrics[7]) if metrics and metrics[7] else 0,
                "decision_maker_calls": metrics[8] if metrics and metrics[8] else 0,
                "budget_discussions": metrics[9] if metrics and metrics[9] else 0,
                "timeline_discussions": metrics[10] if metrics and metrics[10] else 0,
                "call_types": [{"type": c[0], "count": c[1], "avg_conversion": float(c[2]) if c[2] else 0, "avg_deal_value": float(c[3]) if c[3] else 0} for c in call_types],
                "negotiation_stages": [{"stage": n[0], "count": n[1], "avg_conversion": float(n[2]) if n[2] else 0, "avg_deal_value": float(n[3]) if n[3] else 0} for n in negotiation_stages],
                "conversion_trends": [{"date": str(c[0]), "avg_conversion": float(c[1]) if c[1] else 0, "call_count": c[2]} for c in conversion_trends]
            }
            
            # Generate AI insights only if requested
            insights = self._generate_referral_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            return {
                "metrics": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing referral calls: {e}")
            return {"error": str(e)}
    
    def analyze_customer_support_journey(self, customer_id: str, include_ai_insights: bool = True) -> Dict[str, Any]:
        """
        Analyze a specific customer's support journey and referral interactions.
        """
        logger.info(f"Analyzing customer support journey for {customer_id}...")
        
        try:
            with get_connection_context() as conn:
                with conn.cursor() as cursor:
                # Get customer's support tickets
                cursor.execute("""
                    SELECT 
                        ticket_id, subject, priority, status, category,
                        created_at, resolved_at, first_response_time_minutes,
                        resolution_time_minutes, customer_satisfaction_score,
                        sentiment_score, urgency_score, complexity_score,
                        escalation_count, interaction_count
                    FROM support_tickets
                    WHERE customer_id = %s
                    ORDER BY created_at DESC
                    LIMIT 50
                """, (customer_id,))
                
                tickets = cursor.fetchall()
                
                # Get customer's referral calls
                cursor.execute("""
                    SELECT 
                        call_id, call_type, call_purpose, call_outcome,
                        call_status, scheduled_at, started_at, ended_at,
                        duration_minutes, probability_of_conversion,
                        estimated_deal_value, negotiation_stage,
                        sentiment_score, urgency_score
                    FROM referral_calls
                    WHERE customer_id = %s
                    ORDER BY created_at DESC
                    LIMIT 50
                """, (customer_id,))
                
                calls = cursor.fetchall()
                
                # Get customer's ticket interactions
                cursor.execute("""
                    SELECT 
                        interaction_type, direction, channel, timestamp,
                        sentiment_score, urgency_score, resolution_contribution
                    FROM ticket_interactions ti
                    JOIN support_tickets st ON ti.ticket_id = st.ticket_id
                    WHERE st.customer_id = %s
                    ORDER BY timestamp DESC
                    LIMIT 100
                """, (customer_id,))
                
                interactions = cursor.fetchall()
            
            
            # Prepare data for AI analysis
            analysis_data = {
                "customer_id": customer_id,
                "tickets": [{
                    "ticket_id": t[0], "subject": t[1], "priority": t[2], "status": t[3],
                    "category": t[4], "created_at": str(t[5]), "resolved_at": str(t[6]) if t[6] else None,
                    "first_response_time": t[7], "resolution_time": t[8], "satisfaction": float(t[9]) if t[9] else None,
                    "sentiment": float(t[10]) if t[10] else 0, "urgency": float(t[11]) if t[11] else 0,
                    "complexity": float(t[12]) if t[12] else 0, "escalations": t[13], "interactions": t[14]
                } for t in tickets],
                "calls": [{
                    "call_id": c[0], "call_type": c[1], "call_purpose": c[2], "call_outcome": c[3],
                    "call_status": c[4], "scheduled_at": str(c[5]) if c[5] else None,
                    "started_at": str(c[6]) if c[6] else None, "ended_at": str(c[7]) if c[7] else None,
                    "duration": c[8], "conversion_probability": float(c[9]) if c[9] else 0,
                    "deal_value": float(c[10]) if c[10] else 0, "negotiation_stage": c[11],
                    "sentiment": float(c[12]) if c[12] else 0, "urgency": float(c[13]) if c[13] else 0
                } for c in calls],
                "interactions": [{
                    "interaction_type": i[0], "direction": i[1], "channel": i[2],
                    "timestamp": str(i[3]), "sentiment": float(i[4]) if i[4] else 0,
                    "urgency": float(i[5]) if i[5] else 0, "resolution_contribution": float(i[6]) if i[6] else 0
                } for i in interactions]
            }
            
            # Generate AI insights only if requested
            insights = self._generate_customer_journey_insights(analysis_data) if include_ai_insights else ["AI insights disabled for performance"]
            
            return {
                "customer_data": analysis_data,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing customer support journey: {e}")
            return {"error": str(e)}
    
    def _generate_support_insights(self, data: Dict[str, Any]) -> List[str]:
        """Generate AI insights for support ticket analysis."""
        try:
            prompt = f"""
            Analyze the following support ticket data and provide actionable business insights:
            
            Support Ticket Metrics:
            - Total tickets: {data['total_tickets']}
            - Open tickets: {data['open_tickets']}
            - Resolved tickets: {data['resolved_tickets']}
            - Average first response time: {data['avg_first_response']:.1f} minutes
            - Average resolution time: {data['avg_resolution_time']:.1f} minutes
            - Average customer satisfaction: {data['avg_satisfaction']:.2f}/5.0
            - Average sentiment score: {data['avg_sentiment']:.3f}
            - Escalated tickets: {data['escalated_tickets']}
            
            Top Categories: {data['categories'][:5]}
            Priority Analysis: {data['priority_analysis']}
            
            Provide 5-7 specific, actionable insights about:
            1. Customer satisfaction trends and improvement opportunities
            2. Support team performance and efficiency
            3. Ticket escalation patterns and root causes
            4. Response time optimization strategies
            5. Category-specific improvement recommendations
            
            Format each insight as a clear, actionable statement.
            """
            
            response = self.insight_llm([HumanMessage(content=prompt)])
            insights = response.content.split('\n')
            return [insight.strip() for insight in insights if insight.strip() and not insight.startswith('#')]
            
        except Exception as e:
            logger.error(f"Error generating support insights: {e}")
            return ["Unable to generate AI insights at this time"]
    
    def _generate_referral_insights(self, data: Dict[str, Any]) -> List[str]:
        """Generate AI insights for referral call analysis."""
        try:
            prompt = f"""
            Analyze the following referral call data and provide actionable business insights:
            
            Referral Call Metrics:
            - Total calls: {data['total_calls']}
            - Completed calls: {data['completed_calls']}
            - Average duration: {data['avg_duration']:.1f} minutes
            - Average conversion probability: {data['avg_conversion_probability']:.1%}
            - Average deal value: ${data['avg_deal_value']:,.2f}
            - Decision maker present: {data['decision_maker_calls']} calls
            - Budget discussions: {data['budget_discussions']} calls
            - Timeline discussions: {data['timeline_discussions']} calls
            
            Call Types: {data['call_types'][:5]}
            Negotiation Stages: {data['negotiation_stages']}
            
            Provide 5-7 specific, actionable insights about:
            1. Call effectiveness and conversion optimization
            2. Deal value maximization strategies
            3. Negotiation stage progression patterns
            4. Decision maker engagement opportunities
            5. Sales process improvement recommendations
            
            Format each insight as a clear, actionable statement.
            """
            
            response = self.insight_llm([HumanMessage(content=prompt)])
            insights = response.content.split('\n')
            return [insight.strip() for insight in insights if insight.strip() and not insight.startswith('#')]
            
        except Exception as e:
            logger.error(f"Error generating referral insights: {e}")
            return ["Unable to generate AI insights at this time"]
    
    def _generate_customer_journey_insights(self, data: Dict[str, Any]) -> List[str]:
        """Generate AI insights for customer support journey analysis."""
        try:
            ticket_count = len(data['tickets'])
            call_count = len(data['calls'])
            interaction_count = len(data['interactions'])
            
            avg_satisfaction = sum(t['satisfaction'] for t in data['tickets'] if t['satisfaction']) / max(1, sum(1 for t in data['tickets'] if t['satisfaction']))
            avg_conversion = sum(c['conversion_probability'] for c in data['calls']) / max(1, len(data['calls']))
            
            prompt = f"""
            Analyze the following customer support journey data for customer {data['customer_id']} and provide personalized insights:
            
            Customer Journey Summary:
            - Support tickets: {ticket_count}
            - Referral calls: {call_count}
            - Interactions: {interaction_count}
            - Average satisfaction: {avg_satisfaction:.2f}/5.0
            - Average conversion probability: {avg_conversion:.1%}
            
            Recent Tickets: {data['tickets'][:3]}
            Recent Calls: {data['calls'][:3]}
            Recent Interactions: {data['interactions'][:5]}
            
            Provide 5-7 specific, personalized insights about:
            1. Customer satisfaction patterns and improvement opportunities
            2. Support experience optimization for this customer
            3. Referral call effectiveness and conversion potential
            4. Customer engagement strategies
            5. Risk assessment and retention recommendations
            
            Format each insight as a clear, actionable statement specific to this customer.
            """
            
            response = self.insight_llm([HumanMessage(content=prompt)])
            insights = response.content.split('\n')
            return [insight.strip() for insight in insights if insight.strip() and not insight.startswith('#')]
            
        except Exception as e:
            logger.error(f"Error generating customer journey insights: {e}")
            return ["Unable to generate AI insights at this time"]

# Create a singleton instance
support_referral_analyzer = SupportReferralAnalyzer() 