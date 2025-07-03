"""
Script to generate support tickets and referral calls sample data.
"""
import sys
import os
import logging

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.generators.support_referral_data import SupportReferralDataGenerator
from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main function to generate support and referral data."""
    logger.info("🚀 Starting support and referral data generation...")
    
    # Check configuration
    if not settings.is_configured:
        logger.error("❌ Database configuration incomplete. Please check your .env file.")
        return False
    
    generator = SupportReferralDataGenerator()
    
    try:
        # Generate support tickets
        logger.info("📋 Generating support tickets...")
        generator.generate_support_tickets(500)
        
        # Generate referral calls
        logger.info("📞 Generating referral calls...")
        generator.generate_referral_calls(200)
        
        logger.info("✅ Support and referral data generation completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error generating support and referral data: {e}")
        return False
    finally:
        generator.close_connection()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 