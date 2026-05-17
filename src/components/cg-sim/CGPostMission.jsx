import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Share2, RotateCcw, Globe, User, MessageSquare, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const STAT_LABELS = { coalition: 'COALITION', trust: 'TRUST', resource: 'RESOURCE', resilience: 'RESILIENCE', narrative: 'NARRATIVE', systems: 'SYSTEMS' };

const ROLE_LABELS = {
  implementer: 'Systems Builder',
  connector: 'Coalition Weaver',
  advocate: 'Policy Advocate',
  strategist: 'Civic Strategist',
};

const OUTCOME_META = {
  critical_success: { label: 'Motion Carries — Unanimous', color: '#4ade80', glow: 'rgba(74,222,128,0.15)' },
  success:         { label: 'Motion Carries', color: '#86efac', glow: 'rgba(134,239,172,0.12)' },
  fail:            { label: 'Motion Fails', color: '#fb923c', glow: 'rgba(251,146,60,0.1)' },
  critical_fail:   { label: 'Tabled', color: '#f87171', glow: 'rgba(248,113,113,0.1)' },
};

// ── Phase 1: Civic Profile ────────────────────────────────────────────────────
function PhaseProfile({ profile, session, diceResult, onNext }) {
  const meta = OUTCOME_META[diceResult?.outcome] || OUTCOME_META.success;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
          className="inline-block px-6 py-2 rounded-full border mb-4 font-bold text-sm uppercase tracking-widest"
          style={{ borderColor: meta.color + '55', background: meta.glow, color: meta.color }}>
          {meta.label}
        </motion.div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-4xl md:text-5xl font-bold text-white mb-3">Your Civic Profile</h2>
        <p className="text-white/35 text-sm">CommonGround Simulator · {session.campaign.title}</p>
      </div>

      <div className="rounded-3xl border border-[#4ade80]/25 p-8 md:p-10 mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.07), rgba(3,8,15,0.96))' }}>
        <div className="text-center mb-8">
          <div className="inline-block px-5 py-2 rounded-full border border-[#4ade80]/35 mb-4"
            style={{ background: 'rgba(74,222,128,0.08)' }}>
            <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest">{ROLE_LABELS[profile.ecosystemRole]}</p>
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl font-bold text-white mb-4">{profile.classification}</h3>
          <p className="text-white/60 text-base italic max-w-md mx-auto">"{profile.quote}"</p>
        </div>

        <div className="space-y-3">
          {Object.entries(session.stats).map(([stat, val]) => (
            <div key={stat} className="flex items-center gap-3">
              <span className="text-white/35 text-xs uppercase tracking-widest w-20 flex-shrink-0">{STAT_LABELS[stat]}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 20) * 100}%` }}
                  transition={{ delay: 0.4 + Object.keys(session.stats).indexOf(stat) * 0.06, duration: 0.6 }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4ade80, #22c55e)' }} />
              </div>
              <span className="text-[#4ade80] font-bold text-sm w-6 text-right">{val}</span>
            </div>
          ))}
        </div>

        {diceResult && (
          <div className="rounded-xl p-4 border border-white/8 text-center mt-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Boss Moment Roll</p>
            <p className="font-mono text-2xl font-bold text-white">{diceResult.total}</p>
            <p className="text-white/30 text-xs">d20({diceResult.diceResult}) + {diceResult.modifier} modifier</p>
          </div>
        )}
      </div>

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
        See How the City Changed <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 2: World Changed ────────────────────────────────────────────────────
const WORLD_CHANGED = {
  'CG-01': {
    critical_success: [
      "The Fruitvale site becomes the first CommonGround pilot in the Bay Area. Six months after opening, three residents transition to permanent housing. The site's community garden is managed by Rosa's neighborhood association.",
      "Councilmember Halverson's opponent uses CommonGround as a campaign centerpiece. She wins by four points.",
      "Two other Bay Area cities request your site model documentation within the year. You share everything.",
    ],
    success: [
      "The site opens, one month behind schedule. The 30-day review cost you time but earned you legitimacy with two wavering stakeholders who become long-term allies.",
      "Rosa stays on the governance council. She proposes the upcycling workshop in Month 3. It generates $12,000 in its first six months.",
      "The Housing First navigator logs fourteen permanent housing placements in Year 1.",
    ],
    fail: [
      "The 90-day review delays the project but does not kill it. While politics stall, you use the time to overengineer the site plan. It opens stronger than it would have.",
      "Six residents leave the adjacent encampment during the delay. You don't know where they went. You think about that.",
      "The site opens late. The data it generates over its first year becomes the strongest argument against the next delay.",
    ],
    critical_fail: [
      "The project is tabled. The Caltrans lot reverts. You begin the process of identifying alternative sites within a week.",
      "The documentation you built during the process — site model, governance framework, stakeholder map — is adopted by a nonprofit that launches a smaller pilot in West Oakland.",
      "Two years later, a new council majority passes a CommonGround ordinance. Your paperwork is in the preamble.",
    ],
  },
  'CG-02': {
    critical_success: [
      "The Right to Rest bill passes unamended. Pauline's testimony is read into the record of three subsequent legislative sessions as precedent.",
      "Fourteen California cities update their anti-camping ordinances within ninety days of the bill's passage. The League of Cities issues a compliance guide.",
      "Darius publishes a summary of the campaign in a housing policy journal. You're credited as lead architect.",
    ],
    success: [
      "The amended bill passes. The narrowed scope is frustrating but creates the legal foundation for expansion. The next session's bill is already drafted.",
      "The Fresno video becomes a landmark media reference point. City attorneys across California quietly begin revising enforcement protocols even before the bill takes effect.",
      "Darius files the expanded bill in January. You're listed as co-author.",
    ],
    fail: [
      "The bill dies in this session. You file a nearly identical bill before the chamber adjourns. It is already better than the first draft.",
      "Pauline's testimony is entered into the public record. Three journalists who covered the hearing write follow-up pieces. The story doesn't end with the vote.",
      "The League of Cities wins the session. They do not win the issue.",
    ],
    critical_fail: [
      "The procedural maneuver that killed your bill becomes a case study in legislative strategy. You use it to teach your next coalition how to counter it.",
      "The committee record is public. The testimony is public. The bill language is public. None of that disappears when the session ends.",
      "Darius calls the morning after. 'We file Monday,' he says. You already have the draft open.",
    ],
  },
};

function PhaseWorldChanged({ session, diceResult, onNext }) {
  const outcome = diceResult?.outcome || 'success';
  const lines = WORLD_CHANGED[session.campaignId]?.[outcome] || WORLD_CHANGED['CG-01'].success;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(74,222,128,0.1)' }}>
          <Globe className="w-5 h-5 text-[#4ade80]" />
        </div>
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-2">After Action</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">How the City Changed</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">Your decisions sent ripples through the community, the system, and the record.</p>
      </div>

      <div className="space-y-4 mb-10">
        {lines.map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.18 }}
            className="rounded-2xl p-6 border border-white/8 flex gap-4"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="w-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: 'linear-gradient(180deg, #4ade80, #22c55e)', minHeight: '2rem' }} />
            <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{line}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
        What Happens to Your Director <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 3: Director's Log (Send-Off) ────────────────────────────────────────
const SEND_OFFS = {
  critical_success: [
    { id: 'scale', label: 'Scale the model.', sub: "The pilot worked. You're now leading a three-city expansion. The model is yours to replicate." },
    { id: 'policy', label: 'Move to policy.', sub: 'What you built on the ground now becomes legislation. You write the ordinance.' },
    { id: 'teach', label: 'Train the next cohort.', sub: "You've run the playbook. Now you give it to the next director so they don't start from zero." },
  ],
  success: [
    { id: 'operate', label: 'Stay and operate.', sub: 'The site is running. You stay. There\'s always another challenge in Year 2.' },
    { id: 'document', label: 'Write the model document.', sub: 'You turn everything you learned into a replicable framework. Open-sourced.' },
    { id: 'coalition', label: 'Build the statewide coalition.', sub: 'The next city needs what you built. You help them build it faster.' },
  ],
  fail: [
    { id: 'refocus', label: 'Regroup and refile.', sub: "You lost this round. The next filing is better for it. You're not done." },
    { id: 'local', label: 'Go hyper-local.', sub: 'State politics failed you. You go city by city. Slower, but harder to stop.' },
    { id: 'media', label: 'Shift to narrative.', sub: "The vote doesn't tell the whole story. You make sure the story gets told." },
  ],
  critical_fail: [
    { id: 'rebuild', label: 'Rebuild the coalition.', sub: 'You know what failed. You fix it. The next attempt has fewer gaps.' },
    { id: 'research', label: 'Build the evidence base.', sub: "They said there wasn't enough data. You spend the next year generating it." },
    { id: 'train', label: 'Train the next candidates.', sub: 'The people who voted against you are up for reelection. You help their challengers.' },
  ],
};

function PhaseDirectorsLog({ diceResult, onNext }) {
  const [chosen, setChosen] = useState(null);
  const outcome = diceResult?.outcome || 'success';
  const options = SEND_OFFS[outcome] || SEND_OFFS.success;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(74,222,128,0.1)' }}>
          <User className="w-5 h-5 text-[#4ade80]" />
        </div>
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-2">Director's Log</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">What Does Your Director Do Next?</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">The session is over. The work is not.</p>
      </div>

      <div className="space-y-3 mb-8">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => setChosen(opt.id)}
            className={`w-full text-left rounded-2xl p-5 border transition-all duration-200 ${
              chosen === opt.id ? 'border-[#4ade80]' : 'border-white/8 hover:border-[#4ade80]/40'
            }`}
            style={{ background: chosen === opt.id ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                chosen === opt.id ? 'border-[#4ade80] bg-[#4ade80]' : 'border-white/20'
              }`}>
                {chosen === opt.id && <div className="w-2 h-2 rounded-full bg-[#03080f]" />}
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
        style={{ background: chosen ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'rgba(255,255,255,0.05)', color: chosen ? '#03080f' : 'rgba(255,255,255,0.3)' }}>
        Behind the Design <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 4: Session Omega ────────────────────────────────────────────────────
const LORE = {
  'CG-01': [
    { q: 'Did the community-first vs. infrastructure-first choice actually matter?', a: "Yes. Community-first boosts COALITION and TRUST — the two stats that determine your Boss Moment modifier in CG-01. Infrastructure-first builds RESOURCE and SYSTEMS, which are more useful in CG-02. Neither is wrong. They reflect real strategic trade-offs in civic implementation." },
    { q: "Was Rosa a character designed to punish players who didn't consult the community?", a: "Rosa represents a real pattern: well-intentioned projects that skip community engagement create opposition from allies. Both responses in her scene are recoverable — but the apology option generates more COALITION, which is the game's most important stat in the final vote." },
    { q: 'What does the CommonGround model actually propose?', a: "The full model is in the white paper at /common-ground. It's a real civic proposal: managed multi-use sites serving unhoused residents and recreational travelers simultaneously, governed by mixed community councils, funded through circular economics. The game is a simulation of the hardest implementation decisions." },
  ],
  'CG-02': [
    { q: "Was the moral vs. pragmatic framing a trap?", a: "Neither framing is a trap. Moral argument raises NARRATIVE, which powers your Boss Moment modifier. Pragmatic argument raises SYSTEMS and COALITION. The campaign is designed to reward the framing you're willing to defend consistently — not the one that sounds better." },
    { q: "Should I have taken the amendment?", a: "Darius says take the amendment — and he's right in the pragmatic sense. A narrowed win creates precedent. A loss delays it by a session. But holding the line preserves the full principle. The campaign doesn't have a correct answer. That's intentional. Real policy architects face this exact question." },
    { q: "What was Pauline's testimony based on?", a: "Pauline's story is a composite of documented cases in which anti-camping enforcement was applied to people with disabilities in circumstances where no shelter alternative was available. The Right to Rest legislative framework she testifies in support of is a real policy framework — search Martin v. City of Boise for the federal precedent it builds on." },
  ],
};

function PhaseSessionOmega({ session, profile, playerInfo, diceResult, onNext }) {
  const [open, setOpen] = useState(null);
  const questions = LORE[session.campaignId] || LORE['CG-01'];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(74,222,128,0.1)' }}>
          <MessageSquare className="w-5 h-5 text-[#4ade80]" />
        </div>
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-2">Session Omega</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">Behind the Design</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">Step out of role. Ask the questions you couldn't ask mid-session.</p>
      </div>

      <div className="space-y-3 mb-8">
        {questions.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left rounded-2xl p-5 border border-white/8 hover:border-[#4ade80]/30 transition-all"
              style={{ background: open === i ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.025)' }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/80 text-sm font-semibold leading-relaxed">{item.q}</p>
                <ChevronRight className={`w-4 h-4 text-[#4ade80] flex-shrink-0 mt-0.5 transition-transform ${open === i ? 'rotate-90' : ''}`} />
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

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
        Next Mission <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Phase 5: Next Mission ─────────────────────────────────────────────────────
const OUTCOME_NEXT = {
  critical_success: { label: 'MISSION COMPLETE', color: '#4ade80', headline: 'The city remembers what you built.', sub: 'Your Civic Profile is live. See where it lands.' },
  success:         { label: 'MOTION CARRIES', color: '#86efac', headline: 'Progress is slow. You made it move.', sub: 'The model continues. The next campaign is waiting.' },
  fail:            { label: 'MOTION FAILS', color: '#fb923c', headline: 'You didn\'t win the vote. You built the record.', sub: 'Try the other campaign — your stat profile shifts.' },
  critical_fail:   { label: 'TABLED', color: '#f87171', headline: 'You lost the session. Not the cause.', sub: 'Run it again. Different calls, different outcome.' },
};

function PhaseNextMission({ session, diceResult, profile, onPlayAgain, onPlayOther }) {
  const outcome = diceResult?.outcome || 'success';
  const meta = OUTCOME_NEXT[outcome];
  const isCG01 = session.campaignId === 'CG-01';

  const handleShare = () => {
    const text = `I just played the CommonGround Simulator.\n\nCivic Profile: ${profile.classification}\n\n"${profile.quote}"\n\ntop100aero.space/common-ground-sim`;
    if (navigator.share) navigator.share({ title: `Civic Profile: ${profile.classification}`, text }).catch(() => {});
    else navigator.clipboard?.writeText(text);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(74,222,128,0.1)' }}>
          <Rocket className="w-5 h-5 text-[#4ade80]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: meta.color }}>{meta.label}</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-3">{meta.headline}</h2>
        <p className="text-white/40 text-sm">{meta.sub}</p>
      </div>

      {/* Profile CTA */}
      <div className="rounded-2xl p-6 border border-[#4ade80]/20 mb-6 text-center"
        style={{ background: 'rgba(74,222,128,0.04)' }}>
        <p className="text-white/50 text-sm mb-4">Based on your Civic Profile, your next move:</p>
        {profile.ctaLink?.startsWith('http') ? (
          <a href={profile.ctaLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all shadow-[0_0_25px_rgba(74,222,128,0.25)]"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
            {profile.cta} <ChevronRight className="w-4 h-4" />
          </a>
        ) : (
          <Link to={profile.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all shadow-[0_0_25px_rgba(74,222,128,0.25)]"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
            {profile.cta} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Try other campaign */}
      <div className="rounded-2xl p-5 border border-white/8 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div>
          <p className="text-white font-semibold text-sm">Try {isCG01 ? 'Campaign CG-02' : 'Campaign CG-01'}</p>
          <p className="text-white/35 text-xs mt-0.5">{isCG01 ? 'The Policy Architect' : 'The City Director'} · Different stat focus</p>
        </div>
        <button onClick={() => onPlayOther(isCG01 ? 'CG-02' : 'CG-01')}
          className="px-4 py-2 rounded-xl border border-[#4ade80]/30 text-[#4ade80] text-xs font-bold hover:bg-[#4ade80]/10 transition-all">
          Play →
        </button>
      </div>

      {/* Read the white paper */}
      <div className="rounded-2xl p-5 border border-white/8 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div>
          <p className="text-white font-semibold text-sm">Read CommonGround 4.0</p>
          <p className="text-white/35 text-xs mt-0.5">The full strategic white paper this simulator is based on</p>
        </div>
        <Link to="/common-ground"
          className="px-4 py-2 rounded-xl border border-white/15 text-white/50 text-xs font-bold hover:border-white/30 transition-all">
          Read →
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <button onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#4ade80]/50 transition-all text-sm font-semibold">
          <Share2 className="w-4 h-4" /> Share Profile
        </button>
        <button onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#4ade80]/50 transition-all text-sm font-semibold">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>

      <p className="text-center text-white/20 text-xs italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        CommonGround Initiative · Version 4.0 · 2026 · For the people who just need a place to be.
      </p>
    </motion.div>
  );
}

// ── Step dots ─────────────────────────────────────────────────────────────────
const STEPS = ['Profile', 'Aftermath', "Director's Log", 'Session Ω', 'Next Mission'];

export default function CGPostMission({ profile, session, playerInfo, diceResult, onPlayAgain, onPlayOther }) {
  const [phase, setPhase] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10 blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl relative z-10">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => i < phase && setPhase(i)}
                className={`transition-all duration-300 ${i === phase ? 'w-8 h-2 rounded-full' : 'w-2 h-2 rounded-full'} ${i < phase ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ background: i <= phase ? '#4ade80' : 'rgba(255,255,255,0.12)' }}
                title={s} />
              {i < STEPS.length - 1 && (
                <div className="w-6 h-px" style={{ background: i < phase ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === 0 && <PhaseProfile key="profile" profile={profile} session={session} diceResult={diceResult} onNext={() => setPhase(1)} />}
          {phase === 1 && <PhaseWorldChanged key="world" session={session} diceResult={diceResult} onNext={() => setPhase(2)} />}
          {phase === 2 && <PhaseDirectorsLog key="log" diceResult={diceResult} onNext={() => setPhase(3)} />}
          {phase === 3 && <PhaseSessionOmega key="omega" session={session} profile={profile} playerInfo={playerInfo} diceResult={diceResult} onNext={() => setPhase(4)} />}
          {phase === 4 && <PhaseNextMission key="next" session={session} diceResult={diceResult} profile={profile} onPlayAgain={onPlayAgain} onPlayOther={onPlayOther} />}
        </AnimatePresence>
      </div>
    </div>
  );
}