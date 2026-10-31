import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { EPISODE_FORMATS, EPISODE_SETTINGS, stageNote, stageLabel } from './episodeStages';
import EpisodeStatusTrack from './EpisodeStatusTrack';
import EpisodeChaptersEditor from './EpisodeChaptersEditor';
import { normalizeChapters } from './episodeChapters';

const NAVY = '#1E3A5A';
const CREAM = '#FAF8F5';
const COPPER = '#B87333';
const LABEL = '#8F5C2C';

const emptyForm = (fellowEmail, profileName) => ({
  headline: '',
  angle: '',
  topics_text: '',
  chapters: [],
  format: 'audio',
  interview_setting: 'either',
  location: '',
  availability_window: '',
  technical_notes: '',
  consent_to_publish: false,
  contact_email: fellowEmail || '',
  profile_name: profileName || '',
});

const fromIntake = (intake, fellowEmail, profileName) => ({
  ...emptyForm(fellowEmail, profileName),
  ...(intake || {}),
  topics_text: (intake?.topics || []).join('\n'),
  chapters: normalizeChapters(intake?.chapters).map((chapter) => ({ ...chapter })),
});

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="font-body text-[9.5px] font-semibold uppercase tracking-[0.2em]" style={{ color: LABEL }}>
      {label}
    </span>
    {hint && (
      <span className="mt-1 block font-body text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
        {hint}
      </span>
    )}
    <div className="mt-2">{children}</div>
  </label>
);

const inputClass =
  'w-full rounded-md border px-3 py-2 font-body text-[14px] leading-relaxed focus:outline-none';
const inputStyle = {
  borderColor: 'rgba(30,58,90,0.2)',
  background: '#ffffff',
  color: 'rgba(30,58,90,0.9)',
};

// The Fellow opening their own episode.
//
// The intake is the door: what the episode is about, how they would record it, and
// when. Everything here comes from the record they already keep — nothing is asked
// twice. Once opened, the same sheet is where the Fellow reads the stage their
// episode stands in and any note the desk has left them.
export default function EpisodeSheet({
  open,
  onClose,
  intake,
  fellowEmail,
  fellowId,
  profileName,
  onSaved,
}) {
  const [form, setForm] = useState(() => fromIntake(intake, fellowEmail, profileName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(fromIntake(intake, fellowEmail, profileName));
      setError('');
    }
  }, [open, intake, fellowEmail, profileName]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.headline.trim()) {
      setError('Give the episode a working title.');
      return;
    }
    if (!form.angle.trim()) {
      setError('Say what the episode is actually about — the desk reads this first.');
      return;
    }

    const topics = form.topics_text
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    const patch = {
      fellow_email: fellowEmail,
      fellow_id: fellowId || '',
      profile_name: profileName || '',
      headline: form.headline.trim().slice(0, 160),
      angle: form.angle.trim().slice(0, 1200),
      topics,
      chapters: normalizeChapters(form.chapters),
      format: form.format,
      interview_setting: form.interview_setting,
      location: form.location.trim().slice(0, 120),
      availability_window: form.availability_window.trim().slice(0, 240),
      technical_notes: form.technical_notes.trim().slice(0, 600),
      consent_to_publish: !!form.consent_to_publish,
      contact_email: form.contact_email.trim(),
    };

    setSaving(true);
    try {
      if (intake?.id) {
        // Answering a request for changes puts the episode back in front of the desk.
        const resubmitting = intake.status === 'changes_requested';
        await base44.entities.EpisodeIntake.update(intake.id, {
          ...patch,
          ...(resubmitting
            ? {
                status: 'in_review',
                status_history: [
                  ...(intake.status_history || []),
                  { status: 'in_review', at: new Date().toISOString(), note: 'Intake revised by the Fellow.' },
                ],
              }
            : {}),
        });
      } else {
        const now = new Date().toISOString();
        await base44.entities.EpisodeIntake.create({
          ...patch,
          status: 'intake',
          submitted_at: now,
          status_history: [{ status: 'intake', at: now, note: 'Episode opened.' }],
        });
      }
      onSaved?.();
    } catch (e) {
      setError(e?.message || 'The episode could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      style={{ background: 'rgba(7,15,31,0.62)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="h-full w-full max-w-xl overflow-y-auto"
        style={{ background: CREAM }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-sheet-title"
      >
        <header
          className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5"
          style={{ background: NAVY }}
        >
          <div>
            <p className="font-body text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(201,168,124,0.85)' }}>
              Your episode
            </p>
            <h2 id="episode-sheet-title" className="mt-2 font-heading text-[22px] leading-tight" style={{ color: CREAM }}>
              {intake ? stageLabel(intake.status) : 'Open your episode'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 transition-colors hover:bg-white/10"
            style={{ color: CREAM }}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-6 py-7">
          {intake && (
            <div className="mb-7 border-b pb-6" style={{ borderColor: 'rgba(184,115,51,0.28)' }}>
              <EpisodeStatusTrack status={intake.status} />
              <p className="mt-3 font-body text-[12.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
                {stageNote(intake.status)}
              </p>
              {intake.reviewer_note && (
                <p
                  className="mt-3 px-4 py-3 font-body text-[13px] leading-relaxed"
                  style={{ background: 'rgba(184,115,51,0.09)', borderLeft: `2px solid ${COPPER}`, color: 'rgba(30,58,90,0.85)' }}
                >
                  {intake.reviewer_note}
                </p>
              )}
            </div>
          )}

          {!intake && (
            <p className="mb-6 font-body text-[13px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.62)' }}>
              Your documentary record is the foundation of the episode: the chapters, the excerpts, and
              the material you have cut in. This intake is what the production desk reads before the
              conversation is scheduled.
            </p>
          )}

          <form onSubmit={submit} className="space-y-5">
            <Field label="Working title">
              <input
                value={form.headline}
                onChange={set('headline')}
                maxLength={160}
                placeholder="The episode, in your own phrasing"
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field
              label="What the episode is about"
              hint="The argument, the turn, the thing worth an hour of conversation."
            >
              <textarea
                value={form.angle}
                onChange={set('angle')}
                rows={4}
                maxLength={1200}
                placeholder="The story you would want told."
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </Field>

            <Field label="Subjects to cover" hint="One per line, in the order you would tell them.">
              <textarea
                value={form.topics_text}
                onChange={set('topics_text')}
                rows={4}
                placeholder={'The first circuit\nThe decision that changed the route\nWhat comes next'}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </Field>

            <EpisodeChaptersEditor
              chapters={form.chapters}
              onChange={(chapters) => setForm((f) => ({ ...f, chapters }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Format">
                <select value={form.format} onChange={set('format')} className={inputClass} style={inputStyle}>
                  {EPISODE_FORMATS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Recording">
                <select
                  value={form.interview_setting}
                  onChange={set('interview_setting')}
                  className={inputClass}
                  style={inputStyle}
                >
                  {EPISODE_SETTINGS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Where you would record" hint="City, or the room, for an in-person session.">
              <input
                value={form.location}
                onChange={set('location')}
                maxLength={120}
                placeholder="City"
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field label="When you are able to record" hint="In your own words. A window is enough.">
              <input
                value={form.availability_window}
                onChange={set('availability_window')}
                maxLength={240}
                placeholder="Weekday mornings, or after the conference"
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field label="Anything the production desk should know" hint="Microphone, camera, room, connection.">
              <textarea
                value={form.technical_notes}
                onChange={set('technical_notes')}
                rows={3}
                maxLength={600}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </Field>

            <Field label="Where the desk should write" hint="Never published on your record.">
              <input
                type="email"
                value={form.contact_email}
                onChange={set('contact_email')}
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <label className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={!!form.consent_to_publish}
                onChange={set('consent_to_publish')}
                className="mt-0.5 h-4 w-4"
              />
              <span className="font-body text-[12.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.75)' }}>
                The finished episode may be published as part of my record.
              </span>
            </label>

            {error && (
              <p className="font-body text-[12px] leading-relaxed" style={{ color: '#9c3b22' }} role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 font-body text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                style={{ background: COPPER, border: `1px solid ${COPPER}`, color: CREAM }}
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {intake ? 'Save the intake' : 'Open the episode'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 font-body text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(30,58,90,0.55)' }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}