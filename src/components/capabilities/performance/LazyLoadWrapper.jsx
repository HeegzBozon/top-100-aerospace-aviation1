import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LazyLoadWrapper({ 
  children, 
  height = 200, 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = null 
}) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  const defaultFallback = (
    <div className="space-y-3" style={{ height }}>
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-4 w-1/2 bg-white/10" />
      <Skeleton className="h-20 w-full bg-white/10" />
    </div>
  );

  return (
    <div ref={elementRef} style={{ minHeight: height }}>
      {isInView ? children : (fallback || defaultFallback)}
    </div>
  );
}