import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, X, Check, Flame, Rocket } from 'lucide-react';

const B = {
    navy: '#1e3a5a',
    gold: '#c9a87c',
    cream: '#faf8f5',
    sand: '#f5f0e8',
    copper: '#b87333',
    muted: '#5d7a94',
    border: '#e8e0d4',
    rose: '#c87e9d',
};

const WSJF_FIELDS = [
    { key: 'business_value', label: 'Business Value' },
    { key: 'time_criticality', label: 'Time Criticality' },
    { key: 'risk_reduction', label: 'Risk Reduction' },
    { key: 'job_size', label: 'Job Size' },
];

export default function TypeformFlow({ steps, form, setForm, onSubmit, onClose, title, saving, isEdit, onDelete }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [direction, setDirection] = useState('forward');
    const [streak, setStreak] = useState(0);
    const [validationError, setValidationError] = useState(null);
    const [celebrating, setCelebrating] = useState(false);
    const inputRef = useRef(null);
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    const step = steps[stepIdx];
    const progress = Math.round(((stepIdx + 1) / steps.length) * 100);
    const isLast = stepIdx === steps.length - 1;
    const isWsjf = step?.type === 'wsjf';

    const fieldValue = step?.key && !isWsjf ? form[step.key] : '';
    const isEmpty = !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');

    // Lock body scroll
    useEffect(() => {
        const orig = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = orig; };
    }, []);

    // Auto-focus input on step change
    useEffect(() => {
        if (isWsjf || step?.type === 'select' || step?.type === 'custom') return;
        const timer = setTimeout(() => inputRef.current?.focus(), 200);
        return () => clearTimeout(timer);
    }, [stepIdx, isWsjf, step?.type]);

    // --- Navigation ---
    const handleComplete = () => {
        setCelebrating(true);
        const colors = [B.navy, B.gold, B.cream, B.copper, B.rose];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors, scalar: 0.9 });
        setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors }), 200);
        setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, colors }), 400);
        setTimeout(async () => {
            try { await onSubmitRef.current(); }
            catch { /* parent handles error toast */ }
            finally { setCelebrating(false); }
        }, 1100);
    };

    const advance = () => {
        if (celebrating) return;
        if (step?.required && isEmpty && !isWsjf) return;
        if (step?.validate) {
            const err = step.validate(form);
            if (err) { setValidationError(err); return; }
        }
        setValidationError(null);
        if (isLast) { handleComplete(); return; }
        setDirection('forward');
        setStreak(s => s + 1);
        setStepIdx(i => i + 1);
    };

    const goBack = () => {
        if (stepIdx > 0) {
            setDirection('backward');
            setStreak(s => Math.max(0, s - 1));
            setValidationError(null);
            setStepIdx(i => i - 1);
        }
    };

    const selectAndAdvance = (newForm) => {
        setForm(newForm);
        setValidationError(null);
        if (step?.validate) {
            const err = step.validate(newForm);
            if (err) { setValidationError(err); return; }
        }
        if (isLast) { handleComplete(); return; }
        setDirection('forward');
        setStreak(s => s + 1);
        setTimeout(() => setStepIdx(i => i + 1), 250);
    };

    // --- Keyboard navigation ---
    useEffect(() => {
        const handler = (e) => {
            if (celebrating) return;
            const el = document.activeElement;
            const tag = el?.tagName;
            const inText = tag === 'INPUT' || tag === 'TEXTAREA';

            if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }

            if (e.key === 'Enter' && !e.shiftKey && tag !== 'TEXTAREA') {
                e.preventDefault(); advance(); return;
            }
            if (e.key === 'Enter' && e.ctrlKey && tag === 'TEXTAREA') {
                e.preventDefault(); advance(); return;
            }
            if (e.key === 'Backspace' && tag === 'INPUT' && el.value === '') {
                e.preventDefault(); goBack(); return;
            }
            if (step?.type === 'select' && step.options && !inText) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= step.options.length) {
                    e.preventDefault();
                    selectAndAdvance({ ...form, [step.key]: step.options[num - 1].value });
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [stepIdx, form, step, isLast, celebrating]);

    // --- Render ---
    const renderField = () => {
        if (!step) return null;

        if (step.type === 'text' || step.type === 'number' || step.type === 'date') {
            return (
                <Input
                    ref={inputRef}
                    type={step.type === 'text' ? 'text' : step.type}
                    autoComplete="off"
                    value={form[step.key] ?? ''}
                    onChange={e => { setForm({ ...form, [step.key]: e.target.value }); setValidationError(null); }}
                    placeholder={step.placeholder}
                    className="text-lg h-14 border-0 border-b-2 rounded-none bg-transparent px-0"
                    style={{ borderBottomColor: B.gold, color: B.navy }}
                />
            );
        }

        if (step.type === 'textarea') {
            return (
                <Textarea
                    ref={inputRef}
                    autoComplete="off"
                    value={form[step.key] ?? ''}
                    onChange={e => { setForm({ ...form, [step.key]: e.target.value }); setValidationError(null); }}
                    placeholder={step.placeholder}
                    rows={4}
                    className="text-base border-0 border-b-2 rounded-none bg-transparent px-0 resize-none"
                    style={{ borderBottomColor: B.gold, color: B.navy }}
                />
            );
        }

        if (step.type === 'select') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {step.options.map((opt, i) => {
                        const selected = form[step.key] === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => selectAndAdvance({ ...form, [step.key]: opt.value })}
                                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all border-2 hover:scale-[1.02]"
                                style={{
                                    background: selected ? B.navy + '08' : '#ffffff',
                                    borderColor: selected ? B.gold : B.border,
                                }}
                            >
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: selected ? B.gold : B.sand, color: B.navy }}>
                                    {i + 1}
                                </span>
                                <span className="text-sm font-medium" style={{ color: B.navy }}>{opt.label}</span>
                                {selected && <Check className="w-4 h-4 ml-auto" style={{ color: B.gold }} />}
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (step.type === 'wsjf') {
            return (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {WSJF_FIELDS.map(sf => (
                        <div key={sf.key} className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: B.muted }}>{sf.label}</label>
                            <Input
                                type="number" min={0} max={10}
                                value={form[sf.key] ?? ''}
                                onChange={e => setForm({ ...form, [sf.key]: e.target.value })}
                                placeholder="0–10"
                                className="h-12 border-0 border-b-2 rounded-none bg-transparent px-0"
                                style={{ borderBottomColor: B.gold, color: B.navy }}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        if (step.type === 'custom' && step.render) {
            return step.render({ form, setForm, B });
        }

        return null;
    };

    const keyboardHint = step?.type === 'select'
        ? `Press 1–${step.options?.length || 9} to select`
        : step?.type === 'textarea'
            ? 'Ctrl + ↵ to continue'
            : step?.required && isEmpty
                ? 'Type your answer, then ↵'
                : '↵ to continue';

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !celebrating) onClose(); }}>
            <DialogContent
                    className="p-0 gap-0 overflow-hidden max-w-lg max-h-[85vh] flex flex-col"
                    style={{ background: B.cream, borderRadius: '1rem' }}
                    onInteractOutside={(e) => { if (!celebrating) e.preventDefault(); }}
                >
                    <style>{`
                        @keyframes tf-slide-fwd { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
                        @keyframes tf-slide-bwd { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                    `}</style>

                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-4 pr-10 flex-shrink-0">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: B.muted }}>
                            {title}
                        </span>
                        <div className="flex items-center gap-3">
                            {streak >= 2 && (
                                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: B.copper }}>
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>{streak}</span>
                                    {streak >= 5 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: B.copper, color: 'white' }}>ON FIRE</span>
                                    )}
                                </div>
                            )}
                            <span className="text-xs font-medium" style={{ color: B.muted }}>
                                {stepIdx + 1} / {steps.length}
                            </span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div key={stepIdx} style={{
                            animation: direction === 'forward'
                                ? 'tf-slide-fwd 0.3s ease-out'
                                : 'tf-slide-bwd 0.3s ease-out',
                        }}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: B.navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
                                {step?.question}
                            </h2>
                            {step?.subtitle && (
                                <p className="text-sm mb-5" style={{ color: B.muted }}>{step.subtitle}</p>
                            )}
                            <div className="mt-3">
                                {renderField()}
                            </div>
                            {validationError && (
                                <div className="flex items-center gap-2 text-xs mt-3 p-2.5 rounded-lg" style={{ background: B.rose + '12', color: B.rose }}>
                                    <span>⚠</span>
                                    {validationError}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6 mb-4">
                            <div>
                                {stepIdx > 0 ? (
                                    <button onClick={goBack} className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: B.muted }}>
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                ) : onDelete && isEdit ? (
                                    <button onClick={onDelete} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                                        Delete
                                    </button>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs hidden sm:block" style={{ color: B.muted }}>{keyboardHint}</span>
                                <Button
                                    onClick={advance}
                                    disabled={saving || (step?.required && isEmpty && !isWsjf)}
                                    className="flex items-center gap-1.5"
                                    style={{ background: B.navy, color: 'white' }}
                                >
                                    {saving ? 'Saving...' : isLast ? (isEdit ? 'Update' : 'Launch') : 'Next'}
                                    {!isLast && <ChevronRight className="w-4 h-4" />}
                                    {isLast && <Rocket className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full flex-shrink-0" style={{ background: B.sand }}>
                        <div className="h-full transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${B.navy}, ${B.gold})`,
                            }}
                        />
                    </div>

                    {/* Celebration overlay */}
                    {celebrating && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ background: 'rgba(250,248,245,0.92)', borderRadius: '1rem' }}>
                            <div className="text-center" style={{ animation: 'tf-slide-fwd 0.4s ease-out' }}>
                                <div className="text-5xl mb-3">🚀</div>
                                <p className="text-xl font-bold" style={{ color: B.navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
                                    {isEdit ? 'Updated!' : 'Launched!'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
        </Dialog>
    );
}