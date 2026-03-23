import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { createFeaturedServiceCheckout } from '@/functions/createFeaturedServiceCheckout';

const brandColors = {
  goldPrestige: '#c9a87c',
};

export default function FeatureServiceButton({ serviceId, className }) {
  const [loading, setLoading] = useState(false);

  const handleFeature = async () => {
    setLoading(true);
    try {
      const response = await createFeaturedServiceCheckout({ service_id: serviceId });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Feature checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFeature}
      disabled={loading}
      size="sm"
      className={className}
      style={{ background: brandColors.goldPrestige, color: 'white' }}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <>
          <Star className="w-3 h-3 mr-1" />
          Feature $29
        </>
      )}
    </Button>
  );
}