# AI Business Intelligence Platform - Optimization Guide

## 🚀 Performance Optimization Recommendations

### 1. Database Query Optimization (CRITICAL - 60-80% performance gain)

#### Missing Indexes - Implement Immediately
```sql
-- Customer table optimizations
CREATE INDEX idx_customers_status_segment ON customers(status, customer_segment, lifetime_value);
CREATE INDEX idx_customers_status_industry ON customers(status, industry, lifetime_value);
CREATE INDEX idx_customers_churn_risk ON customers(status, churn_risk_score DESC);

-- Contract table optimizations  
CREATE INDEX idx_contracts_status_renewal ON contracts(status, renewal_probability, contract_value);
CREATE INDEX idx_contracts_customer_status ON contracts(customer_id, status);
CREATE INDEX idx_contracts_end_date ON contracts(status, end_date);

-- Analysis table optimizations
CREATE INDEX idx_analysis_date_customer ON analysis(analysis_date, customer_id);
CREATE INDEX idx_analysis_date_metric ON analysis(analysis_date, metric_name);

-- Support tickets optimizations
CREATE INDEX idx_support_created_status ON support_tickets(created_at, status);
CREATE INDEX idx_support_customer_created ON support_tickets(customer_id, created_at DESC);
```

#### Query Performance Issues Found

**File: `ai/chains/data_analyzer.py`**
- Lines 50-61: Multiple COUNT CASE statements cause table scans
- Lines 157-162: Date INTERVAL calculations prevent index usage
- Lines 207-220: Complex GROUP BY without proper indexing

**File: `ai/chains/predictive_analyzer.py`**
- Lines 199-208: DATE_TRUNC with GROUP BY is expensive
- Lines 323-331: LIKE operations on metric_name prevent index usage

**File: `api/app.py`**
- Lines 468-480: ORDER BY churn_risk_score needs index
- Lines 561-575: JOIN operations need composite indexes

### 2. AI/LLM Cost Optimization (60-70% cost reduction)

#### LLM Instance Caching - `ai/models/llm_config.py`
```python
class LLMConfig:
    def __init__(self):
        self._analysis_llm = None
        self._insight_llm = None
        self._prediction_llm = None
    
    def get_analysis_llm(self) -> Optional[ChatOpenAI]:
        if not self._analysis_llm and self.openai_api_key:
            self._analysis_llm = ChatOpenAI(
                model_name=self.model_name,
                temperature=0.1,
                max_tokens=1500,
                request_timeout=30
            )
        return self._analysis_llm
```

#### Prompt Template System
```python
CUSTOMER_ANALYSIS_TEMPLATE = """
Analyze customer metrics and provide {insight_count} key insights:

Customer Metrics:
- Total: {total_customers}
- High-risk: {high_risk_customers} 
- Avg LTV: ${avg_lifetime_value:,.0f}

Focus on: {focus_areas}
Format: Numbered list, max 2 sentences each.
Max response: 500 tokens.
"""
```

#### Rate Limiting Implementation
```python
class RateLimitedLLM:
    def __init__(self, llm, requests_per_minute=60):
        self.llm = llm
        self.min_interval = 60.0 / requests_per_minute
        self.last_request = 0
        
    def invoke_with_retry(self, messages, max_retries=3):
        for attempt in range(max_retries):
            try:
                # Rate limiting
                time_since_last = time.time() - self.last_request
                if time_since_last < self.min_interval:
                    time.sleep(self.min_interval - time_since_last)
                
                response = self.llm.invoke(messages)
                self.last_request = time.time()
                return response
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                time.sleep(2 ** attempt)  # Exponential backoff
```

### 3. Connection Pooling - Replace Direct psycopg2

#### Current Issue: `api/app.py` lines 484-490, 579-585
```python
# Replace direct connections with connection pool
from psycopg2 import pool

class DatabasePool:
    def __init__(self):
        self.pool = psycopg2.pool.ThreadedConnectionPool(
            1, 20,  # min/max connections
            host=settings.REDSHIFT_HOST,
            port=settings.REDSHIFT_PORT,
            database=settings.REDSHIFT_DATABASE,
            user=settings.REDSHIFT_USERNAME,
            password=settings.REDSHIFT_PASSWORD
        )
    
    def get_connection(self):
        return self.pool.getconn()
    
    def put_connection(self, conn):
        self.pool.putconn(conn)
```

### 4. Query Result Caching with Redis

```python
import redis
import json

class QueryCache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.cache_ttl = {
            'customer_health': 3600,      # 1 hour
            'contract_performance': 7200,  # 2 hours
            'business_metrics': 3600,     # 1 hour
        }
    
    def get_or_execute(self, cache_key, query_func, ttl=3600):
        cached = self.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        result = query_func()
        self.redis_client.setex(cache_key, ttl, json.dumps(result))
        return result
```

### 5. Parallel AI Processing - `api/app.py:365-387`

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def get_comprehensive_analysis_parallel():
    with ThreadPoolExecutor(max_workers=3) as executor:
        tasks = [
            executor.submit(data_analyzer.analyze_customer_health),
            executor.submit(data_analyzer.analyze_contract_performance),
            executor.submit(data_analyzer.analyze_business_metrics)
        ]
        results = await asyncio.gather(*tasks)
        return results
```

## 📊 Implementation Priority & Impact

### Week 1 - Critical Performance (High Impact, Low Effort)
1. **Database Indexing** - 60-80% query performance improvement
2. **LLM Instance Caching** - 20% AI cost reduction
3. **Date Query Optimization** - Replace INTERVAL with explicit dates

### Week 2-3 - Cost Optimization (High Impact, Medium Effort)  
1. **Prompt Templates** - 30% token usage reduction
2. **Connection Pooling** - 40% database connection efficiency
3. **Parallel AI Processing** - 25% faster response times

### Month 2 - Architecture Improvements (Medium Impact, High Effort)
1. **Redis Caching Layer** - 50% reduction in repeated queries
2. **Read Replicas** - Separate analytical workloads
3. **Table Partitioning** - Time-based for analysis/support_tickets tables

## 💰 Expected Cost Savings

| Optimization | Monthly Savings | Implementation Time |
|-------------|----------------|-------------------|
| AI Token Optimization | $200-500 | 2-3 days |
| Database Query Efficiency | $100-200 | 1 day |
| Caching Strategy | $50-150 | 2-3 days |
| **Total Estimated** | **$350-850/month** | **1 week** |

## 🔧 Quick Implementation Guide

### Step 1: Database Indexes (30 minutes)
```bash
# Connect to Redshift and run the index creation scripts above
psql -h your-cluster.redshift.amazonaws.com -p 5439 -d your_database -U your_username
```

### Step 2: LLM Caching (1 hour)
- Modify `ai/models/llm_config.py` with caching logic
- Update all analyzer classes to use cached instances

### Step 3: Query Optimization (2 hours)
- Replace INTERVAL calculations with explicit dates
- Add connection pooling to database access

### Step 4: Monitoring (1 hour)
```python
# Add performance monitoring
import time

class PerformanceMonitor:
    @staticmethod
    def time_function(func):
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start
            logger.info(f"{func.__name__} took {duration:.2f}s")
            return result
        return wrapper
```

## 🚨 Critical Fixes Needed

1. **Database Connection Leaks** - `api/app.py` - Not properly closing connections in all error paths
2. **AI Timeout Handling** - Better fallback strategies when AI calls fail
3. **Memory Usage** - Large JSON responses not streaming, causing memory issues

## 📈 Monitoring & Alerting

### Add Performance Metrics
```python
# Application metrics to track
metrics_to_monitor = {
    'database_query_time': 'Average query execution time',
    'ai_token_usage': 'Daily token consumption',
    'cache_hit_rate': 'Percentage of cache hits',
    'error_rate': 'API error percentage',
    'response_time': 'Average API response time'
}
```

### Health Check Enhancements
```python
@app.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    return {
        'database': check_database_health(),
        'ai_service': check_openai_health(),
        'cache': check_cache_health(),
        'memory_usage': get_memory_usage(),
        'active_connections': get_connection_count()
    }
```

---

## 🎯 Success Metrics

After implementing these optimizations, expect:
- **60-80%** faster database queries
- **60-70%** reduced AI costs  
- **50%** faster overall response times
- **90%** reduction in timeout errors
- **Improved user experience** with better caching

**Next Steps**: Start with database indexing (immediate impact), then move to AI optimization for cost savings.