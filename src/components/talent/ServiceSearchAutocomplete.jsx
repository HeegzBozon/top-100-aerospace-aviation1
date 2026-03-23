import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Search, Clock, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServiceSearchAutocomplete({ onSelect, placeholder = "Search services..." }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['all-services-search'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
  });

  const filteredServices = query.length >= 2
    ? services.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase()) ||
        s.category?.some(c => c.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!isOpen || filteredServices.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredServices.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(filteredServices[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (service) => {
    setQuery('');
    setIsOpen(false);
    onSelect?.(service);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        {isLoading && query.length >= 2 && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredServices.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border overflow-hidden"
          >
            {filteredServices.map((service, index) => (
              <Link
                key={service.id}
                to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}
                onClick={() => handleSelect(service)}
              >
                <div
                  className={`p-3 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-slate-100' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {service.image_url && (
                      <img 
                        src={service.image_url} 
                        alt={service.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium truncate"
                        style={{ color: brandColors.navyDeep }}
                      >
                        {service.title}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${service.base_price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration_minutes}m
                        </span>
                        {service.category?.[0] && (
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                            {service.category[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {isOpen && query.length >= 2 && filteredServices.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border p-4 text-center"
          >
            <p className="text-slate-500">No services found for "{query}"</p>
            <Link to={createPageUrl('ServicesLanding')}>
              <p className="text-sm mt-2" style={{ color: brandColors.goldPrestige }}>
                Browse all services →
              </p>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}