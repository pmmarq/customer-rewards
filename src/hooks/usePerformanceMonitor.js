import { useState, useEffect } from 'react';

/**
 * Performance monitoring hook for development
 * Tracks component render frequency and performance metrics
 */
export function usePerformanceMonitor(componentName) {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0
  });

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - metrics.lastRenderTime;
    
    setMetrics(prev => {
      const newCount = prev.renderCount + 1;
      const newAverage = ((prev.averageRenderTime * prev.renderCount) + timeSinceLastRender) / newCount;
      
      return {
        renderCount: newCount,
        lastRenderTime: now,
        averageRenderTime: newAverage
      };
    });

    // Performance warnings in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName}: Render #${metrics.renderCount + 1}, Time since last: ${timeSinceLastRender}ms, Avg: ${metrics.averageRenderTime}ms`);
      
      if (timeSinceLastRender < 16) {
        console.warn(`⚠️ ${componentName} might be re-rendering too frequently (<16ms)`);
      }
    }
  });

  return metrics.renderCount;
}