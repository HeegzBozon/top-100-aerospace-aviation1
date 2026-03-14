import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Plus, Percent, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ServicePackages({ serviceId, basePrice, providerEmail, isProvider = false }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', session_count: 5, discount_percent: 15 });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['service-packages', serviceId],
    queryFn: () => base44.entities.ServicePackage.filter({ service_id: serviceId, is_active: true }),
    enabled: !!serviceId,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const totalPrice = (basePrice * form.session_count) * (1 - form.discount_percent / 100);
      return base44.entities.ServicePackage.create({
        service_id: serviceId,
        provider_email: providerEmail,
        name: form.name || `${form.session_count}-Session Package`,
        session_count: form.session_count,
        total_price: Math.round(totalPrice * 100) / 100,
        discount_percent: form.discount_percent
      });
    },
    onSuccess: () => {
      toast.success('Package created');
      queryClient.invalidateQueries(['service-packages', serviceId]);
      setShowCreate(false);
      setForm({ name: '', session_count: 5, discount_percent: 15 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServicePackage.update(id, { is_active: false }),
    onSuccess: () => {
      toast.success('Package removed');
      queryClient.invalidateQueries(['service-packages', serviceId]);
    }
  });

  const calculatedPrice = (basePrice * form.session_count) * (1 - form.discount_percent / 100);
  const savings = (basePrice * form.session_count) - calculatedPrice;

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Package className="w-5 h-5" />
          Session Packages
        </h3>
        {isProvider && (
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Package
          </Button>
        )}
      </div>

      {packages.length === 0 ? (
        <p className="text-sm text-slate-400">No packages available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="border-2 hover:border-amber-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{pkg.name}</h4>
                    <p className="text-sm text-slate-500">{pkg.session_count} sessions</p>
                  </div>
                  <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
                    <Percent className="w-3 h-3 mr-1" />
                    {pkg.discount_percent}% off
                  </Badge>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                      ${pkg.total_price}
                    </span>
                    <span className="text-sm text-slate-400 line-through ml-2">
                      ${(basePrice * pkg.session_count).toFixed(0)}
                    </span>
                  </div>
                  {isProvider ? (
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(pkg.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button size="sm" style={{ background: brandColors.navyDeep }}>
                      Buy Package
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Package Name</label>
              <Input
                placeholder="e.g. 5-Session Bundle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sessions</label>
                <Input
                  type="number"
                  min={2}
                  value={form.session_count}
                  onChange={(e) => setForm({ ...form, session_count: parseInt(e.target.value) || 2 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <Input
                  type="number"
                  min={5}
                  max={50}
                  value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Regular price:</span>
                <span className="line-through">${(basePrice * form.session_count).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Package price:</span>
                <span style={{ color: brandColors.goldPrestige }}>${calculatedPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Client saves:</span>
                <span>${savings.toFixed(0)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} style={{ background: brandColors.navyDeep }}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}