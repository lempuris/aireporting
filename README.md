# AI-Driven Business Intelligence Platform

A comprehensive AI-powered reporting solution using Python, LangChain, and Amazon Redshift for intelligent business analytics and insights.

## 🏗️ Architecture Overview

```
Data Sources → ETL Pipeline → Redshift Database → AI Processing → Reporting Dashboard
```

### Components:
- **Data Ingestion**: ETL pipelines for customer records, contracts, and analysis data
- **Data Storage**: Amazon Redshift for centralized data warehouse
- **AI Processing**: LangChain for data enrichment and analysis
- **Reporting**: Interactive Dash dashboard with ML-powered insights
- **Sample Data**: Faker-generated realistic data for testing

## 🚀 Features

### Core Components
- **Data Management**: SQLAlchemy models for customers, contracts, and analysis data
- **Sample Data Generation**: Realistic business data with Faker
- **AI Analysis**: LangChain-powered intelligent insights and predictions
- **Predictive Analytics**: Customer churn prediction and revenue forecasting
- **Automated Insights**: Daily business summaries and automated insight generation

### AI Capabilities
- **Customer Health Analysis**: Engagement scoring, churn risk assessment
- **Contract Performance**: Renewal probability, performance tracking
- **Business Metrics**: Trend analysis, risk assessment
- **Predictive Modeling**: Revenue forecasting, customer lifetime value prediction
- **Automated Insights**: Daily summaries and proactive recommendations

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration
Create a `.env` file with your credentials:
```env
# Redshift Configuration
REDSHIFT_HOST=your-redshift-cluster.redshift.amazonaws.com
REDSHIFT_PORT=5439
REDSHIFT_DATABASE=your_database
REDSHIFT_USERNAME=your_username
REDSHIFT_PASSWORD=your_password

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# AWS Configuration (for Redshift access)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### 3. Database Setup
```bash
# Setup database tables
python scripts/setup_database_direct.py

# Generate and load sample data
python scripts/generate_sample_data_direct.py
```

### 4. Run the Application
```bash
python app.py
```

## 📁 Project Structure

```
Ted/
├── config/                 # Configuration and database setup
├── data/                   # Data models and generators
├── ai/                     # AI analysis components
│   ├── models/            # LLM configuration
│   ├── chains/            # Analysis chains
│   └── processors/        # Insight processors
├── scripts/               # Setup and utility scripts
└── requirements.txt       # Python dependencies
```

## 🤖 AI Analysis Usage

### Basic Analysis
```python
from ai.chains.data_analyzer import data_analyzer

# Analyze customer health
customer_analysis = data_analyzer.analyze_customer_health()
print(customer_analysis['insights'])

# Analyze contract performance
contract_analysis = data_analyzer.analyze_contract_performance()
print(contract_analysis['metrics'])

# Analyze business metrics
business_analysis = data_analyzer.analyze_business_metrics()
print(business_analysis['insights'])
```

### Predictive Analytics
```python
from ai.chains.predictive_analyzer import predictive_analyzer

# Predict customer churn
churn_prediction = predictive_analyzer.predict_customer_churn()
print(churn_prediction['predictions'])

# Revenue forecasting
revenue_forecast = predictive_analyzer.predict_revenue_forecast(months=12)
print(revenue_forecast['forecast'])

# Customer lifetime value prediction
ltv_prediction = predictive_analyzer.predict_customer_lifetime_value("CUST_001")
print(ltv_prediction['prediction'])
```

### Automated Insights
```python
from ai.processors.insight_processor import insight_processor

# Update customer insights
result = insight_processor.update_customer_insights()
print(f"Updated {result['updated_count']} customers")

# Generate daily insights
daily_summary = insight_processor.generate_daily_insights()
print(daily_summary['summary'])
```

## 🧪 Testing

Run the comprehensive AI analysis test suite:

```bash
python scripts/test_ai_analysis.py
```

This will test:
- Customer health analysis
- Contract performance analysis
- Business metrics analysis
- Churn prediction
- Revenue forecasting
- Insight processing

## 📊 Sample Data

The platform includes realistic sample data:
- **1,000 customers** with engagement scores, churn risk, and lifetime values
- **500 contracts** with renewal probabilities and performance metrics
- **2,000 analysis records** with business metrics and AI-generated insights

## 🔧 Configuration

### LLM Configuration
The AI system uses different LLM configurations for different tasks:

- **Analysis LLM**: Low temperature (0.1) for consistent data analysis
- **Insight LLM**: Medium temperature (0.3) for creative insights
- **Prediction LLM**: Zero temperature (0.0) for consistent predictions

### Database Schema
The system includes three main tables:
- `customers`: Customer information with AI insights
- `contracts`: Contract data with performance metrics
- `analysis`: Business metrics and analysis records

## 🚀 Next Steps

1. **Interactive Dashboard**: Build a Dash-based dashboard for visualization
2. **Advanced Analytics**: Implement customer segmentation and anomaly detection
3. **Real-time Processing**: Add streaming data processing capabilities
4. **API Integration**: Create REST API endpoints for external access
5. **Scheduling**: Add automated daily/weekly analysis scheduling

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 🎯 Learning Objectives

This project demonstrates:
1. **Data Engineering**: ETL pipelines, data modeling, warehouse design
2. **AI Integration**: LangChain workflows, ML model deployment
3. **Database Management**: Redshift optimization, query performance
4. **Web Development**: Dash applications, real-time dashboards
5. **DevOps**: Environment management, deployment strategies

## 🔍 Key Concepts Explained

### LangChain
- **Chains**: Sequential processing of data through multiple steps
- **Agents**: Autonomous decision-making for data analysis
- **Memory**: Context preservation across processing sessions
- **Tools**: Reusable components for specific tasks

### Redshift
- **Columnar Storage**: Optimized for analytical queries
- **Distribution Keys**: Data distribution across nodes
- **Sort Keys**: Query performance optimization
- **Workload Management**: Resource allocation and prioritization

### AI-Driven Analytics
- **Feature Engineering**: Creating meaningful data attributes
- **Model Training**: Supervised and unsupervised learning
- **Inference**: Real-time predictions and insights
- **Model Monitoring**: Performance tracking and drift detection

## 🛠️ Development Workflow

1. **Local Development**: Use sample data for testing
2. **Staging Environment**: Test with production-like data
3. **Production Deployment**: AWS infrastructure setup
4. **Monitoring**: Performance and error tracking
5. **Iteration**: Continuous improvement based on usage

## 📈 Next Steps

- Add more data sources and connectors
- Implement advanced ML models
- Create mobile application
- Add real-time streaming capabilities
- Implement advanced security features

## 🤝 Contributing

This is a learning project. Feel free to:
- Add new features and data sources
- Improve the AI models and chains
- Enhance the dashboard and visualizations
- Optimize database performance
- Add tests and documentation

## 📚 Resources

- [LangChain Documentation](https://python.langchain.com/)
- [Amazon Redshift Documentation](https://docs.aws.amazon.com/redshift/)
- [Dash Documentation](https://dash.plotly.com/)
- [Pandas Documentation](https://pandas.pydata.org/) 