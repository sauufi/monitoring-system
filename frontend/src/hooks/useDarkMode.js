// frontend/src/hooks/useDarkMode.js
import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for implementing dark mode 
 * @param {string} defaultTheme - Default theme ('light' or 'dark')
 * @returns {Array} [theme, setTheme] - Current theme and setter function
 */
const useDarkMode = (defaultTheme = 'light') => {
  // State for the current theme
  const [theme, setTheme] = useLocalStorage('theme', defaultTheme);
  
  // Effect for toggling the dark mode class on the document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light-mode');
    root.classList.remove('dark-mode');
    
    // Add the current theme class
    root.classList.add(`${theme}-mode`);
    
    // Set the theme color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }, [theme]);
  
  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  return [theme, setTheme, toggleTheme];
};

export default useDarkMode;