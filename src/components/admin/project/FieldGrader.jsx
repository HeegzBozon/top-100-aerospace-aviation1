import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

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

const GRADE_COLORS = {
    A: '#2d7a4e',
    B: '#5a9a4c',
    C: B.gold,
    D: '#c8873e',
    F: '#c85a5a',
};

const RUBRICS = {
    title: {
        'Strategic Theme': 'A strong strategic theme title names an outcome (not a feature), is ambitious but measurable, and is specific enough to guide portfolio-level decisions. Weak: "Growth". Strong: "Expand Local Legends to 50 cities".',
        'Initiative': 'A strong initiative title names a capability to build or deliver at the solution-train level, led by an action verb. Weak: "Chamber". Strong: "Launch Chamber 2.0 Membership Tiers".',
        'Roadmap Item': 'A strong epic title is a program-level deliverable with a clear verb that a team can build within a PI. Weak: "RSVP". Strong: "Build RSVP confirmation email".',
        'Story': 'A strong story title describes team-level work one person can finish in a sprint — ideally follows "As a [user], I want [action] so that [value]" or a concise verb-led phrase.',
    },
    description: {
        'Strategic Theme': 'A strong description paints what "done" looks like in concrete, verifiable terms — what changes in the world and what you can point to as evidence of success.',
        'Initiative': 'A strong description lists scope boundaries (what is in and out) and the capability being delivered, preventing scope creep later.',
        'Roadmap Item': 'A strong description includes the "why" briefly, key constraints, and enough detail that the team can work from it as a spec.',
        'Story': 'A strong description uses Given/When/Then acceptance criteria that make "done" unambiguous and testable.',
    },
};

const SCHEMA = {
    type: 'object',
    properties: {
        score: { type: 'number', description: '0-10' },
        grade: { type: 'string', description: 'A, B, C, D, or F' },
        feedback: { type: 'string', description: '1-2 sentences of specific, actionable feedback' },
        strengths: { type: 'string', description: 'What is good about it, 1 sentence' },
        improvements: { type: 'string', description: '1-2 specific suggestions to improve' },
    },
};

export default function FieldGrader({ entityType, fieldType, value, autoGrade }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const rubric = RUBRICS[fieldType]?.[entityType] || `A strong ${fieldType} is clear, specific, and actionable.`;

    const grade = async () => {
        if (loading) return;
        if (!value || !value.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const prompt = `You are a SAFe (Scaled Agile Framework) writing coach. Grade this ${fieldType} for a ${entityType}.

${fieldType === 'title' ? 'Title' : 'Description'}: "${value}"

Rubric: ${rubric}

Respond with a score (0-10), a letter grade (A/B/C/D/F), specific feedback, what is strong, and concrete improvements.`;
            const res = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: SCHEMA,
            });
            setResult(res);
        } catch (e) {
            setError('Could not grade — try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-grade on mount when requested (edit flow / review screen)
    useEffect(() => {
        if (autoGrade && value && String(value).trim()) {
            grade();
        }
    }, [autoGrade]);

    // Idle state — show the Grade button
    if (!loading && !result && !error) {
        return (
            <button
                onClick={grade}
                disabled={!value || !value.trim()}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 disabled:opacity-30"
                style={{ background: B.sand, color: B.copper, border: `1px solid ${B.border}` }}
            >
                <Sparkles className="w-3.5 h-3.5" />
                Grade with AI
            </button>
        );
    }

    return (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: B.border, background: '#fff' }}>
            {/* Header bar */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: B.sand }}>
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: B.copper }} />
                        <span className="text-xs font-medium" style={{ color: B.muted }}>Grading...</span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="w-4 h-4" style={{ color: B.rose }} />
                        <span className="text-xs font-medium" style={{ color: B.rose }}>{error}</span>
                        <button onClick={grade} className="ml-auto p-1 rounded hover:bg-black/5">
                            <RotateCw className="w-3.5 h-3.5" style={{ color: B.muted }} />
                        </button>
                    </>
                ) : result ? (
                    <>
                        <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: GRADE_COLORS[result.grade] || B.gold, color: 'white' }}
                        >
                            {result.grade || '?'}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold" style={{ color: B.navy }}>
                                {result.score}/10
                            </span>
                        </div>
                        <button onClick={grade} className="ml-auto p-1 rounded hover:bg-black/5" title="Re-grade">
                            <RotateCw className="w-3.5 h-3.5" style={{ color: B.muted }} />
                        </button>
                    </>
                ) : null}
            </div>

            {/* Result body */}
            {result && (
                <div className="px-3 py-2.5 space-y-2">
                    <p className="text-xs leading-relaxed" style={{ color: B.navy }}>
                        {result.feedback}
                    </p>
                    {result.strengths && (
                        <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2d7a4e' }} />
                            <p className="text-xs leading-relaxed" style={{ color: B.muted }}>{result.strengths}</p>
                        </div>
                    )}
                    {result.improvements && (
                        <div className="flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: B.copper }} />
                            <p className="text-xs leading-relaxed" style={{ color: B.muted }}>{result.improvements}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}