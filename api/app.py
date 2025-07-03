"""
Flask API for AI-driven Business Intelligence Platform.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
from datetime import datetime
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.chains.data_analyzer import data_analyzer
from ai.chains.predictive_analyzer import predictive_analyzer
from ai.processors.insight_processor import insight_processor
from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'ai_enabled': bool(settings.OPENAI_API_KEY)
    }), 200

@app.route('/api/v1/analysis/customer-health', methods=['GET'])
def get_customer_health():
    """Get customer health analysis."""
    try:
        logger.info("API: Customer health analysis requested")
        result = data_analyzer.analyze_customer_health()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in customer health analysis: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/analysis/contract-performance', methods=['GET'])
def get_contract_performance():
    """Get contract performance analysis."""
    try:
        logger.info("API: Contract performance analysis requested")
        result = data_analyzer.analyze_contract_performance()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in contract performance analysis: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/analysis/business-metrics', methods=['GET'])
def get_business_metrics():
    """Get business metrics analysis."""
    try:
        logger.info("API: Business metrics analysis requested")
        result = data_analyzer.analyze_business_metrics()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in business metrics analysis: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/predictions/churn', methods=['GET'])
def get_churn_prediction():
    """Get customer churn prediction."""
    try:
        customer_id = request.args.get('customer_id')
        logger.info(f"API: Churn prediction requested for customer: {customer_id or 'all'}")
        
        result = predictive_analyzer.predict_customer_churn(customer_id)
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"API Error in churn prediction: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/predictions/revenue-forecast', methods=['GET'])
def get_revenue_forecast():
    """Get revenue forecast prediction."""
    try:
        months = request.args.get('months', 12, type=int)
        logger.info(f"API: Revenue forecast requested for {months} months")
        
        result = predictive_analyzer.predict_revenue_forecast(months)
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"API Error in revenue forecast: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/predictions/customer-ltv/<customer_id>', methods=['GET'])
def get_customer_ltv(customer_id):
    """Get customer lifetime value prediction."""
    try:
        logger.info(f"API: Customer LTV prediction requested for: {customer_id}")
        
        result = predictive_analyzer.predict_customer_lifetime_value(customer_id)
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in customer LTV prediction: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/insights/update-customers', methods=['POST'])
def update_customer_insights():
    """Update AI insights for customers."""
    try:
        logger.info("API: Customer insights update requested")
        
        result = insight_processor.update_customer_insights()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in customer insights update: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/insights/update-contracts', methods=['POST'])
def update_contract_insights():
    """Update AI insights for contracts."""
    try:
        logger.info("API: Contract insights update requested")
        
        result = insight_processor.update_contract_insights()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in contract insights update: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/insights/daily', methods=['POST'])
def generate_daily_insights():
    """Generate daily business insights."""
    try:
        logger.info("API: Daily insights generation requested")
        
        result = insight_processor.generate_daily_insights()
        
        if "error" in result:
            return jsonify({
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in daily insights generation: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/analysis/comprehensive', methods=['GET'])
def get_comprehensive_analysis():
    """Get comprehensive analysis combining all metrics."""
    try:
        logger.info("API: Comprehensive analysis requested")
        
        # Get query parameter for AI insights (default to False to prevent timeouts)
        include_ai_insights = request.args.get('include_ai_insights', 'false').lower() == 'true'
        
        # Get all analyses with cross-platform timeout protection
        import threading
        import time
        
        # Global variables for timeout handling
        analysis_results = {}
        analysis_complete = threading.Event()
        
        def run_analysis():
            try:
                analysis_results['customer'] = data_analyzer.analyze_customer_health(include_ai_insights=include_ai_insights)
                analysis_results['contract'] = data_analyzer.analyze_contract_performance(include_ai_insights=include_ai_insights)
                analysis_results['business'] = data_analyzer.analyze_business_metrics(include_ai_insights=include_ai_insights)
                analysis_complete.set()
            except Exception as e:
                analysis_results['error'] = str(e)
                analysis_complete.set()
        
        # Start analysis in a separate thread
        analysis_thread = threading.Thread(target=run_analysis)
        analysis_thread.daemon = True
        analysis_thread.start()
        
        # Wait for completion with timeout (25 seconds)
        if not analysis_complete.wait(timeout=25):
            return jsonify({
                'error': 'Analysis timed out. Try again or use include_ai_insights=false parameter.',
                'timestamp': datetime.now().isoformat()
            }), 408
        
        # Check for analysis errors
        if 'error' in analysis_results:
            return jsonify({
                'error': analysis_results['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
        
        customer_analysis = analysis_results['customer']
        contract_analysis = analysis_results['contract']
        business_analysis = analysis_results['business']
        
        # Check for errors
        if "error" in customer_analysis or "error" in contract_analysis or "error" in business_analysis:
            errors = []
            if "error" in customer_analysis:
                errors.append(f"Customer analysis: {customer_analysis['error']}")
            if "error" in contract_analysis:
                errors.append(f"Contract analysis: {contract_analysis['error']}")
            if "error" in business_analysis:
                errors.append(f"Business analysis: {business_analysis['error']}")
            
            return jsonify({
                'error': '; '.join(errors),
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Combine results
        comprehensive_result = {
            'customer_health': customer_analysis,
            'contract_performance': contract_analysis,
            'business_metrics': business_analysis,
            'summary': {
                'total_customers': customer_analysis['metrics']['total_customers'],
                'total_contracts': contract_analysis['metrics']['total_contracts'],
                'total_contract_value': contract_analysis['metrics']['total_contract_value'],
                'high_risk_customers': customer_analysis['metrics']['high_risk_customers'],
                'avg_renewal_probability': contract_analysis['metrics']['avg_renewal_probability']
            },
            'ai_insights_enabled': include_ai_insights
        }
        
        return jsonify({
            'success': True,
            'data': comprehensive_result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except TimeoutError as e:
        logger.error(f"API Timeout in comprehensive analysis: {e}")
        return jsonify({
            'error': 'Analysis timed out. Try again or use include_ai_insights=false parameter.',
            'timestamp': datetime.now().isoformat()
        }), 408
    except Exception as e:
        logger.error(f"API Error in comprehensive analysis: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/customers', methods=['GET'])
def get_customers():
    """Get customer data with optional filtering."""
    try:
        import psycopg2
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        segment = request.args.get('segment')
        status = request.args.get('status', 'active')
        
        # Build query
        query = """
            SELECT customer_id, name, company, industry, customer_segment,
                   lifetime_value, engagement_score, churn_risk_score,
                   support_tickets_count, ai_insights, created_at
            FROM customers
            WHERE status = %s
        """
        params = [status]
        
        if segment:
            query += " AND customer_segment = %s"
            params.append(segment)
        
        query += " ORDER BY churn_risk_score DESC LIMIT %s OFFSET %s"
        params.extend([str(limit), str(offset)])
        
        # Execute query
        conn = psycopg2.connect(
            host=settings.REDSHIFT_HOST,
            port=settings.REDSHIFT_PORT,
            database=settings.REDSHIFT_DATABASE,
            user=settings.REDSHIFT_USERNAME,
            password=settings.REDSHIFT_PASSWORD
        )
        
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            customers = cursor.fetchall()
            
            # Get total count
            count_query = "SELECT COUNT(*) FROM customers WHERE status = %s"
            count_params = [status]
            if segment:
                count_query += " AND customer_segment = %s"
                count_params.append(segment)
            
            cursor.execute(count_query, count_params)
            result = cursor.fetchone()
            total_count = result[0] if result else 0
        
        conn.close()
        
        # Format results
        customer_list = []
        for customer in customers:
            customer_list.append({
                'customer_id': customer[0],
                'name': customer[1],
                'company': customer[2],
                'industry': customer[3],
                'segment': customer[4],
                'lifetime_value': float(customer[5]) if customer[5] else 0,
                'engagement_score': float(customer[6]) if customer[6] else 0,
                'churn_risk_score': float(customer[7]) if customer[7] else 0,
                'support_tickets': customer[8],
                'ai_insights': customer[9],
                'created_at': customer[10].isoformat() if customer[10] else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'customers': customer_list,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in get customers: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/v1/contracts', methods=['GET'])
def get_contracts():
    """Get contract data with optional filtering."""
    try:
        import psycopg2
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        contract_type = request.args.get('contract_type')
        status = request.args.get('status', 'active')
        
        # Build query
        query = """
            SELECT c.contract_id, c.contract_type, c.contract_value,
                   c.renewal_probability, c.performance_score, c.satisfaction_score,
                   c.ai_analysis, c.start_date, c.end_date,
                   cust.name, cust.company
            FROM contracts c
            JOIN customers cust ON c.customer_id = cust.customer_id
            WHERE c.status = %s
        """
        params = [status]
        
        if contract_type:
            query += " AND c.contract_type = %s"
            params.append(contract_type)
        
        query += " ORDER BY c.renewal_probability ASC LIMIT %s OFFSET %s"
        params.extend([str(limit), str(offset)])
        
        # Execute query
        conn = psycopg2.connect(
            host=settings.REDSHIFT_HOST,
            port=settings.REDSHIFT_PORT,
            database=settings.REDSHIFT_DATABASE,
            user=settings.REDSHIFT_USERNAME,
            password=settings.REDSHIFT_PASSWORD
        )
        
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            contracts = cursor.fetchall()
            
            # Get total count
            count_query = "SELECT COUNT(*) FROM contracts WHERE status = %s"
            count_params = [status]
            if contract_type:
                count_query += " AND contract_type = %s"
                count_params.append(contract_type)
            
            cursor.execute(count_query, count_params)
            result = cursor.fetchone()
            total_count = result[0] if result else 0
        
        conn.close()
        
        # Format results
        contract_list = []
        for contract in contracts:
            contract_list.append({
                'contract_id': contract[0],
                'contract_type': contract[1],
                'contract_value': float(contract[2]) if contract[2] else 0,
                'renewal_probability': float(contract[3]) if contract[3] else 0,
                'performance_score': float(contract[4]) if contract[4] else 0,
                'satisfaction_score': float(contract[5]) if contract[5] else 0,
                'ai_analysis': contract[6],
                'start_date': contract[7].isoformat() if contract[7] else None,
                'end_date': contract[8].isoformat() if contract[8] else None,
                'customer_name': contract[9],
                'customer_company': contract[10]
            })
        
        return jsonify({
            'success': True,
            'data': {
                'contracts': contract_list,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total_count
                }
            },
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"API Error in get contracts: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all exceptions."""
    logger.error(f"Unhandled exception: {e}")
    logger.error(traceback.format_exc())
    return jsonify({
        'error': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    logger.info("Starting Flask API server...")
    logger.info(f"OpenAI API Key configured: {'Yes' if settings.OPENAI_API_KEY else 'No'}")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    ) 