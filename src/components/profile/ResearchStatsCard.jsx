import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Shield, Rocket, Clock, FlaskConical,
  Save, Loader2, X, Pencil
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const STAT_CONFIG = [
  { key: 'research_publications', label: 'Publications', icon: BookOpen, color: '#4a90b8' },
  { key: 'citations_count', label: 'Citations', icon: FileText, color: '#c9a87c' },
  { key: 'patents_count', label: 'Patents', icon: Shield, color: '#6b8e6b' },
  { key: 'missions_flown', label: 'Missions', icon: Rocket, color: '#b06040' },
  { key: 'flight_hours', label: 'Flight Hours', icon: Clock, color: '#7a6bb0' },
  { key: 'programs_led_count', label: 'Programs Led', icon: FlaskConical, color: '#508080' },
];

export default function ResearchStatsCard({ nominee, onUpdate }) {
  const [editing, setEditing] = useState(null); // key being edited
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const metrics = nominee?.impact_metrics || {};

  // For programs_led, count the array length
  const getStatValue = (key) => {
    if (key === 'programs_led_count') {
      return metrics.programs_led?.length || 0;
    }
    return metrics[key] || 0;
  };

  const handleEdit = (key) => {
    if (key === 'programs_led_count') return; // not directly editable as number
    setEditing(key);
    setEditValue(String(getStatValue(key)));
  };

  const handleSave = async () => {
    if (!nominee?.id || editing === null) return;
    setSaving(true);
    const updated = { ...metrics, [editing]: Number(editValue) || 0 };
    await base44.entities.Nominee.update(nominee.id, { impact_metrics: updated });
    onUpdate?.({ ...nominee, impact_metrics: updated });
    toast({ title: 'Stat updated!' });
    setEditing(null);
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  const hasAnyStats = STAT_CONFIG.some(s => getStatValue(s.key) > 0);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColors.navyDeep }}>
            Research & Impact
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Tap any stat to update it</p>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3">
        {STAT_CONFIG.map(stat => {
          const Icon = stat.icon;
          const value = getStatValue(stat.key);
          const isEditing = editing === stat.key;
          const isEditableKey = stat.key !== 'programs_led_count';

          return (
            <div key={stat.key} className="relative">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2"
                    style={{ borderColor: stat.color }}
                  >
                    <Input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="h-8 text-center text-sm font-bold w-full"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSave} disabled={saving} className="h-6 px-2 text-[10px] rounded-full" style={{ background: stat.color }}>
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2 text-[10px] rounded-full">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="display"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => isEditableKey && handleEdit(stat.key)}
                    className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 transition-all group ${
                      isEditableKey ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
                    }`}
                    style={{ background: value > 0 ? `${stat.color}06` : 'transparent' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <span className="text-lg font-bold" style={{ color: value > 0 ? brandColors.navyDeep : '#cbd5e1' }}>
                      {value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-tight text-center">
                      {stat.label}
                    </span>
                    {isEditableKey && (
                      <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {!nominee && (
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-400 text-center italic">Claim your nominee profile to track research stats</p>
        </div>
      )}
    </div>
  );
}