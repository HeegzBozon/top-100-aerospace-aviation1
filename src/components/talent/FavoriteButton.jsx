import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoriteButton({ userEmail, targetType, targetId, size = 'icon' }) {
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: ['favorites', userEmail],
    queryFn: () => base44.entities.Favorite.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const isFavorited = favorites.some(f => f.target_type === targetType && f.target_id === targetId);
  const favoriteRecord = favorites.find(f => f.target_type === targetType && f.target_id === targetId);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited && favoriteRecord) {
        await base44.entities.Favorite.delete(favoriteRecord.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: userEmail,
          target_type: targetType,
          target_id: targetId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites', userEmail]);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    }
  });

  if (!userEmail) return null;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMutation.mutate();
      }}
      disabled={toggleMutation.isPending}
      className={`${isFavorited ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
    >
      {toggleMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      )}
    </Button>
  );
}