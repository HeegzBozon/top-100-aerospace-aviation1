
import { useState, useEffect } from 'react';
import { Initiative } from '@/entities/Initiative';
import { Capability } from '@/entities/Capability';
import { Feature } from '@/entities/Feature';
import { Feedback } from '@/entities/Feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { X, Loader2 } from 'lucide-react';

const levelConfig = {
  portfolio: { entity: Initiative, name: 'Initiative (Epic)', parentLevel: null },
  solution: { entity: Capability, name: 'Capability', parentEntity: Initiative, parentField: 'initiative_id', parentName: 'Initiative' },
  art: { entity: Feature, name: 'Feature', parentEntity: Capability, parentField: 'capability_id', parentName: 'Capability' },
  team: { entity: Feedback, name: 'Story', parentEntity: Feature, parentField: 'feature_id', parentName: 'Feature' },
};

export default function BacklogItemForm({ item, level, parentItem, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    status: item?.status || 'funnel',
    business_value: item?.business_value || 1,
    time_criticality: item?.time_criticality || 1,
    risk_reduction: item?.risk_reduction || 1,
    job_size: item?.job_size || 1,
    parent_id: item?.[levelConfig[level]?.parentField] || parentItem?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const { toast } = useToast();

  const config = levelConfig[level];

  useEffect(() => {
    const fetchParentOptions = async () => {
        if (config.parentEntity) {
            try {
                const options = await config.parentEntity.list();
                setParentOptions(options);
            } catch (error) {
                console.error(`Failed to load ${config.parentName}s:`, error);
            }
        }
    };
    fetchParentOptions();
  }, [level, config.parentEntity, config.parentName]); // Added dependencies to useEffect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { business_value, time_criticality, risk_reduction, job_size, parent_id, ...restOfData } = formData;
    const wsjf_score = job_size > 0 ? (business_value + time_criticality + risk_reduction) / job_size : 0;
    
    let payload = { ...restOfData, business_value, time_criticality, risk_reduction, job_size, wsjf_score };
    if (config.parentField && parent_id) {
        payload[config.parentField] = parent_id;
    }
    
    // Special handling for 'team' level which is a Feedback entity
    if (level === 'team') {
        payload.type = item?.type || 'user_story'; // Default to user_story
        payload.subject = payload.name; // Map name to subject
        delete payload.name;
        payload.user_email = item?.user_email || 'system@base44.io'; // Placeholder
    }


    try {
      if (item) {
        await config.entity.update(item.id, payload);
      } else {
        await config.entity.create(payload);
      }
      toast({ title: `${config.name} Saved`, description: 'The item has been successfully saved.' });
      onSuccess();
    } catch (error) {
      console.error(`Error saving ${config.name}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Could not save ${config.name}.` });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const isNumeric = ['business_value', 'time_criticality', 'risk_reduction', 'job_size'].includes(field);
    setFormData(prev => ({ ...prev, [field]: isNumeric ? Number(value) : value }));
  };

  const statusOptions = {
      portfolio: ["funnel", "reviewing", "analyzing", "portfolio_backlog", "implementing", "done"],
      solution: ["funnel", "analyzing", "backlog", "implementing", "done"],
      art: ["funnel", "analyzing", "backlog", "implementing", "validating", "done"],
      team: ["new", "under_consideration", "planned", "in_progress", "resolved", "rejected"],
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {item ? `Edit ${config.name}` : `Create New ${config.name}`}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {config.parentEntity && (
            <div>
                <label className="block text-sm font-medium mb-2">Parent {config.parentName}</label>
                <Select value={formData.parent_id} onValueChange={(value) => handleInputChange('parent_id', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Select parent ${config.parentName}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {parentOptions.map(option => (
                            <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>
           <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select status"/>
                </SelectTrigger>
                <SelectContent>
                    {statusOptions[level].map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <h3 className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">WSJF Scoring</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Business Value</label>
              <Input type="number" value={formData.business_value} onChange={(e) => handleInputChange('business_value', e.target.value)} min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Criticality</label>
              <Input type="number" value={formData.time_criticality} onChange={(e) => handleInputChange('time_criticality', e.target.value)} min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Risk Reduction</label>
              <Input type="number" value={formData.risk_reduction} onChange={(e) => handleInputChange('risk_reduction', e.target.value)} min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Size</label>
              <Input type="number" value={formData.job_size} onChange={(e) => handleInputChange('job_size', e.target.value)} min="1" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
