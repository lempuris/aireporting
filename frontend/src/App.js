import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CustomerAnalysis from './pages/CustomerAnalysis';
import ContractAnalysis from './pages/ContractAnalysis';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import DataExplorer from './pages/DataExplorer';
import Insights from './pages/Insights';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<CustomerAnalysis />} />
              <Route path="/contracts" element={<ContractAnalysis />} />
              <Route path="/predictions" element={<PredictiveAnalytics />} />
              <Route path="/data" element={<DataExplorer />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </main>
        </div>
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
  );
}

export default App; 