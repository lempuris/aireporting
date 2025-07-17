"""
Performance index creation script for AI Business Intelligence Platform.

This script creates indexes to optimize the most frequently used queries
based on the analysis in OPTIMIZATION.md.

Expected performance improvements:
- 60-80% faster database queries
- Reduced query execution time from seconds to milliseconds
- Better performance for ORDER BY operations
- Optimized JOIN operations

Run this script after database setup to improve query performance.
"""

import sys
import os
import logging
import psycopg2
import time

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
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

def measure_query_performance(conn, query, description):
    """Measure query execution time."""
    logger.info(f"Testing {description}...")
    start_time = time.time()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()
            
        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"✅ {description} - Execution time: {execution_time:.3f}s, Rows: {len(result)}")
        return execution_time, len(result)
        
    except Exception as e:
        logger.error(f"❌ {description} failed: {e}")
        return None, 0

def test_queries_before_indexes(conn):
    """Test key queries before creating indexes."""
    logger.info("🔍 Testing query performance BEFORE creating indexes...")
    
    test_queries = [
        {
            "query": """
                SELECT COUNT(*) as total_customers,
                       COUNT(CASE WHEN churn_risk_score > 0.7 THEN 1 END) as high_risk_customers,
                       COUNT(CASE WHEN lifetime_value > 50000 THEN 1 END) as high_value_customers
                FROM customers
                WHERE status = 'active'
            """,
            "description": "Customer health analysis with COUNT CASE statements"
        },
        {
            "query": """
                SELECT customer_id, name, churn_risk_score
                FROM customers
                WHERE status = 'active'
                ORDER BY churn_risk_score DESC
                LIMIT 100
            """,
            "description": "Customer query with ORDER BY churn_risk_score"
        },
        {
            "query": """
                SELECT COUNT(*) as expiring_soon
                FROM contracts
                WHERE status = 'active'
                AND end_date BETWEEN CURRENT_DATE AND DATEADD(day, 90, CURRENT_DATE)
            """,
            "description": "Contract expiration query with date range"
        },
        {
            "query": """
                SELECT customer_segment, COUNT(*) as count, AVG(lifetime_value) as avg_value
                FROM customers
                WHERE status = 'active'
                GROUP BY customer_segment
            """,
            "description": "Customer segmentation with GROUP BY"
        },
        {
            "query": """
                SELECT metric_name, COUNT(*) as count
                FROM analysis
                WHERE analysis_date >= DATEADD(day, -30, CURRENT_DATE)
                GROUP BY metric_name
            """,
            "description": "Analysis metrics with date filter"
        }
    ]
    
    results = {}
    for test in test_queries:
        execution_time, row_count = measure_query_performance(conn, test["query"], test["description"])
        results[test["description"]] = {
            "before": execution_time,
            "rows": row_count
        }
    
    return results

def create_customers_indexes(conn):
    """Create performance indexes for customers table."""
    logger.info("Creating indexes for customers table...")
    
    indexes = [
        {
            "name": "idx_customers_status_churn_risk",
            "sql": "CREATE INDEX idx_customers_status_churn_risk ON customers(status, churn_risk_score)",
            "purpose": "Optimize queries filtering by status and ordering by churn_risk_score"
        },
        {
            "name": "idx_customers_status_segment",
            "sql": "CREATE INDEX idx_customers_status_segment ON customers(status, customer_segment, lifetime_value)",
            "purpose": "Optimize customer segmentation queries"
        },
        {
            "name": "idx_customers_status_lifetime_value",
            "sql": "CREATE INDEX idx_customers_status_lifetime_value ON customers(status, lifetime_value)",
            "purpose": "Optimize high-value customer queries"
        },
        {
            "name": "idx_customers_status_industry",
            "sql": "CREATE INDEX idx_customers_status_industry ON customers(status, industry, lifetime_value)",
            "purpose": "Optimize industry-based customer analysis"
        }
    ]
    
    with conn.cursor() as cursor:
        for index in indexes:
            try:
                logger.info(f"Creating {index['name']} - {index['purpose']}")
                cursor.execute(index["sql"])
                logger.info(f"✅ {index['name']} created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create {index['name']}: {e}")

def create_contracts_indexes(conn):
    """Create performance indexes for contracts table."""
    logger.info("Creating indexes for contracts table...")
    
    indexes = [
        {
            "name": "idx_contracts_status_end_date",
            "sql": "CREATE INDEX idx_contracts_status_end_date ON contracts(status, end_date)",
            "purpose": "Optimize contract expiration queries"
        },
        {
            "name": "idx_contracts_customer_status",
            "sql": "CREATE INDEX idx_contracts_customer_status ON contracts(customer_id, status)",
            "purpose": "Optimize customer-contract joins"
        },
        {
            "name": "idx_contracts_status_renewal",
            "sql": "CREATE INDEX idx_contracts_status_renewal ON contracts(status, renewal_probability, contract_value)",
            "purpose": "Optimize renewal probability analysis"
        },
        {
            "name": "idx_contracts_status_value",
            "sql": "CREATE INDEX idx_contracts_status_value ON contracts(status, contract_value)",
            "purpose": "Optimize contract value analysis"
        }
    ]
    
    with conn.cursor() as cursor:
        for index in indexes:
            try:
                logger.info(f"Creating {index['name']} - {index['purpose']}")
                cursor.execute(index["sql"])
                logger.info(f"✅ {index['name']} created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create {index['name']}: {e}")

def create_analysis_indexes(conn):
    """Create performance indexes for analysis table."""
    logger.info("Creating indexes for analysis table...")
    
    indexes = [
        {
            "name": "idx_analysis_date_customer",
            "sql": "CREATE INDEX idx_analysis_date_customer ON analysis(analysis_date, customer_id)",
            "purpose": "Optimize date-based customer analysis queries"
        },
        {
            "name": "idx_analysis_date_metric",
            "sql": "CREATE INDEX idx_analysis_date_metric ON analysis(analysis_date, metric_name)",
            "purpose": "Optimize metric-based time series queries"
        },
        {
            "name": "idx_analysis_customer_metric",
            "sql": "CREATE INDEX idx_analysis_customer_metric ON analysis(customer_id, metric_name, analysis_date)",
            "purpose": "Optimize customer-specific metric tracking"
        },
        {
            "name": "idx_analysis_metric_category",
            "sql": "CREATE INDEX idx_analysis_metric_category ON analysis(metric_category, analysis_date)",
            "purpose": "Optimize category-based analysis"
        }
    ]
    
    with conn.cursor() as cursor:
        for index in indexes:
            try:
                logger.info(f"Creating {index['name']} - {index['purpose']}")
                cursor.execute(index["sql"])
                logger.info(f"✅ {index['name']} created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create {index['name']}: {e}")

def create_support_tickets_indexes(conn):
    """Create performance indexes for support_tickets table."""
    logger.info("Creating indexes for support_tickets table...")
    
    indexes = [
        {
            "name": "idx_support_created_status",
            "sql": "CREATE INDEX idx_support_created_status ON support_tickets(created_at, status)",
            "purpose": "Optimize support ticket timeline analysis"
        },
        {
            "name": "idx_support_customer_created",
            "sql": "CREATE INDEX idx_support_customer_created ON support_tickets(customer_id, created_at)",
            "purpose": "Optimize customer support history"
        },
        {
            "name": "idx_support_status_priority",
            "sql": "CREATE INDEX idx_support_status_priority ON support_tickets(status, priority, created_at)",
            "purpose": "Optimize support queue management"
        },
        {
            "name": "idx_support_category_status",
            "sql": "CREATE INDEX idx_support_category_status ON support_tickets(category, status, created_at)",
            "purpose": "Optimize category-based support analysis"
        }
    ]
    
    with conn.cursor() as cursor:
        for index in indexes:
            try:
                logger.info(f"Creating {index['name']} - {index['purpose']}")
                cursor.execute(index["sql"])
                logger.info(f"✅ {index['name']} created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create {index['name']}: {e}")

def create_additional_indexes(conn):
    """Create additional indexes for referral calls and interactions."""
    logger.info("Creating additional indexes for referral calls and interactions...")
    
    indexes = [
        {
            "name": "idx_referral_customer_scheduled",
            "sql": "CREATE INDEX idx_referral_customer_scheduled ON referral_calls(customer_id, scheduled_at)",
            "purpose": "Optimize referral call scheduling queries"
        },
        {
            "name": "idx_referral_status_conversion",
            "sql": "CREATE INDEX idx_referral_status_conversion ON referral_calls(call_status, probability_of_conversion)",
            "purpose": "Optimize conversion probability analysis"
        },
        {
            "name": "idx_ticket_interactions_ticket_timestamp",
            "sql": "CREATE INDEX idx_ticket_interactions_ticket_timestamp ON ticket_interactions(ticket_id, timestamp)",
            "purpose": "Optimize ticket interaction timeline"
        },
        {
            "name": "idx_call_negotiations_call_timestamp",
            "sql": "CREATE INDEX idx_call_negotiations_call_timestamp ON call_negotiations(call_id, timestamp)",
            "purpose": "Optimize call negotiation tracking"
        }
    ]
    
    with conn.cursor() as cursor:
        for index in indexes:
            try:
                logger.info(f"Creating {index['name']} - {index['purpose']}")
                cursor.execute(index["sql"])
                logger.info(f"✅ {index['name']} created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create {index['name']}: {e}")

def test_queries_after_indexes(conn, before_results):
    """Test key queries after creating indexes and compare performance."""
    logger.info("🔍 Testing query performance AFTER creating indexes...")
    
    test_queries = [
        {
            "query": """
                SELECT COUNT(*) as total_customers,
                       COUNT(CASE WHEN churn_risk_score > 0.7 THEN 1 END) as high_risk_customers,
                       COUNT(CASE WHEN lifetime_value > 50000 THEN 1 END) as high_value_customers
                FROM customers
                WHERE status = 'active'
            """,
            "description": "Customer health analysis with COUNT CASE statements"
        },
        {
            "query": """
                SELECT customer_id, name, churn_risk_score
                FROM customers
                WHERE status = 'active'
                ORDER BY churn_risk_score DESC
                LIMIT 100
            """,
            "description": "Customer query with ORDER BY churn_risk_score"
        },
        {
            "query": """
                SELECT COUNT(*) as expiring_soon
                FROM contracts
                WHERE status = 'active'
                AND end_date BETWEEN CURRENT_DATE AND DATEADD(day, 90, CURRENT_DATE)
            """,
            "description": "Contract expiration query with date range"
        },
        {
            "query": """
                SELECT customer_segment, COUNT(*) as count, AVG(lifetime_value) as avg_value
                FROM customers
                WHERE status = 'active'
                GROUP BY customer_segment
            """,
            "description": "Customer segmentation with GROUP BY"
        },
        {
            "query": """
                SELECT metric_name, COUNT(*) as count
                FROM analysis
                WHERE analysis_date >= DATEADD(day, -30, CURRENT_DATE)
                GROUP BY metric_name
            """,
            "description": "Analysis metrics with date filter"
        }
    ]
    
    logger.info("\n📊 PERFORMANCE COMPARISON RESULTS:")
    logger.info("=" * 80)
    
    for test in test_queries:
        execution_time, row_count = measure_query_performance(conn, test["query"], test["description"])
        
        if test["description"] in before_results and before_results[test["description"]]["before"]:
            before_time = before_results[test["description"]]["before"]
            improvement = ((before_time - execution_time) / before_time) * 100 if execution_time else 0
            
            logger.info(f"\n{test['description']}:")
            logger.info(f"  Before: {before_time:.3f}s")
            logger.info(f"  After:  {execution_time:.3f}s")
            logger.info(f"  Improvement: {improvement:.1f}%")
            logger.info(f"  Rows: {row_count}")

def verify_indexes_created(conn):
    """Verify that all indexes were created successfully."""
    logger.info("🔍 Verifying created indexes...")
    
    expected_indexes = [
        'idx_customers_status_churn_risk',
        'idx_customers_status_segment',
        'idx_customers_status_lifetime_value',
        'idx_customers_status_industry',
        'idx_contracts_status_end_date',
        'idx_contracts_customer_status',
        'idx_contracts_status_renewal',
        'idx_contracts_status_value',
        'idx_analysis_date_customer',
        'idx_analysis_date_metric',
        'idx_analysis_customer_metric',
        'idx_analysis_metric_category',
        'idx_support_created_status',
        'idx_support_customer_created',
        'idx_support_status_priority',
        'idx_support_category_status',
        'idx_referral_customer_scheduled',
        'idx_referral_status_conversion',
        'idx_ticket_interactions_ticket_timestamp',
        'idx_call_negotiations_call_timestamp'
    ]
    
    with conn.cursor() as cursor:
        # Query to get existing indexes (Redshift specific)
        cursor.execute("""
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
        """)
        
        existing_indexes = [row[0] for row in cursor.fetchall()]
        
        logger.info(f"Found {len(existing_indexes)} performance indexes:")
        for index in existing_indexes:
            logger.info(f"  ✅ {index}")
        
        missing_indexes = set(expected_indexes) - set(existing_indexes)
        if missing_indexes:
            logger.warning(f"Missing indexes: {missing_indexes}")
            return False
        else:
            logger.info("✅ All expected indexes were created successfully!")
            return True

def main():
    """Main function to create all performance indexes."""
    logger.info("🚀 Starting performance index creation...")
    
    # Check configuration
    if not settings.is_configured:
        logger.error("❌ Database configuration incomplete. Please check your .env file.")
        return False
    
    logger.info(f"📊 Connecting to Redshift: {settings.REDSHIFT_HOST}:{settings.REDSHIFT_PORT}/{settings.REDSHIFT_DATABASE}")
    
    try:
        # Get connection
        conn = get_connection()
        logger.info("✅ Connected to Redshift successfully!")
        
        # Test queries before creating indexes
        before_results = test_queries_before_indexes(conn)
        
        # Create all indexes
        create_customers_indexes(conn)
        create_contracts_indexes(conn)
        create_analysis_indexes(conn)
        create_support_tickets_indexes(conn)
        create_additional_indexes(conn)
        
        # Commit all changes
        conn.commit()
        logger.info("✅ All indexes committed successfully!")
        
        # Verify indexes were created
        if not verify_indexes_created(conn):
            logger.error("❌ Some indexes were not created successfully")
            return False
        
        # Test queries after creating indexes
        test_queries_after_indexes(conn, before_results)
        
        conn.close()
        logger.info("🎉 Performance index creation completed successfully!")
        logger.info("💡 Expected improvements: 60-80% faster queries, better ORDER BY performance")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Index creation error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)