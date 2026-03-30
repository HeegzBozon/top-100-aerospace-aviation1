import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { createPaymentPlanCheckout } from '@/functions/createPaymentPlanCheckout';

const PLAN_A = {
  id: 'plan_a',
  label: 'Option A — 3 payments',
  tagline: 'Simpler, faster payoff',
  total: 1850,
  payments: [
    { month: 'April',   label: 'Deposit',   color: 'bg-green-100 text-green-700',  amount: 350,  collected: 350  },
    { month: 'May',     label: 'Payment 2', color: 'bg-orange-100 text-orange-700', amount: 750,  collected: 1100 },
    { month: 'October', label: 'Final',     color: 'bg-blue-100 text-blue-700',    amount: 750,  collected: 1850 },
  ],
};

const PLAN_B = {
  id: 'plan_b',
  label: 'Option B — 4 payments',
  tagline: 'Easier on cash flow',
  total: 1850,
  payments: [
    { month: 'April',   label: 'Deposit',   color: 'bg-green-100 text-green-700',  amount: 350,  collected: 350  },
    { month: 'May',     label: 'Payment 2', color: 'bg-orange-100 text-orange-700', amount: 150,  collected: 500  },
    { month: 'June',    label: 'Payment 3', color: 'bg-amber-100 text-amber-700',  amount: 675,  collected: 1175 },
    { month: 'October', label: 'Final',     color: 'bg-blue-100 text-blue-700',    amount: 675,  collected: 1850 },
  ],
};

const SUMMARY_STATS = [
  { label: 'Total contract value', value: '$1,850' },
  { label: 'Collected by June (Option A)', value: '$1,100' },
  { label: 'Collected by June (Option B)', value: '$1,175' },
  { label: 'Final payment (both)', value: 'October' },
];

function PlanCard({ plan, selected, onSelect }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(plan.id)}
      className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
        selected
          ? 'border-[#c9a87c] bg-[#faf8f5] shadow-lg'
          : 'border-gray-200 bg-white hover:border-[#c9a87c]/40'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm text-gray-500 font-medium">{plan.label}</p>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 transition-all ${
          selected ? 'border-[#c9a87c] bg-[#c9a87c]' : 'border-gray-300'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
      <h2 className="text-xl font-bold text-[#1e3a5a] mb-5">{plan.tagline}</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide">
            <th className="text-left font-semibold pb-2">Month</th>
            <th className="text-left font-semibold pb-2">Payment</th>
            <th className="text-right font-semibold pb-2">Amount</th>
            <th className="text-right font-semibold pb-2">Collected</th>
          </tr>
        </thead>
        <tbody>
          {plan.payments.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-2.5 text-[#1e3a5a] font-medium">{row.month}</td>
              <td className="py-2.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.color}`}>
                  {row.label}
                </span>
              </td>
              <td className="py-2.5 text-right text-[#1e3a5a] font-semibold">${row.amount.toLocaleString()}</td>
              <td className="py-2.5 text-right text-gray-500">${row.collected.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-gray-200">
            <td className="pt-3 font-bold text-[#1e3a5a]">Total</td>
            <td />
            <td className="pt-3 text-right font-bold text-[#1e3a5a]">${plan.total.toLocaleString()}</td>
            <td className="pt-3 text-right text-gray-400">—</td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}

export default function PaymentPlan() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProceed = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createPaymentPlanCheckout({ planId: selectedPlan });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a87c] rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#1e3a5a] rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c9a87c]" />
            <span className="text-xs font-black tracking-widest text-[#c9a87c] uppercase">Payment Plan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1e3a5a] mb-2">Choose Your Payment Plan</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Both options cover the full contract value of <strong>$1,850</strong>. Select the schedule that works best for you.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-5 mb-8"
        >
          <PlanCard plan={PLAN_A} selected={selectedPlan === PLAN_A.id} onSelect={setSelectedPlan} />
          <PlanCard plan={PLAN_B} selected={selectedPlan === PLAN_B.id} onSelect={setSelectedPlan} />
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {SUMMARY_STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1 leading-snug">{stat.label}</p>
              <p className="text-xl font-bold text-[#1e3a5a]">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}
          <button
            onClick={handleProceed}
            disabled={!selectedPlan || loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c9a87c] to-[#d4a090] text-[#1e3a5a] font-bold text-base shadow-lg hover:shadow-xl hover:from-[#e8d4b8] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" />
            {loading ? 'Redirecting to Stripe…' : selectedPlan ? `Pay Deposit — $350` : 'Select a plan to continue'}
            {!loading && selectedPlan && <ChevronRight className="w-4 h-4" />}
          </button>
          <p className="text-xs text-gray-400">You'll be charged the deposit ($350) today via Stripe. Remaining payments are invoiced per schedule.</p>
        </motion.div>
      </div>
    </div>
  );
}