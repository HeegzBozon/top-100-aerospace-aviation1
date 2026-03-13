import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

export default function Arena() {
  useEffect(() => {
    window.location.href = createPageUrl('Top100Nominees2025');
  }, []);

  return null;
}