"""
Sample data generator for support tickets and referral calls.
"""
import sys
import os
import logging
import random
from datetime import datetime, timedelta
import psycopg2
from faker import Faker

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Faker
fake = Faker()

class SupportReferralDataGenerator:
    """
    Generator for realistic support ticket and referral call data.
    """
    
    def __init__(self):
        self.connection = None
        
    def get_connection(self):
        """Get database connection."""
        if not self.connection:
            self.connection = psycopg2.connect(
                host=settings.REDSHIFT_HOST,
                port=settings.REDSHIFT_PORT,
                database=settings.REDSHIFT_DATABASE,
                user=settings.REDSHIFT_USERNAME,
                password=settings.REDSHIFT_PASSWORD
            )
        return self.connection
    
    def generate_support_tickets(self, num_tickets: int = 500):
        """Generate sample support tickets."""
        logger.info(f"Generating {num_tickets} support tickets...")
        
        conn = self.get_connection()
        
        # Support ticket categories and subcategories
        categories = {
            'Technical Issues': ['Login Problems', 'Performance Issues', 'Integration Errors', 'API Issues', 'Data Sync Problems'],
            'Billing': ['Payment Issues', 'Invoice Questions', 'Subscription Changes', 'Refund Requests', 'Pricing Inquiries'],
            'Feature Requests': ['New Features', 'Enhancements', 'Customizations', 'Workflow Improvements', 'UI/UX Requests'],
            'Training': ['User Training', 'Documentation', 'Best Practices', 'Onboarding', 'Advanced Features'],
            'Account Management': ['User Access', 'Permissions', 'Account Setup', 'Security', 'Compliance']
        }
        
        priorities = ['low', 'medium', 'high', 'urgent']
        statuses = ['open', 'in_progress', 'resolved', 'closed']
        
        with conn.cursor() as cursor:
            # Get existing customer IDs
            cursor.execute("SELECT customer_id FROM customers LIMIT 100")
            customer_ids = [row[0] for row in cursor.fetchall()]
            
            if not customer_ids:
                logger.error("No customers found. Please generate customer data first.")
                return
            
            for i in range(num_tickets):
                customer_id = random.choice(customer_ids)
                category = random.choice(list(categories.keys()))
                subcategory = random.choice(categories[category])
                priority = random.choice(priorities)
                status = random.choice(statuses)
                
                # Generate realistic timestamps
                start_date = datetime.now() - timedelta(days=90)
                end_date = datetime.now()
                created_at = fake.date_time_between(start_date=start_date, end_date=end_date)
                resolved_at = None
                if status in ['resolved', 'closed']:
                    resolved_at = fake.date_time_between(start_date=created_at, end_date=end_date)
                
                # Generate realistic metrics
                first_response_time = random.randint(5, 480) if status != 'open' else None
                resolution_time = None
                if resolved_at:
                    resolution_time = random.randint(30, 2880)  # 30 minutes to 48 hours
                
                satisfaction_score = None
                if status in ['resolved', 'closed']:
                    # Higher satisfaction for faster resolution
                    base_satisfaction = 3.0
                    if resolution_time and resolution_time < 240:  # Less than 4 hours
                        base_satisfaction = 4.0
                    elif resolution_time and resolution_time < 1440:  # Less than 24 hours
                        base_satisfaction = 3.5
                    satisfaction_score = round(random.uniform(base_satisfaction, 5.0), 2)
                
                escalation_count = random.randint(0, 3) if priority in ['high', 'urgent'] else 0
                interaction_count = random.randint(1, 10)
                
                # Generate sentiment and urgency scores
                sentiment_score = round(random.uniform(-0.5, 1.0), 3)
                urgency_score = round(random.uniform(0.1, 1.0), 3)
                complexity_score = round(random.uniform(0.1, 1.0), 3)
                
                # Generate ticket data
                ticket_id = f"TKT_{fake.unique.random_number(digits=8)}"[:50]
                ticket_number = f"#{fake.unique.random_number(digits=6)}"[:50]
                subject = fake.sentence(nb_words=6)[:255]
                description = fake.text(max_nb_chars=500)[:255]
                assigned_to = fake.name()[:100]
                created_by = fake.name()[:100]
                
                # Generate AI analysis
                ai_analysis = self._generate_ticket_ai_analysis(priority, category, satisfaction_score if satisfaction_score is not None else 0.0, sentiment_score)[:255]
                
                # Insert ticket
                cursor.execute("""
                    INSERT INTO support_tickets (
                        ticket_id, customer_id, ticket_number, subject, description,
                        priority, status, category, subcategory, assigned_to, created_by,
                        created_at, resolved_at, first_response_time_minutes, resolution_time_minutes,
                        customer_satisfaction_score, escalation_count, interaction_count,
                        sentiment_score, urgency_score, complexity_score, ai_analysis
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    ticket_id, customer_id, ticket_number, subject, description,
                    priority, status, category, subcategory, assigned_to, created_by,
                    created_at, resolved_at, first_response_time, resolution_time,
                    satisfaction_score, escalation_count, interaction_count,
                    sentiment_score, urgency_score, complexity_score, ai_analysis
                ))
                
                # Generate interactions for this ticket
                self._generate_ticket_interactions(cursor, ticket_id, customer_id, interaction_count, created_at, resolved_at if resolved_at is not None else created_at)
                
                if (i + 1) % 50 == 0:
                    logger.info(f"Generated {i + 1} support tickets...")
        
        conn.commit()
        logger.info(f"✅ Generated {num_tickets} support tickets successfully!")
    
    def generate_referral_calls(self, num_calls: int = 200):
        """Generate sample referral calls."""
        logger.info(f"Generating {num_calls} referral calls...")
        
        conn = self.get_connection()
        
        call_types = ['discovery', 'demo', 'negotiation', 'closing', 'follow_up', 'renewal']
        call_statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled']
        call_outcomes = ['positive', 'neutral', 'negative', 'pending']
        negotiation_stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost']
        
        with conn.cursor() as cursor:
            # Get existing customer IDs
            cursor.execute("SELECT customer_id FROM customers LIMIT 50")
            customer_ids = [row[0] for row in cursor.fetchall()]
            
            if not customer_ids:
                logger.error("No customers found. Please generate customer data first.")
                return
            
            for i in range(num_calls):
                customer_id = random.choice(customer_ids)
                call_type = random.choice(call_types)
                call_status = random.choice(call_statuses)
                call_outcome = random.choice(call_outcomes)
                negotiation_stage = random.choice(negotiation_stages)
                
                # Generate realistic timestamps
                call_start_date = datetime.now() - timedelta(days=60)
                call_end_date = datetime.now() + timedelta(days=30)
                scheduled_at = fake.date_time_between(start_date=call_start_date, end_date=call_end_date)
                started_at = None
                ended_at = None
                duration_minutes = None
                
                if call_status == 'completed':
                    started_at = fake.date_time_between(start_date=scheduled_at, end_date=scheduled_at + timedelta(hours=2))
                    ended_at = started_at + timedelta(minutes=random.randint(15, 120))
                    duration_minutes = int((ended_at - started_at).total_seconds() / 60)
                
                # Generate realistic metrics
                probability_of_conversion = round(random.uniform(0.1, 0.9), 3)
                estimated_deal_value = random.randint(5000, 500000) if call_type in ['negotiation', 'closing'] else None
                
                sentiment_score = round(random.uniform(-0.3, 1.0), 3)
                urgency_score = round(random.uniform(0.1, 1.0), 3)
                
                # Generate call data
                call_id = f"CALL_{fake.unique.random_number(digits=8)}"[:50]
                call_number = f"CALL#{fake.unique.random_number(digits=6)}"[:50]
                call_purpose = fake.sentence(nb_words=8)[:255]
                call_summary = fake.text(max_nb_chars=300)[:255]
                participants = fake.text(max_nb_chars=200)[:255]
                objections_raised = fake.text(max_nb_chars=200)[:255] if random.random() < 0.3 else None
                next_steps = fake.text(max_nb_chars=200)[:255]
                if call_status == 'completed':
                    follow_up_start = datetime.now()
                    follow_up_end = datetime.now() + timedelta(days=30)
                    follow_up_date = fake.date_time_between(start_date=follow_up_start, end_date=follow_up_end)
                else:
                    follow_up_date = None
                notes = fake.text(max_nb_chars=400)[:255]
                
                # Generate boolean flags
                decision_makers_present = random.choice([True, False])
                budget_discussed = random.choice([True, False]) if call_type in ['negotiation', 'closing'] else False
                timeline_discussed = random.choice([True, False]) if call_type in ['negotiation', 'closing'] else False
                
                # Generate AI analysis
                ai_analysis = self._generate_call_ai_analysis(call_type, call_outcome, probability_of_conversion, sentiment_score)[:255]
                
                # Insert call
                cursor.execute("""
                    INSERT INTO referral_calls (
                        call_id, customer_id, call_number, call_type, call_purpose,
                        call_summary, call_outcome, call_status, scheduled_at, started_at,
                        ended_at, duration_minutes, participants, decision_makers_present,
                        budget_discussed, timeline_discussed, objections_raised, next_steps,
                        follow_up_date, probability_of_conversion, estimated_deal_value,
                        negotiation_stage, sentiment_score, urgency_score, ai_analysis, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    call_id, customer_id, call_number, call_type, call_purpose,
                    call_summary, call_outcome, call_status, scheduled_at, started_at,
                    ended_at, duration_minutes, participants, decision_makers_present,
                    budget_discussed, timeline_discussed, objections_raised, next_steps,
                    follow_up_date, probability_of_conversion, estimated_deal_value,
                    negotiation_stage, sentiment_score, urgency_score, ai_analysis, notes
                ))
                
                # Generate negotiations for this call
                if call_type in ['negotiation', 'closing'] and call_status == 'completed' and started_at is not None:
                    self._generate_call_negotiations(cursor, call_id, customer_id, started_at)
                
                if (i + 1) % 20 == 0:
                    logger.info(f"Generated {i + 1} referral calls...")
        
        conn.commit()
        logger.info(f"✅ Generated {num_calls} referral calls successfully!")
    
    def _generate_ticket_interactions(self, cursor, ticket_id: str, customer_id: str, interaction_count: int, created_at: datetime, resolved_at: datetime):
        """Generate interactions for a support ticket."""
        interaction_types = ['email', 'phone', 'chat', 'note', 'escalation', 'resolution']
        directions = ['inbound', 'outbound']
        channels = ['email', 'phone', 'live_chat', 'portal', 'social_media']
        
        for i in range(interaction_count):
            interaction_id = f"INT_{fake.unique.random_number(digits=8)}"
            interaction_type = random.choice(interaction_types)[:50]
            direction = random.choice(directions)[:20]
            channel = random.choice(channels)[:50]
            
            # Generate timestamp between ticket creation and resolution
            if resolved_at:
                timestamp = fake.date_time_between(start_date=created_at, end_date=resolved_at)
            else:
                timestamp = fake.date_time_between(start_date=created_at, end_date=datetime.now())
            
            subject = fake.sentence(nb_words=4)[:255]
            content = fake.text(max_nb_chars=200)[:255]
            sender = fake.name()[:100]
            recipient = fake.name()[:100]
            duration_minutes = random.randint(1, 30) if interaction_type in ['phone', 'chat'] else None
            
            sentiment_score = round(random.uniform(-0.5, 1.0), 3)
            urgency_score = round(random.uniform(0.1, 1.0), 3)
            resolution_contribution = round(random.uniform(0.0, 1.0), 3)
            
            ai_analysis = self._generate_interaction_ai_analysis(interaction_type, sentiment_score, urgency_score)[:255]
            metadata = fake.text(max_nb_chars=100)[:255]
            
            cursor.execute("""
                INSERT INTO ticket_interactions (
                    interaction_id, ticket_id, customer_id, interaction_type, direction,
                    channel, subject, content, sender, recipient, timestamp, duration_minutes,
                    sentiment_score, urgency_score, resolution_contribution, ai_analysis, metadata
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                interaction_id, ticket_id, customer_id, interaction_type, direction,
                channel, subject, content, sender, recipient, timestamp, duration_minutes,
                sentiment_score, urgency_score, resolution_contribution, ai_analysis, metadata
            ))
    
    def _generate_call_negotiations(self, cursor, call_id: str, customer_id: str, call_started_at: datetime):
        """Generate negotiations for a referral call."""
        negotiation_topics = ['pricing', 'terms', 'timeline', 'scope', 'payment_terms', 'service_levels']
        negotiation_tactics = ['value_proposition', 'concession', 'deadline_pressure', 'competitor_comparison', 'relationship_building']
        concession_types = ['discount', 'extended_trial', 'additional_features', 'flexible_terms', 'priority_support']
        objection_types = ['price', 'timeline', 'features', 'competition', 'budget', 'authority']
        
        num_negotiations = random.randint(1, 3)
        
        for i in range(num_negotiations):
            negotiation_id = f"NEG_{fake.unique.random_number(digits=8)}"
            negotiation_topic = random.choice(negotiation_topics)[:255]
            negotiation_tactic = random.choice(negotiation_tactics)[:100]
            
            initial_position = fake.text(max_nb_chars=150)[:255]
            counter_position = fake.text(max_nb_chars=150)[:255]
            final_position = fake.text(max_nb_chars=150)[:255]
            
            concession_made = random.choice([True, False])
            concession_value = random.randint(1000, 50000) if concession_made else None
            concession_type = random.choice(concession_types)[:100] if concession_made else None
            
            objection_handled = random.choice([True, False])
            objection_type = random.choice(objection_types)[:100] if objection_handled else None
            objection_response = fake.text(max_nb_chars=200)[:255] if objection_handled else None
            
            decision_made = random.choice([True, False])
            decision_outcome = random.choice(['accepted', 'rejected', 'pending', 'counter_offered']) if decision_made else None
            
            confidence_score = round(random.uniform(0.3, 1.0), 3)
            risk_assessment = random.choice(['low', 'medium', 'high'])[:100]
            
            ai_analysis = self._generate_negotiation_ai_analysis(negotiation_topic, concession_made, objection_handled, decision_outcome if decision_outcome is not None else "pending")[:255]
            
            # Generate timestamp during the call
            timestamp = fake.date_time_between(start_date=call_started_at, end_date=call_started_at + timedelta(minutes=120))
            
            cursor.execute("""
                INSERT INTO call_negotiations (
                    negotiation_id, call_id, customer_id, negotiation_topic, initial_position,
                    counter_position, final_position, negotiation_tactic, concession_made,
                    concession_value, concession_type, objection_handled, objection_type,
                    objection_response, decision_made, decision_outcome, confidence_score,
                    risk_assessment, ai_analysis, timestamp
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                negotiation_id, call_id, customer_id, negotiation_topic, initial_position,
                counter_position, final_position, negotiation_tactic, concession_made,
                concession_value, concession_type, objection_handled, objection_type,
                objection_response, decision_made, decision_outcome, confidence_score,
                risk_assessment, ai_analysis, timestamp
            ))
    
    def _generate_ticket_ai_analysis(self, priority: str, category: str, satisfaction_score: float, sentiment_score: float) -> str:
        """Generate AI analysis for a support ticket."""
        analysis = f"Priority: {priority}, Category: {category}"
        if satisfaction_score:
            analysis += f", Satisfaction: {satisfaction_score}/5.0"
        if sentiment_score:
            analysis += f", Sentiment: {sentiment_score:.3f}"
        
        if priority in ['high', 'urgent']:
            analysis += " - Requires immediate attention"
        if satisfaction_score and satisfaction_score < 3.0:
            analysis += " - Customer satisfaction needs improvement"
        if sentiment_score and sentiment_score < 0:
            analysis += " - Negative sentiment detected"
        
        return analysis
    
    def _generate_call_ai_analysis(self, call_type: str, call_outcome: str, conversion_probability: float, sentiment_score: float) -> str:
        """Generate AI analysis for a referral call."""
        analysis = f"Call Type: {call_type}, Outcome: {call_outcome}, Conversion Probability: {conversion_probability:.1%}"
        
        if conversion_probability > 0.7:
            analysis += " - High conversion potential"
        elif conversion_probability < 0.3:
            analysis += " - Low conversion potential"
        
        if sentiment_score > 0.5:
            analysis += " - Positive sentiment"
        elif sentiment_score < 0:
            analysis += " - Negative sentiment detected"
        
        return analysis
    
    def _generate_interaction_ai_analysis(self, interaction_type: str, sentiment_score: float, urgency_score: float) -> str:
        """Generate AI analysis for a ticket interaction."""
        analysis = f"Interaction Type: {interaction_type}, Sentiment: {sentiment_score:.3f}, Urgency: {urgency_score:.3f}"
        
        if urgency_score > 0.7:
            analysis += " - High urgency detected"
        if sentiment_score < 0:
            analysis += " - Negative sentiment"
        
        return analysis
    
    def _generate_negotiation_ai_analysis(self, topic: str, concession_made: bool, objection_handled: bool, decision_outcome: str) -> str:
        """Generate AI analysis for a negotiation."""
        analysis = f"Topic: {topic}"
        
        if concession_made:
            analysis += " - Concession made to advance deal"
        if objection_handled:
            analysis += " - Objection successfully handled"
        if decision_outcome:
            analysis += f" - Decision: {decision_outcome}"
        
        return analysis
    
    def close_connection(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()

def main():
    """Main function to generate support and referral data."""
    logger.info("🚀 Starting support and referral data generation...")
    
    generator = SupportReferralDataGenerator()
    
    try:
        # Generate support tickets
        generator.generate_support_tickets(500)
        
        # Generate referral calls
        generator.generate_referral_calls(200)
        
        logger.info("✅ Support and referral data generation completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error generating support and referral data: {e}")
        raise
    finally:
        generator.close_connection()

if __name__ == "__main__":
    main() 