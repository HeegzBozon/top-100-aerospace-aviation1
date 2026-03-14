import { useEffect, useRef } from 'react';

export function usePerformanceMonitor(componentName) {
  const renderStartTime = useRef(performance.now());
  const mountTime = useRef(null);

  useEffect(() => {
    // Component mounted
    mountTime.current = performance.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    
    if (mountDuration > 100) {
      console.warn(`⚠️ Slow mount: ${componentName} took ${mountDuration.toFixed(2)}ms`);
    }

    return () => {
      // Component unmounted
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      if (totalLifetime > 5000) {
        console.info(`📊 ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  // Hook for measuring specific operations
  const measureOperation = (operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    const duration = end - start;
    if (duration > 50) {
      console.warn(`⚠️ Slow operation: ${componentName}.${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  };

  return { measureOperation };
}

export function useMemoryMonitor(interval = 30000) {
  useEffect(() => {
    if (!performance.memory) return;

    const logMemoryUsage = () => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100;
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100;
      
      if (used > limit * 0.8) {
        console.warn(`⚠️ High memory usage: ${used}MB / ${limit}MB (${Math.round(used/limit*100)}%)`);
      }
    };

    const intervalId = setInterval(logMemoryUsage, interval);
    return () => clearInterval(intervalId);
  }, [interval]);
}

export function useNetworkMonitor() {
  useEffect(() => {
    if (!navigator.connection) return;

    const logNetworkInfo = () => {
      const connection = navigator.connection;
      console.info(`📡 Network: ${connection.effectiveType}, ${connection.downlink}Mbps, RTT: ${connection.rtt}ms`);
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.warn('⚠️ Slow network detected - consider reducing data usage');
      }
    };

    logNetworkInfo();
    navigator.connection.addEventListener('change', logNetworkInfo);
    
    return () => {
      navigator.connection.removeEventListener('change', logNetworkInfo);
    };
  }, []);
}