# AI Business Intelligence API

A comprehensive Flask API that exposes AI-powered business intelligence capabilities for customer analysis, contract performance, and predictive analytics.

## 🚀 Quick Start

### Installation
```bash
cd api
pip install -r requirements.txt
```

### Running the API
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 📋 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-01T04:52:55.123456",
  "version": "1.0.0",
  "ai_enabled": true
}
```

### Analysis Endpoints

#### Customer Health Analysis
```http
GET /api/v1/analysis/customer-health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_customers": 1000,
      "avg_lifetime_value": 48384.40,
      "avg_engagement": 0.547,
      "high_risk_customers": 90,
      "high_value_customers": 448,
      "segments": [...],
      "top_industries": [...]
    },
    "insights": [
      "Focus on high-risk customers (90) to reduce churn...",
      "Analyze engagement scores to identify customers..."
    ]
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Contract Performance Analysis
```http
GET /api/v1/analysis/contract-performance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_contracts": 352,
      "avg_contract_value": 54194.02,
      "total_contract_value": 19076295.59,
      "avg_renewal_probability": 0.665,
      "low_renewal_risk": 0,
      "high_renewal_confidence": 18,
      "expiring_soon": 41,
      "contract_types": [...]
    },
    "insights": [
      "Focus on professional services and consulting contracts...",
      "Implement targeted renewal campaigns..."
    ]
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Business Metrics Analysis
```http
GET /api/v1/analysis/business-metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "metrics": [...],
      "risks": [...]
    },
    "insights": [
      "Feature Usage, Growth Rate, and Revenue are showing positive trends...",
      "Adoption Rate and Reliability are showing decreasing trends..."
    ]
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Comprehensive Analysis
```http
GET /api/v1/analysis/comprehensive
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_health": {...},
    "contract_performance": {...},
    "business_metrics": {...},
    "summary": {
      "total_customers": 1000,
      "total_contracts": 352,
      "total_contract_value": 19076295.59,
      "high_risk_customers": 90,
      "avg_renewal_probability": 0.665
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

### Predictive Analytics Endpoints

#### Customer Churn Prediction
```http
GET /api/v1/predictions/churn
GET /api/v1/predictions/churn?customer_id=CUST_001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "high_risk_customers": [
        {
          "id": "CUST_001",
          "name": "Sarah Johnson",
          "company": "Santos-Lambert",
          "churn_risk": 0.905,
          "lifetime_value": 23655.46,
          "engagement": 0.128
        }
      ]
    },
    "predictions": {
      "risk_trend": "increasing",
      "top_risk_factors": ["low_engagement", "high_support_tickets"],
      "retention_programs": ["personalized_communication", "loyalty_programs"],
      "revenue_at_risk": 2500000,
      "priority_customers": ["CUST_001", "CUST_002"]
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Revenue Forecast
```http
GET /api/v1/predictions/revenue-forecast
GET /api/v1/predictions/revenue-forecast?months=6
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "historical_revenue": [...],
      "renewal_data": [...],
      "segment_data": [...]
    },
    "forecast": {
      "monthly_forecast": [
        {"month": "2025-08", "forecasted_revenue": 25000000},
        {"month": "2025-09", "forecasted_revenue": 26000000}
      ],
      "growth_rate": "2%",
      "key_factors": "High probability of contract renewals...",
      "confidence_level": "High",
      "risk_factors": "Economic instability, changes in customer behavior..."
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Customer Lifetime Value Prediction
```http
GET /api/v1/predictions/customer-ltv/CUST_001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "customer": {
        "name": "Sarah Johnson",
        "company": "Santos-Lambert",
        "current_ltv": 23655.46,
        "engagement": 0.128,
        "growth_potential": 0.750
      },
      "revenue_history": [...],
      "similar_customers": [...]
    },
    "prediction": {
      "ltv_12_months": 35000,
      "ltv_24_months": 45000,
      "growth_rate": "15%",
      "growth_drivers": ["increased_engagement", "upselling_opportunities"],
      "upselling_opportunities": ["premium_features", "additional_services"]
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

### Insights Management Endpoints

#### Update Customer Insights
```http
POST /api/v1/insights/update-customers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_count": 45,
    "status": "success"
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Update Contract Insights
```http
POST /api/v1/insights/update-contracts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_count": 23,
    "status": "success"
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Generate Daily Insights
```http
POST /api/v1/insights/daily
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Today's key business metrics include a total of 1000 customers...",
    "timestamp": "2025-07-01T04:54:41.410235",
    "status": "success"
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

### Data Access Endpoints

#### Get Customers
```http
GET /api/v1/customers
GET /api/v1/customers?limit=20&offset=0&segment=enterprise&status=active
```

**Query Parameters:**
- `limit` (int): Number of customers to return (default: 50)
- `offset` (int): Number of customers to skip (default: 0)
- `segment` (string): Filter by customer segment
- `status` (string): Filter by status (default: active)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": "CUST_001",
        "name": "Sarah Johnson",
        "company": "Santos-Lambert",
        "industry": "Technology",
        "segment": "enterprise",
        "lifetime_value": 23655.46,
        "engagement_score": 0.128,
        "churn_risk_score": 0.905,
        "support_tickets": 5,
        "ai_insights": "High churn risk due to low engagement...",
        "created_at": "2025-01-15T10:30:00"
      }
    ],
    "pagination": {
      "total": 1000,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

#### Get Contracts
```http
GET /api/v1/contracts
GET /api/v1/contracts?limit=20&offset=0&contract_type=Consulting&status=active
```

**Query Parameters:**
- `limit` (int): Number of contracts to return (default: 50)
- `offset` (int): Number of contracts to skip (default: 0)
- `contract_type` (string): Filter by contract type
- `status` (string): Filter by status (default: active)

**Response:**
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "contract_id": "CONT_001",
        "contract_type": "Consulting",
        "contract_value": 85000.00,
        "renewal_probability": 0.750,
        "performance_score": 0.850,
        "satisfaction_score": 0.900,
        "ai_analysis": "Strong performance with high renewal probability...",
        "start_date": "2025-01-01T00:00:00",
        "end_date": "2025-12-31T00:00:00",
        "customer_name": "Sarah Johnson",
        "customer_company": "Santos-Lambert"
      }
    ],
    "pagination": {
      "total": 352,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  },
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

## 🔧 Configuration

The API uses the same configuration as the main application. Ensure your `.env` file contains:

```env
# Redshift Configuration
REDSHIFT_HOST=your-redshift-cluster.redshift.amazonaws.com
REDSHIFT_PORT=5439
REDSHIFT_DATABASE=your_database
REDSHIFT_USERNAME=your_username
REDSHIFT_PASSWORD=your_password

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

## 🚀 Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 📊 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "timestamp": "2025-07-01T04:52:55.123456"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## 🔒 Security Considerations

- Enable CORS only for trusted domains in production
- Implement authentication and authorization
- Use HTTPS in production
- Rate limiting for API endpoints
- Input validation and sanitization

## 📈 Monitoring

The API includes comprehensive logging for:
- Request/response logging
- Error tracking
- Performance metrics
- AI analysis execution times

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include API documentation
4. Test all endpoints
5. Update requirements.txt if needed 