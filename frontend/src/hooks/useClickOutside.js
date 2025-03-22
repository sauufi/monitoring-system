// frontend/src/hooks/useClickOutside.js
import { useEffect } from 'react';

/**
 * Custom hook for detecting clicks outside of a referenced element
 * @param {React.RefObject} ref - React ref object for the element to monitor
 * @param {Function} handler - Callback function to call when click outside is detected
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    // Define the listener function
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      // Call handler only if the click is outside the element
      handler(event);
    };
    
    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run if ref or handler changes
};

export default useClickOutside;