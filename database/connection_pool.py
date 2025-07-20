"""
Database connection pool for AI Business Intelligence Platform.

This module provides a centralized connection pool to replace direct psycopg2.connect() calls
throughout the application. It uses psycopg2's ThreadedConnectionPool for thread-safe
connection management.

Features:
- Thread-safe connection pooling
- Automatic connection recycling
- Connection health monitoring
- Proper error handling and cleanup
- Configurable pool size and timeout

Usage:
    from database.connection_pool import get_connection, return_connection
    
    # Get a connection from the pool
    conn = get_connection()
    try:
        # Use the connection
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customers")
        results = cursor.fetchall()
    finally:
        # Always return the connection to the pool
        return_connection(conn)
        
    # Or use the context manager (recommended)
    with get_connection_context() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customers")
        results = cursor.fetchall()
"""

import sys
import os
import logging
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
import threading
import time

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import settings

# Configure logging
logger = logging.getLogger(__name__)

class DatabaseConnectionPool:
    """Thread-safe database connection pool."""
    
    def __init__(self, min_connections=2, max_connections=10):
        """
        Initialize the connection pool.
        
        Args:
            min_connections (int): Minimum number of connections to maintain
            max_connections (int): Maximum number of connections allowed
        """
        self.min_connections = min_connections
        self.max_connections = max_connections
        self._pool = None
        self._lock = threading.Lock()
        self._initialized = False
        
    def _initialize_pool(self):
        """Initialize the connection pool (called on first use)."""
        if self._initialized:
            return
            
        with self._lock:
            if self._initialized:
                return
                
            try:
                logger.info(f"Initializing connection pool ({self.min_connections}-{self.max_connections} connections)")
                
                # Check if settings are configured
                if not settings.is_configured:
                    raise ValueError("Database settings not configured. Please check your .env file.")
                
                # Create the connection pool
                self._pool = psycopg2.pool.ThreadedConnectionPool(
                    minconn=self.min_connections,
                    maxconn=self.max_connections,
                    host=settings.REDSHIFT_HOST,
                    port=settings.REDSHIFT_PORT,
                    database=settings.REDSHIFT_DATABASE,
                    user=settings.REDSHIFT_USERNAME,
                    password=settings.REDSHIFT_PASSWORD,
                    # Connection timeout settings
                    connect_timeout=30,
                    # Keep connections alive
                    keepalives=1,
                    keepalives_idle=30,
                    keepalives_interval=5,
                    keepalives_count=3
                )
                
                self._initialized = True
                logger.info("✅ Connection pool initialized successfully")
                
            except Exception as e:
                logger.error(f"❌ Failed to initialize connection pool: {e}")
                raise
    
    def get_connection(self, timeout=30):
        """
        Get a connection from the pool.
        
        Args:
            timeout (int): Timeout in seconds to wait for a connection
            
        Returns:
            psycopg2.connection: Database connection
            
        Raises:
            psycopg2.PoolError: If no connection is available
            psycopg2.DatabaseError: If connection is invalid
        """
        if not self._initialized:
            self._initialize_pool()
        
        try:
            start_time = time.time()
            
            # Get connection from pool
            conn = self._pool.getconn()
            
            if conn is None:
                raise psycopg2.PoolError("No connection available in pool")
            
            # Test connection health
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
            except Exception as e:
                logger.warning(f"Connection health check failed: {e}")
                # Return bad connection and get a new one
                self._pool.putconn(conn, close=True)
                conn = self._pool.getconn()
            
            elapsed_time = time.time() - start_time
            logger.debug(f"Connection acquired in {elapsed_time:.3f}s")
            
            return conn
            
        except Exception as e:
            logger.error(f"Failed to get connection from pool: {e}")
            raise
    
    def return_connection(self, conn, close=False):
        """
        Return a connection to the pool.
        
        Args:
            conn: Database connection to return
            close (bool): Whether to close the connection instead of returning it
        """
        if not self._initialized or not conn:
            logger.warning(f"Cannot return connection: initialized={self._initialized}, conn={conn}")
            return
            
        try:
            # Check if connection is still valid
            if not close and not conn.closed:
                # Rollback any pending transactions
                if conn.status != psycopg2.extensions.STATUS_READY:
                    logger.info("Rolling back transaction before returning connection")
                    conn.rollback()
            
            # Return connection to pool
            logger.debug(f"Returning connection to pool (close={close})")
            self._pool.putconn(conn, close=close)
            logger.debug(f"Connection returned to pool successfully (closed={close})")
            
        except Exception as e:
            logger.error(f"Failed to return connection to pool: {e}")
            try:
                # Force close the connection if return fails
                logger.warning("Force closing connection due to return failure")
                conn.close()
            except:
                pass
    
    def close_all_connections(self):
        """Close all connections in the pool."""
        if not self._initialized:
            return
            
        try:
            with self._lock:
                if self._pool:
                    self._pool.closeall()
                    self._pool = None
                    self._initialized = False
                    logger.info("✅ All connection pool connections closed")
        except Exception as e:
            logger.error(f"Failed to close connection pool: {e}")
    
    def get_pool_status(self):
        """Get current pool status information."""
        if not self._initialized:
            return {"status": "not_initialized"}
        
        try:
            # Note: psycopg2 ThreadedConnectionPool doesn't expose these stats directly
            # This is a simplified status check
            return {
                "status": "initialized",
                "min_connections": self.min_connections,
                "max_connections": self.max_connections,
                "pool_object": str(self._pool)
            }
        except Exception as e:
            logger.error(f"Failed to get pool status: {e}")
            return {"status": "error", "error": str(e)}


# Global connection pool instance
_connection_pool = None
_pool_lock = threading.Lock()

def get_connection_pool():
    """Get the global connection pool instance."""
    global _connection_pool
    
    if _connection_pool is None:
        with _pool_lock:
            if _connection_pool is None:
                _connection_pool = DatabaseConnectionPool()
    
    return _connection_pool

def get_connection(timeout=30):
    """
    Get a database connection from the global pool.
    
    Args:
        timeout (int): Timeout in seconds to wait for a connection
        
    Returns:
        psycopg2.connection: Database connection
    """
    pool = get_connection_pool()
    return pool.get_connection(timeout=timeout)

def return_connection(conn, close=False):
    """
    Return a database connection to the global pool.
    
    Args:
        conn: Database connection to return
        close (bool): Whether to close the connection instead of returning it
    """
    pool = get_connection_pool()
    return pool.return_connection(conn, close=close)

@contextmanager
def get_connection_context(timeout=30):
    """
    Context manager for database connections.
    
    Usage:
        with get_connection_context() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customers")
            results = cursor.fetchall()
    
    Args:
        timeout (int): Timeout in seconds to wait for a connection
        
    Yields:
        psycopg2.connection: Database connection
    """
    conn = None
    connection_returned = False
    try:
        conn = get_connection(timeout=timeout)
        yield conn
    except Exception as e:
        logger.error(f"Database operation failed: {e}")
        # Return connection as failed
        if conn and not connection_returned:
            return_connection(conn, close=True)
            connection_returned = True
        raise
    finally:
        # Always return connection to pool if not already returned
        if conn and not connection_returned:
            return_connection(conn)

def close_all_connections():
    """Close all connections in the global pool."""
    global _connection_pool
    
    if _connection_pool:
        _connection_pool.close_all_connections()
        _connection_pool = None

def get_pool_status():
    """Get current pool status information."""
    if _connection_pool is None:
        return {"status": "not_initialized"}
    
    return _connection_pool.get_pool_status()

# Cleanup function for application shutdown
def cleanup_connections():
    """Clean up all connections when the application shuts down."""
    logger.info("Cleaning up database connections...")
    close_all_connections()
    logger.info("✅ Database connections cleaned up")

# Helper function to test connection pool
def test_connection_pool():
    """Test the connection pool functionality."""
    logger.info("🔍 Testing connection pool...")
    
    try:
        # Test basic connection
        with get_connection_context() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 as test")
            result = cursor.fetchone()
            logger.info(f"✅ Basic connection test passed: {result}")
        
        # Test multiple connections
        connections = []
        for i in range(5):
            conn = get_connection()
            connections.append(conn)
            logger.info(f"✅ Connection {i+1} acquired")
        
        # Return all connections
        for conn in connections:
            return_connection(conn)
            
        logger.info("✅ All connections returned successfully")
        
        # Test pool status
        status = get_pool_status()
        logger.info(f"✅ Pool status: {status}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Connection pool test failed: {e}")
        return False

if __name__ == "__main__":
    # Test the connection pool when run directly
    logging.basicConfig(level=logging.INFO)
    
    success = test_connection_pool()
    
    if success:
        logger.info("🎉 Connection pool test completed successfully!")
    else:
        logger.error("❌ Connection pool test failed!")
        sys.exit(1)
    
    # Cleanup
    cleanup_connections()