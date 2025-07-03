"""
Direct script to generate and load sample data into Redshift using psycopg2.
"""
import sys
import os
import logging
import psycopg2
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import settings
from data.generators.sample_data import data_generator

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

def load_customers(conn, customers_data):
    """Load customer data into the database."""
    logger.info(f"Loading {len(customers_data)} customers...")
    
    try:
        with conn.cursor() as cursor:
            for customer in customers_data:
                insert_sql = """
                INSERT INTO customers (
                    customer_id, name, email, phone, company, industry, company_size,
                    job_title, region, country, city, subscription_tier, total_spend,
                    lifetime_value, monthly_recurring_revenue, last_activity,
                    engagement_score, support_tickets_count, churn_risk_score,
                    growth_potential_score, customer_segment, ai_insights, status, source
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
                
                cursor.execute(insert_sql, (
                    customer['customer_id'],
                    customer['name'],
                    customer['email'],
                    customer['phone'],
                    customer['company'],
                    customer['industry'],
                    customer['company_size'],
                    customer['job_title'],
                    customer['region'],
                    customer['country'],
                    customer['city'],
                    customer['subscription_tier'],
                    customer['total_spend'],
                    customer['lifetime_value'],
                    customer['monthly_recurring_revenue'],
                    customer['last_activity'],
                    customer['engagement_score'],
                    customer['support_tickets_count'],
                    customer['churn_risk_score'],
                    customer['growth_potential_score'],
                    customer['customer_segment'],
                    customer['ai_insights'],
                    customer['status'],
                    customer['source']
                ))
            
            conn.commit()
            logger.info("✅ Customers loaded successfully!")
            return True
    except Exception as e:
        logger.error(f"❌ Error loading customers: {e}")
        return False

def load_contracts(conn, contracts_data):
    """Load contract data into the database."""
    logger.info(f"Loading {len(contracts_data)} contracts...")
    
    try:
        with conn.cursor() as cursor:
            for contract in contracts_data:
                insert_sql = """
                INSERT INTO contracts (
                    contract_id, customer_id, contract_type, contract_name,
                    start_date, end_date, signed_date, renewal_date,
                    contract_value, currency, billing_frequency, payment_terms,
                    status, terms, special_conditions, renewal_probability,
                    legal_risk_score, compliance_status, ai_analysis,
                    performance_score, satisfaction_score, utilization_rate
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
                
                cursor.execute(insert_sql, (
                    contract['contract_id'],
                    contract['customer_id'],
                    contract['contract_type'],
                    contract['contract_name'],
                    contract['start_date'],
                    contract['end_date'],
                    contract['signed_date'],
                    contract['renewal_date'],
                    contract['contract_value'],
                    contract['currency'],
                    contract['billing_frequency'],
                    contract['payment_terms'],
                    contract['status'],
                    contract['terms'],
                    contract['special_conditions'],
                    contract['renewal_probability'],
                    contract['legal_risk_score'],
                    contract['compliance_status'],
                    contract['ai_analysis'],
                    contract['performance_score'],
                    contract['satisfaction_score'],
                    contract['utilization_rate']
                ))
            
            conn.commit()
            logger.info("✅ Contracts loaded successfully!")
            return True
    except Exception as e:
        logger.error(f"❌ Error loading contracts: {e}")
        return False

def load_analysis(conn, analysis_data):
    """Load analysis data into the database."""
    logger.info(f"Loading {len(analysis_data)} analysis records...")
    
    try:
        with conn.cursor() as cursor:
            for analysis in analysis_data:
                insert_sql = """
                INSERT INTO analysis (
                    analysis_id, customer_id, contract_id, metric_name,
                    metric_value, metric_unit, metric_category, analysis_date,
                    period_start, period_end, trend_direction, trend_magnitude,
                    previous_value, change_percentage, confidence_score,
                    ai_insights, recommendations, risk_level, data_source,
                    analysis_type, tags
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
                
                cursor.execute(insert_sql, (
                    analysis['analysis_id'],
                    analysis['customer_id'],
                    analysis['contract_id'],
                    analysis['metric_name'],
                    analysis['metric_value'],
                    analysis['metric_unit'],
                    analysis['metric_category'],
                    analysis['analysis_date'],
                    analysis['period_start'],
                    analysis['period_end'],
                    analysis['trend_direction'],
                    analysis['trend_magnitude'],
                    analysis['previous_value'],
                    analysis['change_percentage'],
                    analysis['confidence_score'],
                    analysis['ai_insights'],
                    analysis['recommendations'],
                    analysis['risk_level'],
                    analysis['data_source'],
                    analysis['analysis_type'],
                    analysis['tags']
                ))
            
            conn.commit()
            logger.info("✅ Analysis data loaded successfully!")
            return True
    except Exception as e:
        logger.error(f"❌ Error loading analysis data: {e}")
        return False

def verify_data_loaded(conn):
    """Verify that data was loaded correctly."""
    logger.info("Verifying data was loaded...")
    
    try:
        with conn.cursor() as cursor:
            # Count records in each table
            cursor.execute("SELECT COUNT(*) FROM customers")
            customer_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM contracts")
            contract_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM analysis")
            analysis_count = cursor.fetchone()[0]
            
            logger.info(f"📊 Data loaded:")
            logger.info(f"  - Customers: {customer_count}")
            logger.info(f"  - Contracts: {contract_count}")
            logger.info(f"  - Analysis records: {analysis_count}")
            
            return customer_count > 0 and contract_count > 0 and analysis_count > 0
            
    except Exception as e:
        logger.error(f"❌ Error verifying data: {e}")
        return False

def show_sample_data(conn):
    """Display sample data from each table."""
    logger.info("Displaying sample data...")
    
    try:
        with conn.cursor() as cursor:
            # Sample customers
            logger.info("\n--- SAMPLE CUSTOMERS ---")
            cursor.execute("SELECT customer_id, name, company, lifetime_value FROM customers LIMIT 3")
            customers = cursor.fetchall()
            for customer in customers:
                logger.info(f"  {customer[0]}: {customer[1]} ({customer[2]}) - ${customer[3]:,.2f}")
            
            # Sample contracts
            logger.info("\n--- SAMPLE CONTRACTS ---")
            cursor.execute("SELECT contract_id, contract_type, contract_value FROM contracts LIMIT 3")
            contracts = cursor.fetchall()
            for contract in contracts:
                logger.info(f"  {contract[0]}: {contract[1]} - ${contract[2]:,.2f}")
            
            # Sample analysis
            logger.info("\n--- SAMPLE ANALYSIS ---")
            cursor.execute("SELECT analysis_id, metric_name, metric_value, metric_unit FROM analysis LIMIT 3")
            analyses = cursor.fetchall()
            for analysis in analyses:
                logger.info(f"  {analysis[0]}: {analysis[1]} = {analysis[2]} {analysis[3]}")
                
    except Exception as e:
        logger.error(f"❌ Error showing sample data: {e}")

def main():
    """Main function to generate and load sample data."""
    logger.info("🚀 Starting sample data generation and loading (direct psycopg2)...")
    
    # Check configuration
    if not settings.is_configured:
        logger.error("❌ Database configuration incomplete. Please check your .env file.")
        return False
    
    try:
        # Get connection
        conn = get_connection()
        logger.info("✅ Connected to Redshift successfully!")
        
        # Generate sample data
        logger.info("📊 Generating sample data...")
        
        # Generate customers
        customers_data = data_generator.generate_customers()
        logger.info(f"Generated {len(customers_data)} customers")
        
        # Generate contracts (using customer IDs)
        contracts_data = data_generator.generate_contracts(customers_data)
        logger.info(f"Generated {len(contracts_data)} contracts")
        
        # Generate analysis data
        analysis_data = data_generator.generate_analysis(customers_data, contracts_data)
        logger.info(f"Generated {len(analysis_data)} analysis records")
        
        # Load data into database
        logger.info("💾 Loading data into Redshift...")
        
        if not load_customers(conn, customers_data):
            return False
        
        if not load_contracts(conn, contracts_data):
            return False
        
        if not load_analysis(conn, analysis_data):
            return False
        
        # Verify data was loaded
        if not verify_data_loaded(conn):
            return False
        
        # Show sample data
        show_sample_data(conn)
        
        conn.close()
        logger.info("🎉 Sample data generation and loading completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 