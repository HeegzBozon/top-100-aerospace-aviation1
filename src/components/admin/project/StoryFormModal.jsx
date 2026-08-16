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

export default function StoryFormModal({ item, roadmapItemId, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({
        title: item?.title || '',
        description: item?.description || '',
        status: item?.status || 'todo',
        story_points: item?.story_points ?? '',
        assignee_email: item?.assignee_email || '',
        roadmap_item_id: item?.roadmap_item_id || roadmapItemId || '',
        priority: item?.priority ?? 0,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            await onSave({
                ...form,
                story_points: Number(form.story_points) || 0,
                priority: Number(form.priority) || 0,
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