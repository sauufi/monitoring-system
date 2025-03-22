// frontend/src/hooks/useInterval.js
import { useEffect, useRef } from 'react';

/**
 * Custom hook for setInterval with automatic cleanup
 * Based on Dan Abramov's blog post:
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 * 
 * @param {Function} callback - Function to call on each interval
 * @param {number|null} delay - Interval delay in milliseconds, null to pause
 */
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    // Don't schedule if delay is null
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;