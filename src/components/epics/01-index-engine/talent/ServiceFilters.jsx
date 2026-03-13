import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CATEGORIES = [
  'Consulting', 'Coaching', 'Technical', 'Design', 
  'Strategy', 'Marketing', 'Leadership', 'Career'
];

export default function ServiceFilters({ filters, onChange, services }) {
  const maxPrice = Math.max(...services.map(s => s.base_price || 0), 500);
  
  const activeFilters = Object.entries(filters).filter(([k, v]) => 
    v && v !== 'all' && !(Array.isArray(v) && v.length === 0)
  ).length;

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      category: 'all',
      providerType: 'all',
      priceRange: [0, maxPrice],
      minRating: 0
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search services..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category */}
        <Select value={filters.category || 'all'} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Provider Type */}
        <Select value={filters.providerType || 'all'} onValueChange={(v) => updateFilter('providerType', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="platform">Official</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Price: ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || maxPrice}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Price Range</h4>
              <Slider
                value={filters.priceRange || [0, maxPrice]}
                min={0}
                max={maxPrice}
                step={10}
                onValueChange={(v) => updateFilter('priceRange', v)}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>${filters.priceRange?.[0] || 0}</span>
                <span>${filters.priceRange?.[1] || maxPrice}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Rating Filter */}
        <Select value={String(filters.minRating || 0)} onValueChange={(v) => updateFilter('minRating', Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
            <X className="w-4 h-4" /> Clear ({activeFilters})
          </Button>
        )}
      </div>
    </div>
  );
}