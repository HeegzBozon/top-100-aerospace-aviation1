import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import FavoriteButton from '@/components/talent/FavoriteButton';
import { User as UserEntity } from '@/entities/User';
import { 
  Sparkles, Search, Filter, ArrowRight, Star, 
  Calendar, Clock, User as LucideUser, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceFilters from '@/components/talent/ServiceFilters';

const ServiceCard = ({ service, userEmail }) => {
  const isPlatform = service.provider_type === 'platform';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isPlatform 
          ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200/50' 
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {userEmail && (
          <FavoriteButton userEmail={userEmail} targetType="service" targetId={service.id} />
        )}
        {isPlatform && (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Official
          </Badge>
        )}
      </div>

      <div className="p-6">
        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
          isPlatform ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
        }`}>
           <Star className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
          {service.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">
          {service.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.duration_minutes}m
          </div>
          <div className="flex items-center gap-1">
            <LucideUser className="w-3.5 h-3.5" />
            {isPlatform ? 'Pineapple Empire' : 'Community Pro'}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-bold text-slate-900">
            ${service.base_price}
          </div>
          <Button size="sm" variant={isPlatform ? "default" : "outline"} className={isPlatform ? "bg-[#1e3a5a]" : ""} asChild>
            <Link to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>View</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ServicesLanding() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    providerType: 'all',
    priceRange: [0, 1000],
    minRating: 0
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => UserEntity.me(),
    retry: false
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
    initialData: []
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = !filters.search || 
      service.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      service.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.providerType === "all" || service.provider_type === filters.providerType;
    const matchesCategory = filters.category === "all" || service.category?.includes(filters.category);
    const matchesPrice = service.base_price >= filters.priceRange[0] && service.base_price <= filters.priceRange[1];
    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-[#1e3a5a] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              The TOP 100 Capital Exchange
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-montserrat">
              Accelerate your career with expert coaching, consulting, and technical services from TOP 100 and top community talent.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full bg-transparent border-none text-white placeholder:text-slate-400 focus:ring-0 pl-10 h-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="w-px bg-white/20 hidden md:block"></div>
              <Select value={filters.providerType} onValueChange={(v) => setFilters({ ...filters, providerType: v })}>
                <SelectTrigger className="w-full md:w-[180px] bg-transparent border-none text-white focus:ring-0">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="platform">Pineapple Empire</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Advanced Filters */}
        <div className="mb-8">
          <ServiceFilters filters={filters} onChange={setFilters} services={services} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Available Services</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{filteredServices.length} results</span>
            <Button variant="outline" size="sm" asChild>
              <Link to={createPageUrl('CompareServices')}>Compare</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} userEmail={currentUser?.email} />
            ))}
          </div>
        )}

        {!isLoading && filteredServices.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No services found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Capital Exchange CTA */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f1f33] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#c9a87c]" />
            <span className="text-sm uppercase tracking-widest text-[#c9a87c]">New</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Exchange Expertise Without Cash
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Earn Exchange Credits (XC) by delivering services, spend them across the network. Reputation-gated, escrow-protected.
          </p>
          <Button size="lg" className="bg-[#c9a87c] hover:bg-[#b89a6d] text-white" asChild>
            <Link to={createPageUrl('CapitalExchange')}>Explore Capital Exchange</Link>
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Have a skill to share?
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Join our curated network of experts. Apply to become a service provider and reach the top talent in aerospace and aviation.
          </p>
          <Button size="lg" className="bg-[#1e3a5a] hover:bg-[#2c4a6e]" asChild>
            <Link to="/ProviderApplication">Apply to be a Provider</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}