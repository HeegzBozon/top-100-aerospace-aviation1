import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Upload, ExternalLink, Globe, Loader2, Settings, X, Plus, Trash2, Save, Mail, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendOnboardingEmail } from '@/functions/sendOnboardingEmail';

// ─── helpers ───────────────────────────────────────────────────────────────
function interpolateDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildPlan(pkg) {
  return [
    { label: 'Deposit', amount: pkg.deposit_amount, note: 'Due now', due_date: null },
    ...(pkg.payment_installments || []).map(p => ({
      label: p.label || 'Payment',
      amount: p.amount,
      note: p.note || '',
      due_date: p.due_date || null,
    })),
  ];
}

function interpolate(text, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v ?? ''), text || '');
}

const STATIC_PKG = {
  name: 'Standard Package',
  headline: 'Your Digital Presence Starts Here',
  subheadline: "We're building something great together. Here's everything you need to kick things off.",
  scope_items: ['New Website', 'SEO', 'Google Business Profile', 'Hosting'],
  deposit_amount: 350,
  total_amount: 2000,
  payment_installments: [
    { label: 'Payment 2', amount: 825, due_date: '2026-05-01', note: '' },
    { label: 'Final Payment', amount: 825, due_date: '2026-06-01', note: '' },
  ],
  closing_quote: '"The sooner these are in, the sooner you\'re live."',
  closing_body: "Our call becomes a review — you'll see real progress, not a blank screen.",
};

const IC = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
const LC = "block text-xs font-semibold text-slate-500 mb-1";

// ─── main page ─────────────────────────────────────────────────────────────
export default function OnboardingKickstarter() {
  const [pkg, setPkg] = useState(null);
  const [pkgId, setPkgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [draft, setDraft] = useState(null);       // editable copy
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newScope, setNewScope] = useState('');
  const [showSendPanel, setShowSendPanel] = useState(false);

  // client state
  const [checklist, setChecklist] = useState({ deposit: false, questionnaire: false, assets: false, inspiration: false });
  const [inspirationLinks, setInspirationLinks] = useState(['', '', '']);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // send email state
  const [templates, setTemplates] = useState([]);
  const [sendForm, setSendForm] = useState({ to_email: '', to_name: '', subject: '', body: '', template_id: '' });
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ── load pkg ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('pkg');
    setPkgId(id || null);
    const load = id
      ? base44.entities.OnboardingPackage.filter({ id }, '', 1).then(r => (Array.isArray(r) ? r[0] : r) || STATIC_PKG)
      : Promise.resolve(STATIC_PKG);
    load.then(p => { setPkg(p); setDraft(JSON.parse(JSON.stringify(p))); }).finally(() => setLoading(false));
  }, []);

  // ── load templates when send panel opens ──
  useEffect(() => {
    if (showSendPanel && templates.length === 0) {
      base44.entities.EmailTemplate.list('-created_date', 50).then(setTemplates);
    }
  }, [showSendPanel]);

  // ── auth check for admin toggle ──
  const handleAdminToggle = async () => {
    if (!isAdmin) {
      try {
        const me = await base44.auth.me();
        if (me?.role !== 'admin') return alert('Admin access required.');
      } catch { return alert('You must be logged in as admin.'); }
    }
    setIsAdmin(v => !v);
  };

  // ── draft helpers ──
  const setD = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const updateInstallment = (i, key, val) => {
    const updated = [...draft.payment_installments];
    updated[i] = { ...updated[i], [key]: val };
    setD('payment_installments', updated);
  };
  const addInstallment = () => setD('payment_installments', [...draft.payment_installments, { label: '', amount: '', due_date: '', note: '' }]);
  const removeInstallment = (i) => setD('payment_installments', draft.payment_installments.filter((_, idx) => idx !== i));
  const addScope = () => { if (!newScope.trim()) return; setD('scope_items', [...(draft.scope_items || []), newScope.trim()]); setNewScope(''); };
  const removeScope = (i) => setD('scope_items', draft.scope_items.filter((_, idx) => idx !== i));

  // ── save ──
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...draft,
      total_amount: Number(draft.total_amount),
      deposit_amount: Number(draft.deposit_amount),
      payment_installments: draft.payment_installments.map(p => ({ ...p, amount: Number(p.amount) })),
    };
    let saved_pkg;
    if (pkgId && pkg?.id) {
      saved_pkg = await base44.entities.OnboardingPackage.update(pkg.id, payload);
    } else {
      saved_pkg = await base44.entities.OnboardingPackage.create(payload);
      const newId = saved_pkg?.id;
      if (newId) window.history.replaceState({}, '', `?pkg=${newId}`);
    }
    setPkg({ ...payload, id: saved_pkg?.id || pkg?.id });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── send email ──
  const applyTemplate = (tpl) => {
    const vars = {
      client_name: sendForm.to_name || 'there',
      package_name: draft?.name || '',
      onboarding_url: window.location.href,
      deposit_amount: draft?.deposit_amount ?? '',
      total_amount: draft?.total_amount ?? '',
    };
    setSendForm(f => ({ ...f, subject: interpolate(tpl.subject, vars), body: interpolate(tpl.body, vars), template_id: tpl.id }));
  };

  const handleSend = async () => {
    setSending(true);
    await sendOnboardingEmail({ to_email: sendForm.to_email, to_name: sendForm.to_name, subject: sendForm.subject, body: sendForm.body });
    setSending(false);
    setEmailSent(true);
    setTimeout(() => { setEmailSent(false); setShowSendPanel(false); }, 2500);
  };

  // ── client helpers ──
  const toggleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toggleCheck('assets');
    } finally { setUploading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
  );

  const display = isAdmin ? draft : pkg; // admin sees live draft; client sees saved pkg
  const plan = buildPlan(display);
  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">

      {/* ── Floating admin toggle ── */}
      <button
        onClick={handleAdminToggle}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all ${
          isAdmin ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'
        }`}
      >
        {isAdmin ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
        {isAdmin ? 'Exit Edit Mode' : 'Edit'}
      </button>

      {/* ── Admin inline edit panel (slides in from right) ── */}
      {isAdmin && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl z-40 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
            <div>
              <p className="font-bold text-slate-800 text-sm">Edit Package</p>
              <p className="text-xs text-slate-400">Changes reflect live in the preview</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSendPanel(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Send
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Send Email sub-panel */}
          {showSendPanel && (
            <div className="m-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Send Onboarding Email</p>
              {emailSent ? (
                <p className="text-sm text-green-700 font-semibold py-2">✓ Email sent!</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={LC}>Client Name</label>
                      <input className={IC} value={sendForm.to_name} onChange={e => setSendForm(f => ({ ...f, to_name: e.target.value }))} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className={LC}>Email *</label>
                      <input className={IC} type="email" value={sendForm.to_email} onChange={e => setSendForm(f => ({ ...f, to_email: e.target.value }))} placeholder="client@co.com" />
                    </div>
                  </div>
                  <div>
                    <label className={LC}>Template</label>
                    <select className={IC} value={sendForm.template_id}
                      onChange={e => { const t = templates.find(t => t.id === e.target.value); if (t) applyTemplate(t); }}>
                      <option value="">— pick a template —</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LC}>Subject</label>
                    <input className={IC} value={sendForm.subject} onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))} placeholder="Your project page is ready…" />
                  </div>
                  <div>
                    <label className={LC}>Body</label>
                    <textarea className={`${IC} h-32 resize-none font-mono text-xs`} value={sendForm.body} onChange={e => setSendForm(f => ({ ...f, body: e.target.value }))} />
                  </div>
                  <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-500 font-mono break-all">{window.location.href}</div>
                  <button
                    onClick={handleSend}
                    disabled={sending || !sendForm.to_email || !sendForm.subject || !sendForm.body}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-40 transition-colors"
                  >
                    {sending ? 'Sending…' : 'Send Email'}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="p-5 space-y-7">

            {/* Content */}
            <Section title="Content">
              <Field label="Internal Name"><input className={IC} value={draft.name} onChange={e => setD('name', e.target.value)} /></Field>
              <Field label="Hero Headline"><input className={IC} value={draft.headline} onChange={e => setD('headline', e.target.value)} /></Field>
              <Field label="Subheadline"><textarea className={`${IC} h-16 resize-none`} value={draft.subheadline} onChange={e => setD('subheadline', e.target.value)} /></Field>
              <Field label="Closing Quote"><input className={IC} value={draft.closing_quote} onChange={e => setD('closing_quote', e.target.value)} /></Field>
              <Field label="Closing Body"><textarea className={`${IC} h-16 resize-none`} value={draft.closing_body} onChange={e => setD('closing_body', e.target.value)} /></Field>
            </Section>

            {/* Scope badges */}
            <Section title="Scope Items">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(draft.scope_items || []).map((item, i) => (
                  <span key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                    {item}
                    <button onClick={() => removeScope(i)} className="text-slate-400 hover:text-red-500 leading-none">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={`${IC} flex-1`} value={newScope} onChange={e => setNewScope(e.target.value)} onKeyDown={e => e.key === 'Enter' && addScope()} placeholder="Add item…" />
                <button onClick={addScope} className="text-xs font-semibold bg-slate-800 text-white px-3 py-1.5 rounded-lg">Add</button>
              </div>
            </Section>

            {/* Payment */}
            <Section title="Payment Plan">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Deposit ($)"><input className={IC} type="number" value={draft.deposit_amount} onChange={e => setD('deposit_amount', e.target.value)} /></Field>
                <Field label="Total ($)"><input className={IC} type="number" value={draft.total_amount} onChange={e => setD('total_amount', e.target.value)} /></Field>
              </div>
              <Field label="Description"><input className={IC} value={draft.description || ''} onChange={e => setD('description', e.target.value)} placeholder="Customized payment schedule…" /></Field>
              <p className={LC + " mt-2"}>Installments</p>
              <div className="space-y-2">
                {draft.payment_installments.map((inst, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">#{i + 1}</span>
                      <button onClick={() => removeInstallment(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={LC}>Label</label><input className={IC} value={inst.label} onChange={e => updateInstallment(i, 'label', e.target.value)} placeholder="Payment 2" /></div>
                      <div><label className={LC}>Amount ($)</label><input className={IC} type="number" value={inst.amount} onChange={e => updateInstallment(i, 'amount', e.target.value)} /></div>
                      <div><label className={LC}>Due Date</label><input className={IC} type="date" value={inst.due_date} onChange={e => updateInstallment(i, 'due_date', e.target.value)} /></div>
                      <div><label className={LC}>Note</label><input className={IC} value={inst.note} onChange={e => updateInstallment(i, 'note', e.target.value)} placeholder="Optional" /></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addInstallment} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                <Plus className="w-3.5 h-3.5" /> Add Installment
              </button>
            </Section>

          </div>
        </div>
      )}

      {/* ── Client Page (full width, offset right when admin panel open) ── */}
      <div className={`transition-all duration-300 ${isAdmin ? 'sm:mr-[420px]' : ''}`}>

        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-3xl mx-auto px-6 py-14 text-center">
            <div className="inline-block bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
              Welcome Aboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              {display.headline || 'Your Digital Presence Starts Here'}
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              {display.subheadline || "We're building something great together."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(display.scope_items || []).map(item => (
                <span key={item} className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1 rounded-full">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

          {/* Payment Plan */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Payment Plan</h2>
            <p className="text-slate-500 text-sm mb-6">{display.description || 'Your customized payment schedule.'}</p>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Description</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Due</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {row.label}
                        {row.note && <span className="ml-2 text-xs text-amber-600 font-semibold">{row.note}</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{row.due_date ? interpolateDate(row.due_date) : '—'}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-800">${Number(row.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 px-5 py-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-slate-500">Total Contract Value</p>
                  <p className="text-xl font-bold text-slate-800">${Number(display.total_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Deposit Due Now</p>
                  <p className="text-xl font-bold text-amber-600">${Number(display.deposit_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Installments</p>
                  <p className="text-xl font-bold text-slate-800">{plan.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-slate-800">Your First 4 Steps</h2>
              <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{completedCount}/4 complete</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Complete these to get your project moving.</p>
            <div className="space-y-4">

              <ChecklistItem done={checklist.deposit} onToggle={() => toggleCheck('deposit')}
                title={`Send $${Number(display.deposit_amount || 0).toLocaleString()} Deposit`}
                description="This secures your spot and gets your project on the board.">
                <button onClick={() => toggleCheck('deposit')}
                  className="inline-flex items-center gap-1.5 mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Pay Now — ${Number(display.deposit_amount || 0).toLocaleString()}
                </button>
              </ChecklistItem>

              <ChecklistItem done={checklist.questionnaire} onToggle={() => toggleCheck('questionnaire')}
                title="Complete the Discovery Questionnaire"
                description="Tell us about your brand, goals, and audience so we can build something that fits.">
                <Link to="/discovery" onClick={() => toggleCheck('questionnaire')}
                  className="inline-flex items-center gap-1.5 mt-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Start Questionnaire <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </ChecklistItem>

              <ChecklistItem done={checklist.assets} onToggle={() => toggleCheck('assets')}
                title="Submit Logo & Brand Assets"
                description="Upload your logo, brand colors, fonts, or any existing materials.">
                {uploadedFile ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4" /><span className="font-medium">{uploadedFile.name}</span>
                  </div>
                ) : (
                  <label className={`inline-flex items-center gap-1.5 mt-3 border border-slate-300 hover:border-slate-500 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </ChecklistItem>

              <ChecklistItem done={checklist.inspiration} onToggle={() => toggleCheck('inspiration')}
                title="Share 2–3 Inspiration Websites"
                description="Sites you love the look or feel of — they don't have to be in your industry.">
                <div className="mt-3 space-y-2">
                  {inspirationLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input type="url" placeholder={`https://example${i + 1}.com`} value={link}
                        onChange={(e) => {
                          const updated = [...inspirationLinks];
                          updated[i] = e.target.value;
                          setInspirationLinks(updated);
                          if (updated.filter(l => l.trim()).length >= 2 && !checklist.inspiration) toggleCheck('inspiration');
                        }}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </ChecklistItem>

            </div>
          </section>

          {/* Closing */}
          <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <p className="text-xl font-semibold leading-relaxed mb-3">{display.closing_quote}</p>
            <p className="text-slate-300 text-sm max-w-md mx-auto">{display.closing_body}</p>
            <p className="mt-6 text-slate-400 text-sm">Questions? Reply to your welcome email.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

// ─── small components ───────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className={LC}>{label}</label>
      {children}
    </div>
  );
}

function ChecklistItem({ done, onToggle, title, description, children }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${done ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <button onClick={onToggle}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'}`}>
          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="text-slate-500 text-sm mt-1">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}