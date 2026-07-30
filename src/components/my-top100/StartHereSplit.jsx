import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, LogOut, Sparkles, Vote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, CONNECTION_OPTIONS } from '@/components/nominate/NominateConfig';

export default function StartHereSplit({ user, hasExisting, onBegin, onVote, onSaved }) {
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [connection, setConnection] = useState(user?.aerospace_connection || '');
  const [saving, setSaving] = useState(false);

  const valid =
    name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    connection;

  const handleContinue = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      // Persist the connection answer so it pre-fills next time
      await base44.auth.updateMe({ aerospace_connection: connection });
      onSaved?.(connection);
    } catch { /* ignore — proceed anyway */ }
    setSaving(false);
    onBegin();
  };

  return (
    <div className="px-5 py-8 lg:py-12 max-w-6xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* ── Left: welcome copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-full mb-6"
            style={{ color: brand.gold, border: `1px solid ${brand.gold}55`, background: `${brand.gold}08` }}
          >
            <Sparkles className="w-3 h-3" />
            Nominations Open
          </span>

          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
            style={{ color: '#0f2139', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            You know someone who deserves this.
          </h1>

          <div className="space-y-4 max-w-xl">
            <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
              The aerospace and aviation community is full of people doing remarkable work. Most of them will never be asked to step forward.
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: '#0f2139' }}>
              <span className="font-bold">You're about to change that for someone.</span>
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
              TOP 100 Aerospace &amp; Aviation has recognized over 300 Fellows across 40+ countries since 2021. This year we're expanding. More programs. More recognition. More community.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#a8a8a8' }}>
              This form takes about 3 minutes per nomination. There's no limit on how many people you nominate. Every single one gets reviewed personally.
            </p>
          </div>

          <p className="text-[12px] mt-6 max-w-md leading-relaxed" style={{ color: '#b5b5b5' }}>
            New: Curate and rank your personal Top 100 — it doubles as your ranked choice ballot.
          </p>
        </motion.div>

        {/* ── Right: About You form ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-3xl p-6 lg:p-8 shadow-sm bg-white"
          style={{ border: `1px solid #e2dcd4` }}
        >
          <h2
            className="text-2xl font-bold leading-tight mb-6"
            style={{ color: '#1e293b', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            First, tell us a little about you.
          </h2>

          {/* Logged-in status */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between gap-3 mb-6"
            style={{ border: `1px solid #e2dcd4`, background: `${brand.gold}0A` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: brand.navy }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs truncate" style={{ color: `${brand.navy}80` }}>
                  Signed in — your details are pre-filled
                </p>
              </div>
            </div>
            <button
              onClick={() => base44.auth.logout(window.location.pathname)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full"
              style={{ color: brand.navy, background: 'white', border: `1px solid ${brand.navy}18` }}
            >
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <Field label="Your Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="bg-white h-12 text-base"
              />
            </Field>
            <Field label="Your Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@aerospace.com"
                className="bg-white h-12 text-base"
              />
            </Field>
            <Field label="Your connection to aerospace and aviation" required>
              <div className="space-y-2">
                {CONNECTION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setConnection(opt)}
                    className="w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all cursor-pointer"
                    style={
                      connection === opt
                        ? { borderColor: brand.gold, background: `${brand.gold}14` }
                        : { borderColor: `${brand.navy}14`, background: 'white' }
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!valid || saving}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-40"
            style={{ background: brand.navy }}
          >
            {saving ? 'Saving…' : (hasExisting ? 'Continue Nominations' : 'Begin Nominations')}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary: jump to Vote */}
          <button
            onClick={onVote}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all"
            style={{ background: 'transparent', border: `1.5px solid ${brand.gold}`, color: brand.gold }}
          >
            <Vote className="w-4 h-4" />
            Or jump to Vote
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#94a3b8' }}>
        {label}
        {required && <span style={{ color: brand.gold }}> *</span>}
      </label>
      {children}
    </div>
  );
}