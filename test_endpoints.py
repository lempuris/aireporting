#!/usr/bin/env python3
"""
Simple test script to test database endpoints without Flask complications.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_connection_context, cleanup_connections
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_customers_query():
    """Test customers query directly."""
    try:
        logger.info("Testing customers query...")
        with get_connection_context() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT customer_id, name, company FROM customers WHERE status = %s ORDER BY customer_id LIMIT %s", ['active', '5'])
                customers = cursor.fetchall()
                logger.info(f"Found {len(customers)} customers")
                
                cursor.execute("SELECT COUNT(*) FROM customers WHERE status = %s", ['active'])
                result = cursor.fetchone()
                total_count = result[0] if result else 0
                logger.info(f"Total customers: {total_count}")
                
                return {
                    'success': True,
                    'customers': customers,
                    'total': total_count
                }
            finally:
                cursor.close()
                
    except Exception as e:
        logger.error(f"Customers query failed: {e}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}

def test_contracts_query():
    """Test contracts query directly."""
    try:
        logger.info("Testing contracts query...")
        with get_connection_context() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT contract_id, contract_type, contract_value FROM contracts WHERE status = %s ORDER BY contract_id LIMIT %s", ['active', '5'])
                contracts = cursor.fetchall()
                logger.info(f"Found {len(contracts)} contracts")
                
                cursor.execute("SELECT COUNT(*) FROM contracts WHERE status = %s", ['active'])
                result = cursor.fetchone()
                total_count = result[0] if result else 0
                logger.info(f"Total contracts: {total_count}")
                
                return {
                    'success': True,
                    'contracts': contracts,
                    'total': total_count
                }
            finally:
                cursor.close()
                
    except Exception as e:
        logger.error(f"Contracts query failed: {e}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}

if __name__ == "__main__":
    print("Testing database queries directly...")
    
    # Clean up any existing connections
    cleanup_connections()
    
    # Test customers
    print("\nTesting customers query...")
    customers_result = test_customers_query()
    if 'error' in customers_result:
        print(f"Customers query failed: {customers_result['error']}")
    else:
        print(f"Customers query successful: {customers_result['total']} customers total")
    
    # Test contracts
    print("\nTesting contracts query...")
    contracts_result = test_contracts_query()
    if 'error' in contracts_result:
        print(f"Contracts query failed: {contracts_result['error']}")
    else:
        print(f"Contracts query successful: {contracts_result['total']} contracts total")
    
    # Clean up
    cleanup_connections()
    print("\nTests completed!")