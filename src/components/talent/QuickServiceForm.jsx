import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, CheckCircle, Sparkles } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const CATEGORIES = [
  'Consulting',
  'Coaching',
  'Technical',
  'Design',
  'Strategy',
  'Mentorship',
  'Other'
];

export default function QuickServiceForm({ userEmail, onSuccess }) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    base_price: '',
    duration_minutes: '60',
    category: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create({
      ...data,
      provider_user_email: userEmail,
      provider_type: 'community',
      is_active: true,
      price_model: 'fixed',
      base_price: parseFloat(data.base_price),
      duration_minutes: parseInt(data.duration_minutes),
      category: data.category ? [data.category] : []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-services']);
      setShowSuccess(true);
      setFormData({ title: '', description: '', base_price: '', duration_minutes: '60', category: '' });
      setTimeout(() => {
        setShowSuccess(false);
        setIsExpanded(false);
        onSuccess?.();
      }, 2000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.base_price) return;
    createMutation.mutate(formData);
  };

  if (showSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-8 text-center">
          <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-2" />
          <p className="font-medium text-green-700">Service Created!</p>
        </CardContent>
      </Card>
    );
  }

  if (!isExpanded) {
    return (
      <Card 
        className="border-dashed border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Quick Add Service</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          Add New Service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Service title (e.g., 'Career Strategy Session')"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Textarea
              placeholder="Brief description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Price (USD)</label>
              <Input
                type="number"
                placeholder="99"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                required
                min="0"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Duration</label>
              <Select
                value={formData.duration_minutes}
                onValueChange={(v) => setFormData(prev => ({ ...prev, duration_minutes: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.title || !formData.base_price}
              style={{ background: brandColors.goldPrestige, color: 'white' }}
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Create Service</>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}