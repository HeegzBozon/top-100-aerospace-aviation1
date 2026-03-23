import { useState } from 'react';
import { KeyResult } from '@/entities/KeyResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';

export default function KeyResultForm({ kr, objectiveId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: kr?.name || '',
    metric_type: kr?.metric_type || 'percentage',
    start_value: kr?.start_value || 0,
    target_value: kr?.target_value || 100,
    current_value: kr?.current_value || kr?.start_value || 0,
    notes: kr?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            ...formData,
            start_value: Number(formData.start_value),
            target_value: Number(formData.target_value),
            current_value: Number(formData.current_value),
        }
      if (kr) {
        await KeyResult.update(kr.id, payload);
      } else {
        await KeyResult.create({ ...payload, objective_id: objectiveId });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save key result:", error);
      alert("An error occurred saving the key result.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{kr ? 'Edit' : 'Create'} Key Result</h2>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} className="rounded-full"><X className="w-6 h-6" /></Button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Key Result Name</label>
            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g., Increase activation rate" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Metric Type</label>
              <Select value={formData.metric_type} onValueChange={v => handleChange('metric_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Start Value</label>
              <Input type="number" value={formData.start_value} onChange={e => handleChange('start_value', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <Input type="number" value={formData.current_value} onChange={e => handleChange('current_value', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <Input type="number" value={formData.target_value} onChange={e => handleChange('target_value', e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {kr ? 'Save Changes' : 'Create Key Result'}
          </Button>
        </div>
      </form>
    </div>
  );
}