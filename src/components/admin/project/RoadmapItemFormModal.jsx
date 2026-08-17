import { useState, useEffect } from 'react';
import TypeformFlow from './TypeformFlow';

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

    const steps = [
        { key: 'title', type: 'text', question: 'What needs to be done?', subtitle: 'Give this epic a clear title.', placeholder: 'e.g. Build RSVP confirmation email', required: true },
        { key: 'description', type: 'textarea', question: 'Brief description.', subtitle: 'What does this item involve?', placeholder: 'Brief description of the item' },
        {
            key: 'status', type: 'select', question: 'What status?', subtitle: 'Current workflow stage.', options: STATUSES,
            validate: (f) => (f.status !== 'backlog' && !f.initiative_id ? 'Link an upstream Initiative before advancing past Backlog.' : null),
        },
        { key: 'type', type: 'select', question: 'What type of item?', subtitle: 'Press 1–4 to select.', options: TYPES },
        { key: 'value_stream', type: 'select', question: 'Which value stream?', subtitle: 'Operational or developmental?', options: STREAMS },
        { key: 'target_date', type: 'date', question: 'Target completion date?', subtitle: 'When should this be done?' },
        { key: 'priority', type: 'number', question: 'What priority?', subtitle: 'Sort order — higher = first.', placeholder: '0' },
        { key: '__wsjf__', type: 'wsjf', question: 'Score it with WSJF.', subtitle: 'Rate each factor 1–10. Leave blank to skip.' },
    ];

    return (
        <TypeformFlow
            steps={steps}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={onClose}
            title={item ? 'Edit Roadmap Item' : 'New Roadmap Item'}
            saving={saving}
            isEdit={!!item}
        />
    );
}