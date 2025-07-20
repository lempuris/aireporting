#!/usr/bin/env python3
"""
Minimal Flask app to test database connections.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from datetime import datetime
from database import get_connection_context, cleanup_connections

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    # Test database connection
    db_status = "healthy"
    try:
        with get_connection_context() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            finally:
                cursor.close()
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = f"unhealthy: {str(e)}"
    
    return jsonify({
        'status': 'healthy' if db_status == "healthy" else 'degraded',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'database_status': db_status
    }), 200

@app.route('/api/v1/customers', methods=['GET'])
def get_customers():
    """Get customer data."""
    try:
        limit = request.args.get('limit', 10, type=int)
        logger.info(f"Customers endpoint called with limit={limit}")
        
        with get_connection_context() as conn:
            cursor = conn.cursor()
            try:
                logger.info("Executing customers query...")
                cursor.execute("SELECT customer_id, name, company FROM customers WHERE status = %s ORDER BY customer_id LIMIT %s", ['active', str(limit)])
                customers = cursor.fetchall()
                logger.info(f"Query executed successfully, found {len(customers)} customers")
                
            except Exception as db_e:
                logger.error(f"Database query error: {db_e}")
                raise
            finally:
                cursor.close()
                logger.info("Cursor closed successfully")
        
        # Format results
        customer_list = []
        for customer in customers:
            customer_list.append({
                'customer_id': customer[0],
                'name': customer[1],
                'company': customer[2]
            })
        
        logger.info(f"Returning {len(customer_list)} customers")
        return jsonify({
            'success': True,
            'count': len(customer_list),
            'data': customer_list,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in get customers: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/contracts', methods=['GET'])
def get_contracts():
    """Get contract data."""
    try:
        limit = request.args.get('limit', 10, type=int)
        logger.info(f"Contracts endpoint called with limit={limit}")
        
        with get_connection_context() as conn:
            cursor = conn.cursor()
            try:
                logger.info("Executing contracts query...")
                cursor.execute("SELECT contract_id, contract_type, contract_value FROM contracts WHERE status = %s ORDER BY contract_id LIMIT %s", ['active', str(limit)])
                contracts = cursor.fetchall()
                logger.info(f"Query executed successfully, found {len(contracts)} contracts")
                
            except Exception as db_e:
                logger.error(f"Database query error: {db_e}")
                raise
            finally:
                cursor.close()
                logger.info("Cursor closed successfully")
        
        # Format results
        contract_list = []
        for contract in contracts:
            contract_list.append({
                'contract_id': contract[0],
                'contract_type': contract[1],
                'contract_value': float(contract[2]) if contract[2] else 0
            })
        
        logger.info(f"Returning {len(contract_list)} contracts")
        return jsonify({
            'success': True,
            'count': len(contract_list),
            'data': contract_list,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in get contracts: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Placeholder endpoints for frontend compatibility
@app.route('/api/v1/analysis/customer-health', methods=['GET'])
def get_customer_health_stub():
    """Placeholder for customer health analysis."""
    return jsonify({
        'success': True,
        'data': {
            'metrics': {
                'total_customers': 2000,
                'avg_engagement': 0.546,
                'high_risk_customers': 183
            },
            'insights': ['Analysis endpoints temporarily unavailable - using data endpoints only']
        },
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/v1/analysis/contract-performance', methods=['GET'])
def get_contract_performance_stub():
    """Placeholder for contract performance analysis."""
    return jsonify({
        'success': True,
        'data': {
            'metrics': {
                'total_contracts': 694,
                'avg_renewal_probability': 0.663,
                'total_contract_value': 37163051.08
            },
            'insights': ['Analysis endpoints temporarily unavailable - using data endpoints only']
        },
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/v1/analysis/comprehensive', methods=['GET'])
def get_comprehensive_analysis_stub():
    """Placeholder for comprehensive analysis."""
    return jsonify({
        'success': True,
        'data': {
            'customer_health': {'metrics': {'total_customers': 2000}},
            'contract_performance': {'metrics': {'total_contracts': 694}},
            'business_metrics': {'metrics': {'revenue': 37163051.08}},
            'summary': {
                'total_customers': 2000,
                'total_contracts': 694,
                'total_contract_value': 37163051.08
            },
            'ai_insights_enabled': False
        },
        'timestamp': datetime.now().isoformat()
    }), 200

# Error handler for missing endpoints
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found - this is the minimal server with limited endpoints',
        'available_endpoints': ['/health', '/api/v1/customers', '/api/v1/contracts'],
        'timestamp': datetime.now().isoformat()
    }), 404

if __name__ == '__main__':
    logger.info("Starting minimal Flask API server...")
    
    try:
        app.run(
            host='0.0.0.0',
            port=5001,
            debug=False,
            threaded=False  # Disable threading to avoid concurrency issues
        )
    except KeyboardInterrupt:
        logger.info("Shutting down Flask API server...")
    finally:
        # Clean up database connections
        cleanup_connections()
        logger.info("Database connections cleaned up")