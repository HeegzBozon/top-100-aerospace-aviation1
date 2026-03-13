import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

// Approximate exchange rates (in production, fetch from API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.50,
  CHF: 0.88,
  INR: 83.12,
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF ',
  INR: '₹',
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  INR: 'Indian Rupee',
};

export default function MultiCurrencyPrice({ 
  priceUSD, 
  className = '',
  size = 'default', // 'sm', 'default', 'lg'
  showSelector = true,
}) {
  const [currency, setCurrency] = useState('USD');

  const convertPrice = (usdAmount, targetCurrency) => {
    const rate = EXCHANGE_RATES[targetCurrency];
    const converted = usdAmount * rate;
    
    // Format based on currency
    if (targetCurrency === 'JPY') {
      return Math.round(converted);
    }
    return converted.toFixed(2);
  };

  const formatPrice = (amount, curr) => {
    const symbol = CURRENCY_SYMBOLS[curr];
    return `${symbol}${amount}`;
  };

  const convertedPrice = convertPrice(priceUSD, currency);
  const formattedPrice = formatPrice(convertedPrice, currency);

  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
  };

  if (!showSelector) {
    return (
      <span className={`${sizeClasses[size]} ${className}`}>
        {formattedPrice}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={sizeClasses[size]}>
        {formattedPrice}
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            {currency}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.keys(EXCHANGE_RATES).map((curr) => (
            <DropdownMenuItem
              key={curr}
              onClick={() => setCurrency(curr)}
              className="flex justify-between gap-4"
            >
              <span className="font-medium">{curr}</span>
              <span className="text-slate-500 text-xs">{CURRENCY_NAMES[curr]}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currency !== 'USD' && (
        <span className="text-xs text-slate-500">
          (${priceUSD} USD)
        </span>
      )}
    </div>
  );
}

// Utility hook for currency conversion
export function useCurrencyConverter() {
  const [currency, setCurrency] = useState('USD');

  const convert = (usdAmount) => {
    const rate = EXCHANGE_RATES[currency];
    const converted = usdAmount * rate;
    if (currency === 'JPY') return Math.round(converted);
    return parseFloat(converted.toFixed(2));
  };

  const format = (amount) => {
    return `${CURRENCY_SYMBOLS[currency]}${amount}`;
  };

  return {
    currency,
    setCurrency,
    convert,
    format,
    rates: EXCHANGE_RATES,
    symbols: CURRENCY_SYMBOLS,
  };
}