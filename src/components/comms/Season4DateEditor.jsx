import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

// Default season 4 dates - in a real app these would come from a Season entity
const DEFAULT_DATES = {
  nominations: { start: '2026-01-15', end: '2026-03-15' },
  voting: { start: '2026-03-16', end: '2026-05-15' },
  review: { start: '2026-05-16', end: '2026-06-30' },
  announcement: { start: '2026-07-01', end: '2026-07-01' },
};

export default function Season4DateEditor({ onClose }) {
  const [dates, setDates] = useState(DEFAULT_DATES);
  const [saving, setSaving] = useState(false);

  const phases = [
    { id: 'nominations', label: 'Nominations' },
    { id: 'voting', label: 'Community Voting' },
    { id: 'review', label: 'Expert Review' },
    { id: 'announcement', label: 'Finalists Announced' },
  ];

  const handleDateChange = (phase, field, value) => {
    setDates(prev => ({
      ...prev,
      [phase]: { ...prev[phase], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would update the Season entity
      // await base44.entities.Season.update(seasonId, { ...dates });
      toast.success('Season dates updated!');
      onClose();
    } catch (error) {
      toast.error('Failed to update dates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: `${brandColors.navyDeep}10` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${brandColors.goldPrestige}15` }}
            >
              <Calendar className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: brandColors.navyDeep }}>
                Edit Season 4 Dates
              </h2>
              <p className="text-sm text-gray-500">Update phase start and end dates</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {phases.map((phase) => (
            <div 
              key={phase.id}
              className="p-4 rounded-xl border"
              style={{ borderColor: `${brandColors.navyDeep}15` }}
            >
              <h3 className="font-semibold mb-4" style={{ color: brandColors.navyDeep }}>
                {phase.label}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Start Date</Label>
                  <Input
                    type="date"
                    value={dates[phase.id]?.start || ''}
                    onChange={(e) => handleDateChange(phase.id, 'start', e.target.value)}
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">End Date</Label>
                  <Input
                    type="date"
                    value={dates[phase.id]?.end || ''}
                    onChange={(e) => handleDateChange(phase.id, 'end', e.target.value)}
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: `${brandColors.navyDeep}10` }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            style={{ background: brandColors.navyDeep }}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}