import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Database, 
  Lightbulb,
  Brain,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview and key metrics'
    },
    {
      name: 'Customer Analysis',
      href: '/customers',
      icon: Users,
      description: 'Customer health and insights'
    },
    {
      name: 'Contract Analysis',
      href: '/contracts',
      icon: FileText,
      description: 'Contract performance metrics'
    },
    {
      name: 'Predictive Analytics',
      href: '/predictions',
      icon: TrendingUp,
      description: 'AI-powered predictions'
    },
    {
      name: 'Data Explorer',
      href: '/data',
      icon: Database,
      description: 'Raw data exploration'
    },
    {
      name: 'AI Insights',
      href: '/insights',
      icon: Lightbulb,
      description: 'Generated insights'
    }
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-primary-600 to-indigo-600">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-white" />
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">AI Business Intelligence</h1>
                <p className="text-primary-100 text-xs">Powered by LangChain</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <Activity className="h-4 w-4 text-success-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">System Status</p>
                <p className="text-xs text-success-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 