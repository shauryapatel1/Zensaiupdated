import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkModeState] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    try {
      const savedDarkMode = localStorage.getItem('zensai-dark-mode');
      
      // Default to light mode unless explicitly set to dark
      const shouldUseDarkMode = savedDarkMode === 'true';
      setIsDarkModeState(shouldUseDarkMode);
      
      // Apply dark mode class to document
      if (shouldUseDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Error loading theme preference:', err);
      // Default to light mode if localStorage fails
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setDarkMode = (enabled: boolean) => {
    setIsDarkModeState(enabled);
    try {
      localStorage.setItem('zensai-dark-mode', enabled.toString());
      
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Error saving theme preference:', err);
      // Still update the UI even if localStorage fails
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      setDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}