import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, Zap, Lightbulb, Target, MessageCircle, BarChart3, Wand2, Vote } from 'lucide-react';

const ROOM_NEEDS = [
  { id: 'energy', label: 'Energy & Connection', desc: 'The room needs to warm up, bond, or reconnect', icon: Zap },
  { id: 'problem', label: 'Solve a Problem', desc: "A specific challenge needs the room's brain", icon: Target },
  { id: 'ideas', label: 'Generate Ideas', desc: 'We need creative fuel and divergent thinking', icon: Lightbulb },
  { id: 'decide', label: 'Make a Decision', desc: 'Options exist — we need to align and choose', icon: BarChart3 },
  { id: 'discuss', label: 'Open Discussion', desc: 'A topic needs space, voices, and synthesis', icon: MessageCircle },
  { id: 'reflect', label: 'Reflect & Learn', desc: 'Process what happened and extract lessons', icon: Users },
];

const TIME_OPTIONS = [
  { value: 30, label: '30 min', desc: 'Quick and focused' },
  { value: 45, label: '45 min', desc: 'Balanced depth' },
  { value: 60, label: '60 min', desc: 'Full session' },
  { value: 90, label: '90+ min', desc: 'Deep dive' },
];

const RECOMMENDATIONS = {
  energy: {
    template: 'Warmup & Connection Session',
    explanation: 'Start with a Check-In Round to read the room, then move into Think-Pair-Share to get people talking in smaller groups before opening up.',
    tactics: ['Check-In Round', '1-2-4-All', 'Open Discussion'],
  },
  problem: {
    template: 'Hot Seat Problem Solving',
    explanation: 'The Hot Seat format is built exactly for this — one challenge, the whole room, real input without politeness. Bookend with framing to set up and dot voting to close.',
    tactics: ['Problem Framing', 'The Hot Seat', 'Dot Voting'],
  },
  ideas: {
    template: 'Divergent Thinking Sprint',
    explanation: 'Start with How Might We to reframe the challenge, then Brainwriting for silent parallel generation, and Rapid Fire for energy and volume.',
    tactics: ['How Might We', 'Brainwriting', 'Rapid Fire Ideas', 'Dot Voting'],
  },
  decide: {
    template: 'Decision Sprint',
    explanation: 'Map impact vs. effort to see the landscape clearly, use Dot Voting to surface group preferences, then Fist to Five to reach genuine consensus.',
    tactics: ['Impact/Effort Matrix', 'Dot Voting', 'Fist to Five'],
  },
  discuss: {
    template: 'Facilitated Open Forum',
    explanation: 'Think-Pair-Share gets everyone's voice before the full room opens. Fishbowl creates structured depth if the conversation needs to go further.',
    tactics: ['Check-In Round', 'Think-Pair-Share', 'Open Discussion'],
  },
  reflect: {
    template: 'Retrospective & Learning Harvest',
    explanation: 'Win/Learn/Change gives structure to what could otherwise become venting. Rose/Bud/Thorn adds a forward-looking layer. Close with action ownership.',
    tactics: ['Rose/Bud/Thorn', 'Win/Learn/Change', 'Fist to Five'],
  },
};

const STEP_LABELS = ['What does the room need?', 'How much time?', 'Any specific topic?'];

export default function SessionSelector({ setCurrentSession }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [roomNeed, setRoomNeed] = useState(null);
  const [time, setTime] = useState(null);
  const [hasTopic, setHasTopic] = useState(null);
  const [topic, setTopic] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [votingMode, setVotingMode] = useState(false);

  const recommendation = roomNeed ? RECOMMENDATIONS[roomNeed] : null;

  const handleSubmit = () => setShowResult(true);

  const handleBuildAgenda = () => {
    setCurrentSession({
      template: recommendation?.template,
      roomNeed,
      time,
      topic: hasTopic ? topic : null,
      tactics: recommendation?.tactics || [],
    });
    navigate('/session-portal/agenda');
  };

  const canAdvance = [
    !!roomNeed,
    !!time,
    hasTopic !== null,
  ][step];

  if (showResult && recommendation) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {/* Result Card */}
          <div className="rounded-3xl border border-[#c9a87c]/30 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(13,31,54,0.95))' }}>
            <div className="px-8 py-7 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-[#c9a87c]" />
                <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Recommended Session</span>
              </div>
              <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {recommendation.template}
              </h2>
              {topic && <p className="text-white/50 text-sm mt-1">Topic: <span className="text-white/70">{topic}</span></p>}
            </div>

            <div className="px-8 py-6">
              <p className="text-white/70 text-sm leading-relaxed mb-6">{recommendation.explanation}</p>

              <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-3">Tactics in Sequence</p>
              <div className="space-y-2 mb-8">
                {recommendation.tactics.map((tactic, i) => (
                  <div key={tactic} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(201,168,124,0.2)', color: '#c9a87c' }}>{i + 1}</span>
                    <span className="text-white text-sm font-medium">{tactic}</span>
                    <span className="ml-auto text-white/30 text-xs">{time && Math.round(time / recommendation.tactics.length)} min</span>
                  </div>
                ))}
              </div>

              {votingMode ? (
                <div className="rounded-2xl border border-[#c9a87c]/20 p-6 mb-6"
                  style={{ background: 'rgba(201,168,124,0.04)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Vote className="w-4 h-4 text-[#c9a87c]" />
                    <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Community Vote</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">Share this link with your participants. They'll vote on the session format before you begin.</p>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/20 bg-white/5">
                    <code className="text-[#c9a87c] text-xs flex-1 break-all">{window.location.origin}/session-portal/selector?vote={encodeURIComponent(recommendation.template)}</code>
                  </div>
                  <p className="text-white/30 text-xs mt-3 italic">Voting link generated — share in your Moon Joy session chat or GHL broadcast.</p>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleBuildAgenda}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#07111f] transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                  Build This Agenda <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setVotingMode(v => !v)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all"
                  style={{ background: 'rgba(201,168,124,0.06)' }}>
                  <Vote className="w-4 h-4" />
                  {votingMode ? 'Hide Vote Link' : 'Open to Community Vote'}
                </button>
              </div>
            </div>
          </div>

          <button onClick={() => { setShowResult(false); setStep(0); setRoomNeed(null); setTime(null); setHasTopic(null); setTopic(''); }}
            className="mt-6 text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Start over
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-[#c9a87c] text-[#07111f]' : i === step ? 'bg-[#c9a87c]/30 text-[#c9a87c] ring-1 ring-[#c9a87c]' : 'bg-white/10 text-white/30'
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-white' : 'text-white/30'}`}>{label}</span>
            {i < STEP_LABELS.length - 1 && <div className="w-8 h-px bg-white/10 mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Q1 */}
        {step === 0 && (
          <motion.div key="q1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              What does the room need?
            </h2>
            <p className="text-white/50 text-sm mb-6">Pick the energy that fits today's session.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROOM_NEEDS.map(({ id, label, desc, icon: Icon }) => (
                <button key={id} onClick={() => setRoomNeed(id)}
                  className={`text-left p-5 rounded-2xl border transition-all ${
                    roomNeed === id
                      ? 'border-[#c9a87c] bg-[#c9a87c]/10'
                      : 'border-white/10 bg-white/3 hover:border-white/30 hover:bg-white/5'
                  }`}>
                  <Icon className={`w-5 h-5 mb-2 ${roomNeed === id ? 'text-[#c9a87c]' : 'text-white/50'}`} />
                  <p className={`font-bold text-sm mb-1 ${roomNeed === id ? 'text-[#c9a87c]' : 'text-white'}`}>{label}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Q2 */}
        {step === 1 && (
          <motion.div key="q2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              How much time do you have?
            </h2>
            <p className="text-white/50 text-sm mb-6">We'll sequence the tactics to fit.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_OPTIONS.map(({ value, label, desc }) => (
                <button key={value} onClick={() => setTime(value)}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    time === value
                      ? 'border-[#c9a87c] bg-[#c9a87c]/10'
                      : 'border-white/10 bg-white/3 hover:border-white/30'
                  }`}>
                  <p className={`font-bold text-xl mb-1 ${time === value ? 'text-[#c9a87c]' : 'text-white'}`}>{label}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Q3 */}
        {step === 2 && (
          <motion.div key="q3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Is there a specific topic?
            </h2>
            <p className="text-white/50 text-sm mb-6">Optional — helps frame the recommendation.</p>
            <div className="flex gap-3 mb-6">
              {[{ val: true, label: 'Yes, there\'s a topic' }, { val: false, label: 'No specific topic' }].map(({ val, label }) => (
                <button key={String(val)} onClick={() => setHasTopic(val)}
                  className={`flex-1 py-4 rounded-2xl border text-sm font-semibold transition-all ${
                    hasTopic === val
                      ? 'border-[#c9a87c] bg-[#c9a87c]/10 text-[#c9a87c]'
                      : 'border-white/10 bg-white/3 text-white/60 hover:border-white/30'
                  }`}>{label}</button>
              ))}
            </div>
            {hasTopic && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="What's the topic or challenge for today's session?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-[#c9a87c]/50"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 2 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#07111f] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#07111f] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            <Wand2 className="w-4 h-4" /> Get Recommendation
          </button>
        )}
      </div>
    </div>
  );
}