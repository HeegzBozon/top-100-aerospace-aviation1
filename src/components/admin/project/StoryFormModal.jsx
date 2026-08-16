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
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
];

export default function StoryFormModal({ item, roadmapItemId, defaultStatus, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({
        title: item?.title || '',
        description: item?.description || '',
        status: item?.status || defaultStatus || 'todo',
        type: item?.type || 'frontend',
        story_points: item?.story_points ?? '',
        assignee_email: item?.assignee_email || '',
        roadmap_item_id: item?.roadmap_item_id || roadmapItemId || '',
        priority: item?.priority ?? 0,
        business_value: item?.business_value || '',
        time_criticality: item?.time_criticality || '',
        risk_reduction: item?.risk_reduction || '',
        job_size: item?.job_size || '',
    });
    const [saving, setSaving] = useState(false);

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
                story_points: Number(form.story_points) || 0,
                priority: Number(form.priority) || 0,
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
                        {item ? 'Edit Story' : 'New Story'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Build RSVP confirmation email"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Acceptance Criteria</Label>
                        <Textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Given... When... Then..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="frontend">Frontend</SelectItem>
                                <SelectItem value="backend">Backend</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="devops">DevOps</SelectItem>
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
                            <Label>Story Points</Label>
                            <Input
                                type="number" min={0}
                                value={form.story_points}
                                onChange={e => setForm({ ...form, story_points: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Assignee Email</Label>
                            <Input
                                value={form.assignee_email}
                                onChange={e => setForm({ ...form, assignee_email: e.target.value })}
                                placeholder="dev@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Priority</Label>
                            <Input
                                type="number"
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}
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
                </div>

                <DialogFooter>
                    {onDelete && (
                        <Button variant="destructive" onClick={onDelete} className="mr-auto">Delete</Button>
                    )}
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