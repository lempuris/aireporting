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
    """Configuration for Language Models used in AI analysis."""
    
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model_name = settings.OPENAI_MODEL
        
        if not self.openai_api_key:
            logger.warning("OpenAI API key not found. Some AI features may not work.")
            self.llm = None
        else:
            self.llm = ChatOpenAI(
                model_name=self.model_name,
                temperature=0.1,  # Low temperature for consistent analysis
                max_tokens=2000
            )
            logger.info(f"LLM initialized with model: {self.model_name}")
    
    def get_analysis_llm(self) -> Optional[ChatOpenAI]:
        """Get LLM configured for data analysis tasks."""
        if not self.llm:
            return None
        
        return ChatOpenAI(
            model_name=self.model_name,
            temperature=0.1,
            max_tokens=1500
        )
    
    def get_insight_llm(self) -> Optional[ChatOpenAI]:
        """Get LLM configured for generating insights."""
        if not self.llm:
            return None
        
        return ChatOpenAI(
            model_name=self.model_name,
            temperature=0.3,  # Slightly higher for creative insights
            max_tokens=1000
        )
    
    def get_prediction_llm(self) -> Optional[ChatOpenAI]:
        """Get LLM configured for predictive analysis."""
        if not self.llm:
            return None
        
        return ChatOpenAI(
            model_name=self.model_name,
            temperature=0.0,  # Zero temperature for consistent predictions
            max_tokens=800
        )

# Global LLM configuration instance
llm_config = LLMConfig() 