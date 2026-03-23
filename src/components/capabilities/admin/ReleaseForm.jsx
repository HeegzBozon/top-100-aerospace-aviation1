import { useState } from 'react';
import { Release } from '@/entities/Release';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, X, Loader2, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function ReleaseForm({ release, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: release?.name || '',
    target_release_date: release?.target_release_date ? new Date(release.target_release_date) : null,
    status: release?.status || 'planning',
    safe_readiness_score: release?.safe_readiness_score || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.target_release_date) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const payload = {
        ...formData,
        target_release_date: formData.target_release_date.toISOString().split('T')[0],
        safe_readiness_score: Number(formData.safe_readiness_score),
    };

    try {
      if (release) {
        await Release.update(release.id, payload);
      } else {
        await Release.create(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save release:", error);
      alert('Error saving release.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{release ? 'Edit Release' : 'Create New Release'}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Input 
            value={formData.name} 
            onChange={(e) => handleFormChange('name', e.target.value)} 
            placeholder="Release Name (e.g., Q3 2024 Major Release)"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_release_date ? format(formData.target_release_date, 'PPP') : 'Target Release Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.target_release_date}
                    onSelect={(date) => handleFormChange('target_release_date', date)}
                  />
                </PopoverContent>
              </Popover>

              <Select value={formData.status} onValueChange={(v) => handleFormChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="tracking">Tracking</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="ready_for_release">Ready for Release</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SAFe Readiness Score (%)</label>
            <Input 
                type="number"
                min="0"
                max="100"
                value={formData.safe_readiness_score}
                onChange={(e) => handleFormChange('safe_readiness_score', e.target.value)}
                placeholder="0-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Release</>}
          </Button>
        </div>
      </form>
    </div>
  );
}