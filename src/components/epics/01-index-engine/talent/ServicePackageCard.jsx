import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServicePackageCard({ pkg, service, onPurchase }) {
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('createCheckoutSession', {
        packageId: pkg.id,
        serviceId: pkg.service_id,
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });

  const savings = service?.base_price 
    ? (service.base_price * pkg.session_count - pkg.total_price).toFixed(0)
    : 0;

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {pkg.discount_percent >= 20 && (
        <div 
          className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: brandColors.goldPrestige }}
        >
          <Sparkles className="w-3 h-3 inline mr-1" />
          BEST VALUE
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          <CardTitle className="text-lg" style={{ color: brandColors.navyDeep }}>
            {pkg.name}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span 
              className="text-3xl font-bold"
              style={{ color: brandColors.navyDeep }}
            >
              ${pkg.total_price}
            </span>
            {pkg.discount_percent > 0 && (
              <span className="text-sm text-slate-400 line-through">
                ${(service?.base_price * pkg.session_count).toFixed(0)}
              </span>
            )}
          </div>
          {pkg.discount_percent > 0 && (
            <Badge 
              className="mt-2"
              style={{ backgroundColor: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
            >
              Save {pkg.discount_percent}% (${savings})
            </Badge>
          )}
        </div>

        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {pkg.session_count} sessions included
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            ${(pkg.total_price / pkg.session_count).toFixed(0)} per session
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Valid for {pkg.valid_days} days
          </li>
        </ul>

        <Button
          className="w-full"
          onClick={() => purchaseMutation.mutate()}
          disabled={purchaseMutation.isPending}
          style={{ backgroundColor: brandColors.navyDeep }}
        >
          {purchaseMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Purchase Package'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}