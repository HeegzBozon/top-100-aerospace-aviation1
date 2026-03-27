import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const EMPTY_INSTALLMENT = { label: '', amount: '', due_date: '', note: '' };

export default function PackageEditor({ pkg, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: pkg?.name ?? '',
    description: pkg?.description ?? '',
    headline: pkg?.headline ?? 'Your Digital Presence Starts Here',
    subheadline: pkg?.subheadline ?? "We're building something great together. Here's everything you need to kick things off.",
    scope_items: pkg?.scope_items ?? ['New Website', 'SEO', 'Google Business Profile', 'Hosting'],
    total_amount: pkg?.total_amount ?? '',
    deposit_amount: pkg?.deposit_amount ?? '',
    payment_installments: pkg?.payment_installments ?? [
      { label: 'Payment 2', amount: '', due_date: '', note: '' },
      { label: 'Final Payment', amount: '', due_date: '', note: '' },
    ],
    closing_quote: pkg?.closing_quote ?? '"The sooner these are in, the sooner you\'re live."',
    closing_body: pkg?.closing_body ?? "Our call becomes a review — you'll see real progress, not a blank screen.",
    status: pkg?.status ?? 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [newScope, setNewScope] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateInstallment = (i, key, val) => {
    const updated = [...form.payment_installments];
    updated[i] = { ...updated[i], [key]: val };
    set('payment_installments', updated);
  };

  const addInstallment = () => set('payment_installments', [...form.payment_installments, { ...EMPTY_INSTALLMENT }]);
  const removeInstallment = (i) => set('payment_installments', form.payment_installments.filter((_, idx) => idx !== i));

  const addScope = () => {
    if (!newScope.trim()) return;
    set('scope_items', [...form.scope_items, newScope.trim()]);
    setNewScope('');
  };

  const removeScope = (i) => set('scope_items', form.scope_items.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      total_amount: Number(form.total_amount),
      deposit_amount: Number(form.deposit_amount),
      payment_installments: form.payment_installments.map(p => ({ ...p, amount: Number(p.amount) })),
    };
    if (pkg?.id) {
      await base44.entities.OnboardingPackage.update(pkg.id, payload);
    } else {
      await base44.entities.OnboardingPackage.create(payload);
    }
    setSaving(false);
    onSave();
  };

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Package Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Internal Name *</label>
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Web + SEO Standard" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short Description</label>
            <input className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full website + SEO package for local businesses" />
          </div>
        </div>
      </section>

      {/* Financials */}
      <section>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Payment Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelClass}>Total Contract Value ($) *</label>
            <input className={inputClass} type="number" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} placeholder="2000" />
          </div>
          <div>
            <label className={labelClass}>Deposit Amount ($) *</label>
            <input className={inputClass} type="number" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} placeholder="350" />
          </div>
        </div>

        <p className={labelClass}>Payment Installments (after deposit)</p>
        <div className="space-y-3 mb-3">
          {form.payment_installments.map((inst, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">Installment {i + 1}</span>
                <button onClick={() => removeInstallment(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Label</label>
                  <input className={inputClass} value={inst.label} onChange={e => updateInstallment(i, 'label', e.target.value)} placeholder="Payment 2" />
                </div>
                <div>
                  <label className={labelClass}>Amount ($)</label>
                  <input className={inputClass} type="number" value={inst.amount} onChange={e => updateInstallment(i, 'amount', e.target.value)} placeholder="825" />
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input className={inputClass} type="date" value={inst.due_date} onChange={e => updateInstallment(i, 'due_date', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Note</label>
                  <input className={inputClass} value={inst.note} onChange={e => updateInstallment(i, 'note', e.target.value)} placeholder="Due now" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addInstallment} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Installment
        </Button>
      </section>

      {/* Scope Items */}
      <section>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Scope Badges</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.scope_items.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
              {item}
              <button onClick={() => removeScope(i)} className="text-slate-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputClass} flex-1`} value={newScope} onChange={e => setNewScope(e.target.value)} onKeyDown={e => e.key === 'Enter' && addScope()} placeholder="Add scope item..." />
          <Button variant="outline" size="sm" onClick={addScope}>Add</Button>
        </div>
      </section>

      {/* Client-facing copy */}
      <section>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Client-Facing Copy</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Hero Headline</label>
            <input className={inputClass} value={form.headline} onChange={e => set('headline', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Hero Subheadline</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={form.subheadline} onChange={e => set('subheadline', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Closing Quote</label>
            <input className={inputClass} value={form.closing_quote} onChange={e => set('closing_quote', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Closing Body</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={form.closing_body} onChange={e => set('closing_body', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button onClick={handleSave} disabled={saving || !form.name || !form.total_amount}>
          {saving ? 'Saving...' : pkg?.id ? 'Update Package' : 'Create Package'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}