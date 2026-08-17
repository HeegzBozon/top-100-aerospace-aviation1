import { useState } from 'react';
import TypeformFlow from './TypeformFlow';

const STATUSES = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
];

const TYPES = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'design', label: 'Design' },
    { value: 'devops', label: 'DevOps' },
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

    const steps = [
        { key: 'title', type: 'text', question: 'What\'s the story?', subtitle: 'Give it a clear title.', placeholder: 'e.g. Build RSVP confirmation email', required: true, help: 'Stories are team-level work items — something one person can finish in a sprint. Use the format: "As a [user], I want [action] so that [value]." Or keep it short: "Build RSVP confirmation email".' },
        { key: 'description', type: 'textarea', question: 'Acceptance criteria.', subtitle: 'Given... When... Then...', placeholder: 'Given... When... Then...', help: 'Write acceptance criteria in Given/When/Then format. "Given a user has RSVP\'d, When they check their email, Then they see a confirmation with event details." This makes "done" unambiguous.' },
        { key: 'type', type: 'select', question: 'What type of work?', subtitle: 'Press 1–4 to select.', options: TYPES, help: 'Frontend = UI/client work. Backend = API/server. Design = visual/UX. DevOps = infra/deploy. Pick the primary discipline — cross-discipline stories should be split.' },
        {
            key: 'status', type: 'select', question: 'What status?', subtitle: 'Current team workflow stage.', options: STATUSES,
            validate: (f) => (f.status !== 'todo' && !f.roadmap_item_id ? 'Link an upstream Epic before advancing past To Do.' : null),
            help: 'To Do → In Progress → Done. Blocked = something external is stopping progress. Don\'t advance past To Do without linking an upstream Epic.',
        },
        { key: 'story_points', type: 'number', question: 'How many story points?', subtitle: 'Effort estimation.', placeholder: '0', help: 'Relative effort estimation, not hours. Use Fibonacci (1, 2, 3, 5, 8, 13). A 3 is roughly 1-2 days of focused work. If it\'s over 13, split it.' },
        { key: 'assignee_email', type: 'text', question: 'Who\'s assigned?', subtitle: 'Team member email.', placeholder: 'dev@example.com', help: 'The person who will do the work. One person, not a team. If multiple people are needed, split into multiple stories.' },
        { key: 'priority', type: 'number', question: 'What priority?', subtitle: 'Sort order — higher = first.', placeholder: '0', help: 'Sort order within the parent Epic. Higher = earlier. Use this to sequence stories within an epic.' },
        { key: '__wsjf__', type: 'wsjf', question: 'Score it with WSJF.', subtitle: 'Rate each factor 1–10. Leave blank to skip.', help: 'WSJF = (Business Value + Time Criticality + Risk Reduction) ÷ Job Size. Higher scores float to the top of the backlog. Rate honestly — if everything is a 10, nothing is.' },
    ];

    return (
        <TypeformFlow
            steps={steps}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={onClose}
            title={item ? 'Edit Story' : 'New Story'}
            saving={saving}
            isEdit={!!item}
            onDelete={onDelete}
        />
    );
}