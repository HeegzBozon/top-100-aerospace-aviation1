import React, { useState, useEffect, useRef, useCallback } from 'react';

const VirtualizedList = ({
  items,
  renderItem,
  itemHeight,
  itemBuffer = 5,
  containerHeight
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(containerHeight || 0);

  const updateViewHeight = useCallback(() => {
    if (containerRef.current) {
      setViewHeight(containerRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    updateViewHeight();
    window.addEventListener('resize', updateViewHeight);
    return () => window.removeEventListener('resize', updateViewHeight);
  }, [updateViewHeight]);

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - itemBuffer);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewHeight) / itemHeight) + itemBuffer
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: `${items.length * itemHeight}px`,
          position: 'relative',
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return renderItem({
            item,
            index: actualIndex,
            style: {
              position: 'absolute',
              top: `${actualIndex * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`,
            },
          });
        })}
      </div>
    </div>
  );
};

export default VirtualizedList;