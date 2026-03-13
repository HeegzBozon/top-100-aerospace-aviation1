import React, { useState } from 'react';
import { Initiative } from '@/entities/Initiative';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2, Zap } from 'lucide-react';

export default function InitiativeForm({ keyResultId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter an initiative name.');
      return;
    }

    setLoading(true);

    try {
      await Initiative.create({
        key_result_id: keyResultId,
        name: formData.name,
        description: formData.description,
        status: 'not_started',
        linked_feedback_ids: []
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating Initiative:', error);
      alert('Failed to create Initiative.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create Initiative</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">Actions necessary to achieve the results you seek:</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Initiative Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="e.g., Publish 20 magazine/blog posts"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Detailed description of the initiative..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Initiative'}
          </Button>
        </div>
      </form>
    </div>
  );
}