import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Coins, Clock, DollarSign, Save } from "lucide-react";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const unitTypes = [
  { value: 'advisory_hour', label: '1-Hour Advisory Session' },
  { value: 'design_sprint', label: 'Design Sprint' },
  { value: 'audit', label: 'Audit / Review' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentorship_session', label: 'Mentorship Session' },
  { value: 'technical_review', label: 'Technical Review' },
  { value: 'custom', label: 'Custom Unit' },
];

const categories = [
  'Consulting', 'Technical', 'Leadership', 'Design', 
  'Mentorship', 'Strategy', 'Operations', 'Engineering'
];

export default function ServiceUnitForm({ existingUnit, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: existingUnit?.title || '',
    description: existingUnit?.description || '',
    unit_type: existingUnit?.unit_type || 'advisory_hour',
    xc_cost: existingUnit?.xc_cost || 50,
    reference_value_usd: existingUnit?.reference_value_usd || 250,
    duration_minutes: existingUnit?.duration_minutes || 60,
    category: existingUnit?.category || [],
    max_monthly_redemptions: existingUnit?.max_monthly_redemptions || 10,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (existingUnit) {
        return base44.entities.ServiceUnit.update(existingUnit.id, data);
      }
      return base44.entities.ServiceUnit.create(data);
    },
    onSuccess: () => {
      toast.success(existingUnit ? 'Service unit updated!' : 'Service unit created!');
      queryClient.invalidateQueries({ queryKey: ['service-units'] });
      queryClient.invalidateQueries({ queryKey: ['my-service-units'] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.xc_cost) {
      toast.error('Please fill in required fields');
      return;
    }
    mutation.mutate(formData);
  };

  const toggleCategory = (cat) => {
    const current = formData.category || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, category: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, category: [...current, cat] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Strategic Advisory Session"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what's included in this service unit..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Unit Type</label>
          <Select 
            value={formData.unit_type} 
            onValueChange={(v) => setFormData({ ...formData, unit_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration (minutes)
          </label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
            min={15}
            max={480}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            XC Cost *
          </label>
          <Input
            type="number"
            value={formData.xc_cost}
            onChange={(e) => setFormData({ ...formData, xc_cost: parseInt(e.target.value) || 0 })}
            min={1}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Exchange Credits to redeem</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Reference Value (USD)
          </label>
          <Input
            type="number"
            value={formData.reference_value_usd}
            onChange={(e) => setFormData({ ...formData, reference_value_usd: parseInt(e.target.value) || 0 })}
            min={0}
          />
          <p className="text-xs text-slate-500 mt-1">For anchoring, not payment</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                formData.category?.includes(cat)
                  ? 'text-white'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
              style={formData.category?.includes(cat) ? { 
                background: brandColors.navyDeep, 
                borderColor: brandColors.navyDeep 
              } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Monthly Redemptions</label>
        <Input
          type="number"
          value={formData.max_monthly_redemptions}
          onChange={(e) => setFormData({ ...formData, max_monthly_redemptions: parseInt(e.target.value) || 10 })}
          min={1}
          max={100}
        />
        <p className="text-xs text-slate-500 mt-1">Limit how many times this can be redeemed per month</p>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="flex-1"
          style={{ background: brandColors.navyDeep }}
        >
          <Save className="w-4 h-4 mr-2" />
          {existingUnit ? 'Update' : 'Create'} Service Unit
        </Button>
      </div>
    </form>
  );
}