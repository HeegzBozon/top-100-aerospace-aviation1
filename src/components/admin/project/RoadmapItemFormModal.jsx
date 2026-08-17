import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const STATUSES = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'next_up', label: 'Next Up' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
];

const TYPES = [
    { value: 'feature', label: 'Feature' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'bug', label: 'Bug' },
    { value: 'feedback', label: 'Feedback' },
];

const STREAMS = [
    { value: 'operational', label: 'Operational' },
    { value: 'developmental', label: 'Developmental' },
];

export default function RoadmapItemFormModal({ item, defaultStatus, onClose, onSave, defaultInitiativeId }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'backlog',
        type: 'feature',
        value_stream: 'operational',
        priority: 0,
        target_date: '',
        business_value: '',
        time_criticality: '',
        risk_reduction: '',
        job_size: '',
        initiative_id: defaultInitiativeId || '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setForm({
                title: item.title || '',
                description: item.description || '',
                status: item.status || 'backlog',
                type: item.type || 'feature',
                value_stream: item.value_stream || 'operational',
                priority: item.priority || 0,
                target_date: item.target_date ? item.target_date.split('T')[0] : '',
                business_value: item.business_value || '',
                time_criticality: item.time_criticality || '',
                risk_reduction: item.risk_reduction || '',
                job_size: item.job_size || '',
                initiative_id: item.initiative_id || (defaultInitiativeId || ''),
            });
        } else if (defaultInitiativeId || defaultStatus) {
            setForm(prev => ({ ...prev, status: defaultStatus || prev.status, initiative_id: defaultInitiativeId || prev.initiative_id }));
        }
    }, [item, defaultStatus]);

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            const bv = Number(form.business_value) || 0;
            const tc = Number(form.time_criticality) || 0;
            const rr = Number(form.risk_reduction) || 0;
            const size = Number(form.job_size) || 0;
            const wsjf_score = size > 0 ? (bv + tc + rr) / size : 0;
            await onSave({
                ...form,
                priority: Number(form.priority) || 0,
                target_date: form.target_date || null,
                business_value: bv || null,
                time_criticality: tc || null,
                risk_reduction: rr || null,
                job_size: size || null,
                wsjf_score,
                initiative_id: form.initiative_id || null,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle style={{ color: '#1e3a5a' }}>
                        {item ? 'Edit Item' : 'New Roadmap Item'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="What needs to be done?"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of the item"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Type</Label>
                            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Value Stream</Label>
                            <Select value={form.value_stream} onValueChange={v => setForm({ ...form, value_stream: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STREAMS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Target Date</Label>
                            <Input
                                type="date"
                                value={form.target_date}
                                onChange={e => setForm({ ...form, target_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5d7a94' }}>
                            WSJF Inputs (1-10)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px]">Business Value</Label>
                                <Input type="number" min={0} max={10}
                                    value={form.business_value}
                                    onChange={e => setForm({ ...form, business_value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px]">Time Criticality</Label>
                                <Input type="number" min={0} max={10}
                                    value={form.time_criticality}
                                    onChange={e => setForm({ ...form, time_criticality: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px]">Risk Reduction</Label>
                                <Input type="number" min={0} max={10}
                                    value={form.risk_reduction}
                                    onChange={e => setForm({ ...form, risk_reduction: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px]">Job Size</Label>
                                <Input type="number" min={0} max={10}
                                    value={form.job_size}
                                    onChange={e => setForm({ ...form, job_size: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Priority (sort order, higher = first)</Label>
                        <Input
                            type="number"
                            value={form.priority}
                            onChange={e => setForm({ ...form, priority: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || !form.title.trim()}
                        style={{ background: '#1e3a5a', color: 'white' }}
                    >
                        {saving ? 'Saving...' : item ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}