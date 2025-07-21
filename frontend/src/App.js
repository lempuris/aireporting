import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CustomerAnalysis from './pages/CustomerAnalysis';
import ContractAnalysis from './pages/ContractAnalysis';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import DataExplorer from './pages/DataExplorer';
import Insights from './pages/Insights';
import SupportAnalysis from './pages/SupportAnalysis';
import ReferralAnalysis from './pages/ReferralAnalysis';
import SupportChatbot from './components/SupportChatbot';

// Route transition component
const RouteTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex h-screen" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
              <RouteTransition>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomerAnalysis />} />
                  <Route path="/contracts" element={<ContractAnalysis />} />
                  <Route path="/predictions" element={<PredictiveAnalytics />} />
                  <Route path="/data" element={<DataExplorer />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/support" element={<SupportAnalysis />} />
                  <Route path="/referrals" element={<ReferralAnalysis />} />
                </Routes>
              </RouteTransition>
            </main>
          </div>
          
          {/* Support Chatbot */}
          <SupportChatbot />
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 