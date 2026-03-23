import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServiceTestimonials({ serviceId, limit = 5 }) {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['service-testimonials', serviceId],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ 
        service_id: serviceId,
        is_approved: true 
      });
      return all.slice(0, limit);
    },
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
        </CardContent>
      </Card>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const featuredTestimonials = testimonials.filter(t => t.is_featured);
  const regularTestimonials = testimonials.filter(t => !t.is_featured);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Quote className="w-5 h-5" />
          Client Testimonials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Featured Testimonials */}
        {featuredTestimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border-2"
            style={{ borderColor: brandColors.goldPrestige, backgroundColor: `${brandColors.goldPrestige}08` }}
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={testimonial.avatar_url} />
                <AvatarFallback style={{ backgroundColor: brandColors.navyDeep, color: 'white' }}>
                  {testimonial.client_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: brandColors.navyDeep }}>
                      {testimonial.client_name || 'Client'}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
                    >
                      Featured
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-current" 
                        style={{ color: brandColors.goldPrestige }} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 italic">"{testimonial.content}"</p>
                {testimonial.created_date && (
                  <p className="text-xs text-slate-500 mt-2">
                    {format(new Date(testimonial.created_date), 'MMMM yyyy')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Regular Testimonials */}
        {regularTestimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (featuredTestimonials.length + index) * 0.1 }}
            className="p-4 rounded-lg bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={testimonial.avatar_url} />
                <AvatarFallback className="text-xs" style={{ backgroundColor: brandColors.navyDeep, color: 'white' }}>
                  {testimonial.client_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm" style={{ color: brandColors.navyDeep }}>
                    {testimonial.client_name || 'Client'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-3 h-3 fill-current" 
                        style={{ color: brandColors.goldPrestige }} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600">"{testimonial.content}"</p>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}