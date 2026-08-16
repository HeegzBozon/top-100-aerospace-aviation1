import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const STATUSES = [
    { value: 'funnel', label: 'Funnel' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'implementing', label: 'Implementing' },
    { value: 'done', label: 'Done' },
];

export default function ObjectiveFormModal({ item, defaultStatus, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({
        name: item?.name || '',
        description: item?.description || '',
        theme: item?.theme || '',
        status: item?.status || defaultStatus || 'funnel',
        type: item?.type || 'growth',
        owner_email: item?.owner_email || '',
        horizon: item?.horizon || '',
        business_value: item?.business_value || '',
        time_criticality: item?.time_criticality || '',
        risk_reduction: item?.risk_reduction || '',
        job_size: item?.job_size || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const bv = Number(form.business_value) || 0;
            const tc = Number(form.time_criticality) || 0;
            const rr = Number(form.risk_reduction) || 0;
            const size = Number(form.job_size) || 0;
            const wsjf_score = size > 0 ? (bv + tc + rr) / size : 0;
            await onSave({
                ...form,
                business_value: bv || null,
                time_criticality: tc || null,
                risk_reduction: rr || null,
                job_size: size || null,
                wsjf_score,
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
                        {item ? 'Edit Strategic Theme' : 'New Strategic Theme'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Expand Local Legends to 50 cities"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Detailed description of this strategic objective"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="growth">Growth</SelectItem>
                                <SelectItem value="retention">Retention</SelectItem>
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="community">Community</SelectItem>
                            </SelectContent>
                        </Select>
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
                            <Label>Theme</Label>
                            <Input
                                value={form.theme}
                                onChange={e => setForm({ ...form, theme: e.target.value })}
                                placeholder="e.g. Growth, Retention"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Owner Email</Label>
                        <Input
                            value={form.owner_email}
                            onChange={e => setForm({ ...form, owner_email: e.target.value })}
                            placeholder="owner@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5d7a94' }}>
                            Horizon
                        </Label>
                        <Select value={form.horizon} onValueChange={v => setForm({ ...form, horizon: v })}>
                            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="h1">H1 — Core (Protect & extend)</SelectItem>
                                <SelectItem value="h2">H2 — Growth (Build & scale)</SelectItem>
                                <SelectItem value="h3">H3 — Future (Explore & incubate)</SelectItem>
                            </SelectContent>
                        </Select>
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
                </div>

                <DialogFooter>
                    {onDelete && (
                        <Button variant="destructive" onClick={onDelete} className="mr-auto">Delete</Button>
                    )}
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || !form.name.trim()}
                        style={{ background: '#1e3a5a', color: 'white' }}
                    >
                        {saving ? 'Saving...' : item ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}