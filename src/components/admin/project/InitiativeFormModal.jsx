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
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'portfolio_backlog', label: 'Backlog' },
    { value: 'implementing', label: 'Implementing' },
    { value: 'done', label: 'Done' },
];

export default function InitiativeFormModal({ item, objectiveId, defaultStatus, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({
        name: item?.name || '',
        description: item?.description || '',
        status: item?.status || defaultStatus || 'funnel',
        type: item?.type || 'feature',
        objective_id: item?.objective_id || objectiveId || '',
        horizon: item?.horizon || '',
        implementation: item?.implementation || '',
        potential: item?.potential || '',
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
            const wsjfInputs = ['business_value', 'time_criticality', 'risk_reduction', 'job_size'];
            const payload = { ...form };
            const bv = Number(form.business_value) || 0;
            const tc = Number(form.time_criticality) || 0;
            const rr = Number(form.risk_reduction) || 0;
            const size = Number(form.job_size) || 0;
            payload.wsjf_score = size > 0 ? (bv + tc + rr) / size : 0;
            wsjfInputs.forEach(k => { payload[k] = Number(form[k]) || null; });
            await onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle style={{ color: '#1e3a5a' }}>
                        {item ? 'Edit Initiative' : 'New Initiative'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Launch Chamber 2.0 Membership Tiers"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Detailed description of this initiative"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="feature">Feature</SelectItem>
                                <SelectItem value="platform">Platform</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                                <SelectItem value="research">Research</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                            Prioritization Matrix
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px]">Implementation</Label>
                                <Select value={form.implementation} onValueChange={v => setForm({ ...form, implementation: v })}>
                                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="difficult">Difficult</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px]">Potential</Label>
                                <Select value={form.potential} onValueChange={v => setForm({ ...form, potential: v })}>
                                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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