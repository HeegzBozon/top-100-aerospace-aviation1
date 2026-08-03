import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createProMembershipCheckout } from '@/functions/createProMembershipCheckout';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const ROSE = '#d4a574';
const CREAM = '#faf8f5';

export default function AccessTierCard({ tier, index }) {
  const popular = tier.id === 'pro';
  const business = tier.id === 'business';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCTA = async () => {
    setError(null);

    if (tier.id === 'public') {
      base44.auth.redirectToLogin();
      return;
    }

    if (business) {
      window.location.href = `mailto:partnerships@top100aerospace.com?subject=${encodeURIComponent('Business Membership — Design Partner Inquiry')}`;
      return;
    }

    // Pro
    try {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        navigate('/Profile');
        return;
      }
      setLoading(true);
      const res = await createProMembershipCheckout({});
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative flex h-full flex-col rounded-2xl p-6 ${popular ? 'ring-2 ring-offset-2' : 'border'}`}
      style={{
        background: popular ? `linear-gradient(135deg, ${CREAM}, white)` : 'white',
        borderColor: popular ? GOLD : `${NAVY}20`,
        ringColor: popular ? GOLD : undefined,
      }}
    >
      {popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          style={{ background: GOLD }}
        >
          Fellows comped
        </div>
      )}

      <div className="mb-1">
        <h3
          className="text-lg font-bold"
          style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
        >
          {tier.name}
        </h3>
        <p
          className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: GOLD }}
        >
          {tier.audience}
        </p>
      </div>

      <div className="mb-4 mt-3">
        {business ? (
          <span
            className="text-2xl font-bold"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Contact Sales
          </span>
        ) : (
          <div>
            {tier.pricePrefix && (
              <span
                className="block text-xs font-medium uppercase tracking-[0.14em]"
                style={{ color: `${NAVY}80`, fontFamily: "'Montserrat', sans-serif" }}
              >
                {tier.pricePrefix}
              </span>
            )}
            <span
              className="text-3xl font-bold"
              style={{ color: NAVY }}
            >
              {tier.price}
            </span>
            <span className="ml-1 text-sm text-gray-500">{tier.priceNote}</span>
          </div>
        )}
      </div>

      <p
        className="mb-6 text-sm leading-6"
        style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
      >
        {tier.description}
      </p>

      <ul className="mb-6 flex-1 space-y-3">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
            <span
              className="text-sm leading-5"
              style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {error && (
        <p
          className="mb-3 text-center text-xs font-medium"
          style={{ color: '#b91c1c', fontFamily: "'Montserrat', sans-serif" }}
        >
          {error}
        </p>
      )}

      <Button
        onClick={handleCTA}
        disabled={loading}
        className="w-full font-bold"
        style={{
          background: popular
            ? `linear-gradient(135deg, ${GOLD}, ${ROSE})`
            : tier.id === 'public'
              ? NAVY
              : 'transparent',
          color: popular || tier.id === 'public' ? 'white' : NAVY,
          border: !popular && tier.id !== 'public' ? `2px solid ${NAVY}` : 'none',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {loading ? 'Redirecting to Stripe…' : tier.cta}
      </Button>
    </motion.div>
  );
}