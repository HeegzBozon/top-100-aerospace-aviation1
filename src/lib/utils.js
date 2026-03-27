import { twMerge } from "tailwind-merge"

// Inline clsx to avoid cold-start dep resolution timeout
function clsx(...args) {
  return args.flat().filter(Boolean).map(a => {
    if (typeof a === 'string') return a;
    if (typeof a === 'object' && a !== null) {
      return Object.entries(a).filter(([,v]) => v).map(([k]) => k).join(' ');
    }
    return '';
  }).join(' ');
}

export function cn(...inputs) {
  return twMerge(clsx(...inputs))
} 


export const isIframe = window.self !== window.top;