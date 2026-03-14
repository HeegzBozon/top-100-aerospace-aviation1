import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Sparkles, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/core/ThemeContext';

const themeOptions = [
  { value: 'auto', label: 'Auto', icon: Monitor },
  { value: 'sunrise', label: 'Sunrise', icon: Sunrise },
  { value: 'day', label: 'Day', icon: Sun },
  { value: 'sunset', label: 'Sunset', icon: Sunset },
  { value: 'twilight', label: 'Twilight', icon: Sparkles },
  { value: 'night', label: 'Night', icon: Moon },
];

export default function ThemeSwitcher({ currentTheme: _legacy, onThemeChange: _legacyChange }) {
  const { themeMode, setTheme } = useTheme();
  const CurrentIcon = themeOptions.find(t => t.value === themeMode)?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-current hover:bg-white/20">
          <CurrentIcon className="w-5 h-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/80 backdrop-blur-md border-white/20">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map(option => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}