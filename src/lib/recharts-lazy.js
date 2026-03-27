/**
 * Lazy Recharts Loader
 * 
 * This module provides a way to use recharts components without static imports.
 * Static imports of recharts cause a "Cannot access before initialization" error
 * in production builds due to circular dependencies in the recharts/d3 bundle.
 * 
 * Usage:
 *   import { useRecharts } from '@/lib/recharts-lazy';
 *   
 *   function MyChart() {
 *     const rc = useRecharts();
 *     if (!rc) return <div>Loading chart...</div>;
 *     const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = rc;
 *     return <ResponsiveContainer>...</ResponsiveContainer>;
 *   }
 */
import { useState, useEffect } from 'react';

let rechartsModule = null;
let rechartsPromise = null;

function loadRecharts() {
  if (rechartsModule) return Promise.resolve(rechartsModule);
  if (!rechartsPromise) {
    rechartsPromise = import('recharts').then(mod => {
      rechartsModule = mod;
      return mod;
    });
  }
  return rechartsPromise;
}

/**
 * Hook that returns the recharts module (all exports) once loaded.
 * Returns null while loading.
 */
export function useRecharts() {
  const [mod, setMod] = useState(rechartsModule);

  useEffect(() => {
    if (!mod) {
      loadRecharts().then(m => setMod(m));
    }
  }, [mod]);

  return mod;
}

/**
 * Preload recharts (call early to reduce perceived latency).
 */
export function preloadRecharts() {
  loadRecharts();
}