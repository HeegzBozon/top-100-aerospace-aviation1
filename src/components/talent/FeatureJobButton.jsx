import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { createFeaturedJobCheckout } from '@/functions/createFeaturedJobCheckout';

const brandColors = {
  goldPrestige: '#c9a87c',
};

export default function FeatureJobButton({ jobId, jobTitle, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleFeature = async () => {
    setLoading(true);
    try {
      const { data } = await createFeaturedJobCheckout({
        job_id: jobId,
        success_url: `${window.location.origin}/EmployerDashboard?featured_success=true&job_id=${jobId}`,
        cancel_url: `${window.location.origin}/EmployerDashboard`
      });

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Feature checkout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFeature}
      disabled={loading}
      size="sm"
      className="gap-1"
      style={{ background: brandColors.goldPrestige, color: 'white' }}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Star className="w-3 h-3" />
      )}
      Feature $49
    </Button>
  );
}