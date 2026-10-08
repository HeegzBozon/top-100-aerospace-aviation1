import React, { useState } from 'react';
import { Plus, Trash2, FileText, FileUp, Crown } from 'lucide-react';
import { MAGAZINE_PALETTE as P, SECTION_TYPES, SECTION_GROUPS, ASSEMBLY_MODES, THEME_ACCENTS, DEFAULT_SECTIONS, VOLUME_IV_BLUEPRINT, sectionGroupLabel } from '@/components/magazine/magazineConfig';
import PdfUploadPanel from '@/components/magazine/PdfUploadPanel';

let sectionIdCounter = 0;

export default function IssueBlueprint({ issue, articles, pages, onUpdate }) {
  const [title, setTitle] = useState(issue.title || '');
  const [subtitle, setSubtitle] = useState(issue.subtitle || '');
  const [coverKicker, setCoverKicker] = useState(issue.cover_kicker || '');
  const [coverUrl, setCoverUrl] = useState(issue.cover_image_url || '');
  const [coverCredits, setCoverCredits] = useState(issue.cover_credits || {});
  const [preface, setPreface] = useState(issue.preface || '');
  const [colophon, setColophon] = useState(issue.colophon || '');
  const [sections, setSections] = useState(issue.sections || []);
  const [assemblyMode, setAssemblyMode] = useState(issue.assembly_mode || 'native');
  const [themeAccent, setThemeAccent] = useState(issue.theme_accent || 'navy');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate(issue.id, {
        title, subtitle, cover_kicker: coverKicker, cover_image_url: coverUrl,
        cover_credits: coverCredits, preface, colophon, sections,
        assembly_mode: assemblyMode, theme_accent: themeAccent,
      });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const id = `sec-${Date.now()}-${sectionIdCounter++}`;
    setSections([...sections, { id, name: 'New Section', section_type: 'evergreen', section_group: 'well', order: sections.length }]);
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSection = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (idx, dir) => {
    const newSections = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= newSections.length) return;
    [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const loadDefaultSections = () => {
    setSections(DEFAULT_SECTIONS.map((s, i) => ({ ...s, order: i, id: `${s.id}-${Date.now()}` })));
  };

  const loadVolumeIVBlueprint = () => {
    setTitle(VOLUME_IV_BLUEPRINT.title);
    setSubtitle(VOLUME_IV_BLUEPRINT.subtitle);
    setCoverKicker(VOLUME_IV_BLUEPRINT.cover_kicker);
    setColophon(VOLUME_IV_BLUEPRINT.colophon);
    setSections(VOLUME_IV_BLUEPRINT.sections.map((s, i) => ({ ...s, order: i, id: `${s.id}-${Date.now()}` })));
  };

  // Group sections by section_group for visual display
  const groupedSections = SECTION_GROUPS.map((group) => ({
    ...group,
    items: sections.filter((s) => (s.section_group || 'well') === group.key),
  }));

  const updateCoverCredit = (field, value) => {
    setCoverCredits({ ...coverCredits, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Volume IV Quick Start */}
      {sections.length === 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(184,115,51,0.05)', border: `1px solid ${P.copper}30` }}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4" style={{ color: P.copper }} />
            <h3 className="text-sm font-serif" style={{ color: P.navy }}>Volume IV Flagship Blueprint</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'rgba(30,58,90,0.6)' }}>
            Load the September-issue structure: Front of Book, an expanded honoree Well with themed packages, and Back of Book.
          </p>
          <div className="flex gap-2">
            <button onClick={loadVolumeIVBlueprint} className="mag-btn-primary">
              <Crown className="w-4 h-4 inline mr-1.5" /> Load Volume IV Blueprint
            </button>
            <button onClick={loadDefaultSections} className="mag-btn-secondary">Basic Skeleton</button>
          </div>
        </div>
      )}

      {/* Issue Identity */}
      <Section title="Issue Identity">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mag-input" placeholder="TOP 100 Aerospace & Aviation 2026" />
        </Field>
        <Field label="Subtitle">
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mag-input" placeholder="The 2026 Edition" />
        </Field>
        <Field label="Cover Kicker">
          <input value={coverKicker} onChange={(e) => setCoverKicker(e.target.value)} className="mag-input" placeholder="The 2026 Edition" />
        </Field>
        <Field label="Cover Image URL">
          <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="mag-input" placeholder="https://..." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Theme Accent">
            <select value={themeAccent} onChange={(e) => setThemeAccent(e.target.value)} className="mag-input">
              {THEME_ACCENTS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Assembly Mode">
            <select value={assemblyMode} onChange={(e) => setAssemblyMode(e.target.value)} className="mag-input">
              {ASSEMBLY_MODES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Cover Credits */}
      <Section title="Cover Credits" subtitle="Subject, photographer, and writer — in the Vogue format">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Cover Subject">
            <input value={coverCredits.subject || ''} onChange={(e) => updateCoverCredit('subject', e.target.value)} className="mag-input" placeholder="Honoree name" />
          </Field>
          <Field label="Photographer / Artist">
            <input value={coverCredits.photographer || ''} onChange={(e) => updateCoverCredit('photographer', e.target.value)} className="mag-input" placeholder="Photographer credit" />
          </Field>
          <Field label="Writer">
            <input value={coverCredits.writer || ''} onChange={(e) => updateCoverCredit('writer', e.target.value)} className="mag-input" placeholder="Writer credit" />
          </Field>
        </div>
      </Section>

      {/* Assembly Mode Panel */}
      {assemblyMode === 'pdf' && (
        <PdfUploadPanel issue={issue} onUpdate={onUpdate} />
      )}

      {/* Editorial Blueprint — Sections grouped by position */}
      <Section title="Editorial Blueprint" subtitle="Front of Book → The Well → Back of Book">
        {sections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm mb-4" style={{ color: 'rgba(30,58,90,0.5)' }}>No sections defined yet.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={loadVolumeIVBlueprint} className="mag-btn-primary"><Crown className="w-4 h-4 inline mr-1" /> Volume IV Blueprint</button>
              <button onClick={loadDefaultSections} className="mag-btn-secondary">Basic Skeleton</button>
              <button onClick={addSection} className="mag-btn-secondary"><Plus className="w-4 h-4 inline mr-1" /> Add Section</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSections.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: P.copper }}>{group.label}</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(30,58,90,0.1)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(30,58,90,0.4)' }}>{group.items.length}</span>
                </div>
                <div className="space-y-2">
                  {group.items.map((sec) => {
                    const idx = sections.findIndex((s) => s.id === sec.id);
                    return (
                      <div key={sec.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(30,58,90,0.03)' }}>
                        <div className="flex flex-col">
                          <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="text-[10px] disabled:opacity-20" style={{ color: P.navy }}>▲</button>
                          <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="text-[10px] disabled:opacity-20" style={{ color: P.navy }}>▼</button>
                        </div>
                        <span className="text-xs font-mono w-6 text-center" style={{ color: P.gold }}>{String(idx + 1).padStart(2, '0')}</span>
                        <input
                          value={sec.name}
                          onChange={(e) => updateSection(sec.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1.5 text-sm rounded-lg border-0 bg-white min-w-0"
                          style={{ outline: '1px solid rgba(30,58,90,0.15)' }}
                        />
                        <select
                          value={sec.section_type}
                          onChange={(e) => updateSection(sec.id, 'section_type', e.target.value)}
                          className="px-2 py-1.5 text-xs rounded-lg border-0 bg-white"
                          style={{ outline: '1px solid rgba(30,58,90,0.15)' }}
                        >
                          {SECTION_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </select>
                        <select
                          value={sec.section_group || 'well'}
                          onChange={(e) => updateSection(sec.id, 'section_group', e.target.value)}
                          className="px-2 py-1.5 text-xs rounded-lg border-0 bg-white"
                          style={{ outline: '1px solid rgba(30,58,90,0.15)' }}
                        >
                          {SECTION_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
                        </select>
                        <button onClick={() => removeSection(sec.id)} className="p-1 rounded-full hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(30,58,90,0.4)' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <button onClick={addSection} className="mag-btn-secondary mt-2"><Plus className="w-4 h-4 inline mr-1" /> Add Section</button>
          </div>
        )}
      </Section>

      {/* Editor's Letter & Colophon */}
      <Section title="Editor's Letter & Colophon">
        <Field label="Editor's Letter (Preface)">
          <textarea value={preface} onChange={(e) => setPreface(e.target.value)} rows={5} className="mag-input" placeholder="The opening letter from the editor..." />
        </Field>
        <Field label="Colophon (Closing)">
          <textarea value={colophon} onChange={(e) => setColophon(e.target.value)} rows={3} className="mag-input" placeholder="Closing institutional matter..." />
        </Field>
      </Section>

      {/* Save */}
      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving} className="mag-btn-primary px-6 py-2.5 shadow-lg">
          {saving ? 'Saving...' : 'Save Blueprint'}
        </button>
      </div>

      <style>{`
        .mag-input {
          width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.5rem;
          background: #fff; border: 0; outline: 1px solid rgba(30,58,90,0.15); color: ${P.navy};
        }
        .mag-input:focus { outline: 2px solid ${P.gold}; }
        .mag-btn-primary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: ${P.navy}; color: ${P.cream}; border: 0; cursor: pointer; transition: opacity 0.2s;
        }
        .mag-btn-primary:hover { opacity: 0.9; }
        .mag-btn-primary:disabled { opacity: 0.5; }
        .mag-btn-secondary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: transparent; color: ${P.navy}; border: 1px solid rgba(30,58,90,0.2); cursor: pointer; transition: all 0.2s;
        }
        .mag-btn-secondary:hover { background: rgba(30,58,90,0.05); }
      `}</style>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <h3 className="text-sm font-serif mb-1" style={{ color: P.navy }}>{title}</h3>
      {subtitle && <p className="text-xs mb-4" style={{ color: 'rgba(30,58,90,0.5)' }}>{subtitle}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>{label}</label>
      {children}
    </div>
  );
}