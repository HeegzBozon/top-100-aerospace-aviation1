import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Shield, Rocket, Clock, FlaskConical,
  Save, Loader2, X, Pencil, Plus, Trash2, BarChart3
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const PRESET_STATS = [
  { key: 'research_publications', label: 'Publications', icon: BookOpen, color: '#4a90b8' },
  { key: 'citations_count', label: 'Citations', icon: FileText, color: '#c9a87c' },
  { key: 'patents_count', label: 'Patents', icon: Shield, color: '#6b8e6b' },
  { key: 'missions_flown', label: 'Missions', icon: Rocket, color: '#b06040' },
  { key: 'flight_hours', label: 'Flight Hours', icon: Clock, color: '#7a6bb0' },
];

const CUSTOM_COLORS = ['#4a90b8', '#c9a87c', '#6b8e6b', '#b06040', '#7a6bb0', '#508080', '#8b6bb0', '#b07060'];

function StatTile({ label, value, icon: Icon, color, onEdit, onRemove, isCustom }) {
  return (
    <div className="relative group">
      <button
        onClick={onEdit}
        className="w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm"
        style={{ background: value > 0 ? `${color}06` : 'transparent' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-lg font-bold" style={{ color: value > 0 ? brandColors.navyDeep : '#cbd5e1' }}>
          {(value || 0).toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-tight text-center">
          {label}
        </span>
      </button>
      <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
      {isCustom && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
        </button>
      )}
    </div>
  );
}

function EditStatModal({ stat, onSave, onCancel, saving }) {
  const [label, setLabel] = useState(stat?.label || '');
  const [value, setValue] = useState(String(stat?.value || 0));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xs space-y-4" onClick={e => e.stopPropagation()}>
        <h4 className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>
          {stat?.isNew ? 'Add Custom Stat' : `Edit: ${stat?.label}`}
        </h4>
        {stat?.isCustom || stat?.isNew ? (
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Label</label>
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Speaking Engagements"
              className="mt-1 h-9 text-sm"
              maxLength={20}
              autoFocus={!!stat?.isNew}
            />
          </div>
        ) : null}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Value</label>
          <Input
            type="number"
            min="0"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="mt-1 h-9 text-sm"
            autoFocus={!stat?.isNew && !stat?.isCustom}
            onKeyDown={e => { if (e.key === 'Enter') onSave(label, Number(value) || 0); }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel} className="rounded-full text-xs">Cancel</Button>
          <Button
            size="sm"
            onClick={() => onSave(label, Number(value) || 0)}
            disabled={saving || ((stat?.isCustom || stat?.isNew) && !label.trim())}
            className="rounded-full text-xs gap-1"
            style={{ background: brandColors.navyDeep }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResearchStatsCard({ nominee, user, onNomineeUpdate, onUserUpdate }) {
  const [editingStat, setEditingStat] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const metrics = nominee?.impact_metrics || {};
  const customStats = user?.custom_card_stats || [];

  const handleEditPreset = (preset) => {
    setEditingStat({
      type: 'preset',
      key: preset.key,
      label: preset.label,
      value: metrics[preset.key] || 0,
      isCustom: false,
      isNew: false,
    });
  };

  const handleEditCustom = (idx) => {
    const s = customStats[idx];
    setEditingStat({
      type: 'custom',
      idx,
      label: s.label,
      value: s.value,
      isCustom: true,
      isNew: false,
    });
  };

  const handleAddCustom = () => {
    setEditingStat({
      type: 'custom',
      idx: -1,
      label: '',
      value: 0,
      isCustom: true,
      isNew: true,
    });
  };

  const handleRemoveCustom = async (idx) => {
    const updated = customStats.filter((_, i) => i !== idx);
    await base44.auth.updateMe({ custom_card_stats: updated });
    onUserUpdate?.({ ...user, custom_card_stats: updated });
    toast({ title: 'Stat removed' });
  };

  const handleSave = async (label, value) => {
    setSaving(true);
    if (editingStat.type === 'preset' && nominee?.id) {
      const updated = { ...metrics, [editingStat.key]: value };
      await base44.entities.Nominee.update(nominee.id, { impact_metrics: updated });
      onNomineeUpdate?.({ ...nominee, impact_metrics: updated });
    } else if (editingStat.type === 'custom') {
      let updated;
      if (editingStat.idx === -1) {
        updated = [...customStats, { label: label.trim(), value }];
      } else {
        updated = customStats.map((s, i) => i === editingStat.idx ? { label: label.trim(), value } : s);
      }
      await base44.auth.updateMe({ custom_card_stats: updated });
      onUserUpdate?.({ ...user, custom_card_stats: updated });
    }
    toast({ title: 'Stat updated!' });
    setEditingStat(null);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColors.navyDeep }}>
              Trading Card Stats
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddCustom}
            className="h-7 px-2 text-[10px] font-bold gap-1 rounded-full"
            style={{ color: brandColors.goldPrestige }}
          >
            <Plus className="w-3 h-3" /> Add Stat
          </Button>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Tap any stat to edit · These appear on your card</p>
      </div>

      <div className="p-4">
        {/* Preset aerospace stats */}
        {nominee && (
          <>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Aerospace Metrics</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESET_STATS.map(preset => (
                <StatTile
                  key={preset.key}
                  label={preset.label}
                  value={metrics[preset.key] || 0}
                  icon={preset.icon}
                  color={preset.color}
                  onEdit={() => handleEditPreset(preset)}
                  isCustom={false}
                />
              ))}
            </div>
          </>
        )}

        {/* Custom stats */}
        {customStats.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Custom Stats</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {customStats.map((s, idx) => (
                <StatTile
                  key={idx}
                  label={s.label}
                  value={s.value}
                  icon={BarChart3}
                  color={CUSTOM_COLORS[idx % CUSTOM_COLORS.length]}
                  onEdit={() => handleEditCustom(idx)}
                  onRemove={() => handleRemoveCustom(idx)}
                  isCustom
                />
              ))}
            </div>
          </>
        )}

        {!nominee && customStats.length === 0 && (
          <div className="text-center py-6">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-200" />
            <p className="text-xs text-slate-400">Add custom stats to personalize your trading card</p>
            <Button
              size="sm"
              onClick={handleAddCustom}
              className="mt-3 gap-1 rounded-full text-xs"
              style={{ background: brandColors.navyDeep }}
            >
              <Plus className="w-3 h-3" /> Add Your First Stat
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingStat && (
          <EditStatModal
            stat={editingStat}
            onSave={handleSave}
            onCancel={() => setEditingStat(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}