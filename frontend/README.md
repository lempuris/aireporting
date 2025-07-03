# AI Business Intelligence Frontend

A beautiful, modern React dashboard for the AI Business Intelligence platform. This frontend provides an intuitive interface to consume and visualize all API endpoints with real-time analytics, AI-generated insights, and interactive data exploration.

## 🚀 Features

### 📊 Dashboard
- **Overview Metrics**: Key performance indicators with real-time updates
- **Interactive Charts**: Customer segments, contract performance, and business trends
- **AI Insights**: Automatically generated business insights and recommendations
- **Quick Actions**: Easy navigation to detailed analysis pages

### 👥 Customer Analysis
- **Customer Health Metrics**: Engagement scores, lifetime value, and churn risk
- **Segmentation Analysis**: Visual breakdown by customer segments and industries
- **Search & Filter**: Advanced filtering by segment, industry, and engagement levels
- **Risk Assessment**: High-risk customer identification and alerts

### 📄 Contract Analysis
- **Contract Performance**: Renewal rates, contract values, and status tracking
- **Type Distribution**: Visual analysis of contract types and their performance
- **Value Optimization**: Insights into contract value trends and opportunities
- **Renewal Forecasting**: Predictive analytics for contract renewals

### 🔮 Predictive Analytics
- **Churn Prediction**: AI-powered customer churn risk assessment
- **Revenue Forecasting**: Multi-month revenue projections with trend analysis
- **Customer LTV**: Lifetime value predictions and growth analysis
- **Risk Segmentation**: High, medium, and low-risk customer categorization

### 📈 Data Explorer
- **Raw Data Access**: Direct access to customer and contract data
- **Advanced Filtering**: Filter by type, status, segment, and custom criteria
- **Export Capabilities**: CSV export for further analysis
- **Real-time Search**: Instant search across all data fields

### 💡 AI Insights
- **Automated Insights**: AI-generated business insights and recommendations
- **Priority Management**: High, medium, and low priority insight categorization
- **Type Filtering**: Filter insights by customer, contract, and trend categories
- **Generation Controls**: Manual insight generation and refresh capabilities

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Beautiful, responsive charts and data visualization
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Elegant toast notifications
- **Lucide React**: Beautiful, customizable icons

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- The Flask API server running on `http://localhost:5000`

### Setup Instructions

#### 1. Start the Flask API Server

First, ensure your Flask API server is running:

1. **Navigate to the project root directory**:
   ```bash
   cd /path/to/your/project
   ```

2. **Install Python dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask API server**:
   ```bash
   python api/app.py
   ```

4. **Verify the API is running** by visiting `http://localhost:5000/health`

The API server should show:
```
INFO:__main__:🚀 Starting Flask API server...
INFO:__main__:OpenAI API Key configured: ✅
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.2:5000
```

#### 2. Start the React Frontend

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

#### 3. Verify Both Services Are Running

- **API Server**: `http://localhost:5000` (Flask backend)
- **Frontend**: `http://localhost:3000` (React frontend)

You should see the beautiful AI Business Intelligence dashboard with real-time data from your API!

## 🔧 Configuration

### API Configuration
The frontend is configured to connect to the Flask API server. The API base URL can be configured in `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Environment Variables
Create a `.env` file in the frontend directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard with sidebar navigation
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Mobile-first design with touch-friendly interactions

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Success**: Green (#10B981) - Positive metrics and actions
- **Warning**: Orange (#F59E0B) - Medium priority alerts
- **Danger**: Red (#EF4444) - High priority alerts and errors
- **Secondary**: Gray (#64748B) - Supporting text and elements

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across device sizes

### Components
- **Cards**: Consistent card design with subtle shadows and borders
- **Buttons**: Primary and secondary button styles with hover states
- **Metrics**: Large, prominent metric displays with trend indicators
- **Charts**: Interactive charts with consistent color schemes
- **Insights**: Color-coded insight cards with priority indicators

## 🔄 API Integration

The frontend integrates with all Flask API endpoints:

### Analysis Endpoints
- `GET /api/v1/analysis/customer-health` - Customer health analysis
- `GET /api/v1/analysis/contract-performance` - Contract performance metrics
- `GET /api/v1/analysis/business-metrics` - Business metrics overview
- `GET /api/v1/analysis/comprehensive` - Comprehensive analysis

### Predictive Analytics
- `GET /api/v1/predictions/churn` - Churn prediction analysis
- `GET /api/v1/predictions/revenue-forecast` - Revenue forecasting
- `GET /api/v1/predictions/customer-ltv/{id}` - Customer LTV analysis

### Insights Management
- `POST /api/v1/insights/daily` - Generate daily insights
- `POST /api/v1/insights/update-customers` - Update customer insights
- `POST /api/v1/insights/update-contracts` - Update contract insights

### Data Access
- `GET /api/v1/customers` - Customer data with filtering
- `GET /api/v1/contracts` - Contract data with filtering

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Serve Production Build
```bash
npx serve -s build
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

## 🔍 Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Project Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── App.js             # Main app component
│   └── index.js           # App entry point
├── package.json           # Dependencies and scripts
└── tailwind.config.js     # Tailwind configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues

#### API Connection Issues
- **Error**: "Failed to load data" or "Network Error"
- **Solution**: Ensure the Flask API server is running on `http://localhost:5000`
- **Check**: Visit `http://localhost:5000/health` in your browser

#### CORS Issues
- **Error**: CORS policy errors in browser console
- **Solution**: The API is configured to allow requests from `http://localhost:3000`
- **Check**: Ensure you're accessing the frontend from `http://localhost:3000`

#### Missing Dependencies
- **Error**: Module not found errors
- **Solution**: Run `npm install` in the frontend directory
- **Check**: Verify all dependencies are installed correctly

#### API Endpoint Errors
- **Error**: 500 errors from API endpoints
- **Solution**: Check the Flask server logs for detailed error messages
- **Common Issues**: 
  - Missing OpenAI API key in `.env` file
  - Database connection issues
  - Missing sample data

### Getting Help

For support and questions:
- Check the API documentation in the main project README
- Review the browser console for frontend error messages
- Check the Flask server logs for backend error messages
- Ensure the Flask API server is running and accessible
- Verify API endpoint connectivity by testing individual endpoints

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live data updates
- **Advanced Filtering**: More sophisticated filtering and search capabilities
- **Custom Dashboards**: User-configurable dashboard layouts
- **Export Features**: PDF reports and advanced data export options
- **Mobile App**: React Native mobile application
- **Dark Mode**: Dark theme support
- **Internationalization**: Multi-language support 