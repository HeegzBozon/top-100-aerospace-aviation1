import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

export default function VotingHub() {
  useEffect(() => {
    window.location.href = createPageUrl('Passport');
  }, []);

  return null;
}