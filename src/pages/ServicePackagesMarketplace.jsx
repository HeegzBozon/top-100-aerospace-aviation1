import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, Search, Filter, ArrowLeft, 
  Sparkles, Star, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import ServicePackageCard from '@/components/epics/01-index-engine/talent/ServicePackageCard';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServicePackagesMarketplace() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'best_value', 'popular'

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['all-packages'],
    queryFn: () => base44.entities.ServicePackage.filter({ is_active: true }),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['all-services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const isLoading = packagesLoading || servicesLoading;

  // Enrich packages with service data
  const enrichedPackages = packages.map(pkg => ({
    ...pkg,
    service: services.find(s => s.id === pkg.service_id),
  })).filter(pkg => pkg.service);

  // Apply filters
  let filteredPackages = enrichedPackages;

  if (search) {
    filteredPackages = filteredPackages.filter(pkg =>
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.service?.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filter === 'best_value') {
    filteredPackages = filteredPackages.filter(pkg => pkg.discount_percent >= 15);
  }

  // Sort by discount (best value first)
  filteredPackages.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.navyDeep}dd)` }}
      >
        <div className="max-w-6xl mx-auto">
          <Link 
            to={createPageUrl('ServicesLanding')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold text-white">Session Packages</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl">
            Save more with bundled sessions. Get multiple sessions at a discounted rate.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages or services..."
              className="pl-12 h-12 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            style={filter === 'all' ? { backgroundColor: brandColors.navyDeep } : {}}
          >
            All Packages
          </Button>
          <Button
            variant={filter === 'best_value' ? 'default' : 'outline'}
            onClick={() => setFilter('best_value')}
            style={filter === 'best_value' ? { backgroundColor: brandColors.goldPrestige } : {}}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Best Value (15%+ off)
          </Button>
        </div>

        {filteredPackages.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-600">No packages found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="mb-2">
                  <Link 
                    to={`${createPageUrl('ServiceDetail')}?id=${pkg.service?.id}`}
                    className="text-sm hover:underline"
                    style={{ color: brandColors.goldPrestige }}
                  >
                    {pkg.service?.title}
                  </Link>
                </div>
                <ServicePackageCard pkg={pkg} service={pkg.service} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}