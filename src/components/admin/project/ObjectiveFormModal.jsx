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
        implementation: item?.implementation || '',
        potential: item?.potential || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            await onSave(form);
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