import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Upload } from 'lucide-react';
import { STORY_PROMPTS } from './documentaryChapters';

const KIND_BY_TYPE = (type = '', name = '') => {
  if (type.startsWith('video/')) return 'clip';
  if (type.startsWith('audio/')) return 'recording';
  if (type.startsWith('image/')) return 'photo';
  if (/\.(pdf|docx?|txt|md)$/i.test(name)) return 'document';
  return 'photo';
};

// The Fellow's own cut. Every question answered is footage; every file added is
// material. Nothing here touches measurement — it only lengthens the film.
export default function DocumentaryDirectorNote({
  activeChapter,
  chapters,
  openPrompts,
  settings,
  fellowEmail,
  onSaved,
}) {
  const [drafts, setDrafts] = useState(settings?.documentary_prompts || {});
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    setDrafts(settings?.documentary_prompts || {});
  }, [settings?.documentary_prompts]);

  const persist = async (patch) => {
    if (settings?.id) {
      await base44.entities.FellowProfileSettings.update(settings.id, patch);
    } else {
      await base44.entities.FellowProfileSettings.create({ fellow_email: fellowEmail, ...patch });
    }
    onSaved?.();
  };

  const savePrompt = async (key) => {
    const text = (drafts[key] || '').trim();
    setError('');
    if (!text) {
      setError('Write the answer first — the film only keeps what you actually say.');
      return;
    }
    setSavingKey(key);
    try {
      await persist({
        documentary_prompts: {
          ...(settings?.documentary_prompts || {}),
          [key]: text.slice(0, 600),
        },
      });
      setSavedKey(key);
    } catch (e) {
      setError(e?.message || 'That answer could not be saved.');
    } finally {
      setSavingKey(null);
    }
  };

  const uploadMedia = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const kind = KIND_BY_TYPE(file.type, file.name);
      await persist({
        documentary_media: [
          ...(settings?.documentary_media || []),
          {
            key: `${Date.now()}`,
            chapter: activeChapter?.key || 'opening',
            kind,
            url: file_url,
            caption: '',
          },
        ],
      });
    } catch (e) {
      setError(e?.message || 'That file could not be added.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const contributions = settings?.documentary_media?.length || 0;
  const answered = STORY_PROMPTS.length - openPrompts.length;

  return (
    <section className="border-t border-editorial-gold/20 bg-[#0a1624] px-5 py-10 sm:px-10">
      <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.3em] text-editorial-copper">
        Director's note · only you see this
      </p>
      <h3 className="mt-3 font-heading text-[22px] text-editorial-cream sm:text-[26px]">
        {answered === 0
          ? 'Your film is running on the record alone.'
          : `${answered} of ${STORY_PROMPTS.length} answers are cut in.`}
      </h3>
      <p className="mt-2 max-w-xl font-body text-[12px] leading-relaxed text-editorial-cream/55">
        Every answer becomes an interview excerpt in its own chapter, and every file you add becomes
        material for the cut. Nothing here changes how you are measured.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {STORY_PROMPTS.map((prompt) => {
          const answeredHere = !openPrompts.some((p) => p.key === prompt.key);
          return (
            <div key={prompt.key} className="doc-sheet">
              <div className="flex items-start justify-between gap-2">
                <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.24em] text-editorial-gold">
                  {prompt.label}
                </p>
                {answeredHere && (
                  <span className="flex items-center gap-1 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-editorial-cream/45">
                    <Check className="h-3 w-3" /> In the cut
                  </span>
                )}
              </div>
              <p className="mt-2 font-heading text-[14px] leading-snug text-editorial-cream/75">
                {prompt.question}
              </p>
              <textarea
                value={drafts[prompt.key] || ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [prompt.key]: e.target.value }))}
                rows={3}
                maxLength={600}
                placeholder="Type it the way you would say it."
                className="mt-3 w-full resize-none rounded-md border border-editorial-cream/15 bg-[#0d1b2b] px-3 py-2 font-body text-[13px] leading-relaxed text-editorial-cream placeholder:text-editorial-cream/30 focus:border-editorial-gold/60 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {savedKey === prompt.key && savingKey !== prompt.key && (
                  <span className="font-body text-[9.5px] uppercase tracking-[0.18em] text-editorial-cream/45">
                    Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => savePrompt(prompt.key)}
                  disabled={savingKey === prompt.key}
                  className="doc-key px-3 py-1.5"
                >
                  {savingKey === prompt.key ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="font-body text-[9px] font-bold uppercase tracking-[0.18em]">
                      Cut it in
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-editorial-cream/10 pt-5">
        <label className="doc-key cursor-pointer gap-2 px-3 py-2">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <span className="font-body text-[9.5px] font-semibold uppercase tracking-[0.2em]">
            {uploading ? 'Adding material' : 'Add a photo, clip or recording'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md"
            onChange={uploadMedia}
            className="hidden"
          />
        </label>
        <p className="font-body text-[10.5px] text-editorial-cream/45">
          Files are stored publicly — anyone with the link can open them. Added to{' '}
          <span className="text-editorial-gold/80">
            Chapter {activeChapter?.number} · {activeChapter?.label}
          </span>
          {contributions > 0 ? ` · ${contributions} contribution${contributions === 1 ? '' : 's'} so far` : ''}
        </p>
      </div>

      {chapters.length === 0 && (
        <p className="mt-3 font-body text-[10.5px] text-editorial-cream/45">
          There is nothing to cut yet.
        </p>
      )}

      {error && (
        <p className="mt-3 font-body text-[10.5px] text-[#e8a08a]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}