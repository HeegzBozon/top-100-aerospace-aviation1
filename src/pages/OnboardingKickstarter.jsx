import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Upload, ExternalLink, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PAYMENT_PLANS = {
  A: [
    { month: 'April 2026', label: 'Deposit', amount: 350, note: 'Due now' },
    { month: 'May 2026', label: 'Payment 2', amount: 825 },
    { month: 'June 2026', label: 'Final Payment', amount: 825 },
  ],
  B: [
    { month: 'April 2026', label: 'Deposit', amount: 350, note: 'Due now' },
    { month: 'May 2026', label: 'Payment 2', amount: 550 },
    { month: 'June 2026', label: 'Payment 3', amount: 550 },
    { month: 'July 2026', label: 'Final Payment', amount: 550 },
  ],
};

function runningTotal(plan) {
  let total = 0;
  return plan.map(p => { total += p.amount; return total; });
}

export default function OnboardingKickstarter() {
  const [activeTab, setActiveTab] = useState('A');
  const [checklist, setChecklist] = useState({
    deposit: false,
    questionnaire: false,
    assets: false,
    inspiration: false,
  });
  const [inspirationLinks, setInspirationLinks] = useState(['', '', '']);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const plan = PAYMENT_PLANS[activeTab];
  const totals = runningTotal(plan);
  const totalValue = totals[totals.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <div className="inline-block bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Welcome Aboard
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Your Digital Presence<br />Starts Here
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            We're building something great together. Here's everything you need to kick things off — your scope, your payment plan, and your first four steps.
          </p>
          {/* Scope summary badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {['New Website', 'SEO', 'Google Business Profile', 'Hosting', 'Social Media Support'].map(item => (
              <span key={item} className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

        {/* Payment Plans */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Payment Plan</h2>
          <p className="text-slate-500 text-sm mb-6">Choose the schedule that works best for you.</p>

          {/* Tab toggle */}
          <div className="flex gap-2 mb-6">
            {['A', 'B'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Option {tab}: {tab === 'A' ? '3 Payments' : '4 Payments'}
              </button>
            ))}
          </div>

          {/* Payment table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Month</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Description</th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-600">Amount</th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-600">Running Total</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4 text-slate-700 font-medium">{row.month}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {row.label}
                      {row.note && <span className="ml-2 text-xs text-amber-600 font-semibold">{row.note}</span>}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">${row.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-slate-500">${totals[i].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-50 px-5 py-4 flex flex-wrap gap-4 text-sm">
              <div className="flex-1 min-w-[140px]">
                <p className="text-slate-500">Total Contract Value</p>
                <p className="text-xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-slate-500">Collected by June</p>
                <p className="text-xl font-bold text-slate-800">
                  ${(activeTab === 'A' ? totalValue : plan.slice(0,3).reduce((s, p) => s + p.amount, 0)).toLocaleString()}
                </p>
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-slate-500">Final Payment</p>
                <p className="text-xl font-bold text-slate-800">{plan[plan.length - 1].month}</p>
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
            <div className={`bg-white rounded-2xl border p-5 transition-all ${checklist.deposit ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleCheck('deposit')}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checklist.deposit ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {checklist.deposit && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Send $350 Deposit</p>
                  <p className="text-slate-500 text-sm mt-1">This secures your spot and gets your project on the board.</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    onClick={(e) => { e.preventDefault(); toggleCheck('deposit'); }}
                  >
                    Pay Now — $350
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Discovery */}
            <div className={`bg-white rounded-2xl border p-5 transition-all ${checklist.questionnaire ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleCheck('questionnaire')}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checklist.questionnaire ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {checklist.questionnaire && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Complete the Discovery Questionnaire</p>
                  <p className="text-slate-500 text-sm mt-1">Tell us about your brand, goals, and audience so we can build something that fits.</p>
                  <Link
                    to="/discovery"
                    onClick={() => toggleCheck('questionnaire')}
                    className="inline-flex items-center gap-1.5 mt-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Start Questionnaire <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 3: Brand Assets */}
            <div className={`bg-white rounded-2xl border p-5 transition-all ${checklist.assets ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleCheck('assets')}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checklist.assets ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {checklist.assets && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Submit Logo & Brand Assets</p>
                  <p className="text-slate-500 text-sm mt-1">Upload your logo, brand colors, fonts, or any existing materials.</p>
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
                </div>
              </div>
            </div>

            {/* Step 4: Inspiration */}
            <div className={`bg-white rounded-2xl border p-5 transition-all ${checklist.inspiration ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleCheck('inspiration')}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checklist.inspiration ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {checklist.inspiration && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Share 2–3 Inspiration Websites</p>
                  <p className="text-slate-500 text-sm mt-1">Sites you love the look or feel of — they don't have to be in your industry.</p>
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
                            if (updated.filter(l => l.trim()).length >= 2) toggleCheck('inspiration') || null;
                          }}
                          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Motivational closing */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-center text-white">
          <p className="text-xl font-semibold leading-relaxed mb-3">
            "The sooner these are in, the sooner you're live."
          </p>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Our call becomes a review — you'll see real progress, not a blank screen. We can't wait to show you what we're building.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
            <span>Questions? Reply to your welcome email.</span>
          </div>
        </section>

      </div>
    </div>
  );
}