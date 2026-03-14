import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  goldPrestige: '#c9a87c',
  navyDeep: '#1e3a5a',
};

export default function ServiceReviews({ serviceId, limit = 5 }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['service-reviews', serviceId],
    queryFn: () => base44.entities.Review.filter({ service_id: serviceId }),
    enabled: !!serviceId,
    initialData: []
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-slate-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            <Star className="w-6 h-6" fill={brandColors.goldPrestige} stroke={brandColors.goldPrestige} />
            <span className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{avgRating}</span>
          </div>
          <span className="text-slate-500">({reviews.length} reviews)</span>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, limit).map((review) => (
            <Card key={review.id} className="border-slate-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{review.reviewer_email?.split('@')[0]}</span>
                      {review.is_verified && (
                        <Badge variant="outline" className="ml-2 text-xs text-green-600 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {format(new Date(review.created_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4"
                      fill={review.rating >= star ? brandColors.goldPrestige : 'transparent'}
                      stroke={review.rating >= star ? brandColors.goldPrestige : '#e2e8f0'}
                    />
                  ))}
                </div>

                {review.title && (
                  <h4 className="font-medium mb-1" style={{ color: brandColors.navyDeep }}>{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-sm text-slate-600">{review.comment}</p>
                )}

                {/* Provider Response */}
                {review.provider_response && (
                  <div className="mt-3 pl-4 border-l-2 border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Provider Response</p>
                    <p className="text-sm text-slate-600">{review.provider_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}