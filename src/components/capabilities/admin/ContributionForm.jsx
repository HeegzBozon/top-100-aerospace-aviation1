import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ContributionForm({ nominees, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    nominee_id: '',
    type: 'publication',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    external_links: [],
    tags: [],
    verified_by_nominee: false
  });

  const [linkInput, setLinkInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLink = () => {
    if (linkInput.trim()) {
      setFormData(prev => ({
        ...prev,
        external_links: [...(prev.external_links || []), linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      external_links: prev.external_links.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nominee */}
      <div className="space-y-2">
        <Label htmlFor="nominee">Nominee *</Label>
        <Select value={formData.nominee_id} onValueChange={(value) => handleChange('nominee_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select nominee" />
          </SelectTrigger>
          <SelectContent>
            {nominees.map(n => (
              <SelectItem key={n.id} value={n.id}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patent">Patent</SelectItem>
            <SelectItem value="publication">Publication</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="award">Award</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="mission">Mission</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
            <SelectItem value="mentorship">Mentorship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Contribution title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Detailed description"
          rows={4}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <Label>External Links</Label>
        <div className="flex gap-2">
          <Input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://..."
            onKeyPress={(e) => e.key === 'Enter' && addLink()}
          />
          <Button type="button" onClick={addLink} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.external_links || []).map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded text-sm">
              <span className="truncate max-w-xs">{link}</span>
              <button type="button" onClick={() => removeLink(idx)} className="text-red-600 hover:text-red-700">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button type="button" onClick={addTag} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.tags || []).map((tag, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {tag}
              <button type="button" onClick={() => removeTag(idx)} className="hover:text-blue-900">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Contribution</Button>
      </div>
    </form>
  );
}