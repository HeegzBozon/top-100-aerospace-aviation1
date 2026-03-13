import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select provider');
  }
  return context;
};

const Select = ({ children, value, onValueChange, defaultValue = undefined }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value ?? defaultValue);
  const [displayValue, setDisplayValue] = useState(null);
  const selectRef = useRef(null);

  const handleValueChange = (newValue, newDisplay) => {
    setSelectedValue(newValue);
    setDisplayValue(newDisplay);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const findDisplayValue = (nodes) => {
      let found = null;
      React.Children.forEach(nodes, (node) => {
        if (!React.isValidElement(node)) return;
        if (node.props.value === selectedValue) {
          found = node.props.children;
        } else if (node.props.children && typeof node.props.children !== 'string') {
          found = findDisplayValue(node.props.children) || found;
        }
      });
      return found;
    };
    setDisplayValue(findDisplayValue(children));
  }, [selectedValue, children]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const contextValue = {
    isOpen,
    setIsOpen,
    selectedValue,
    handleValueChange,
    displayValue,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen, displayValue } = useSelectContext();
  const placeholder = React.Children.only(children)?.props?.placeholder;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(prev => !prev)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black dark:text-white",
        className
      )}
      {...props}
    >
      <span className="truncate">{displayValue || placeholder || 'Select...'}</span>
      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }) => {
  const { displayValue } = useSelectContext();
  return <>{displayValue || placeholder}</>;
};

const SelectContent = React.forwardRef(({ className, children, style, ...props }, ref) => {
  const { isOpen } = useSelectContext();
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{ zIndex: 99999, ...style }}
      {...props}
    >
      <div className="p-1 max-h-80 overflow-y-auto">{children}</div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { selectedValue, handleValueChange } = useSelectContext();
  const isSelected = value === selectedValue;

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={() => handleValueChange(value, children)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

const SelectGroup = ({ children }) => <>{children}</>;
const SelectLabel = ({ className, ...props }) => <div className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />;
const SelectSeparator = ({ className, ...props }) => <div className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)} {...props} />;


export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};