import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeSwitcher() {
  const { currentTheme, setTheme, themes } = useTheme();
  
  // Get theme keys in order
  const themeKeys = Object.keys(themes);
  
  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-full px-4 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-10 hover:bg-gray-500 group"
      style={{
        backgroundColor: 'rgb(var(--color-bg-tertiary))',
        color: 'rgb(var(--color-text-primary))'
      }}
      title={`Switch to ${themes[themeKeys[(themeKeys.indexOf(currentTheme) + 1) % themeKeys.length]].name} theme`}
    >
      <span className="text-xl transition-transform duration-200 group-hover:scale-110">
        {themes[currentTheme].icon}
      </span>
      <span className="ml-2 font-medium">{themes[currentTheme].name}</span>
      <svg 
        className="ml-auto w-4 h-4 transition-transform duration-200 group-hover:rotate-180" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
}

export default ThemeSwitcher;