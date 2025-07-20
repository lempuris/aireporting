"""
Application settings and configuration management.
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings loaded from environment variables."""
    
    # Redshift Configuration
    REDSHIFT_HOST: str = os.getenv("REDSHIFT_HOST", "localhost")
    REDSHIFT_PORT: int = int(os.getenv("REDSHIFT_PORT", "5439"))
    REDSHIFT_DATABASE: str = os.getenv("REDSHIFT_DATABASE", os.getenv("REDSHIFT_DB", "ai_reporting"))
    REDSHIFT_USERNAME: str = os.getenv("REDSHIFT_USERNAME", os.getenv("REDSHIFT_USER", "admin"))
    REDSHIFT_PASSWORD: str = os.getenv("REDSHIFT_PASSWORD", "password")
    
    # Legacy property names for backward compatibility
    DATABASE_HOST = REDSHIFT_HOST
    DATABASE_PORT = REDSHIFT_PORT
    DATABASE_NAME = REDSHIFT_DATABASE
    DATABASE_USER = REDSHIFT_USERNAME
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    
    # Application Configuration
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Sample Data Configuration
    SAMPLE_CUSTOMERS_COUNT: int = int(os.getenv("SAMPLE_CUSTOMERS_COUNT", "1000"))
    SAMPLE_CONTRACTS_COUNT: int = int(os.getenv("SAMPLE_CONTRACTS_COUNT", "500"))
    SAMPLE_ANALYSIS_COUNT: int = int(os.getenv("SAMPLE_ANALYSIS_COUNT", "2000"))
    
    @property
    def redshift_connection_string(self) -> str:
        """Generate Redshift connection string."""
        return f"postgresql://{self.REDSHIFT_USERNAME}:{self.REDSHIFT_PASSWORD}@{self.REDSHIFT_HOST}:{self.REDSHIFT_PORT}/{self.REDSHIFT_DATABASE}"
    
    @property
    def is_configured(self) -> bool:
        """Check if all required settings are configured."""
        required_settings = [
            self.REDSHIFT_HOST,
            self.REDSHIFT_DATABASE,
            self.REDSHIFT_USERNAME,
            self.REDSHIFT_PASSWORD
        ]
        return all(required_settings)

# Global settings instance
settings = Settings() 