import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    class: '',
    icon: '☀️',
    description: 'Clean and bright'
  },
  dark: {
    name: 'Dark',
    class: 'dark',
    icon: '🌙',
    description: 'Easy on the eyes'
  },
  blueNight: {
    name: 'Blue Night',
    class: 'dark theme-blue-night',
    icon: '🌌',
    description: 'Deep blue elegance'
  },
  sunset: {
    name: 'Sunset',
    class: 'theme-sunset',
    icon: '🌅',
    description: 'Warm and vibrant'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themes).forEach(t => {
      if (t.class) {
        t.class.split(' ').forEach(className => {
          root.classList.remove(className);
        });
      }
    });
    
    // Add current theme classes
    if (theme.class) {
      theme.class.split(' ').forEach(className => {
        root.classList.add(className);
      });
    }
    
    // Save to localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    setTheme: setCurrentTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};