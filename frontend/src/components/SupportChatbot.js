import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Mail,
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  Database, 
  Lightbulb,
  MessageSquare,
  Phone,
  ArrowRight
} from 'lucide-react';
import EmailSupportForm from './EmailSupportForm';

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your BI assistant. I can help you navigate the application or explain what you can find on each page. Try asking me about:",
      timestamp: new Date(),
      suggestions: [
        "What's on the Dashboard?",
        "How do I view customer insights?",
        "Show me contract analysis",
        "Where can I find predictions?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base for the chatbot
  const knowledgeBase = useMemo(() => ({
    pages: {
      dashboard: {
        name: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        description: 'Overview and key metrics',
        summary: 'View total customers, contracts, revenue trends, customer segments, and contract performance. Get a high-level overview of your business intelligence with interactive charts and AI insights.',
        features: ['Key metrics overview', 'Revenue trends', 'Customer segments', 'Contract performance charts', 'Quick action shortcuts']
      },
      customers: {
        name: 'Customer Analysis',
        path: '/customers',
        icon: Users,
        description: 'Customer health and insights',
        summary: 'Analyze customer health scores, engagement metrics, industry distribution, and churn risk. View detailed customer lists with health indicators and renewal probabilities.',
        features: ['Customer health scores', 'Engagement analysis', 'Industry insights', 'Churn risk assessment', 'Customer segmentation']
      },
      contracts: {
        name: 'Contract Analysis',
        path: '/contracts',
        icon: FileText,
        description: 'Contract performance metrics',
        summary: 'Monitor contract types, renewal rates, contract values, and performance metrics. Track contract lifecycle and identify optimization opportunities.',
        features: ['Contract distribution', 'Renewal rate trends', 'Value analysis', 'Performance tracking', 'Contract list with filters']
      },
      predictions: {
        name: 'Predictive Analytics',
        path: '/predictions',
        icon: TrendingUp,
        description: 'AI-powered predictions',
        summary: 'Access churn predictions, revenue forecasts, and customer lifetime value calculations. Use AI to predict future trends and make data-driven decisions.',
        features: ['Churn prediction', 'Revenue forecasting', 'Customer LTV', 'Risk assessment', 'Predictive modeling']
      },
      data: {
        name: 'Data Explorer',
        path: '/data',
        icon: Database,
        description: 'Raw data exploration',
        summary: 'Explore raw datasets, view data quality metrics, analyze correlations, and export data. Perfect for detailed data analysis and quality assessment.',
        features: ['Dataset exploration', 'Data quality metrics', 'Correlation analysis', 'Data trends', 'Export capabilities']
      },
      insights: {
        name: 'AI Insights',
        path: '/insights',
        icon: Lightbulb,
        description: 'Generated insights',
        summary: 'View AI-generated insights across all business areas. Filter by type, priority, and category to discover actionable recommendations.',
        features: ['AI-generated insights', 'Priority filtering', 'Insight categories', 'Impact scoring', 'Actionable recommendations']
      },
      support: {
        name: 'Support Analysis',
        path: '/support',
        icon: MessageSquare,
        description: 'Support ticket analytics',
        summary: 'Analyze support ticket patterns, resolution times, customer satisfaction, and support team performance. Identify areas for improvement.',
        features: ['Ticket analysis', 'Resolution metrics', 'Satisfaction scores', 'Team performance', 'Trend identification']
      },
      referrals: {
        name: 'Referral Analysis',
        path: '/referrals',
        icon: Phone,
        description: 'Referral call insights',
        summary: 'Track referral call volumes, conversion rates, and performance trends. Analyze referral patterns and optimize conversion strategies.',
        features: ['Call volume trends', 'Conversion analysis', 'Performance metrics', 'Referral patterns', 'Strategy optimization']
      }
    },
    
    // Common queries and responses
    responses: {
      navigation: {
        keywords: ['navigate', 'go to', 'find', 'where', 'how to access', 'show me', 'take me to'],
        handler: (query, pageKey) => {
          const page = knowledgeBase.pages[pageKey];
          if (page) {
            return {
              type: 'navigation',
              page: page,
              content: `I'll help you navigate to ${page.name}. ${page.summary}`,
              features: page.features,
              action: () => navigate(page.path)
            };
          }
          return null;
        }
      },
      summary: {
        keywords: ['what is', 'what can', 'what do', 'explain', 'describe', 'tell me about', 'summary'],
        handler: (query, pageKey) => {
          const page = knowledgeBase.pages[pageKey];
          if (page) {
            return {
              type: 'summary',
              page: page,
              content: `${page.name}: ${page.summary}`,
              features: page.features,
              action: () => navigate(page.path)
            };
          }
          return null;
        }
      },
      current: {
        keywords: ['current page', 'this page', 'here', 'what am i looking at'],
        handler: () => {
          const currentPageKey = Object.keys(knowledgeBase.pages).find(
            key => knowledgeBase.pages[key].path === location.pathname
          );
          const page = knowledgeBase.pages[currentPageKey];
          if (page) {
            return {
              type: 'current',
              page: page,
              content: `You're currently on the ${page.name} page. ${page.summary}`,
              features: page.features
            };
          }
          return {
            type: 'current',
            content: "I'm not sure which page you're on. You can ask me about specific pages or try 'What's on the Dashboard?' to get started."
          };
        }
      }
    }
  }), [navigate, location.pathname]);

  // Process user input and generate response
  const processMessage = (userMessage) => {
    const query = userMessage.toLowerCase();
    
    // Find matching page first - check for exact matches first, then partial matches
    let pageKey = null;
    
    // Check for exact page name matches first
    pageKey = Object.keys(knowledgeBase.pages).find(key => {
      const page = knowledgeBase.pages[key];
      const pageName = page.name.toLowerCase();
      return query.includes(pageName);
    });
    
    // If no exact match, check for specific keyword patterns with priority order
    if (!pageKey) {
      // Support Analysis - must be checked first to avoid conflicts
      if (query.includes('support analysis') || query.includes('support ticket') || query.includes('ticket analysis')) {
        pageKey = 'support';
      }
      // Customer Analysis 
      else if (query.includes('customer analysis') || ((query.includes('customer') || query.includes('client')) && !query.includes('support'))) {
        pageKey = 'customers';
      }
      // Contract Analysis
      else if (query.includes('contract analysis') || (query.includes('contract') && !query.includes('support'))) {
        pageKey = 'contracts';
      }
      // Referral Analysis
      else if (query.includes('referral analysis') || query.includes('referral')) {
        pageKey = 'referrals';
      }
      // Predictive Analytics
      else if (query.includes('predictive') || query.includes('predict') || query.includes('forecast') || query.includes('analytics')) {
        pageKey = 'predictions';
      }
      // Data Explorer
      else if (query.includes('data explorer') || (query.includes('data') && (query.includes('explorer') || query.includes('raw') || query.includes('explore')))) {
        pageKey = 'data';
      }
      // AI Insights
      else if (query.includes('ai insights') || (query.includes('insight') && query.includes('ai'))) {
        pageKey = 'insights';
      }
      // Dashboard
      else if (query.includes('dashboard') || query.includes('home') || query.includes('overview') || query.includes('main')) {
        pageKey = 'dashboard';
      }
      // General support (only if not already matched above)
      else if (query.includes('support') && !pageKey) {
        pageKey = 'support';
      }
      // General calls
      else if (query.includes('call') && !query.includes('support')) {
        pageKey = 'referrals';
      }
    }

    // Find matching response type
    const responseType = Object.keys(knowledgeBase.responses).find(type => {
      return knowledgeBase.responses[type].keywords.some(keyword => 
        query.includes(keyword)
      );
    });

    // Handle current page queries
    if (query.includes('current') || query.includes('this page') || query.includes('here') || query.includes('what am i looking at')) {
      const currentPageKey = Object.keys(knowledgeBase.pages).find(
        key => knowledgeBase.pages[key].path === location.pathname
      );
      const page = knowledgeBase.pages[currentPageKey];
      if (page) {
        return {
          type: 'current',
          page: page,
          content: `You're currently on the ${page.name} page. ${page.summary}`,
          features: page.features
        };
      }
    }

    // Generate response based on found page and type
    if (pageKey && responseType && knowledgeBase.responses[responseType].handler) {
      const response = knowledgeBase.responses[responseType].handler(query, pageKey);
      if (response) return response;
    }

    // Handle page-specific queries without specific response type
    if (pageKey) {
      const page = knowledgeBase.pages[pageKey];
      if (query.includes('navigate') || query.includes('go to') || query.includes('show me') || query.includes('take me')) {
        return {
          type: 'navigation',
          page: page,
          content: `I'll help you navigate to ${page.name}. ${page.summary}`,
          features: page.features,
          action: () => navigate(page.path)
        };
      } else {
        return {
          type: 'summary',
          page: page,
          content: `${page.name}: ${page.summary}`,
          features: page.features,
          action: () => navigate(page.path)
        };
      }
    }

    // Default responses for common queries
    if (query.includes('help') || query.includes('what can you do') || query.includes('assist')) {
      return {
        type: 'help',
        content: "I can help you with:\n• Navigate to different pages\n• Explain what each page contains\n• Provide summaries of features\n• Guide you through the application",
        suggestions: [
          "What's on the Dashboard?",
          "Show me Customer Analysis",
          "What can I do with contracts?",
          "Take me to predictions"
        ]
      };
    }

    // Fallback to email support
    return {
      type: 'fallback',
      content: "I'm not sure how to help with that specific question. Would you like to contact our support team for more detailed assistance?",
      showEmailOption: true
    };
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    const messageToProcess = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Process the message and generate bot response
    setTimeout(() => {
      const response = processMessage(messageToProcess);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        page: response.page,
        features: response.features,
        suggestions: response.suggestions,
        showEmailOption: response.showEmailOption,
        action: response.action
      };

      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Process the message and generate bot response
    setTimeout(() => {
      const response = processMessage(suggestion);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        page: response.page,
        features: response.features,
        suggestions: response.suggestions,
        showEmailOption: response.showEmailOption,
        action: response.action
      };

      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300
                   max-sm:bottom-4 max-sm:right-4 max-sm:p-3 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          backgroundColor: 'rgb(var(--color-primary))',
          color: 'white'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-lg shadow-xl overflow-hidden
                       sm:w-96 sm:h-[600px] sm:bottom-6 sm:right-6
                       max-sm:fixed max-sm:inset-4 max-sm:w-auto max-sm:h-auto max-sm:bottom-4 max-sm:top-4 max-sm:left-4 max-sm:right-4"
            style={{
              backgroundColor: 'rgb(var(--color-bg-secondary))',
              borderColor: 'rgb(var(--color-border))'
            }}
            initial={{ scale: 0, opacity: 0, originX: 1, originY: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                borderColor: 'rgb(var(--color-border))'
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-white bg-opacity-20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">BI Assistant</h3>
                  <p className="text-xs text-blue-100">Here to help you navigate</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[460px] max-sm:h-[calc(100vh-200px)]">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message bubble */}
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'border'
                      }`}
                      style={{
                        backgroundColor: message.type === 'bot' ? 'rgb(var(--color-bg-primary))' : undefined,
                        borderColor: message.type === 'bot' ? 'rgb(var(--color-border))' : undefined,
                        color: message.type === 'bot' ? 'rgb(var(--color-text-primary))' : undefined
                      }}
                    >
                      {/* Avatar */}
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          message.type === 'user' ? 'bg-white bg-opacity-20' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" style={{ color: 'rgb(var(--color-primary))' }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          
                          {/* Features list */}
                          {message.features && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>Key features:</p>
                              <ul className="text-xs space-y-1">
                                {message.features.map((feature, index) => (
                                  <li key={index} className="flex items-center space-x-1">
                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgb(var(--color-primary))' }}></span>
                                    <span style={{ color: 'rgb(var(--color-text-secondary))' }}>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Navigation button */}
                          {message.page && message.action && (
                            <button
                              onClick={message.action}
                              className="mt-2 inline-flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors hover:bg-opacity-80"
                              style={{
                                backgroundColor: 'rgb(var(--color-primary))',
                                color: 'white'
                              }}
                            >
                              <message.page.icon className="h-3 w-3" />
                              <span>Go to {message.page.name}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}

                          {/* Email support option */}
                          {message.showEmailOption && (
                            <button
                              onClick={() => setShowEmailForm(true)}
                              className="mt-2 inline-flex items-center space-x-1 text-xs px-2 py-1 rounded border transition-colors hover:bg-opacity-10"
                              style={{
                                borderColor: 'rgb(var(--color-border))',
                                color: 'rgb(var(--color-primary))'
                              }}
                            >
                              <Mail className="h-3 w-3" />
                              <span>Contact Support</span>
                            </button>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-2 space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block text-xs px-2 py-1 rounded border text-left w-full transition-colors hover:bg-opacity-10"
                                  style={{
                                    borderColor: 'rgb(var(--color-border))',
                                    color: 'rgb(var(--color-primary))'
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs mt-1 px-2" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4" style={{ borderColor: 'rgb(var(--color-border))' }}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about the application..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-bg-primary))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-text-primary))'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgb(var(--color-primary))',
                    color: 'white'
                  }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Support Form Modal */}
      <EmailSupportForm 
        isOpen={showEmailForm}
        onClose={() => setShowEmailForm(false)}
      />
    </>
  );
};

export default SupportChatbot;