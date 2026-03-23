import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Clock, Calendar } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Default Partnership Hours',
    days_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    start_time: '12:00',
    end_time: '21:00',
    interval_minutes: 90,
    duration_minutes: 60,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['availabilityRules'],
    queryFn: () => base44.entities.AvailabilityRule.list(),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AvailabilityRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['availabilityRules']);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilityRule.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['availabilityRules'])
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.AvailabilityRule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['availabilityRules'])
  });

  const resetForm = () => {
    setFormData({
      name: 'Default Partnership Hours',
      days_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      start_time: '12:00',
      end_time: '21:00',
      interval_minutes: 90,
      duration_minutes: 60,
      is_active: true
    });
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            Meeting Availability
          </h2>
          <p className="text-sm text-gray-600">Manage when partners can book meetings</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          style={{ background: brandColors.goldPrestige, color: 'white' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Default Partnership Hours"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days of Week</label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.days_of_week.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interval (minutes)</label>
                <Input
                  type="number"
                  value={formData.interval_minutes}
                  onChange={(e) => setFormData({ ...formData, interval_minutes: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={createMutation.isPending} style={{ background: brandColors.goldPrestige, color: 'white' }}>
                {createMutation.isPending ? 'Creating...' : 'Create Rule'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                    {rule.name}
                  </h3>
                  {rule.is_active && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{rule.days_of_week.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{rule.start_time} - {rule.end_time}</span>
                  </div>
                  <div className="text-gray-600">
                    Interval: {rule.interval_minutes} min
                  </div>
                  <div className="text-gray-600">
                    Duration: {rule.duration_minutes} min
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActiveMutation.mutate({ id: rule.id, is_active: !rule.is_active })}
                >
                  {rule.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(rule.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No availability rules set. Click "Add Rule" to create one.
          </div>
        )}
      </div>
    </div>
  );
}