import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Share2, RotateCcw, Rocket, Globe, User, MessageSquare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import RadarChart from './RadarChart';
import FlightDebrief from './FlightDebrief';
import OutcomeNextThread from './OutcomeNextThread';

const STAT_LABELS = { altitude: 'ALTITUDE', velocity: 'VELOCITY', payload: 'PAYLOAD', range: 'RANGE', resilience: 'RESILIENCE', maneuver: 'MANEUVER' };

const OUTCOME_META = {
  critical_success: { label: 'Critical Success', color: '#9dc97c', glow: 'rgba(157,201,124,0.15)' },
  success:         { label: 'Mission Complete', color: '#c9a87c', glow: 'rgba(201,168,124,0.12)' },
  fail:            { label: 'NO-GO',            color: '#7b9ec9', glow: 'rgba(123,158,201,0.12)' },
  critical_fail:   { label: 'Flame-Out',        color: '#e8614a', glow: 'rgba(232,97,74,0.12)' },
};

// ── Phase 1: The Boss Aftermath ───────────────────────────────────────────────
function PhaseAftermath({ profile, session, diceResult, onNext }) {
  const meta = OUTCOME_META[diceResult?.outcome] || OUTCOME_META.success;
  const { classification, quote, ecosystemRole } = profile;

  const ROLE_LABELS = { fellow: 'Potential Fellow', booster: 'Community Booster', investor: 'Potential Investor', partner: 'Strategic Partner' };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Outcome flash */}
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
          className="inline-block px-6 py-2 rounded-full border mb-4 font-bold text-sm uppercase tracking-widest"
          style={{ borderColor: meta.color + '55', background: meta.glow, color: meta.color }}>
          {meta.label}
        </motion.div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-4xl md:text-5xl font-bold text-white mb-3">Your Flight Profile</h2>
        <p className="text-white/35 text-sm">Class of 2026 · {session.campaign.title}</p>
      </div>

      {/* Profile card */}
      <div className="rounded-3xl border border-[#c9a87c]/30 p-8 md:p-10 mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(7,17,31,0.95))' }}>
        <div className="text-center mb-8">
          <div className="inline-block px-5 py-2 rounded-full border border-[#c9a87c]/40 mb-4"
            style={{ background: 'rgba(201,168,124,0.1)' }}>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">{ROLE_LABELS[ecosystemRole]}</p>
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl font-bold text-white mb-4">{classification}</h3>
          <p className="text-white/60 text-base italic max-w-md mx-auto">"{quote}"</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0"><RadarChart stats={session.stats} /></div>
          <div className="flex-1 w-full space-y-3">
            {Object.entries(session.stats).map(([stat, val]) => (
              <div key={stat} className="flex items-center gap-3">
                <span className="text-white/40 text-xs uppercase tracking-widest w-20 flex-shrink-0">{STAT_LABELS[stat]}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 20) * 100}%` }}
                    transition={{ delay: 0.4 + Object.keys(session.stats).indexOf(stat) * 0.06, duration: 0.6 }}
                    className="h-full rounded-full bg-[#c9a87c]" />
                </div>
                <span className="text-[#c9a87c] font-bold text-sm w-6 text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boss roll callout */}
      {diceResult && (
        <div className="rounded-xl p-4 border border-white/8 text-center mb-6"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Boss Moment Roll</p>
          <p className="font-mono text-2xl font-bold text-white">{diceResult.total}</p>
          <p className="text-white/30 text-xs">d20({diceResult.diceResult}) + {diceResult.modifier} modifier</p>
        </div>
      )}

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a090)', color: '#07111f' }}>
        See How the World Changed <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 2: The World Changed (Epilogue) ─────────────────────────────────────
const WORLD_CHANGED = {
  'C-01': {
    critical_success: [
      "The X-29A data package you brought home becomes a cornerstone reference in forward-swept wing research for the next decade.",
      "Three test pilots after you cite your single-engine recovery in their own training. Col. Hargrove adds a new annotation to the flight rules.",
      "Edwards is quiet again. The desert doesn't remember. The data does.",
    ],
    success: [
      "Your flight report goes into the program archive. The aircraft flies again six months later with updated EGT limits.",
      "Mara Grayson gets promoted. She mentions your callsign in her acceptance remarks.",
      "The Mojave is the same as it always was. But you know what the envelope feels like now. That changes you.",
    ],
    fail: [
      "The accident report circulates through the test pilot community. Your name is attached to a safety bulletin — the kind that saves the pilot who reads it.",
      "Edwards modifies the emergency egress protocol based on your incident. Fifteen years later, it matters.",
      "The X-29A is gone. The data from your flight, including what went wrong, is not.",
    ],
    critical_fail: [
      "You survived. That's not nothing — test pilots who survive catastrophic departures are rare and valuable.",
      "The program is grounded for sixty days. When it resumes, the envelope card has four new pages.",
      "Your incident brief becomes required reading at TPS. Future pilots know the edge because you found it.",
    ],
  },
  'C-02': {
    critical_success: [
      "The IMU anomaly you navigated becomes a documented flight rule. Your GO call is cited as the example.",
      "Mission Control hangs a photo of the lunar orbit insertion on the wall. Your console is in the frame.",
      "Three years later, Dr. Marcus Tran publishes a paper on the anomaly signature. He thanks you in the acknowledgments.",
    ],
    success: [
      "The crew makes it home. The 0.8-second correction burn is a footnote in the mission report.",
      "Flight Director Chen Wei reads the debrief. She sends two words: 'Right call.'",
      "The mission is declared a success. You know what it cost. That knowledge is the asset.",
    ],
    fail: [
      "The scrubbed burn costs the mission eighteen hours. The crew is fine. The review board is thorough.",
      "Your NO-GO call becomes a case study — not a cautionary tale, but an example of conservative risk management under uncertainty.",
      "The IMU data is inconclusive. It stays that way. Some things in Mission Control don't resolve cleanly.",
    ],
    critical_fail: [
      "The review board finding has your name in it. So does the corrected flight rule that prevents the same error from happening again.",
      "The crew lands safely. At the debrief, the commander shakes your hand. 'We made it,' she says. That's all she says.",
      "Mission Control has seen worse. The room remembers who stayed at the console and who learned from it.",
    ],
  },
};

function PhaseWorldChanged({ session, diceResult, onNext }) {
  const outcome = diceResult?.outcome || 'success';
  const lines = WORLD_CHANGED[session.campaignId]?.[outcome] || WORLD_CHANGED['C-01'].success;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(201,168,124,0.1)' }}>
          <Globe className="w-5 h-5 text-[#c9a87c]" />
        </div>
        <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">After Action</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">How the World Changed</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">The ripple effects of your decisions extend beyond the cockpit.</p>
      </div>

      <div className="space-y-4 mb-10">
        {lines.map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.18 }}
            className="rounded-2xl p-6 border border-white/8 flex gap-4"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="w-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: 'linear-gradient(180deg, #c9a87c, #d4a090)', minHeight: '2rem' }} />
            <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{line}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a090)', color: '#07111f' }}>
        What Happens to Your Pilot <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 3: Pilot's Log (Character Send-Off) ─────────────────────────────────
const SEND_OFFS = {
  critical_success: [
    { id: 'lead', label: 'Lead the next program.', sub: "You're assigned to the next-generation project. The envelope just got bigger." },
    { id: 'teach', label: 'Go back to teach.', sub: 'You return to TPS as an instructor. Pass the knowledge. Build the next generation.' },
    { id: 'private', label: 'Take a commercial offer.', sub: 'The private sector has been calling. You answer. The mission continues differently.' },
  ],
  success: [
    { id: 'continue', label: 'Stay on the program.', sub: "There's more envelope left. You're not done yet." },
    { id: 'mentor', label: 'Become a mentor.', sub: 'You pull up the junior pilots. You know what the chair costs.' },
    { id: 'research', label: 'Shift to research.', sub: 'The anomaly data is interesting. You want to understand it fully.' },
  ],
  fail: [
    { id: 'rebuild', label: 'Rebuild and return.', sub: "You request reassignment. A different aircraft. A different approach. You're not done." },
    { id: 'analyze', label: 'Stay and analyze.', sub: "You dig into the data. The answer is in there. You'll find it." },
    { id: 'step_back', label: 'Step back for a season.', sub: "You take desk time. Debrief. Recover. Pilots don't always need to be flying to be useful." },
  ],
  critical_fail: [
    { id: 'survive', label: 'Survive and consult.', sub: "You're alive. Your experience is rarer than you think. People need to hear it." },
    { id: 'ground', label: 'Take the ground role.', sub: "The console matters as much as the cockpit. You know that now better than anyone." },
    { id: 'write', label: 'Write the account.', sub: "There are things you know that aren't in any manual. Get them on paper." },
  ],
};

function PhasePilotsLog({ diceResult, profile, onNext }) {
  const [chosen, setChosen] = useState(null);
  const outcome = diceResult?.outcome || 'success';
  const options = SEND_OFFS[outcome] || SEND_OFFS.success;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(201,168,124,0.1)' }}>
          <User className="w-5 h-5 text-[#c9a87c]" />
        </div>
        <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Pilot's Log</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">What Does Your Pilot Do Next?</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">The mission is over. The pilot is not. Choose your next move.</p>
      </div>

      <div className="space-y-3 mb-8">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => setChosen(opt.id)}
            className={`w-full text-left rounded-2xl p-5 border transition-all duration-200 ${
              chosen === opt.id ? 'border-[#c9a87c]' : 'border-white/8 hover:border-[#c9a87c]/40'
            }`}
            style={{ background: chosen === opt.id ? 'rgba(201,168,124,0.1)' : 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                chosen === opt.id ? 'border-[#c9a87c] bg-[#c9a87c]' : 'border-white/20'
              }`}>
                {chosen === opt.id && <div className="w-2 h-2 rounded-full bg-[#07111f]" />}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{opt.label}</p>
                <p className="text-white/45 text-xs mt-1 leading-relaxed">{opt.sub}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={!chosen}
        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          chosen ? 'hover:scale-[1.01]' : 'opacity-40 cursor-not-allowed'
        }`}
        style={{ background: chosen ? 'linear-gradient(135deg, #c9a87c, #d4a090)' : 'rgba(255,255,255,0.05)', color: chosen ? '#07111f' : 'rgba(255,255,255,0.3)' }}>
        Go Behind the Curtain <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 4: Session Omega (Post-Mortem) ──────────────────────────────────────
const LORE_QUESTIONS = {
  'C-01': [
    { q: 'Did my choice early on actually matter?', a: 'Yes. The engineering vs. military split affects your PAYLOAD and MANEUVER stats, which directly modify your Boss Moment roll. Higher MANEUVER players statistically land critical success 12% more often.' },
    { q: 'What was Dr. Cochran\'s notebook about?', a: 'The notebook scene is modeled on real mentorship dynamics in test pilot culture — specifically the informal knowledge transfer that happens outside official training. Taking it boosts PAYLOAD and RANGE. Refusing boosts MANEUVER and VELOCITY. Neither is wrong.' },
    { q: 'How close was my boss roll to a different outcome?', a: 'Outcomes are gated at 5, 10, and 16. If your roll was within 2 of a threshold, the outcome could have flipped. The modifier comes from your RESILIENCE + MANEUVER average, scaled as a D&D stat modifier.' },
  ],
  'C-02': [
    { q: 'What was the IMU anomaly actually?', a: "It's intentionally unresolved — the same way real Mission Control anomalies sometimes are. The game doesn't tell you if Marcus was right because the data didn't either. That's the point of the campaign." },
    { q: 'Was the GO/NO-GO call objectively correct?', a: "There is no objectively correct call. The campaign is designed to put you in a position where both choices are defensible, and the consequences are asymmetric. That's what Flight Directors actually face." },
    { q: 'What did Chen Wei\'s handoff message mean?', a: "\"That's what the chair is for\" is the whole thesis of C-02. The chair is not about being right. It's about being accountable for the call. Whichever call you made, you made it. That's the qualification." },
  ],
};

function PhaseSessionOmega({ session, profile, playerInfo, diceResult, onNext }) {
  const [open, setOpen] = useState(null);
  const questions = LORE_QUESTIONS[session.campaignId] || LORE_QUESTIONS['C-01'];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(201,168,124,0.1)' }}>
          <MessageSquare className="w-5 h-5 text-[#c9a87c]" />
        </div>
        <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Session Omega</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">Behind the Curtain</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">Step out of the cockpit. Ask the questions you couldn't ask mid-mission.</p>
      </div>

      <div className="space-y-3 mb-8">
        {questions.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left rounded-2xl p-5 border border-white/8 hover:border-[#c9a87c]/30 transition-all"
              style={{ background: open === i ? 'rgba(201,168,124,0.06)' : 'rgba(255,255,255,0.025)' }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/80 text-sm font-semibold leading-relaxed">{item.q}</p>
                <ChevronRight className={`w-4 h-4 text-[#c9a87c] flex-shrink-0 mt-0.5 transition-transform ${open === i ? 'rotate-90' : ''}`} />
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="text-white/45 text-sm leading-relaxed mt-3 border-t border-white/8 pt-3">
                    {item.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Flight Debrief upgrade here */}
      <div className="rounded-3xl p-6 md:p-8 border border-white/8 mb-6"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <FlightDebrief profile={profile} session={session} playerInfo={playerInfo} />
      </div>

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a090)', color: '#07111f' }}>
        Next Launch <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 5: Next Launch (Transition) ────────────────────────────────────────
function PhaseNextLaunch({ session, diceResult, profile, playerInfo, onPlayAgain, onPlayOther }) {
  const handleShare = () => {
    const text = `I just completed ${session.campaign.title} on Flight Simulator by TOP 100 Aerospace & Aviation.\n\nFlight Profile: ${profile.classification}\n\n"${profile.quote}"\n\ntop100aero.space/play`;
    if (navigator.share) navigator.share({ title: `Flight Profile: ${profile.classification}`, text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); }
  };

  const isCampaign01 = session.campaignId === 'C-01';

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(201,168,124,0.1)' }}>
          <Rocket className="w-5 h-5 text-[#c9a87c]" />
        </div>
        <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Next Launch</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">What Are You Flying Next?</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">The mission is logged. The field is open. Choose your next vector.</p>
      </div>

      {/* Outcome next thread */}
      <OutcomeNextThread diceResult={diceResult} session={session} onPlayAgain={onPlayAgain} onPlayOther={onPlayOther} />

      {/* Profile CTA */}
      <div className="rounded-2xl p-6 border border-[#c9a87c]/20 mb-6 text-center"
        style={{ background: 'rgba(201,168,124,0.05)' }}>
        <p className="text-white/50 text-sm mb-4">Based on your Flight Profile, your next move:</p>
        {profile.ctaLink?.startsWith('http') ? (
          <a href={profile.ctaLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_25px_rgba(201,168,124,0.3)]">
            {profile.cta} <ChevronRight className="w-4 h-4" />
          </a>
        ) : (
          <Link to={profile.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_25px_rgba(201,168,124,0.3)]">
            {profile.cta} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Action row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <button onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c9a87c]/50 transition-all text-sm font-semibold">
          <Share2 className="w-4 h-4" /> Share Profile
        </button>
        <button onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c9a87c]/50 transition-all text-sm font-semibold">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>

      <p className="text-center text-white/20 text-xs italic"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Top 100 Aerospace & Aviation · Est. 2021 · Ad Astra.
      </p>
    </motion.div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Profile' },
  { label: 'Aftermath' },
  { label: "Pilot's Log" },
  { label: 'Session Ω' },
  { label: 'Next Launch' },
];

// ── Main Orchestrator ─────────────────────────────────────────────────────────
export default function PostMissionJourney({ profile, session, playerInfo, diceResult, onPlayAgain, onPlayOther }) {
  const [phase, setPhase] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-15 blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl relative z-10">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => i < phase && setPhase(i)}
                className={`transition-all duration-300 ${i === phase ? 'w-8 h-2 rounded-full' : 'w-2 h-2 rounded-full'} ${
                  i < phase ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ background: i <= phase ? '#c9a87c' : 'rgba(255,255,255,0.12)' }}
                title={s.label}
              />
              {i < STEPS.length - 1 && (
                <div className="w-6 h-px" style={{ background: i < phase ? 'rgba(201,168,124,0.4)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === 0 && <PhaseAftermath key="aftermath" profile={profile} session={session} diceResult={diceResult} onNext={() => setPhase(1)} />}
          {phase === 1 && <PhaseWorldChanged key="world" session={session} diceResult={diceResult} onNext={() => setPhase(2)} />}
          {phase === 2 && <PhasePilotsLog key="pilots-log" diceResult={diceResult} profile={profile} onNext={() => setPhase(3)} />}
          {phase === 3 && <PhaseSessionOmega key="omega" session={session} profile={profile} playerInfo={playerInfo} diceResult={diceResult} onNext={() => setPhase(4)} />}
          {phase === 4 && <PhaseNextLaunch key="next" session={session} diceResult={diceResult} profile={profile} playerInfo={playerInfo} onPlayAgain={onPlayAgain} onPlayOther={onPlayOther} />}
        </AnimatePresence>
      </div>
    </div>
  );
}