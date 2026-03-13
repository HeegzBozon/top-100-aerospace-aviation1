import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const sliderRef = React.useRef(null);

  React.useImperativeHandle(ref, () => sliderRef.current);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    
    const updateValue = (clientX) => {
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = min + percent * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      setInternalValue([clampedValue]);
      if (onValueChange) {
        onValueChange([clampedValue]);
      }
    };

    updateValue(e.clientX);

    const handleMouseMove = (e) => {
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const currentValue = internalValue[0] || 0;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div 
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }