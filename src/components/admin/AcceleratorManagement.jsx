import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Rocket, Plus, Calendar, Users, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function AcceleratorManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    demo_day_date: '',
    status: 'planning',
    max_startups: 10,
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['all-cohorts'],
    queryFn: () => base44.entities.AcceleratorCohort.list('-created_date'),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.AcceleratorEnrollment.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCohort) {
        return await base44.entities.AcceleratorCohort.update(editingCohort.id, data);
      }
      return await base44.entities.AcceleratorCohort.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-cohorts']);
      toast.success(editingCohort ? 'Cohort updated!' : 'Cohort created!');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.AcceleratorCohort.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-cohorts']);
      toast.success('Cohort deleted');
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingCohort(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      demo_day_date: '',
      status: 'planning',
      max_startups: 10,
    });
  };

  const handleEdit = (cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      demo_day_date: cohort.demo_day_date || '',
      status: cohort.status,
      max_startups: cohort.max_startups,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const activeCohorts = cohorts.filter(c => c.status === 'active' || c.status === 'recruiting');
  const totalEnrolled = enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              {cohorts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
              {activeCohorts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              {totalEnrolled}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
              {enrollments.length > 0 
                ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
          Cohort Management
        </h2>
        <Button onClick={() => setShowForm(true)} style={{ background: brandColors.goldPrestige }}>
          <Plus className="w-4 h-4 mr-2" />
          New Cohort
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border"
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cohort Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Winter 2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Focus areas and program highlights..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date *</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Demo Day</label>
                <Input
                  type="date"
                  value={formData.demo_day_date}
                  onChange={(e) => setFormData({...formData, demo_day_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Startups</label>
              <Input
                type="number"
                value={formData.max_startups}
                onChange={(e) => setFormData({...formData, max_startups: parseInt(e.target.value)})}
                min="1"
                max="50"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending} style={{ background: brandColors.goldPrestige }}>
                {saveMutation.isPending ? 'Saving...' : editingCohort ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Cohorts List */}
      <div className="grid gap-4">
        {cohorts.map(cohort => {
          const cohortEnrollments = enrollments.filter(e => e.cohort_id === cohort.id);
          return (
            <Card key={cohort.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{cohort.name}</CardTitle>
                      <Badge style={{ 
                        background: cohort.status === 'active' ? '#10b981' 
                          : cohort.status === 'recruiting' ? brandColors.goldPrestige
                          : undefined 
                      }}>
                        {cohort.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{cohort.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(cohort)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        if (confirm('Delete this cohort?')) {
                          deleteMutation.mutate(cohort.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Start</div>
                    <div className="font-medium">{new Date(cohort.start_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">End</div>
                    <div className="font-medium">{new Date(cohort.end_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Demo Day</div>
                    <div className="font-medium">
                      {cohort.demo_day_date ? new Date(cohort.demo_day_date).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Enrolled</div>
                    <div className="font-medium">{cohortEnrollments.length} / {cohort.max_startups}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}