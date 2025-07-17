"""
Database package for AI Business Intelligence Platform.

This package provides centralized database connectivity and connection pooling
to replace direct psycopg2.connect() calls throughout the application.
"""

from .connection_pool import (
    get_connection,
    return_connection,
    get_connection_context,
    get_pool_status,
    close_all_connections,
    cleanup_connections
)

__all__ = [
    'get_connection',
    'return_connection', 
    'get_connection_context',
    'get_pool_status',
    'close_all_connections',
    'cleanup_connections'
]