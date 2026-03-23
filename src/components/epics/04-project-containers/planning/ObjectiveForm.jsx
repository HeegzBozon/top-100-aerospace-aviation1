import { useState } from 'react';
import { Objective } from '@/entities/Objective';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2 } from 'lucide-react';

export default function ObjectiveForm({ objective, planId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: objective?.name || '',
    description: objective?.description || '',
    owner_email: objective?.owner_email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (objective) {
        await Objective.update(objective.id, formData);
      } else {
        await Objective.create({ ...formData, plan_id: planId });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save objective:", error);
      alert("An error occurred saving the objective.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{objective ? 'Edit' : 'Create'} Objective</h2>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} className="rounded-full"><X className="w-6 h-6" /></Button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Objective Name</label>
            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g., Improve User Onboarding" required />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="What is the high-level goal?" />
          </div>
          <div>
            <label className="text-sm font-medium">Owner Email</label>
            <Input type="email" value={formData.owner_email} onChange={e => handleChange('owner_email', e.target.value)} placeholder="e.g., product.lead@company.com" />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {objective ? 'Save Changes' : 'Create Objective'}
          </Button>
        </div>
      </form>
    </div>
  );
}