import { useState } from 'react';
import TypeformFlow from './TypeformFlow';

const STATUSES = [
    { value: 'funnel', label: 'Funnel' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'portfolio_backlog', label: 'Backlog' },
    { value: 'implementing', label: 'Implementing' },
    { value: 'done', label: 'Done' },
];

const TYPES = [
    { value: 'feature', label: 'Feature' },
    { value: 'platform', label: 'Platform' },
    { value: 'operations', label: 'Operations' },
    { value: 'research', label: 'Research' },
];

const HORIZONS = [
    { value: 'h1', label: 'H1 — Core (Protect & extend)' },
    { value: 'h2', label: 'H2 — Growth (Build & scale)' },
    { value: 'h3', label: 'H3 — Future (Explore & incubate)' },
];

export default function InitiativeFormModal({ item, objectiveId, defaultStatus, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({
        name: item?.name || '',
        description: item?.description || '',
        status: item?.status || defaultStatus || 'funnel',
        type: item?.type || 'feature',
        objective_id: item?.objective_id || objectiveId || '',
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
        { key: 'name', type: 'text', question: 'Name this initiative.', subtitle: 'What large-scale effort is this?', placeholder: 'e.g. Launch Chamber 2.0 Membership Tiers', required: true },
        { key: 'description', type: 'textarea', question: 'Describe the initiative.', subtitle: 'What does it encompass?', placeholder: 'Detailed description of this initiative' },
        { key: 'type', type: 'select', question: 'What type of initiative?', subtitle: 'Press 1–4 to select.', options: TYPES },
        {
            key: 'status', type: 'select', question: 'Where does this sit?', subtitle: 'Current Solution Train status.', options: STATUSES,
            validate: (f) => (f.status !== 'funnel' && !f.objective_id ? 'Link an upstream Objective before advancing past Funnel.' : null),
        },
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
            title={item ? 'Edit Initiative' : 'New Initiative'}
            saving={saving}
            isEdit={!!item}
            onDelete={onDelete}
        />
    );
}