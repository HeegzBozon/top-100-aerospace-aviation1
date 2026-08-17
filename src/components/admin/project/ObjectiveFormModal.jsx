import { useState } from 'react';
import TypeformFlow from './TypeformFlow';

const STATUSES = [
    { value: 'funnel', label: 'Funnel' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'implementing', label: 'Implementing' },
    { value: 'done', label: 'Done' },
];

const TYPES = [
    { value: 'growth', label: 'Growth' },
    { value: 'retention', label: 'Retention' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'community', label: 'Community' },
];

const HORIZONS = [
    { value: 'h1', label: 'H1 — Core (Protect & extend)' },
    { value: 'h2', label: 'H2 — Growth (Build & scale)' },
    { value: 'h3', label: 'H3 — Future (Explore & incubate)' },
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

    const steps = [
        { key: 'name', type: 'text', question: 'What are you calling this strategic theme?', subtitle: 'Give it a clear, ambitious name.', placeholder: 'e.g. Expand Local Legends to 50 cities', required: true },
        { key: 'description', type: 'textarea', question: 'Describe the objective.', subtitle: 'What does success look like?', placeholder: 'Detailed description of this strategic objective' },
        { key: 'type', type: 'select', question: 'What type of objective?', subtitle: 'Press 1–4 to select.', options: TYPES },
        { key: 'status', type: 'select', question: 'Where does this sit in the funnel?', subtitle: 'Current portfolio Kanban status.', options: STATUSES },
        { key: 'theme', type: 'text', question: 'Any theme tag?', subtitle: 'Optional categorization label.', placeholder: 'e.g. Growth, Retention' },
        { key: 'owner_email', type: 'text', question: 'Who owns this?', subtitle: 'Email of the person or team responsible.', placeholder: 'owner@example.com' },
        { key: 'horizon', type: 'select', question: 'Which investment horizon?', subtitle: 'H1 = Core · H2 = Growth · H3 = Future', options: HORIZONS },
        { key: '__wsjf__', type: 'wsjf', question: 'Score it with WSJF.', subtitle: 'Rate each factor 1–10. Leave blank to skip.' },
    ];

    return (
        <TypeformFlow
            steps={steps}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={onClose}
            title={item ? 'Edit Strategic Theme' : 'New Strategic Theme'}
            saving={saving}
            isEdit={!!item}
            onDelete={onDelete}
        />
    );
}