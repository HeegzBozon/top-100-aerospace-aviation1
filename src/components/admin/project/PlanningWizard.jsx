import { useState, useEffect } from 'react';
import {
    Rocket, Check, Lock, ChevronRight, ChevronLeft, X,
    ClipboardList, Gauge, FileText, Target, Cpu, ShieldCheck, AlertTriangle,
    Hand, Circle, Sparkles,
} from 'lucide-react';
import {
    READINESS_BLOCKS, DAY_ONE_PHASES, DAY_TWO_PHASES, ROAM_CATEGORIES,
    OPERATING_PRINCIPLES, WIZARD_STEPS,
} from './planningWizardConfig';

const STORAGE_KEY = 'top100_planning_wizard_state';
const ICONS = { ClipboardList, Gauge, FileText, Target, Cpu, ShieldCheck, AlertTriangle, Lock, Rocket };

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8',
    copper: '#c87e9d', surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

export default function PlanningWizard({ open, onClose }) {
    const [step, setStep] = useState(0);
    const [state, setState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { readiness: {}, dayOne: {}, dayTwo: {}, roam: {}, confidence: null };
        } catch {
            return { readiness: {}, dayOne: {}, dayTwo: {}, roam: {}, confidence: null };
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    if (!open) return null;

    const readinessComplete = READINESS_BLOCKS.filter(b => !b.isGate).every(b => state.readiness[b.id]);
    const gatePassed = state.readiness['gogo'];
    const dayOneComplete = DAY_ONE_PHASES.every(p => state.dayOne[p.id]);
    const dayTwoComplete = DAY_TWO_PHASES.every(p => state.dayTwo[p.id]);
    const overallProgress = Math.round(
        ((READINESS_BLOCKS.filter(b => state.readiness[b.id]).length / READINESS_BLOCKS.length) * 25) +
        (DAY_ONE_PHASES.filter(p => state.dayOne[p.id]).length / DAY_ONE_PHASES.length * 30) +
        (DAY_TWO_PHASES.filter(p => state.dayTwo[p.id]).length / DAY_TWO_PHASES.length * 30) +
        (state.confidence ? 15 : 0)
    );

    const toggle = (group, id) => setState(prev => ({ ...prev, [group]: { ...prev[group], [id]: !prev[group]?.[id] } }));

    return (
        <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(13,22,32,0.96)', backdropFilter: 'blur(8px)' }}>
            {/* Left stepper rail */}
            <div className="w-60 flex-shrink-0 border-r flex flex-col" style={{ borderRight: `1px solid ${C.border}`, background: C.surface }}>
                <div className="p-4 border-b" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Rocket className="w-4 h-4" style={{ color: C.gold }} />
                        <span className="text-sm font-bold" style={{ color: C.text }}>Seasonal Planning</span>
                    </div>
                    <p className="text-[11px]" style={{ color: C.muted }}>Guided Facilitation Engine</p>
                </div>

                <div className="flex-1 p-3 space-y-1">
                    {WIZARD_STEPS.map((s, i) => {
                        const active = step === i;
                        const done = i < step;
                        return (
                            <button key={s.id} onClick={() => setStep(i)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                                style={{ background: active ? C.navy : 'transparent' }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                                    style={{ background: done ? C.green : active ? C.gold : 'transparent', color: done || active ? C.surface : C.muted, border: `1px solid ${done || active ? 'transparent' : C.border}` }}>
                                    {done ? <Check className="w-3 h-3" /> : i + 1}
                                </div>
                                <div>
                                    <div className="text-xs font-semibold" style={{ color: active ? 'white' : done ? C.text : C.muted }}>{s.label}</div>
                                    <div className="text-[10px]" style={{ color: active ? '#ffffff99' : C.dim }}>{s.sub}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: C.muted }}>Readiness</span>
                        <span className="text-xs font-bold" style={{ color: C.gold }}>{overallProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, background: `linear-gradient(90deg, ${C.navy}, ${C.gold})` }} />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <span className="text-xs uppercase tracking-widest font-bold" style={{ color: C.muted }}>{WIZARD_STEPS[step].label} — {WIZARD_STEPS[step].sub}</span>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                        <X className="w-4 h-4" style={{ color: C.muted }} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {step === 0 && <BriefStep />}
                    {step === 1 && <ReadinessStep state={state} onToggle={toggle} readinessComplete={readinessComplete} gatePassed={gatePassed} />}
                    {step === 2 && <ContextStep state={state} onToggle={toggle} />}
                    {step === 3 && <CommitStep state={state} setState={setState} onToggle={toggle} />}
                    {step === 4 && <LaunchStep />}
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderTop: `1px solid ${C.border}` }}>
                    <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
                        style={{ color: C.muted }}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    {step < 4 ? (
                        <button onClick={() => setStep(s => Math.min(4, s + 1))}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: C.navy, color: 'white' }}>
                            {WIZARD_STEPS[step + 1].label} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button onClick={onClose}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                            style={{ background: C.gold, color: C.surface }}>
                            <Rocket className="w-3.5 h-3.5" /> Close & Plan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function BriefStep() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: C.navy }}>
                    <Rocket className="w-6 h-6" style={{ color: C.gold }} />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: C.text }}>Mission Brief</h2>
                    <p className="text-sm" style={{ color: C.muted }}>TOP 100 OS — How We Work</p>
                </div>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: C.text }}>
                This guided engine walks your team through the three-day Seasonal Planning ceremony —
                from async readiness gates to the final fist-of-five confidence vote. Every deliverable
                passes a gate before it ships.
            </p>
            <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.muted }}>Operating Principles</span>
                {OPERATING_PRINCIPLES.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                        <span className="text-sm" style={{ color: C.text }}>{p}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReadinessStep({ state, onToggle, readinessComplete, gatePassed }) {
    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>Day Zero — Readiness Gate</h2>
            <p className="text-sm mb-6" style={{ color: C.muted }}>Async prep. All blocks must clear before the room convenes.</p>
            <div className="space-y-2">
                {READINESS_BLOCKS.map((b) => {
                    const Icon = ICONS[b.icon] || Circle;
                    const checked = state.readiness[b.id];
                    const isGate = b.isGate;
                    const locked = isGate && !readinessComplete;
                    return (
                        <button key={b.id} onClick={() => !locked && onToggle('readiness', b.id)} disabled={locked}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                            style={{
                                background: checked ? `${C.green}10` : C.panel,
                                border: `1px solid ${checked ? C.green : locked ? `${C.border}` : C.border}`,
                                opacity: locked ? 0.4 : 1,
                            }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: checked ? C.green : 'transparent', border: `1px solid ${checked ? 'transparent' : C.border}` }}>
                                {checked ? <Check className="w-4 h-4" style={{ color: C.surface }} /> : locked ? <Lock className="w-4 h-4" style={{ color: C.dim }} /> : <Icon className="w-4 h-4" style={{ color: C.gold }} />}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-semibold" style={{ color: checked ? C.green : C.text }}>{b.label}</span>
                                <p className="text-[11px]" style={{ color: C.muted }}>{b.desc}</p>
                            </div>
                            {isGate && <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold" style={{ background: gatePassed ? C.green : C.navy, color: 'white' }}>Gate</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ContextStep({ state, onToggle }) {
    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>Day One — Context & Draft</h2>
            <p className="text-sm mb-6" style={{ color: C.muted }}>Align, break out, review.</p>
            <div className="space-y-4">
                {DAY_ONE_PHASES.map((p, i) => {
                    const done = state.dayOne[p.id];
                    return (
                        <div key={p.id} className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${done ? C.green : C.border}` }}>
                            <button onClick={() => onToggle('dayOne', p.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: done ? C.green : C.navy }}>
                                    {done ? <Check className="w-4 h-4" style={{ color: C.surface }} /> : <span className="text-xs font-bold text-white">{i + 1}</span>}
                                </div>
                                <span className="text-sm font-semibold flex-1" style={{ color: done ? C.green : C.text }}>{p.name}</span>
                            </button>
                            <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Activities</span>
                                    <ul className="space-y-1 mt-1">
                                        {p.activities.map((a, j) => <li key={j} className="text-[11px] flex gap-1.5" style={{ color: C.muted }}><span style={{ color: C.gold }}>›</span>{a}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Outputs</span>
                                    <ul className="space-y-1 mt-1">
                                        {p.outputs.map((o, j) => <li key={j} className="text-[11px] flex gap-1.5" style={{ color: C.muted }}><span style={{ color: C.green }}>✓</span>{o}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CommitStep({ state, setState, onToggle }) {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>Day Two — Commit & Close</h2>
                <p className="text-sm" style={{ color: C.muted }}>Finalize, ROAM the risks, vote confidence.</p>
            </div>

            {/* Finalization phase */}
            <div className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${state.dayTwo?.finalization ? C.green : C.border}` }}>
                <button onClick={() => onToggle('dayTwo', 'finalization')} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: state.dayTwo?.finalization ? C.green : C.navy }}>
                        {state.dayTwo?.finalization ? <Check className="w-4 h-4" style={{ color: C.surface }} /> : <span className="text-xs font-bold text-white">1</span>}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: state.dayTwo?.finalization ? C.green : C.text }}>Finalization</span>
                </button>
                <div className="px-4 pb-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Activities</span>
                    <ul className="space-y-1 mt-1">
                        {DAY_TWO_PHASES[0].activities.map((a, j) => <li key={j} className="text-[11px] flex gap-1.5" style={{ color: C.muted }}><span style={{ color: C.gold }}>›</span>{a}</li>)}
                    </ul>
                </div>
            </div>

            {/* ROAM Risk Pass */}
            <div className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 border-b" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <span className="text-sm font-semibold" style={{ color: C.text }}>ROAM Risk Pass</span>
                    <p className="text-[11px]" style={{ color: C.muted }}>Classify each risk into one of four categories.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                    {ROAM_CATEGORIES.map(c => {
                        const active = state.roam?.selected === c.id;
                        return (
                            <button key={c.id} onClick={() => setState(prev => ({ ...prev, roam: { ...prev.roam, selected: prev.roam?.selected === c.id ? null : c.id } }))}
                                className="p-3 rounded-lg text-left transition-all"
                                style={{ background: active ? `${c.accent}15` : 'transparent', border: `1px solid ${active ? c.accent : C.border}` }}>
                                <span className="text-xs font-bold" style={{ color: c.accent }}>{c.label}</span>
                                <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{c.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fist-of-Five Confidence Vote */}
            <div className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 border-b" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2">
                        <Hand className="w-4 h-4" style={{ color: C.gold }} />
                        <span className="text-sm font-semibold" style={{ color: C.text }}>Fist-of-Five Confidence Vote</span>
                    </div>
                    <p className="text-[11px]" style={{ color: C.muted }}>How confident are you in this plan?</p>
                </div>
                <div className="flex items-center justify-center gap-3 p-4">
                    {[1, 2, 3, 4, 5].map(n => {
                        const active = state.confidence === n;
                        return (
                            <button key={n} onClick={() => setState(prev => ({ ...prev, confidence: prev.confidence === n ? null : n }))}
                                className="flex flex-col items-center gap-1.5 group">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                                    style={{ background: active ? C.gold : 'transparent', border: `2px solid ${active ? C.gold : C.border}` }}>
                                    <Hand className="w-5 h-5 transition-transform" style={{ color: active ? C.surface : C.muted, transform: active ? 'scale(1.1)' : 'scale(1)' }} />
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: active ? C.gold : C.muted }}>{n}</span>
                            </button>
                        );
                    })}
                </div>
                {state.confidence !== null && state.confidence < 3 && (
                    <div className="px-4 pb-3">
                        <div className="rounded-lg p-3 text-center" style={{ background: `${C.copper}15`, border: `1px solid ${C.copper}` }}>
                            <span className="text-xs font-semibold" style={{ color: C.copper }}>Below threshold — plan rework triggered.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Commit phase checkbox */}
            <div className="rounded-xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${state.dayTwo?.commit ? C.green : C.border}` }}>
                <button onClick={() => onToggle('dayTwo', 'commit')} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: state.dayTwo?.commit ? C.green : C.navy }}>
                        {state.dayTwo?.commit ? <Check className="w-4 h-4" style={{ color: C.surface }} /> : <span className="text-xs font-bold text-white">2</span>}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: state.dayTwo?.commit ? C.green : C.text }}>Risk & Commit Complete</span>
                </button>
            </div>
        </div>
    );
}

function LaunchStep() {
    return (
        <div className="max-w-2xl mx-auto text-center py-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.gold})` }}>
                <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Planning Complete</h2>
            <p className="text-sm mb-8" style={{ color: C.muted }}>
                Season objectives locked. Risks ROAM'd. Confidence recorded. The season is ready to execute.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${C.green}15`, border: `1px solid ${C.green}` }}>
                <Check className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-sm font-semibold" style={{ color: C.green }}>Liftoff confirmed</span>
            </div>
        </div>
    );
}