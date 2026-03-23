import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Briefcase, Lightbulb, Code, Palette, Target, 
  Users, BookOpen, Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  skyBlue: '#4a90b8',
};

const CATEGORIES = [
  { id: 'Consulting', label: 'Consulting', icon: Briefcase, color: '#3b82f6', description: 'Strategic advisory and business consulting' },
  { id: 'Coaching', label: 'Coaching', icon: Target, color: '#8b5cf6', description: 'Career and executive coaching' },
  { id: 'Technical', label: 'Technical', icon: Code, color: '#10b981', description: 'Engineering and technical expertise' },
  { id: 'Design', label: 'Design', icon: Palette, color: '#f59e0b', description: 'UX, product, and visual design' },
  { id: 'Strategy', label: 'Strategy', icon: Lightbulb, color: '#ef4444', description: 'Business strategy and planning' },
  { id: 'Mentorship', label: 'Mentorship', icon: Users, color: '#06b6d4', description: 'One-on-one mentorship programs' },
  { id: 'Other', label: 'Other Services', icon: BookOpen, color: '#6366f1', description: 'Specialized and unique offerings' },
];

export default function ServiceCategories() {
  const { data: services } = useQuery({
    queryKey: ['services-categories'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
    initialData: []
  });

  const getCategoryCount = (categoryId) => {
    return services.filter(s => s.category?.includes(categoryId)).length;
  };

  const featuredServices = services.filter(s => s.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero */}
      <div 
        className="relative py-16 text-white"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: brandColors.skyBlue }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: brandColors.goldPrestige }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
              <span className="text-sm uppercase tracking-widest" style={{ color: brandColors.goldPrestige }}>
                Service Categories
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse by Expertise
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Find the perfect service from industry-leading professionals across specialized categories.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => {
            const count = getCategoryCount(cat.id);
            const Icon = cat.icon;
            
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`${createPageUrl('TalentExchange')}?tab=services&category=${cat.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                    <CardContent className="p-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                        style={{ background: `${cat.color}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: cat.color }} />
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                        {cat.label}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        {cat.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{count} services</Badge>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                Featured Services
              </h2>
              <Link to={createPageUrl('TalentExchange') + '?tab=services'}>
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Link key={service.id} to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5">
                      <Badge className="mb-3" style={{ background: brandColors.goldPrestige, color: 'white' }}>
                        <Sparkles className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                      <h3 className="font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color: brandColors.goldPrestige }}>
                          ${service.base_price}
                        </span>
                        <span className="text-xs text-slate-400">
                          {service.duration_minutes}min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center p-10 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-3" style={{ color: brandColors.navyDeep }}>
            Ready to offer your expertise?
          </h2>
          <p className="text-slate-500 mb-6 max-w-xl mx-auto">
            Join our network of industry professionals and start offering your services to the TOP 100 community.
          </p>
          <Link to={createPageUrl('ProviderApplication')}>
            <Button size="lg" style={{ background: brandColors.navyDeep }}>
              Become a Provider
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}