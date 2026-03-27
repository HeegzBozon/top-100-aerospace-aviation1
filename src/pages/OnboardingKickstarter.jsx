import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Upload, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function interpolateDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildPlanFromPackage(pkg) {
  const rows = [
    { label: 'Deposit', amount: pkg.deposit_amount, note: 'Due now', due_date: null },
    ...(pkg.payment_installments || []).map(p => ({
      label: p.label || 'Payment',
      amount: p.amount,
      note: p.note || '',
      due_date: p.due_date || null,
    })),
  ];
  return rows;
}

// Static fallback for when no pkg param is provided
const STATIC_PKG = {
  name: 'Standard Package',
  headline: 'Your Digital Presence Starts Here',
  subheadline: "We're building something great together. Here's everything you need to kick things off — your scope, your payment plan, and your first four steps.",
  scope_items: ['New Website', 'SEO', 'Google Business Profile', 'Hosting', 'Social Media Support'],
  deposit_amount: 350,
  total_amount: 2000,
  payment_installments: [
    { label: 'Payment 2', amount: 825, due_date: '2026-05-01', note: '' },
    { label: 'Final Payment', amount: 825, due_date: '2026-06-01', note: '' },
  ],
  closing_quote: '"The sooner these are in, the sooner you\'re live."',
  closing_body: "Our call becomes a review — you'll see real progress, not a blank screen. We can't wait to show you what we're building.",
};

export default function OnboardingKickstarter() {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({ deposit: false, questionnaire: false, assets: false, inspiration: false });
  const [inspirationLinks, setInspirationLinks] = useState(['', '', '']);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkgId = params.get('pkg');
    if (pkgId) {
      base44.entities.OnboardingPackage.filter({ id: pkgId }, '', 1)
        .then(res => {
          const record = Array.isArray(res) ? res[0] : res;
          setPkg(record || STATIC_PKG);
        })
        .catch(() => setPkg(STATIC_PKG))
        .finally(() => setLoading(false));
    } else {
      setPkg(STATIC_PKG);
      setLoading(false);
    }
  }, []);

  const toggleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      toggleCheck('assets');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const plan = buildPlanFromPackage(pkg);
  const totalValue = pkg.total_amount;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <div className="inline-block bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Welcome Aboard
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {pkg.headline || 'Your Digital Presence Starts Here'}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            {pkg.subheadline || "We're building something great together."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(pkg.scope_items || []).map(item => (
              <span key={item} className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

        {/* Payment Plan */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Payment Plan</h2>
          <p className="text-slate-500 text-sm mb-6">{pkg.description || 'Your customized payment schedule.'}</p>
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
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {row.due_date ? interpolateDate(row.due_date) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">${Number(row.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-50 px-5 py-4 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-slate-500">Total Contract Value</p>
                <p className="text-xl font-bold text-slate-800">${Number(totalValue).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Deposit Due Now</p>
                <p className="text-xl font-bold text-amber-600">${Number(pkg.deposit_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Installments</p>
                <p className="text-xl font-bold text-slate-800">{plan.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Checklist */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-slate-800">Your First 4 Steps</h2>
            <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              {completedCount}/4 complete
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-6">Complete these to get your project moving.</p>

          <div className="space-y-4">
            {/* Step 1: Deposit */}
            <ChecklistItem
              done={checklist.deposit}
              onToggle={() => toggleCheck('deposit')}
              title={`Send $${Number(pkg.deposit_amount).toLocaleString()} Deposit`}
              description="This secures your spot and gets your project on the board."
            >
              <button
                onClick={() => toggleCheck('deposit')}
                className="inline-flex items-center gap-1.5 mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Pay Now — ${Number(pkg.deposit_amount).toLocaleString()}
              </button>
            </ChecklistItem>

            {/* Step 2: Discovery */}
            <ChecklistItem
              done={checklist.questionnaire}
              onToggle={() => toggleCheck('questionnaire')}
              title="Complete the Discovery Questionnaire"
              description="Tell us about your brand, goals, and audience so we can build something that fits."
            >
              <Link
                to="/discovery"
                onClick={() => toggleCheck('questionnaire')}
                className="inline-flex items-center gap-1.5 mt-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Start Questionnaire <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </ChecklistItem>

            {/* Step 3: Brand Assets */}
            <ChecklistItem
              done={checklist.assets}
              onToggle={() => toggleCheck('assets')}
              title="Submit Logo & Brand Assets"
              description="Upload your logo, brand colors, fonts, or any existing materials."
            >
              {uploadedFile ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">{uploadedFile.name}</span>
                </div>
              ) : (
                <label className={`inline-flex items-center gap-1.5 mt-3 border border-slate-300 hover:border-slate-500 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </ChecklistItem>

            {/* Step 4: Inspiration */}
            <ChecklistItem
              done={checklist.inspiration}
              onToggle={() => toggleCheck('inspiration')}
              title="Share 2–3 Inspiration Websites"
              description="Sites you love the look or feel of — they don't have to be in your industry."
            >
              <div className="mt-3 space-y-2">
                {inspirationLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="url"
                      placeholder={`https://example${i + 1}.com`}
                      value={link}
                      onChange={(e) => {
                        const updated = [...inspirationLinks];
                        updated[i] = e.target.value;
                        setInspirationLinks(updated);
                        if (updated.filter(l => l.trim()).length >= 2 && !checklist.inspiration) {
                          toggleCheck('inspiration');
                        }
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
          <p className="text-xl font-semibold leading-relaxed mb-3">
            {pkg.closing_quote || '"The sooner these are in, the sooner you\'re live."'}
          </p>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            {pkg.closing_body || "Our call becomes a review — you'll see real progress, not a blank screen."}
          </p>
          <p className="mt-6 text-slate-400 text-sm">Questions? Reply to your welcome email.</p>
        </section>
      </div>
    </div>
  );
}

function ChecklistItem({ done, onToggle, title, description, children }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${done ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'}`}
        >
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