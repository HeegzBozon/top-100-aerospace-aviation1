import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Job } from '@/entities/Job';
import { Employer } from '@/entities/Employer';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Briefcase, Building2, MapPin, Clock, DollarSign, 
  Shield, Star, Zap, Filter, ChevronRight, Users, Sparkles, User as UserIcon, Send
} from 'lucide-react';
import { IntroRequestModal } from '@/components/epics/01-index-engine/talent';
import { VerifiedBadge } from '@/components/epics/01-index-engine/talent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// ============ SERVICES TAB ============
const ServiceCard = ({ service, onRequestIntro }) => {
  const isPlatform = service.provider_type === 'platform';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        service.is_featured 
          ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200 ring-2 ring-amber-100' 
          : isPlatform 
          ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200/50' 
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="absolute top-2 right-2 md:top-3 md:right-3 flex gap-1 md:gap-2">
        {service.is_featured && (
          <Badge className="bg-amber-500 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
            Featured
          </Badge>
        )}
        {isPlatform && !service.is_featured && (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1">
            <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
            Official
          </Badge>
        )}
        {service.is_verified && <VerifiedBadge type="provider" size="xs" />}
      </div>

      <div className="p-4 md:p-6">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl mb-3 md:mb-4 flex items-center justify-center ${
          isPlatform ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
        }`}>
           <Star className="w-5 h-5 md:w-6 md:h-6" />
        </div>

        <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1 md:mb-2 line-clamp-1">
          {service.title}
        </h3>
        
        <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4 line-clamp-2 h-8 md:h-10">
          {service.description}
        </p>

        <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-slate-500 mb-4 md:mb-6">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {service.duration_minutes}m
          </div>
          <div className="flex items-center gap-1">
            <UserIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {isPlatform ? 'TOP 100' : 'Community Pro'}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="text-sm md:text-lg font-bold text-slate-900">
            ${service.base_price}
          </div>
          <div className="flex gap-1 md:gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => { e.preventDefault(); onRequestIntro(service); }}
              className="gap-1 text-xs px-2 md:px-3 h-7 md:h-8"
            >
              <Send className="w-2.5 h-2.5 md:w-3 md:h-3" /> Intro
            </Button>
            <Link to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>
              <Button size="sm" variant={isPlatform ? "default" : "outline"} className={`text-xs px-2 md:px-3 h-7 md:h-8 ${isPlatform ? "bg-[#1e3a5a]" : ""}`}>
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function ServicesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [category, setCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [introModal, setIntroModal] = useState({ open: false, service: null });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
    initialData: []
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || service.provider_type === filterType;
    const matchesCategory = category === "All Categories" || service.category?.includes(category);
    const matchesPrice = service.base_price >= priceRange[0] && 
                         (priceRange[1] >= 1000 || service.base_price <= priceRange[1]);
    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    // Featured services first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  const activeFiltersCount = [
    searchTerm,
    filterType !== 'all',
    category !== 'All Categories',
    priceRange[0] > 0 || priceRange[1] < 1000
  ].filter(Boolean).length;

  const handleRequestIntro = (service) => {
    setIntroModal({ open: true, service });
  };

  return (
    <div className="py-4 md:py-8">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-4 mb-4 md:mb-8">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search services..."
              className="pl-9 h-9 md:h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1 h-9 md:h-10 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {['All Categories', 'Consulting', 'Coaching', 'Technical', 'Design', 'Strategy', 'Mentorship', 'Other'].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1 h-9 md:h-10 text-sm">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="platform">Official</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setCategory('All Categories');
                  setPriceRange([0, 1000]);
                }}
                className="text-slate-500 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-slate-900">Available Services</h2>
        <span className="text-xs md:text-sm text-slate-500">{filteredServices.length} results</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 md:h-72 bg-slate-200 rounded-xl md:rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRequestIntro={handleRequestIntro} />
            ))}
          </div>
        )}

        {/* Intro Request Modal for Services */}
        {introModal.service && (
          <IntroRequestModal
            isOpen={introModal.open}
            onClose={() => setIntroModal({ open: false, service: null })}
            targetType="service"
            targetId={introModal.service.id}
            targetTitle={introModal.service.title}
            recipientEmail={introModal.service.provider_user_email}
            companyName={introModal.service.provider_type === 'platform' ? 'TOP 100' : 'the provider'}
          />
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

      {/* CTA Section */}
      <div className="mt-8 md:mt-16 bg-white rounded-xl md:rounded-2xl border border-slate-200 p-6 md:p-10 text-center">
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">
          Have a skill to share?
        </h2>
        <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 max-w-xl mx-auto">
          Join our curated network of experts. Offer your services and reach the top talent in aerospace and aviation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link to={createPageUrl('MissionControl') + '?module=provider'}>
            <Button size="default" className="bg-[#1e3a5a] hover:bg-[#2c4a6e] w-full sm:w-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              Post a Service
            </Button>
          </Link>
          <Link to={createPageUrl('ProviderApplication')}>
            <Button size="default" variant="outline" className="w-full sm:w-auto">
              New Provider? Apply Here
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============ JOBS TAB ============
function JobCard({ job, employer, onRequestIntro }) {
  const experienceLabels = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior',
    executive: 'Executive',
    intern: 'Internship'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all group"
      style={{ borderColor: '#e2e8f0' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {employer?.logo_url ? (
            <img src={employer.logo_url} alt={employer.company_name} className="w-14 h-14 rounded-lg object-contain border" />
          ) : (
            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
              <Building2 className="w-6 h-6" style={{ color: brandColors.navyDeep }} />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>{job.title}</h3>
              {job.featured && (
                <Badge className="text-xs" style={{ background: brandColors.goldPrestige, color: 'white' }}>
                  <Star className="w-3 h-3 mr-1" /> Featured
                </Badge>
              )}
              {job.urgent && (
                <Badge className="text-xs bg-red-500 text-white">
                  <Zap className="w-3 h-3 mr-1" /> Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">{employer?.company_name || 'Company'}</p>
            
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {experienceLabels[job.experience_level] || job.experience_level}
              </span>
              {job.remote_policy !== 'onsite' && (
                <Badge variant="outline" className="text-xs">{job.remote_policy}</Badge>
              )}
              {job.security_clearance && job.security_clearance !== 'none' && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Shield className="w-4 h-4" /> Clearance Required
                </span>
              )}
            </div>

            {job.salary_display === 'show' && job.salary_min && (
              <div className="flex items-center gap-1 mt-2 text-sm font-medium" style={{ color: brandColors.goldPrestige }}>
                <DollarSign className="w-4 h-4" />
                ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString() || 'DOE'}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>

      {job.summary && (
        <p className="text-sm text-slate-600 mt-4 line-clamp-2">{job.summary}</p>
      )}

      {job.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {job.required_skills.slice(0, 5).map((skill, i) => (
            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
          ))}
          {job.required_skills.length > 5 && (
            <Badge variant="outline" className="text-xs">+{job.required_skills.length - 5}</Badge>
          )}
        </div>
      )}

      {/* Quick Intro Button */}
      <div className="mt-4 pt-4 border-t flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRequestIntro(job, employer); }}
          className="gap-1"
          style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
        >
          <Send className="w-3 h-3" /> Request Intro
        </Button>
      </div>
    </motion.div>
  );
}

function JobsTab() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    experience: 'all',
    remote: 'all',
    clearance: 'all'
  });
  const [introModal, setIntroModal] = useState({ open: false, job: null, employer: null });
  const [showFilters, setShowFilters] = useState(false);

  const handleJobIntro = (job, employer) => {
    setIntroModal({ open: true, job, employer });
  };

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-active'],
    queryFn: () => base44.entities.Job.filter({ status: 'active' }, '-posted_date', 50),
    initialData: []
  });

  const { data: employers } = useQuery({
    queryKey: ['employers-verified'],
    queryFn: async () => {
      const list = await base44.entities.Employer.filter({ verification_status: 'verified' });
      const map = {};
      list.forEach(e => map[e.id] = e);
      return map;
    },
    initialData: {}
  });

  const filteredJobs = jobs.filter(job => {
    if (search && !job.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.experience !== 'all' && job.experience_level !== filters.experience) return false;
    if (filters.remote !== 'all' && job.remote_policy !== filters.remote) return false;
    if (filters.clearance !== 'all') {
      if (filters.clearance === 'none' && job.security_clearance !== 'none') return false;
      if (filters.clearance === 'required' && job.security_clearance === 'none') return false;
    }
    return true;
  });

  const featuredJobs = filteredJobs.filter(j => j.featured);
  const regularJobs = filteredJobs.filter(j => !j.featured);

  return (
    <div className="py-4 md:py-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </span>
          <span className="text-xs text-slate-500">{filteredJobs.length} results</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl border p-6 sticky top-24" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
              <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>Filters</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Experience Level</label>
                <select 
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  className="w-full rounded-lg border p-2 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="intern">Internship</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Remote Policy</label>
                <select 
                  value={filters.remote}
                  onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
                  className="w-full rounded-lg border p-2 text-sm"
                >
                  <option value="all">All Options</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 block mb-2">Security Clearance</label>
                <select 
                  value={filters.clearance}
                  onChange={(e) => setFilters({ ...filters, clearance: e.target.value })}
                  className="w-full rounded-lg border p-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="none">No Clearance</option>
                  <option value="required">Clearance Required</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Link to={createPageUrl('MissionControl') + '?module=employer'}>
                <Button 
                  className="w-full"
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  For Employers
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <main className="flex-1">
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>{jobs.length} Open Positions</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>{Object.keys(employers).length} Verified Employers</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span>TOP 100 Network</span>
            </div>
          </div>

          {jobsLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <Star className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                    Featured Opportunities
                  </h2>
                  <div className="space-y-4">
                    {featuredJobs.map(job => (
                      <div key={job.id}>
                        <Link to={`${createPageUrl('JobDetail')}?id=${job.id}`}>
                          <JobCard job={job} employer={employers[job.employer_id]} onRequestIntro={handleJobIntro} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Jobs */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: brandColors.navyDeep }}>
                  {search ? `Results for "${search}"` : 'All Opportunities'}
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({regularJobs.length} positions)
                  </span>
                </h2>
                {regularJobs.length > 0 ? (
                  <div className="space-y-4">
                    {regularJobs.map(job => (
                      <div key={job.id}>
                        <Link to={`${createPageUrl('JobDetail')}?id=${job.id}`}>
                          <JobCard job={job} employer={employers[job.employer_id]} onRequestIntro={handleJobIntro} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">No positions found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Intro Request Modal for Jobs */}
          {introModal.job && (
            <IntroRequestModal
              isOpen={introModal.open}
              onClose={() => setIntroModal({ open: false, job: null, employer: null })}
              targetType="job"
              targetId={introModal.job.id}
              targetTitle={introModal.job.title}
              recipientEmail={introModal.job.poster_email || introModal.employer?.owner_email}
              companyName={introModal.employer?.company_name}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function TalentExchange() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'services';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Beta Banner */}
      <div className="sticky top-16 z-40 w-full">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full py-2 px-6"
          style={{
            background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`,
          }}
        >
          <div className="flex items-center justify-center gap-2 text-white text-sm">
            <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span>Talent Exchange Beta — Now Live</span>
          </div>
        </motion.div>
      </div>
      
      {/* Hero Section */}
      <div 
        className="relative text-white py-8 md:py-16 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10 hidden md:block">
          <div className="absolute top-10 left-10 w-48 md:w-72 h-48 md:h-72 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-10 right-10 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="text-xs md:text-sm uppercase tracking-widest"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                TOP 100 Talent Exchange
              </span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl md:text-5xl mb-3 md:mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              {activeTab === 'services' 
                ? 'Expert Services Marketplace'
                : 'Career Opportunities'
              }
            </h1>

            <p className="text-sm md:text-lg text-white/70 max-w-2xl mx-auto mb-6 md:mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {activeTab === 'services'
                ? 'Access coaching, consulting, and technical services from industry leaders.'
                : 'Discover opportunities at leading aerospace and aviation organizations.'
              }
            </p>

            {/* Tabs */}
            <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'services' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                Services
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'jobs' 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Briefcase className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                Jobs
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'services' ? <ServicesTab /> : <JobsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}