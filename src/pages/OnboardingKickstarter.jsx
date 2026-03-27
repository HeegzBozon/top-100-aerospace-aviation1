import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Upload, ExternalLink, Globe, Loader2, Settings, X, Plus, Trash2, Save, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendOnboardingEmail } from '@/functions/sendOnboardingEmail';
import { saveSignatureToProfile } from '@/functions/saveSignatureToProfile';
import SignaturePad from '@/components/onboarding/SignaturePad';

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function interpolate(text, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v ?? ''), text || '');
}

// Default 2 plans
const DEFAULT_PLANS = [
  {
    label: 'Plan A',
    description: '3 payments — spread it out',
    installments: [
      { label: 'Deposit', amount: 350, due_date: '', note: 'Due now' },
      { label: 'Payment 2', amount: 825, due_date: '2026-05-01', note: '' },
      { label: 'Final Payment', amount: 825, due_date: '2026-06-01', note: '' },
    ],
  },
  {
    label: 'Plan B',
    description: '2 payments — pay in half',
    installments: [
      { label: 'Deposit', amount: 350, due_date: '', note: 'Due now' },
      { label: 'Remaining Balance', amount: 1650, due_date: '2026-05-01', note: '' },
    ],
  },
];

const STATIC_PKG = {
  name: 'Standard Package',
  headline: 'Your Digital Presence Starts Here',
  subheadline: "We're building something great together. Here's everything you need to kick things off.",
  scope_items: ['New Website', 'SEO', 'Google Business Profile', 'Hosting'],
  deposit_amount: 350,
  total_amount: 2000,
  payment_plans: DEFAULT_PLANS,
  payment_installments: [],
  closing_quote: '"The sooner these are in, the sooner you\'re live."',
  closing_body: "Our call becomes a review — you'll see real progress, not a blank screen.",
};

const IC = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
const LC = "block text-xs font-semibold text-slate-500 mb-1";

// ─── main ────────────────────────────────────────────────────────────────────
export default function OnboardingKickstarter() {
  const [pkg, setPkg] = useState(null);
  const [pkgId, setPkgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newScope, setNewScope] = useState('');
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null); // index of plan open in editor

  // client state
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [checklist, setChecklist] = useState({ deposit: false, questionnaire: false, assets: false, inspiration: false, signature: false });
  const [inspirationLinks, setInspirationLinks] = useState(['', '', '']);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [signature, setSignature] = useState(null);
  const [savingSignature, setSavingSignature] = useState(false);

  // send email
  const [templates, setTemplates] = useState([]);
  const [sendForm, setSendForm] = useState({ to_email: '', to_name: '', subject: '', body: '', template_id: '' });
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('pkg');
    setPkgId(id || null);
    const load = id
      ? base44.entities.OnboardingPackage.filter({ id }, '', 1).then(r => (Array.isArray(r) ? r[0] : r) || STATIC_PKG)
      : Promise.resolve(STATIC_PKG);
    load.then(p => {
      // migrate legacy packages that only have payment_installments
      if ((!p.payment_plans || p.payment_plans.length === 0) && p.payment_installments?.length > 0) {
        p = { ...p, payment_plans: [{ label: 'Plan A', description: '', installments: p.payment_installments }] };
      } else if (!p.payment_plans || p.payment_plans.length === 0) {
        p = { ...p, payment_plans: DEFAULT_PLANS };
      }
      setPkg(p);
      setDraft(JSON.parse(JSON.stringify(p)));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showSendPanel && templates.length === 0) {
      base44.entities.EmailTemplate.list('-created_date', 50).then(setTemplates);
    }
  }, [showSendPanel]);

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

  // plans
  const updatePlan = (pi, key, val) => {
    const plans = [...draft.payment_plans];
    plans[pi] = { ...plans[pi], [key]: val };
    setD('payment_plans', plans);
  };
  const addPlan = () => {
    const label = ['Plan A', 'Plan B', 'Plan C', 'Plan D'][draft.payment_plans.length] || `Plan ${String.fromCharCode(65 + draft.payment_plans.length)}`;
    setD('payment_plans', [...draft.payment_plans, { label, description: '', installments: [{ label: 'Deposit', amount: draft.deposit_amount, due_date: '', note: 'Due now' }] }]);
    setExpandedPlan(draft.payment_plans.length);
  };
  const removePlan = (pi) => {
    const plans = draft.payment_plans.filter((_, i) => i !== pi);
    setD('payment_plans', plans);
    if (expandedPlan === pi) setExpandedPlan(null);
  };

  // installments within a plan
  const updateInstallment = (pi, ii, key, val) => {
    const plans = [...draft.payment_plans];
    const insts = [...plans[pi].installments];
    insts[ii] = { ...insts[ii], [key]: val };
    plans[pi] = { ...plans[pi], installments: insts };
    setD('payment_plans', plans);
  };
  const addInstallment = (pi) => {
    const plans = [...draft.payment_plans];
    plans[pi] = { ...plans[pi], installments: [...plans[pi].installments, { label: '', amount: '', due_date: '', note: '' }] };
    setD('payment_plans', plans);
  };
  const removeInstallment = (pi, ii) => {
    const plans = [...draft.payment_plans];
    plans[pi] = { ...plans[pi], installments: plans[pi].installments.filter((_, i) => i !== ii) };
    setD('payment_plans', plans);
  };

  const addScope = () => { if (!newScope.trim()) return; setD('scope_items', [...(draft.scope_items || []), newScope.trim()]); setNewScope(''); };
  const removeScope = (i) => setD('scope_items', draft.scope_items.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...draft,
      total_amount: Number(draft.total_amount),
      deposit_amount: Number(draft.deposit_amount),
      payment_plans: draft.payment_plans.map(p => ({
        ...p,
        installments: p.installments.map(inst => ({ ...inst, amount: Number(inst.amount) })),
      })),
    };
    let saved_pkg;
    if (pkgId && pkg?.id) {
      saved_pkg = await base44.entities.OnboardingPackage.update(pkg.id, payload);
    } else {
      saved_pkg = await base44.entities.OnboardingPackage.create(payload);
      if (saved_pkg?.id) window.history.replaceState({}, '', `?pkg=${saved_pkg.id}`);
    }
    setPkg({ ...payload, id: saved_pkg?.id || pkg?.id });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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

  const handleSignature = async (signatureData) => {
    setSignature(signatureData);
    setSavingSignature(true);
    try {
      const activePlan = plans[selectedPlanIdx] || plans[0];
      await saveSignatureToProfile({ signatureData, planLabel: activePlan.label });
      toggleCheck('signature');
    } catch (err) {
      console.error('Failed to save signature:', err);
    } finally { setSavingSignature(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
  );

  const display = isAdmin ? draft : pkg;
  const plans = display.payment_plans || [];
  const activePlan = plans[selectedPlanIdx] || plans[0];
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(checklist).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">

      {/* floating admin toggle */}
      <button onClick={handleAdminToggle}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all ${
          isAdmin ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'
        }`}>
        {isAdmin ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
        {isAdmin ? 'Exit Edit Mode' : 'Edit'}
      </button>

      {/* ── Admin panel ── */}
      {isAdmin && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl z-40 overflow-y-auto">
          {/* header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex flex-col gap-3 z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">Edit Package</p>
                <p className="text-xs text-slate-400">Live preview updates as you type</p>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={() => setShowSendPanel(v => !v)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg">
                <Mail className="w-3.5 h-3.5" /> Send
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg disabled:opacity-50">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* send sub-panel */}
          {showSendPanel && (
            <div className="m-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Send Onboarding Email</p>
              {emailSent ? <p className="text-sm text-green-700 font-semibold py-2">✓ Email sent!</p> : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={LC}>Client Name</label><input className={IC} value={sendForm.to_name} onChange={e => setSendForm(f => ({ ...f, to_name: e.target.value }))} placeholder="Jane Smith" /></div>
                    <div><label className={LC}>Email *</label><input className={IC} type="email" value={sendForm.to_email} onChange={e => setSendForm(f => ({ ...f, to_email: e.target.value }))} placeholder="client@co.com" /></div>
                  </div>
                  <div><label className={LC}>Template</label>
                    <select className={IC} value={sendForm.template_id} onChange={e => { const t = templates.find(t => t.id === e.target.value); if (t) applyTemplate(t); }}>
                      <option value="">— pick a template —</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div><label className={LC}>Subject</label><input className={IC} value={sendForm.subject} onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))} /></div>
                  <div><label className={LC}>Body</label><textarea className={`${IC} h-28 resize-none font-mono text-xs`} value={sendForm.body} onChange={e => setSendForm(f => ({ ...f, body: e.target.value }))} /></div>
                  <button onClick={handleSend} disabled={sending || !sendForm.to_email || !sendForm.subject || !sendForm.body}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-40">
                    {sending ? 'Sending…' : 'Send Email'}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="p-5 space-y-7">

            {/* Content */}
            <AdminSection title="Content">
              <AdminField label="Internal Name"><input className={IC} value={draft.name} onChange={e => setD('name', e.target.value)} /></AdminField>
              <AdminField label="Hero Headline"><input className={IC} value={draft.headline} onChange={e => setD('headline', e.target.value)} /></AdminField>
              <AdminField label="Subheadline"><textarea className={`${IC} h-14 resize-none`} value={draft.subheadline} onChange={e => setD('subheadline', e.target.value)} /></AdminField>
              <AdminField label="Closing Quote"><input className={IC} value={draft.closing_quote} onChange={e => setD('closing_quote', e.target.value)} /></AdminField>
              <AdminField label="Closing Body"><textarea className={`${IC} h-14 resize-none`} value={draft.closing_body} onChange={e => setD('closing_body', e.target.value)} /></AdminField>
            </AdminSection>

            {/* Scope */}
            <AdminSection title="Scope Items">
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
            </AdminSection>

            {/* Pricing */}
            <AdminSection title="Pricing">
              <div className="grid grid-cols-2 gap-3">
                <AdminField label="Deposit ($)"><input className={IC} type="number" value={draft.deposit_amount} onChange={e => setD('deposit_amount', e.target.value)} /></AdminField>
                <AdminField label="Total ($)"><input className={IC} type="number" value={draft.total_amount} onChange={e => setD('total_amount', e.target.value)} /></AdminField>
              </div>
              <AdminField label="Description"><input className={IC} value={draft.description || ''} onChange={e => setD('description', e.target.value)} placeholder="Your customized payment schedule…" /></AdminField>
            </AdminSection>

            {/* Payment Plans */}
            <AdminSection title="Payment Plans">
              <p className="text-xs text-slate-400 mb-3">Clients pick their preferred plan. Add up to 3 options (A, B, C).</p>
              <div className="space-y-3">
                {draft.payment_plans.map((plan, pi) => (
                  <div key={pi} className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* plan header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedPlan(expandedPlan === pi ? null : pi)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{plan.label || `Plan ${pi + 1}`}</span>
                        <input
                          className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none w-40"
                          value={plan.label}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updatePlan(pi, 'label', e.target.value)}
                          placeholder="Plan A"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{plan.installments?.length || 0} payments</span>
                        {draft.payment_plans.length > 1 && (
                          <button onClick={e => { e.stopPropagation(); removePlan(pi); }}
                            className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* plan body (expanded) */}
                    {expandedPlan === pi && (
                      <div className="p-4 space-y-3 bg-white">
                        <AdminField label="Short description (shown to client)">
                          <input className={IC} value={plan.description || ''} onChange={e => updatePlan(pi, 'description', e.target.value)} placeholder="e.g. Pay in 3 easy installments" />
                        </AdminField>
                        <p className={LC + " mt-2"}>Installments</p>
                        <div className="space-y-2">
                          {(plan.installments || []).map((inst, ii) => (
                            <div key={ii} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-semibold">#{ii + 1}</span>
                                {plan.installments.length > 1 && (
                                  <button onClick={() => removeInstallment(pi, ii)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div><label className={LC}>Label</label><input className={IC} value={inst.label} onChange={e => updateInstallment(pi, ii, 'label', e.target.value)} placeholder="Deposit" /></div>
                                <div><label className={LC}>Amount ($)</label><input className={IC} type="number" value={inst.amount} onChange={e => updateInstallment(pi, ii, 'amount', e.target.value)} /></div>
                                <div><label className={LC}>Due Date</label><input className={IC} type="date" value={inst.due_date || ''} onChange={e => updateInstallment(pi, ii, 'due_date', e.target.value)} /></div>
                                <div><label className={LC}>Note</label><input className={IC} value={inst.note || ''} onChange={e => updateInstallment(pi, ii, 'note', e.target.value)} placeholder="Due now" /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => addInstallment(pi)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                          <Plus className="w-3.5 h-3.5" /> Add Installment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {draft.payment_plans.length < 3 && (
                <button onClick={addPlan}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl py-2.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Plan {['A', 'B', 'C'][draft.payment_plans.length] || ''}
                </button>
              )}
            </AdminSection>

          </div>
        </div>
      )}

      {/* ── Client View ── */}
      <div className={`transition-all duration-300 ${isAdmin ? 'sm:mr-[440px]' : ''}`}>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#1e3a5a] to-slate-900 text-white">
          <div className="max-w-3xl mx-auto px-6 py-14 text-center">
            <div className="inline-block bg-[#c9a87c] text-[#1e3a5a] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
              Welcome Aboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{display.headline}</h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">{display.subheadline}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(display.scope_items || []).map(item => (
                <span key={item} className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1 rounded-full">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

          {/* Payment Plan Comparison */}
          <section>
            <h2 className="text-3xl font-bold text-[#1e3a5a] mb-1" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Your Payment Options</h2>
            <p className="text-slate-500 text-sm mb-6">{display.description || 'Compare and choose the option that works best for you.'}</p>

            {/* Side-by-side plan cards */}
            <div className={`grid gap-5 mb-6 ${plans.length > 2 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {plans.map((plan, pi) => {
                const isSelected = selectedPlanIdx === pi;
                const totalCollected = (plan.installments || []).reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
                return (
                  <div key={pi} className={`relative bg-white rounded-2xl overflow-hidden p-5 transition-all ${
                    isSelected
                      ? 'border-2 border-[#c9a87c] shadow-lg -translate-y-1'
                      : 'border border-slate-100 shadow-sm hover:shadow-md'
                  }`}>
                    {/* Checkmark badge for selected */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-[#c9a87c] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                    


                    {/* Plan header */}
                    <div className={`mb-5 pb-4 border-b transition-colors ${isSelected ? 'border-[#c9a87c]/20' : 'border-slate-100'}`}>
                      <p className="text-xs font-semibold text-[#1e3a5a] uppercase tracking-wider">{plan.label}</p>
                      <p className="text-lg font-bold text-[#1e3a5a] mt-1" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{plan.description || 'Your Payment Schedule'}</p>
                    </div>

                    {/* Timeline table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-2.5 font-semibold text-slate-600">Month</th>
                            <th className="pb-2.5 font-semibold text-slate-600">Payment</th>
                            <th className="pb-2.5 font-semibold text-slate-600 text-right">Amount</th>
                            <th className="pb-2.5 font-semibold text-slate-600 text-right">Collected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(plan.installments || []).map((row, i) => {
                            let collected = 0;
                            for (let j = 0; j <= i; j++) {
                              collected += Number(plan.installments[j]?.amount || 0);
                            }
                            const monthStr = row.due_date ? new Date(row.due_date).toLocaleDateString('en-US', { month: 'short' }) : 'Now';
                            return (
                              <tr key={i} className="border-t border-slate-100">
                                <td className="py-2.5 text-slate-700 font-medium">{monthStr}</td>
                                <td className="py-2.5">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    row.label === 'Deposit' ? 'bg-green-100 text-green-700' :
                                    row.label === 'Final' || row.label?.includes('Final') ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {row.label}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right text-slate-800 font-semibold text-xs">${Number(row.amount || 0).toLocaleString()}</td>
                                <td className="py-2.5 text-right text-slate-800 font-semibold text-xs">${collected.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Plan total */}
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center mb-4">
                      <p className="font-semibold text-slate-700 text-sm">Total</p>
                      <p className="text-base font-bold text-slate-800">${totalCollected.toLocaleString()}</p>
                    </div>

                    {/* Select button */}
                    <button
                      onClick={() => setSelectedPlanIdx(pi)}
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedPlanIdx === pi
                          ? 'bg-[#1e3a5a] text-[#c9a87c]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {selectedPlanIdx === pi ? '✓ Selected' : 'Select This Plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary metrics */}
            {plans.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Contract Value</p>
                  <p className="text-2xl font-bold text-slate-800">${Number(display.total_amount || 0).toLocaleString()}</p>
                </div>
                {plans.map((plan, pi) => {
                  const juneTotal = (plan.installments || [])
                    .filter(inst => !inst.due_date || new Date(inst.due_date) <= new Date('2026-06-30'))
                    .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
                  return (
                    <div key={pi} className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Collected by June<br/>({plan.label})</p>
                      <p className="text-2xl font-bold text-slate-800">${juneTotal.toLocaleString()}</p>
                    </div>
                  );
                })}
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Final Payment</p>
                  <p className="text-2xl font-bold text-slate-800">October</p>
                </div>
              </div>
            )}
          </section>

          {/* Checklist */}
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-3xl font-bold text-[#1e3a5a]" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Your First 5 Steps</h2>
              <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{completedCount}/{checklistTotal} complete</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Complete these to get your project moving.</p>
            <div className="space-y-4">

              <ChecklistItem done={checklist.deposit} onToggle={() => toggleCheck('deposit')}
                title={`Send $${Number(activePlan?.installments?.[0]?.amount || display.deposit_amount || 0).toLocaleString()} Deposit`}
                description="This secures your spot and gets your project on the board.">
                <button onClick={() => toggleCheck('deposit')}
                  className="inline-flex items-center gap-1.5 mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  Pay Now — ${Number(activePlan?.installments?.[0]?.amount || display.deposit_amount || 0).toLocaleString()}
                </button>
              </ChecklistItem>

              <ChecklistItem done={checklist.questionnaire} onToggle={() => toggleCheck('questionnaire')}
                title="Complete the Discovery Questionnaire"
                description="Tell us about your brand, goals, and audience so we can build something that fits.">
                <Link to="/discovery" onClick={() => toggleCheck('questionnaire')}
                  className="inline-flex items-center gap-1.5 mt-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
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
                  <label className={`inline-flex items-center gap-1.5 mt-3 border border-slate-300 hover:border-slate-500 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
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

              <ChecklistItem done={checklist.signature} onToggle={() => {}}
                title="E-Sign Your Agreement"
                description={`Sign your ${activePlan.label} payment plan agreement digitally.`}>
                {!signature ? (
                  <div className="mt-3">
                    <SignaturePad onSign={handleSignature} />
                    {savingSignature && <p className="text-xs text-slate-400 mt-2">Saving signature...</p>}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4" /><span className="font-medium">Signature saved!</span>
                  </div>
                )}
              </ChecklistItem>

            </div>
          </section>

          {/* Closing */}
          <section className="bg-gradient-to-r from-[#1e3a5a] to-slate-900 rounded-2xl p-8 text-center text-white">
            <p className="text-xl font-semibold leading-relaxed mb-3" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>{display.closing_quote}</p>
            <p className="text-slate-300 text-sm max-w-md mx-auto">{display.closing_body}</p>
            <p className="mt-6 text-slate-400 text-sm">Questions? Reply to your welcome email.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────
function AdminSection({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function AdminField({ label, children }) {
  return <div><label className={LC}>{label}</label>{children}</div>;
}
function ChecklistItem({ done, onToggle, title, description, children }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${done ? 'border-[#c9a87c]/40 bg-[#c9a87c]/5' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <button onClick={onToggle}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-[#c9a87c] border-[#c9a87c]' : 'border-slate-300 hover:border-[#c9a87c]'}`}>
          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1">
          <p className="font-semibold text-[#1e3a5a]">{title}</p>
          <p className="text-slate-500 text-sm mt-1">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}