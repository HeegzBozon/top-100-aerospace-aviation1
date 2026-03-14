import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import ReviewResponseForm from './ReviewResponseForm';

const brandColors = {
  goldPrestige: '#c9a87c',
  navyDeep: '#1e3a5a',
};

export default function ProviderReviewsManager({ providerEmail }) {
  const [respondingTo, setRespondingTo] = useState(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['provider-reviews', providerEmail],
    queryFn: () => base44.entities.Review.filter({ provider_email: providerEmail }),
    enabled: !!providerEmail,
    initialData: []
  });

  const unreplied = reviews.filter(r => !r.provider_response);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-slate-100 rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            Reviews ({reviews.length})
          </CardTitle>
          {avgRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" fill={brandColors.goldPrestige} stroke={brandColors.goldPrestige} />
              <span className="font-bold">{avgRating}</span>
            </div>
          )}
        </div>
        {unreplied.length > 0 && (
          <p className="text-sm text-amber-600">{unreplied.length} awaiting your response</p>
        )}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No reviews yet</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{review.reviewer_email?.split('@')[0]}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star 
                            key={s} 
                            className="w-3 h-3" 
                            fill={review.rating >= s ? brandColors.goldPrestige : 'transparent'}
                            stroke={review.rating >= s ? brandColors.goldPrestige : '#cbd5e1'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {format(new Date(review.created_date), 'MMM d')}
                  </span>
                </div>

                {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}

                {/* Provider Response */}
                {review.provider_response ? (
                  <div className="mt-3 pl-3 border-l-2 border-slate-300">
                    <p className="text-xs text-slate-500 mb-1">Your response</p>
                    <p className="text-sm text-slate-600">{review.provider_response}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-1 h-6 text-xs"
                      onClick={() => setRespondingTo(review.id)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 gap-1"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="w-3 h-3" /> Respond
                  </Button>
                )}

                {respondingTo === review.id && (
                  <ReviewResponseForm 
                    review={review} 
                    onClose={() => setRespondingTo(null)} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}