import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Database, 
  Lightbulb,
  Brain,
  Activity,
  MessageSquare,
  Phone
} from 'lucide-react';

const Sidebar = React.memo(() => {
  const navigation = useMemo(() => [
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
    },
    {
      name: 'Support Analysis',
      href: '/support',
      icon: MessageSquare,
      description: 'Support ticket analytics'
    },
    {
      name: 'Referral Analysis',
      href: '/referrals',
      icon: Phone,
      description: 'Referral call insights'
    }
  ], []);

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 border-r transition-all duration-300" style={{ backgroundColor: 'rgb(var(--color-bg-secondary))', borderColor: 'rgb(var(--color-border))' }}>
          {/* Logo */}
          <div className="flex items-center h-20 flex-shrink-0 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700">
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
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-500 bg-opacity-20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600'
                          : 'hover:bg-gray-500 hover:bg-opacity-10'
                      }`
                    }
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs" style={{ color: 'rgb(var(--color-text-secondary))' }}>{item.description}</div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Theme Switcher */}
          <div className="px-4 py-3 border-t transition-all duration-300" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <ThemeSwitcher />
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0 flex border-t p-4 transition-all duration-300" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <Activity className="h-4 w-4 text-success-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>System Status</p>
                <p className="text-xs text-success-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 