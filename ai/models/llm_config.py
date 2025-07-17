"""
LLM configuration and setup for AI analysis.
"""
import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from config.settings import settings

logger = logging.getLogger(__name__)

class LLMConfig:
    """Configuration for Language Models used in AI analysis with caching."""
    
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model_name = settings.OPENAI_MODEL
        
        # Cached LLM instances
        self._analysis_llm = None
        self._insight_llm = None
        self._prediction_llm = None
        
        if not self.openai_api_key:
            logger.warning("OpenAI API key not found. Some AI features may not work.")
        else:
            logger.info(f"LLM configuration initialized with model: {self.model_name}")
    
    def get_analysis_llm(self) -> Optional[ChatOpenAI]:
        """Get cached LLM instance configured for data analysis tasks."""
        if not self.openai_api_key:
            return None
        
        if self._analysis_llm is None:
            logger.info("Creating cached analysis LLM instance")
            self._analysis_llm = ChatOpenAI(
                model_name=self.model_name,
                temperature=0.1,  # Low temperature for consistent analysis
                max_tokens=1500,
                request_timeout=30
            )
        
        return self._analysis_llm
    
    def get_insight_llm(self) -> Optional[ChatOpenAI]:
        """Get cached LLM instance configured for generating insights."""
        if not self.openai_api_key:
            return None
        
        if self._insight_llm is None:
            logger.info("Creating cached insight LLM instance")
            self._insight_llm = ChatOpenAI(
                model_name=self.model_name,
                temperature=0.3,  # Slightly higher for creative insights
                max_tokens=1000,
                request_timeout=30
            )
        
        return self._insight_llm
    
    def get_prediction_llm(self) -> Optional[ChatOpenAI]:
        """Get cached LLM instance configured for predictive analysis."""
        if not self.openai_api_key:
            return None
        
        if self._prediction_llm is None:
            logger.info("Creating cached prediction LLM instance")
            self._prediction_llm = ChatOpenAI(
                model_name=self.model_name,
                temperature=0.0,  # Zero temperature for consistent predictions
                max_tokens=800,
                request_timeout=30
            )
        
        return self._prediction_llm
    
    def clear_cache(self):
        """Clear all cached LLM instances (useful for testing or configuration changes)."""
        logger.info("Clearing LLM cache")
        self._analysis_llm = None
        self._insight_llm = None
        self._prediction_llm = None
    
    def get_cache_status(self) -> dict:
        """Get the current cache status."""
        return {
            "analysis_llm_cached": self._analysis_llm is not None,
            "insight_llm_cached": self._insight_llm is not None,
            "prediction_llm_cached": self._prediction_llm is not None,
            "model_name": self.model_name,
            "api_key_configured": bool(self.openai_api_key)
        }

# Global LLM configuration instance
llm_config = LLMConfig() 