"""
Direct database setup script for Redshift using psycopg2.
"""
import sys
import os
import logging
import psycopg2

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_connection():
    """Get a database connection."""
    return psycopg2.connect(
        host=settings.REDSHIFT_HOST,
        port=settings.REDSHIFT_PORT,
        database=settings.REDSHIFT_DATABASE,
        user=settings.REDSHIFT_USERNAME,
        password=settings.REDSHIFT_PASSWORD
    )

def create_customers_table(conn):
    """Create the customers table."""
    logger.info("Creating customers table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        customer_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(40),
        company VARCHAR(255),
        industry VARCHAR(100),
        company_size VARCHAR(50),
        job_title VARCHAR(100),
        region VARCHAR(100),
        country VARCHAR(100),
        city VARCHAR(100),
        subscription_tier VARCHAR(50) DEFAULT 'basic',
        total_spend DECIMAL(15,4) DEFAULT 0.0,
        lifetime_value DECIMAL(15,4) DEFAULT 0.0,
        monthly_recurring_revenue DECIMAL(15,4) DEFAULT 0.0,
        last_activity TIMESTAMP,
        engagement_score DECIMAL(15,4) DEFAULT 0.0,
        support_tickets_count INTEGER DEFAULT 0,
        churn_risk_score DECIMAL(15,4) DEFAULT 0.0,
        growth_potential_score DECIMAL(15,4) DEFAULT 0.0,
        customer_segment VARCHAR(50),
        ai_insights VARCHAR(65535),
        status VARCHAR(50) DEFAULT 'active',
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT GETDATE(),
        updated_at TIMESTAMP DEFAULT GETDATE()
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Customers table created successfully!")

def create_contracts_table(conn):
    """Create the contracts table."""
    logger.info("Creating contracts table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        contract_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        contract_type VARCHAR(100) NOT NULL,
        contract_name VARCHAR(255),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        signed_date TIMESTAMP,
        renewal_date TIMESTAMP,
        contract_value DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        billing_frequency VARCHAR(50),
        payment_terms VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        terms TEXT,
        special_conditions TEXT,
        renewal_probability DECIMAL(6,3) DEFAULT 0.0,
        legal_risk_score DECIMAL(6,3) DEFAULT 0.0,
        compliance_status VARCHAR(50) DEFAULT 'compliant',
        ai_analysis VARCHAR(65535),
        performance_score DECIMAL(6,3) DEFAULT 0.0,
        satisfaction_score DECIMAL(6,3) DEFAULT 0.0,
        utilization_rate DECIMAL(6,3) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT GETDATE(),
        updated_at TIMESTAMP DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Contracts table created successfully!")

def create_analysis_table(conn):
    """Create the analysis table."""
    logger.info("Creating analysis table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS analysis (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        analysis_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50),
        contract_id VARCHAR(50),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        metric_unit VARCHAR(50),
        metric_category VARCHAR(100),
        analysis_date TIMESTAMP NOT NULL,
        period_start TIMESTAMP,
        period_end TIMESTAMP,
        trend_direction VARCHAR(20),
        trend_magnitude DECIMAL(10,2) DEFAULT 0.0,
        previous_value DECIMAL(15,2),
        change_percentage DECIMAL(10,2),
        confidence_score DECIMAL(6,3) DEFAULT 0.0,
        ai_insights VARCHAR(65535),
        recommendations VARCHAR(65535),
        risk_level VARCHAR(20),
        data_source VARCHAR(100),
        analysis_type VARCHAR(50),
        tags VARCHAR(65535),
        created_at TIMESTAMP DEFAULT GETDATE(),
        updated_at TIMESTAMP DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Analysis table created successfully!")

def create_support_tickets_table(conn):
    """Create the support tickets table."""
    logger.info("Creating support tickets table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        contract_id VARCHAR(50),
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        category VARCHAR(100),
        subcategory VARCHAR(100),
        assigned_to VARCHAR(100),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT GETDATE(),
        updated_at TIMESTAMP DEFAULT GETDATE(),
        resolved_at TIMESTAMP,
        first_response_time_minutes INTEGER,
        resolution_time_minutes INTEGER,
        customer_satisfaction_score DECIMAL(3,2),
        escalation_count INTEGER DEFAULT 0,
        interaction_count INTEGER DEFAULT 0,
        sentiment_score DECIMAL(6,3) DEFAULT 0.0,
        urgency_score DECIMAL(6,3) DEFAULT 0.0,
        complexity_score DECIMAL(6,3) DEFAULT 0.0,
        ai_analysis VARCHAR(65535),
        tags VARCHAR(65535),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Support tickets table created successfully!")

def create_ticket_interactions_table(conn):
    """Create the ticket interactions table for tracking all communications."""
    logger.info("Creating ticket interactions table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS ticket_interactions (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        interaction_id VARCHAR(50) UNIQUE NOT NULL,
        ticket_id VARCHAR(50) NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        direction VARCHAR(20) NOT NULL,
        channel VARCHAR(50),
        subject VARCHAR(255),
        content TEXT,
        sender VARCHAR(100),
        recipient VARCHAR(100),
        timestamp TIMESTAMP DEFAULT GETDATE(),
        duration_minutes INTEGER,
        sentiment_score DECIMAL(6,3) DEFAULT 0.0,
        urgency_score DECIMAL(6,3) DEFAULT 0.0,
        resolution_contribution DECIMAL(6,3) DEFAULT 0.0,
        ai_analysis VARCHAR(65535),
        metadata VARCHAR(65535),
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Ticket interactions table created successfully!")

def create_referral_calls_table(conn):
    """Create the referral calls table."""
    logger.info("Creating referral calls table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS referral_calls (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        call_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        contract_id VARCHAR(50),
        call_number VARCHAR(50) UNIQUE NOT NULL,
        call_type VARCHAR(50) NOT NULL,
        call_purpose VARCHAR(255),
        call_summary TEXT,
        call_outcome VARCHAR(100),
        call_status VARCHAR(50) DEFAULT 'scheduled',
        scheduled_at TIMESTAMP,
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        duration_minutes INTEGER,
        participants TEXT,
        decision_makers_present BOOLEAN DEFAULT FALSE,
        budget_discussed BOOLEAN DEFAULT FALSE,
        timeline_discussed BOOLEAN DEFAULT FALSE,
        objections_raised TEXT,
        next_steps TEXT,
        follow_up_date TIMESTAMP,
        probability_of_conversion DECIMAL(6,3) DEFAULT 0.0,
        estimated_deal_value DECIMAL(15,2),
        negotiation_stage VARCHAR(50),
        sentiment_score DECIMAL(6,3) DEFAULT 0.0,
        urgency_score DECIMAL(6,3) DEFAULT 0.0,
        ai_analysis VARCHAR(65535),
        notes TEXT,
        created_at TIMESTAMP DEFAULT GETDATE(),
        updated_at TIMESTAMP DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Referral calls table created successfully!")

def create_call_negotiations_table(conn):
    """Create the call negotiations table for tracking negotiation details."""
    logger.info("Creating call negotiations table...")
    
    create_sql = """
    CREATE TABLE IF NOT EXISTS call_negotiations (
        id INTEGER IDENTITY(1,1) PRIMARY KEY,
        negotiation_id VARCHAR(50) UNIQUE NOT NULL,
        call_id VARCHAR(50) NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        negotiation_topic VARCHAR(255) NOT NULL,
        initial_position TEXT,
        counter_position TEXT,
        final_position TEXT,
        negotiation_tactic VARCHAR(100),
        concession_made BOOLEAN DEFAULT FALSE,
        concession_value DECIMAL(15,2),
        concession_type VARCHAR(100),
        objection_handled BOOLEAN DEFAULT FALSE,
        objection_type VARCHAR(100),
        objection_response TEXT,
        decision_made BOOLEAN DEFAULT FALSE,
        decision_outcome VARCHAR(100),
        confidence_score DECIMAL(6,3) DEFAULT 0.0,
        risk_assessment VARCHAR(100),
        ai_analysis VARCHAR(65535),
        timestamp TIMESTAMP DEFAULT GETDATE(),
        FOREIGN KEY (call_id) REFERENCES referral_calls(call_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    """
    
    with conn.cursor() as cursor:
        cursor.execute(create_sql)
        logger.info("✅ Call negotiations table created successfully!")

def verify_tables(conn):
    """Verify that all tables were created correctly."""
    logger.info("Verifying table creation...")
    
    expected_tables = ['customers', 'contracts', 'analysis', 'support_tickets', 'ticket_interactions', 'referral_calls', 'call_negotiations']
    
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        """)
        
        existing_tables = [row[0] for row in cursor.fetchall()]
        logger.info(f"Found tables: {existing_tables}")
        
        # Check if all expected tables exist
        missing_tables = set(expected_tables) - set(existing_tables)
        if missing_tables:
            logger.error(f"❌ Missing tables: {missing_tables}")
            return False
        else:
            logger.info("✅ All expected tables found!")
            return True

def show_table_schemas(conn):
    """Display the schema of created tables."""
    logger.info("Displaying table schemas...")
    
    tables = ['customers', 'contracts', 'analysis', 'support_tickets', 'ticket_interactions', 'referral_calls', 'call_negotiations']
    
    for table in tables:
        logger.info(f"\n--- {table.upper()} TABLE SCHEMA ---")
        with conn.cursor() as cursor:
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = '{table}'
                ORDER BY ordinal_position
            """)
            
            for row in cursor.fetchall():
                nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                default = f" DEFAULT {row[3]}" if row[3] else ""
                logger.info(f"  {row[0]}: {row[1]} {nullable}{default}")

def main():
    """Main setup function."""
    logger.info("🚀 Starting database setup (direct psycopg2)...")
    
    # Check configuration
    if not settings.is_configured:
        logger.error("❌ Database configuration incomplete. Please check your .env file.")
        return False
    
    logger.info(f"📊 Connecting to Redshift: {settings.REDSHIFT_HOST}:{settings.REDSHIFT_PORT}/{settings.REDSHIFT_DATABASE}")
    
    try:
        # Get connection
        conn = get_connection()
        logger.info("✅ Connected to Redshift successfully!")
        
        # Create tables
        create_customers_table(conn)
        create_contracts_table(conn)
        create_analysis_table(conn)
        create_support_tickets_table(conn)
        create_ticket_interactions_table(conn)
        create_referral_calls_table(conn)
        create_call_negotiations_table(conn)
        
        # Commit changes
        conn.commit()
        
        # Verify tables
        if not verify_tables(conn):
            return False
        
        # Show schemas
        show_table_schemas(conn)
        
        conn.close()
        logger.info("🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database setup error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 