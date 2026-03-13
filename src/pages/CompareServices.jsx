import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ServiceComparison from '@/components/epics/01-index-engine/talent/ServiceComparison';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function CompareServices() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialIds = urlParams.get('ids')?.split(',').filter(Boolean) || [];
  
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const { data: allServices } = useQuery({
    queryKey: ['all-services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
    initialData: []
  });

  const selectedServices = allServices.filter(s => selectedIds.includes(s.id));
  const availableServices = allServices.filter(s => 
    !selectedIds.includes(s.id) &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addService = (id) => {
    if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
      setShowPicker(false);
      setSearchTerm('');
    }
  };

  const removeService = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('ServicesLanding')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              Compare Services
            </h1>
            <p className="text-slate-500 text-sm">Select up to 4 services to compare</p>
          </div>
        </div>

        {/* Selected Services Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedServices.map((svc) => (
            <Badge key={svc.id} className="py-2 px-3 gap-2" style={{ background: brandColors.navyDeep }}>
              {svc.title}
              <button onClick={() => removeService(svc.id)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedIds.length < 4 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPicker(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          )}
        </div>

        {/* Service Picker */}
        {showPicker && (
          <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableServices.slice(0, 12).map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => addService(svc.id)}
                  className="p-3 text-left rounded-lg border hover:border-amber-300 hover:bg-amber-50 transition-colors"
                >
                  <p className="font-medium text-sm truncate">{svc.title}</p>
                  <p className="text-xs text-slate-400">${svc.base_price}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowPicker(false)} className="mt-3">
              Cancel
            </Button>
          </div>
        )}

        {/* Comparison Table */}
        {selectedServices.length >= 2 ? (
          <ServiceComparison services={selectedServices} onRemove={removeService} />
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border">
            <p className="text-slate-400">Select at least 2 services to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}