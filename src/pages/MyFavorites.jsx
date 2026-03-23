import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Briefcase, Star, Clock, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton from '@/components/talent/FavoriteButton';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function MyFavorites() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me(),
  });

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['my-favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const serviceFavoriteIds = favorites.filter(f => f.target_type === 'service').map(f => f.target_id);
  const jobFavoriteIds = favorites.filter(f => f.target_type === 'job').map(f => f.target_id);

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['favorite-services', serviceFavoriteIds],
    queryFn: async () => {
      if (serviceFavoriteIds.length === 0) return [];
      const allServices = await base44.entities.Service.list();
      return allServices.filter(s => serviceFavoriteIds.includes(s.id));
    },
    enabled: serviceFavoriteIds.length > 0,
  });

  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['favorite-jobs', jobFavoriteIds],
    queryFn: async () => {
      if (jobFavoriteIds.length === 0) return [];
      const allJobs = await base44.entities.Job.list();
      return allJobs.filter(j => jobFavoriteIds.includes(j.id));
    },
    enabled: jobFavoriteIds.length > 0,
  });

  const isLoading = loadingFavorites || loadingServices || loadingJobs;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
          My Favorites
        </h1>
        <p className="text-slate-600 mt-2">Services and jobs you've saved for later</p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="services" className="gap-2">
            <Star className="w-4 h-4" />
            Services ({services.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Jobs ({jobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          {services.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600">No favorite services yet</h3>
              <p className="text-slate-500 mt-2">Browse services and click the heart to save them here</p>
              <Link to={createPageUrl('ServicesLanding')}>
                <Button className="mt-4" style={{ backgroundColor: brandColors.navyDeep }}>
                  Browse Services
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {service.image_url && (
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>
                            {service.title}
                          </h3>
                          <FavoriteButton 
                            userEmail={user?.email} 
                            targetType="service" 
                            targetId={service.id} 
                          />
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${service.base_price}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration_minutes}m
                            </span>
                          </div>
                          <Link to={createPageUrl('ServiceDetail') + `?id=${service.id}`}>
                            <Button size="sm" variant="ghost">
                              View <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          {jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600">No favorite jobs yet</h3>
              <p className="text-slate-500 mt-2">Browse job listings and save ones you're interested in</p>
              <Link to={createPageUrl('TalentExchange')}>
                <Button className="mt-4" style={{ backgroundColor: brandColors.navyDeep }}>
                  Browse Jobs
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
                          {job.title}
                        </h3>
                        <p className="text-slate-600 text-sm">{job.company_name}</p>
                      </div>
                      <FavoriteButton 
                        userEmail={user?.email} 
                        targetType="job" 
                        targetId={job.id} 
                      />
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {job.location && (
                          <Badge variant="outline">{job.location}</Badge>
                        )}
                        {job.employment_type && (
                          <Badge variant="outline">{job.employment_type}</Badge>
                        )}
                      </div>
                      <Link to={createPageUrl('JobDetail') + `?id=${job.id}`}>
                        <Button size="sm" variant="ghost">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}