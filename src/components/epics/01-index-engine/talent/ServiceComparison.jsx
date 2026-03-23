import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServiceComparison({ services, onRemove }) {
  if (!services || services.length < 2) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-500">Select at least 2 services to compare</p>
      </Card>
    );
  }

  const features = [
    { key: 'base_price', label: 'Price', format: (v) => `$${v}` },
    { key: 'duration_minutes', label: 'Duration', format: (v) => `${v} min` },
    { key: 'provider_type', label: 'Provider', format: (v) => v === 'platform' ? 'Official' : 'Community' },
    { key: 'is_verified', label: 'Verified', format: (v) => v },
    { key: 'is_featured', label: 'Featured', format: (v) => v },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4 bg-slate-50 font-medium text-slate-500 text-sm">Feature</th>
            {services.map((service) => (
              <th key={service.id} className="p-4 bg-slate-50 min-w-[200px]">
                <div className="space-y-2">
                  <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
                    {service.title}
                  </h3>
                  {service.is_featured && (
                    <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
                      <Star className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                  )}
                  {onRemove && (
                    <Button size="sm" variant="ghost" onClick={() => onRemove(service.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.key} className="border-b">
              <td className="p-4 font-medium text-slate-600">{feature.label}</td>
              {services.map((service) => {
                const value = service[feature.key];
                return (
                  <td key={service.id} className="p-4 text-center">
                    {typeof value === 'boolean' ? (
                      value ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )
                    ) : (
                      <span className="font-medium">{feature.format(value)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-b">
            <td className="p-4 font-medium text-slate-600">Categories</td>
            {services.map((service) => (
              <td key={service.id} className="p-4 text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {service.category?.map((cat, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4"></td>
            {services.map((service) => (
              <td key={service.id} className="p-4 text-center">
                <Link to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>
                  <Button style={{ background: brandColors.navyDeep }}>
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}