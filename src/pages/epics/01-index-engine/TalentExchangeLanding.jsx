import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Search, ArrowRight, Star, Clock, User, 
  Briefcase, Users, Building2, Rocket, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

// Services Tab Content
const ServiceCard = ({ service }) => {
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
      {isPlatform && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Official
          </Badge>
        </div>
      )}

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
            <User className="w-3.5 h-3.5" />
            {isPlatform ? 'TOP 100' : 'Community Pro'}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-bold text-slate-900">
            ${service.base_price}
          </div>
          <Link to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>
            <Button size="sm" variant={isPlatform ? "default" : "outline"} className={isPlatform ? "bg-[#1e3a5a]" : ""}>
              View
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

function ServicesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || service.provider_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Search/Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 mb-16">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-300" />
          <input
            type="text"
            placeholder="Search for services..."
            className="w-full bg-transparent border-none text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-px bg-white/20 hidden md:block"></div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px] bg-transparent border-none text-white focus:ring-0">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="platform">TOP 100</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Marketplace Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16" style={{ background: brandColors.cream }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Available Services</h2>
          <span className="text-sm text-slate-500">{filteredServices.length} results</span>
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
              <ServiceCard key={service.id} service={service} />
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

      {/* CTA Section */}
      <div className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Have a skill to share?
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Join our curated network of experts. Apply to become a service provider and reach the top talent in aerospace and aviation.
          </p>
          <Link to="/ProviderApplication">
            <Button size="lg" className="bg-[#1e3a5a] hover:bg-[#2c4a6e]">
              Apply to be a Provider
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Talent Tab Content
const talentFeatures = [
  { icon: Award, title: 'TOP 100 Talent Pool', description: 'Access pre-vetted aerospace leaders recognized by industry peers' },
  { icon: Building2, title: 'Premier Employers', description: 'Connect with leading aerospace companies actively hiring' },
  { icon: Rocket, title: 'Career Advancement', description: 'Exclusive opportunities for industry professionals' },
];

function TalentTab() {
  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/TalentExchange');
  };

  const handleEmployerAccess = () => {
    base44.auth.redirectToLogin('/EmployerDashboard');
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="text-lg px-8 py-6 rounded-full font-semibold"
          style={{ 
            background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #e8d4b8)`,
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          <Users className="w-5 h-5 mr-2" />
          Find Opportunities
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          onClick={handleEmployerAccess}
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 rounded-full font-semibold"
          style={{ 
            borderColor: brandColors.goldPrestige,
            color: brandColors.goldPrestige,
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          <Building2 className="w-5 h-5 mr-2" />
          Employer Portal
        </Button>
      </div>

      {/* Features */}
      <section className="py-20 px-4" style={{ background: brandColors.cream }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {talentFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${brandColors.navyDeep}10` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: brandColors.navyDeep }} />
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4" style={{ background: brandColors.navyDeep }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'Aerospace Leaders' },
            { value: '50+', label: 'Premier Employers' },
            { value: '30+', label: 'Countries' },
          ].map((stat) => (
            <div key={stat.label}>
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </div>
              <div className="text-white/60 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center" style={{ background: brandColors.cream }}>
        <h2 
          className="text-3xl mb-4"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
        >
          Ready to Elevate Your Career?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Join the exclusive network of aerospace and aviation professionals.
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="px-10 py-6 rounded-full font-semibold"
          style={{ 
            background: brandColors.navyDeep,
            color: 'white',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </section>
    </div>
  );
}

export default function TalentExchangeLanding() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'services';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div 
        className="relative text-white py-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="text-sm uppercase tracking-widest"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                The TOP 100 Capital Exchange
              </span>
            </div>

            <h1 
              className="text-4xl md:text-5xl mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              {activeTab === 'services' 
                ? 'The TOP 100 Capital Exchange'
                : 'Where Aerospace Excellence Meets Opportunity'
              }
            </h1>

            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {activeTab === 'services'
                ? 'Expert coaching, consulting, and technical services from TOP 100 professionals and community talent.'
                : 'The premier talent platform connecting recognized aerospace leaders with industry-leading employers.'
              }
            </p>

            {/* Tabs */}
            <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'services' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Services
              </button>
              <button
                onClick={() => setActiveTab('talent')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'talent' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Talent & Jobs
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'services' ? <ServicesTab /> : <TalentTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}