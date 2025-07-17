# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Python/Flask)
- **Install dependencies**: `pip install -r requirements.txt`
- **Run API server**: `python api/app.py` (runs on port 5000)
- **Database setup**: `python scripts/setup_database_direct.py`
- **Generate sample data**: `python scripts/generate_sample_data_direct.py`
- **Generate support/referral data**: `python scripts/generate_support_referral_data.py`
- **Test AI analysis**: `python scripts/test_ai_analysis.py`

### Frontend (React)
- **Navigate to frontend**: `cd frontend`
- **Install dependencies**: `npm install`
- **Start development server**: `npm start` (runs on port 3000)
- **Build for production**: `npm run build`
- **Run tests**: `npm test`

## Architecture Overview

This is an AI-driven Business Intelligence Platform with a microservices architecture:

### Backend Components
- **Flask API** (`api/app.py`): REST API server providing analytics endpoints
- **AI Analysis Engine** (`ai/`): LangChain-based AI processing modules
  - `chains/data_analyzer.py`: Customer health, contract performance, business metrics analysis
  - `chains/predictive_analyzer.py`: Churn prediction, revenue forecasting, LTV calculation
  - `chains/support_referral_analyzer.py`: Support ticket and referral call analysis
  - `processors/insight_processor.py`: AI insight generation and updates
- **Configuration** (`config/settings.py`): Environment-based settings management
- **Data Generation** (`data/generators/`): Faker-based sample data creation

### Frontend Components
- **React SPA** (`frontend/src/`): Modern React application with routing
- **Pages**: Dashboard, Analytics (Customer, Contract, Predictive, Support, Referral), Data Explorer
- **Components**: Metric cards, insight cards, sidebar navigation, cache manager
- **Services**: API client (`api.js`), caching layer (`cache.js`, `cachedApi.js`)
- **Styling**: Tailwind CSS with custom components

### Database
- **Amazon Redshift**: Data warehouse for customers, contracts, analysis records
- **Tables**: `customers`, `contracts`, `analysis` with AI-generated insights
- **Connection**: PostgreSQL driver for Redshift connectivity

## Environment Configuration

Create `.env` file with:
```env
# Redshift Configuration
REDSHIFT_HOST=your-cluster.redshift.amazonaws.com
REDSHIFT_PORT=5439
REDSHIFT_DATABASE=your_database
REDSHIFT_USERNAME=your_username
REDSHIFT_PASSWORD=your_password

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## LLM Configuration

The AI system uses different LLM configurations:
- **Analysis LLM**: Temperature 0.1 for consistent data analysis
- **Insight LLM**: Temperature 0.3 for creative insights
- **Prediction LLM**: Temperature 0.0 for consistent predictions

## API Endpoints

### Analysis Endpoints
- `GET /api/v1/analysis/customer-health`: Customer engagement and churn analysis
- `GET /api/v1/analysis/contract-performance`: Contract renewal and performance metrics
- `GET /api/v1/analysis/business-metrics`: Overall business trend analysis
- `GET /api/v1/analysis/support-tickets`: Support ticket analysis
- `GET /api/v1/analysis/referral-calls`: Referral call analysis
- `GET /api/v1/analysis/comprehensive`: Combined analysis (use `include_ai_insights=false` for faster response)

### Prediction Endpoints
- `GET /api/v1/predictions/churn?customer_id=CUST_001`: Customer churn prediction
- `GET /api/v1/predictions/revenue-forecast?months=12`: Revenue forecasting
- `GET /api/v1/predictions/customer-ltv/{customer_id}`: Customer lifetime value

### Data Endpoints
- `GET /api/v1/customers`: Customer data with filtering and pagination
- `GET /api/v1/contracts`: Contract data with filtering and pagination

## Development Workflow

1. **Backend Development**: Start with `python api/app.py` for API server
2. **Frontend Development**: Run `npm start` in frontend directory for hot reload
3. **Database Setup**: Run setup and data generation scripts before first use
4. **AI Testing**: Use `scripts/test_ai_analysis.py` to validate AI functionality

## Key Files to Understand

- `api/app.py`: Main Flask application with all API routes
- `ai/chains/data_analyzer.py`: Core data analysis logic
- `frontend/src/services/api.js`: Frontend API client
- `config/settings.py`: Configuration management
- `requirements.txt` & `frontend/package.json`: Dependencies

## Frontend Caching

The frontend implements a sophisticated caching system:
- **Cache Layer** (`services/cache.js`): TTL-based in-memory caching
- **Cached API** (`services/cachedApi.js`): Automatic cache wrapping for API calls
- **Cache Manager** (`components/CacheManager.js`): UI for cache management
- **useCache Hook** (`hooks/useCache.js`): React hook for cached data

## Sample Data

The platform includes realistic sample data generation:
- 1,000 customers with engagement scores and churn risk
- 500 contracts with renewal probabilities
- 2,000 analysis records with AI insights
- Support tickets and referral call data for journey analysis

## Performance Considerations

- Use `include_ai_insights=false` parameter for faster API responses during development
- Frontend caching reduces API calls and improves user experience
- Database queries are optimized with proper indexing on key fields
- AI analysis includes timeout protection (25 seconds) to prevent hanging requests