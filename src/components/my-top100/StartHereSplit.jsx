import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, Cpu, LogOut, Sparkles, Vote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, CONNECTION_OPTIONS } from '@/components/nominate/NominateConfig';
import AnalystOffice from '@/components/voting/AnalystOffice';
import useGlass from '@/hooks/useGlass';
import { useNavHint } from '@/components/handheld/faceHint';
import { useConsoleFace, RADIO } from '@/components/handheld/consoleMode';
import usePreflightWheel from '@/components/my-top100/usePreflightWheel';

export default function StartHereSplit({ user, hasExisting, onBegin, onVote, onSaved, onOpenOS }) {
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

  // Every choice on this panel is a key, and on the glass the console walks them: the
  // orientation, the five connection answers, the way on to the Manifest, then the way
  // into the Crosscheck — the order they are printed in, numbered so the keypad reaches
  // the same key by its number. The fields are left out of the list on purpose: a name
  // and an address are typed, and the keys belong to the field while one is open.
  const glass = useGlass();
  const radio = useConsoleFace() === RADIO;
  const keyHint = useNavHint();
  const nodes = useRef([]);

  const options = [
    { label: 'How it works', run: onOpenOS },
    ...CONNECTION_OPTIONS.map((opt) => ({ label: opt, run: () => setConnection(opt) })),
    { label: hasExisting ? 'Continue your Manifest' : 'Build your Manifest', run: handleContinue },
    { label: 'Or begin your analysis', run: onVote },
  ];
  const continuation = CONNECTION_OPTIONS.length + 1;
  const cursor = usePreflightWheel({ options, enabled: glass });

  useEffect(() => {
    if (!glass) return;
    nodes.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, glass]);

  // The key the ring is standing on, struck in copper — the mark every other numbered
  // surface on this device gives its cursor.
  const focused = (index) =>
    glass && cursor === index ? { boxShadow: '0 0 0 2px #B87333' } : null;

  const ordinal = (index) =>
    glass ? (
      <span className="ml-2 shrink-0 font-body text-[10px] font-bold tabular-nums" style={{ color: '#B87333' }}>
        {String(index + 1).padStart(2, '0')}
      </span>
    ) : null;

  return (
    <div className="px-5 py-8 lg:py-12 max-w-6xl mx-auto w-full">
      {glass && (
        <p
          className="mb-4 text-center font-body text-[8.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: `${brand.navy}55` }}
        >
          {keyHint({ walk: 'Walk', open: 'Press' })}
          {radio ? ` · 1–${options.length} jump` : ''}
        </p>
      )}
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
            The Selection Committee
          </span>

          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
            style={{ color: '#0f2139', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Serve the season as an Analyst.
          </h1>

          <div className="space-y-4 max-w-xl">
            <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
              A TOP 100 Analyst finds the field, measures it, and carries the record. The aerospace and aviation community is full of people doing remarkable work, and most of them will never be asked to step forward.
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: '#0f2139' }}>
              <span className="font-bold">You're about to change that for someone.</span>
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
              TOP 100 Aerospace &amp; Aviation has recognized over 300 Fellows across 40+ countries since 2021. Analysts are how the field is chosen. This year we're expanding. More programs. More recognition. More community.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#a8a8a8' }}>
              This form takes about 3 minutes per nomination. There's no limit on how many people you nominate. Every single one gets reviewed personally.
            </p>
          </div>

          <AnalystOffice className="mt-7 max-w-xl" />

          <div className="mt-7 flex flex-col sm:flex-row items-start gap-3">
            <button
              onClick={onOpenOS}
              ref={(node) => {
                nodes.current[0] = node;
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: 'transparent',
                border: `1.5px solid ${brand.navy}22`,
                color: brand.navy,
                ...focused(0),
              }}
            >
              <Cpu className="w-4 h-4" style={{ color: brand.gold }} />
              How it works
              {ordinal(0)}
            </button>
          </div>

          <p className="text-[12px] mt-6 max-w-md leading-relaxed" style={{ color: '#b5b5b5' }}>
            The Manifest is your own TOP 100, in order — you choose who to back, and how strongly. The Crosscheck is where the analysis happens.
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
                {CONNECTION_OPTIONS.map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setConnection(opt)}
                    ref={(node) => {
                      nodes.current[1 + i] = node;
                    }}
                    className="w-full flex items-center justify-between gap-2 text-left p-3.5 rounded-xl border-2 text-sm transition-all cursor-pointer"
                    style={
                      connection === opt
                        ? { borderColor: brand.gold, background: `${brand.gold}14`, ...focused(1 + i) }
                        : { borderColor: `${brand.navy}14`, background: 'white', ...focused(1 + i) }
                    }
                  >
                    <span className="min-w-0">{opt}</span>
                    {ordinal(1 + i)}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!valid || saving}
            ref={(node) => {
              nodes.current[continuation] = node;
            }}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-40"
            style={{ background: brand.navy, ...focused(continuation) }}
          >
            {saving ? 'Saving…' : (hasExisting ? 'Continue your Manifest' : 'Build your Manifest')}
            <ArrowRight className="w-4 h-4" />
            {ordinal(continuation)}
          </button>

          {/* Secondary: jump to Vote */}
          <button
            onClick={onVote}
            ref={(node) => {
              nodes.current[continuation + 1] = node;
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all"
            style={{
              background: 'transparent',
              border: `1.5px solid ${brand.gold}`,
              color: brand.gold,
              ...focused(continuation + 1),
            }}
          >
            <Vote className="w-4 h-4" />
            Or begin your analysis
            {ordinal(continuation + 1)}
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