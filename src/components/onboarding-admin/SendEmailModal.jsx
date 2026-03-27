import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendOnboardingEmail } from '@/functions/sendOnboardingEmail';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Mail } from 'lucide-react';

const APP_URL = window.location.origin;

function interpolate(text, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v ?? ''), text || '');
}

export default function SendEmailModal({ isOpen, onClose, pkg }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [clientName, setClientName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    base44.entities.EmailTemplate.list('-created_date', 50).then(setTemplates);
  }, []);

  const pkgId = pkg?.id ?? '';
  const onboardingUrl = `${APP_URL}/onboarding?pkg=${pkgId}`;

  const getVars = () => ({
    client_name: clientName || 'there',
    package_name: pkg?.name ?? '',
    onboarding_url: onboardingUrl,
    deposit_amount: pkg?.deposit_amount ?? '',
    total_amount: pkg?.total_amount ?? '',
  });

  const applyTemplate = (tpl) => {
    const vars = getVars();
    setSubject(interpolate(tpl.subject, vars));
    setBody(interpolate(tpl.body, vars));
  };

  const handleTemplateChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (!id) return;
    const tpl = templates.find(t => t.id === id);
    if (tpl) applyTemplate(tpl);
  };

  // Re-interpolate when client name changes
  useEffect(() => {
    if (!selectedTemplateId) return;
    const tpl = templates.find(t => t.id === selectedTemplateId);
    if (tpl) applyTemplate(tpl);
  }, [clientName, pkg]);

  const handleSend = async () => {
    setSending(true);
    await sendOnboardingEmail({ to_email: toEmail, to_name: clientName, subject, body });
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 2000);
  };

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-600" />
            Send Onboarding Email
            {pkg && <span className="text-slate-400 font-normal text-sm">— {pkg.name}</span>}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-slate-700">Email sent!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Client details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Client Name</label>
                <input className={inputClass} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className={labelClass}>Send To *</label>
                <input className={inputClass} type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="client@example.com" />
              </div>
            </div>

            {/* Template picker */}
            <div>
              <label className={labelClass}>Load a Template</label>
              <select className={inputClass} value={selectedTemplateId} onChange={handleTemplateChange}>
                <option value="">— Select a template —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Onboarding URL preview */}
            <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono break-all">
              <span className="text-slate-400 font-sans font-semibold mr-2">Link:</span>{onboardingUrl}
            </div>

            {/* Subject */}
            <div>
              <label className={labelClass}>Subject *</label>
              <input className={inputClass} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your project page is ready..." />
            </div>

            {/* Body */}
            <div>
              <label className={labelClass}>Body *</label>
              <textarea
                className={`${inputClass} h-56 resize-none text-xs font-mono leading-relaxed`}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={handleSend} disabled={sending || !toEmail || !subject || !body} className="gap-2">
                <Mail className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}