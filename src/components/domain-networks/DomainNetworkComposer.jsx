import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B, ACCENTS } from '@/components/fellow-home/fellowHomeConfig';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border bg-white outline-none focus:ring-1';
const inputStyle = { borderColor: B.border, color: B.navy };

// Admin-only composer to convene a standing Domain Network. Facilitation is a
// named-human constraint; this captures the facilitator, never a price.
export default function DomainNetworkComposer({ user, accent = B.navy, onSubmitted }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('space_rd');
  const [charter, setCharter] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [facilitatorEmail, setFacilitatorEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Network name is required.'); return; }
    setSaving(true);
    try {
      await base44.entities.DomainNetwork.create({
        name: name.trim(),
        domain_focus: domain,
        charter: charter.trim(),
        facilitator_name: facilitatorName.trim(),
        facilitator_email: facilitatorEmail.trim() || user?.email,
        status: 'active',
      });
      toast.success('Domain Network convened.');
      setName(''); setCharter(''); setFacilitatorName(''); setFacilitatorEmail('');
      onSubmitted?.();
    } catch {
      toast.error('Could not convene network.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: B.border, background: B.cream }}>
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Convene a Domain Network</span>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Network name" className={inputCls} style={inputStyle} />
      <select value={domain} onChange={(e) => setDomain(e.target.value)} className={inputCls} style={inputStyle}>
        {ACCENTS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
      </select>
      <textarea value={charter} onChange={(e) => setCharter(e.target.value)} placeholder="What this network distills into practice" rows={2} className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <input value={facilitatorName} onChange={(e) => setFacilitatorName(e.target.value)} placeholder="Facilitator name" className={inputCls} style={inputStyle} />
        <input value={facilitatorEmail} onChange={(e) => setFacilitatorEmail(e.target.value)} placeholder="Facilitator email" className={inputCls} style={inputStyle} />
      </div>
      <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60" style={{ background: accent, color: '#fff' }}>
        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Convening</> : 'Convene Network'}
      </button>
    </form>
  );
}