import {
    Check, ChevronLeft, Rocket, ShieldCheck, Lock,
} from 'lucide-react';
import BacklogPanel from './gatePanels/BacklogPanel';
import CapacityPanel from './gatePanels/CapacityPanel';
import ObjectivesPanel from './gatePanels/ObjectivesPanel';
import RiskPanel from './gatePanels/RiskPanel';
import { READINESS_BLOCKS } from './planningWizardConfig';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

const COMPLIANCE_ITEMS = [
    'Export Control (ITAR/EAR)',
    'Data Privacy (GDPR/CCPA)',
    'Security (SOC2/FedRAMP)',
    'Accessibility (WCAG 2.1)',
    'IP & Licensing Clearance',
    'Safety Certification (DO-178C)',
];

const FACILITATION_ITEMS = [
    'Planning deck finalized',
    'Breakout room schedule locked',
    'Facilitator roles assigned',
    'Stakeholder invites sent',
    'Recording/livestream configured',
    'Retro template prepared',
];

export default function GateWorkPanel({ gate, state, setState, onToggle, onBack, readinessComplete }) {
    const checked = state.readiness?.[gate.id];
    const isGate = gate.isGate;
    const locked = isGate && !readinessComplete;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={onBack} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                    <ChevronLeft className="w-4 h-4" style={{ color: C.muted }} />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold" style={{ color: C.text }}>{gate.label}</h2>
                    <p className="text-xs" style={{ color: C.muted }}>{gate.desc}</p>
                </div>
                {locked ? (
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold flex items-center gap-1" style={{ background: C.surface, color: C.dim }}>
                        <Lock className="w-3 h-3" /> Locked
                    </span>
                ) : checked ? (
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold flex items-center gap-1" style={{ background: `${C.green}20`, color: C.green }}>
                        <Check className="w-3 h-3" /> Cleared
                    </span>
                ) : (
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold" style={{ background: C.surface, color: C.gold }}>In Progress</span>
                )}
            </div>

            {/* Work surface */}
            <div className="mb-4">
                {gate.id === 'backlog' && <BacklogPanel state={state} setState={setState} />}
                {gate.id === 'capacity' && <CapacityPanel state={state} setState={setState} />}
                {gate.id === 'business' && <TextDraftPanel state={state} setState={setState} field="business" placeholder="Draft the business context presentation: market situation, strategic drivers, key investments, competitive landscape..." />}
                {gate.id === 'objectives' && <ObjectivesPanel state={state} setState={setState} />}
                {gate.id === 'architecture' && <TextDraftPanel state={state} setState={setState} field="architecture" placeholder="Document architecture state, tech debt inventory, upgrade recommendations, dependency risks..." />}
                {gate.id === 'compliance' && <ChecklistPanel state={state} setState={setState} field="compliance" items={COMPLIANCE_ITEMS} />}
                {gate.id === 'risk' && <RiskPanel state={state} setState={setState} />}
                {gate.id === 'facilitation' && <ChecklistPanel state={state} setState={setState} field="facilitation" items={FACILITATION_ITEMS} />}
                {gate.id === 'gogo' && <GoNoGoPanel state={state} readinessComplete={readinessComplete} onConfirm={() => onToggle('readiness', 'gogo')} />}
            </div>

            {/* Mark complete action */}
            {!isGate && (
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderTop: `1px solid ${C.border}` }}>
                    <button onClick={onBack} className="text-xs font-medium transition-colors" style={{ color: C.muted }}>
                        ← Back to gates
                    </button>
                    <button onClick={() => { onToggle('readiness', gate.id); onBack(); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: checked ? `${C.green}20` : C.green, color: checked ? C.green : C.surface }}>
                        {checked ? <><Check className="w-3.5 h-3.5" /> Marked Complete</> : <><Check className="w-3.5 h-3.5" /> Mark Complete</>}
                    </button>
                </div>
            )}
        </div>
    );
}

function TextDraftPanel({ state, setState, field, placeholder }) {
    const drafts = state.drafts || {};
    const value = drafts[field] || '';
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

    return (
        <div className="space-y-2">
            <textarea
                value={value}
                onChange={e => setState(prev => ({ ...prev, drafts: { ...prev.drafts, [field]: e.target.value } }))}
                placeholder={placeholder}
                className="w-full min-h-[280px] p-4 rounded-lg text-sm leading-relaxed resize-y focus:outline-none transition-colors"
                style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}
            />
            <div className="flex items-center justify-between text-[10px]" style={{ color: C.dim }}>
                <span>Autosaved to planning state</span>
                <span>{wordCount} words</span>
            </div>
        </div>
    );
}

function ChecklistPanel({ state, setState, field, items }) {
    const checked = state[field] || {};

    const toggle = (item) => setState(prev => ({ ...prev, [field]: { ...prev[field], [item]: !prev[field]?.[item] } }));

    const doneCount = items.filter(i => checked[i]).length;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: C.muted }}>{doneCount}/{items.length} flagged</span>
                <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / items.length) * 100}%`, background: C.gold }} />
                </div>
            </div>
            {items.map(item => {
                const on = checked[item];
                return (
                    <button key={item} onClick={() => toggle(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                        style={{ background: on ? `${C.green}10` : C.panel, border: `1px solid ${on ? C.green : C.border}` }}>
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: on ? C.green : 'transparent', border: `1px solid ${on ? 'transparent' : C.border}` }}>
                            {on && <Check className="w-3 h-3" style={{ color: C.surface }} />}
                        </div>
                        <span className="text-sm" style={{ color: on ? C.green : C.text }}>{item}</span>
                    </button>
                );
            })}
        </div>
    );
}

function GoNoGoPanel({ state, readinessComplete, onConfirm }) {
    const gates = READINESS_BLOCKS.filter(b => !b.isGate);
    const cleared = gates.filter(b => state.readiness?.[b.id]).length;

    if (!readinessComplete) {
        return (
            <div className="rounded-lg p-6 text-center" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: C.dim }} />
                <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>All readiness blocks must clear first</p>
                <p className="text-xs" style={{ color: C.muted }}>{cleared} of {gates.length} gates cleared</p>
                <div className="h-1.5 rounded-full overflow-hidden mt-3 max-w-xs mx-auto" style={{ background: '#ffffff10' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(cleared / gates.length) * 100}%`, background: C.gold }} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: `${C.green}10`, border: `1px solid ${C.green}` }}>
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5" style={{ color: C.green }} />
                    <span className="text-sm font-bold" style={{ color: C.green }}>All readiness gates cleared</span>
                </div>
                <p className="text-xs" style={{ color: C.muted }}>Review the summary below and confirm the go/no-go decision to convene the room.</p>
            </div>
            <div className="space-y-1.5">
                {gates.map(b => (
                    <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                        <Check className="w-3.5 h-3.5" style={{ color: C.green }} />
                        <span className="text-sm" style={{ color: C.text }}>{b.label}</span>
                    </div>
                ))}
            </div>
            <button onClick={onConfirm}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-colors"
                style={{ background: state.readiness?.gogo ? `${C.green}20` : C.gold, color: state.readiness?.gogo ? C.green : C.surface }}>
                <Rocket className="w-4 h-4" />
                {state.readiness?.gogo ? 'GO Confirmed' : 'Confirm GO Decision'}
            </button>
        </div>
    );
}