import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ThemeSwitcher is a placeholder — the app currently uses a single brand theme.
// Extend brandTheme.js with additional theme keys to enable real switching.
export default function ThemeSwitcher() {
  return (
    <Button variant="ghost" size="icon" className="text-current hover:bg-white/20" disabled aria-label="Theme switcher (coming soon)">
      <Palette className="w-5 h-5" />
    </Button>
  );
}