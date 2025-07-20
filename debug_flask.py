#!/usr/bin/env python3
"""
Debug Flask app to isolate the cursor issue.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from database import get_connection_context, cleanup_connections
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

@app.route('/debug')
def debug_endpoint():
    """Debug endpoint to test cursor behavior."""
    try:
        logger.info("Debug endpoint called")
        
        # Test the exact pattern from working minimal app
        with get_connection_context() as conn:
            logger.info("Got connection from pool")
            cursor = conn.cursor()
            logger.info("Created cursor")
            try:
                cursor.execute("SELECT customer_id FROM customers LIMIT 1")
                logger.info("Executed query")
                result = cursor.fetchone()
                logger.info(f"Fetched result: {result}")
                
                return f"Success: {result[0] if result else 'No result'}"
                
            except Exception as db_e:
                logger.error(f"Database error: {db_e}")
                return f"DB Error: {str(db_e)}"
            finally:
                logger.info("Closing cursor")
                cursor.close()
                logger.info("Cursor closed")
                
    except Exception as e:
        logger.error(f"Endpoint error: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return f"Error: {str(e)}"

if __name__ == '__main__':
    logger.info("Starting debug Flask server...")
    try:
        app.run(host='0.0.0.0', port=5002, debug=False, threaded=False)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        cleanup_connections()
        logger.info("Cleaned up connections")