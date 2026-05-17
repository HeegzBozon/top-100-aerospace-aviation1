import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CG_CAMPAIGNS } from '@/components/cg-sim/cgCampaigns';
import { cgClassifyProfile } from '@/components/cg-sim/cgClassifyProfile';
import CGCampaignSelect from '@/components/cg-sim/CGCampaignSelect';
import CGSceneView from '@/components/cg-sim/CGSceneView';
import CGDiceRoll from '@/components/cg-sim/CGDiceRoll';
import CGSignalLog from '@/components/cg-sim/CGSignalLog';
import CGPostMission from '@/components/cg-sim/CGPostMission';
import TransitionInterlude from '@/components/flight-sim/TransitionInterlude';

const PHASES = {
  SELECT: 'select',
  PLAYING: 'playing',
  SIGNAL_LOG: 'signal_log',
  DICE: 'dice',
  INTERLUDE: 'interlude',
  PROFILE: 'profile',
};

// Reuse the flight sim's GameEngine LLM logic but with CG-specific prompts
async function generateCGScene(session, scene, previousChoiceKey) {
  const statSummary = Object.entries(session.stats).map(([k, v]) => `${k}:${v}`).join(', ');
  const choiceHistory = session.choices.map(c => `${c.sceneId}→${c.choiceKey}`).join(', ');
  const prompt = `You are the narrator for a civic simulator called CommonGround. The player is a City Director implementing a dignity infrastructure site for unhoused residents in ${session.campaign.setting}.

Campaign: "${session.campaign.title}" — ${session.campaign.tagline}
Player stats: ${statSummary}
Previous choices: ${choiceHistory}
Last choice: ${previousChoiceKey}
Scene: ${scene.title}
Fallback text to adapt: ${scene.fallbackText}

Write a vivid, grounded narrative (3-4 paragraphs, 200-280 words) continuing from the player's last choice. Ground the scene in real civic detail: bureaucracy, community dynamics, housing policy, urban infrastructure. Tone: clear, serious, human — not bureaucratic. End on a genuine decision point or revelation. No choices list — just the scene narrative.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt, model: 'gemini_3_flash' });
  return typeof res === 'string' ? res : res?.text || scene.fallbackText;
}

async function generateCGBossOutcome(session, bossScene, result) {
  const statSummary = Object.entries(session.stats).map(([k, v]) => `${k}:${v}`).join(', ');
  const choiceHistory = session.choices.map(c => `${c.sceneId}→${c.choiceKey}`).join(', ');
  const outcome = result.outcome;
  const fallback = bossScene.fallbackOutcomes[outcome];

  const prompt = `You are the narrator for CommonGround, a civic simulator. The player just made their boss-moment decision.

Campaign: "${session.campaign.title}" — ${session.campaign.tagline}
Player stats: ${statSummary}
Choices: ${choiceHistory}
Dice roll: ${result.total} (d20:${result.diceResult} + modifier:${result.modifier})
Outcome tier: ${outcome}
Fallback outcome to adapt: ${fallback}

Write a vivid first-person narrative (3-5 paragraphs, 250-350 words) describing what actually happened — the room, the vote, the aftermath. Ground it in specific civic detail. Tone: serious, human, honest about complexity. This is the climax. Make it land.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt, model: 'claude_sonnet_4_6' });
  return typeof res === 'string' ? res : res?.text || fallback;
}

export default function CommonGroundSimulator() {
  const [phase, setPhase] = useState(PHASES.SELECT);
  const [session, setSession] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [aiContent, setAiContent] = useState({});
  const [diceResult, setDiceResult] = useState(null);
  const [isBossInterlude, setIsBossInterlude] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [civicProfile, setCivicProfile] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase, currentSceneIndex]);

  const startCampaign = (campaignId) => {
    const campaign = CG_CAMPAIGNS[campaignId];
    setSession({ campaignId, campaign, stats: { ...campaign.baseStats }, choices: [], startedAt: Date.now() });
    setCurrentSceneIndex(0);
    setAiContent({});
    setDiceResult(null);
    setCivicProfile(null);
    setPhase(PHASES.PLAYING);
  };

  const handleChoice = async (scene, choiceKey, statDeltas) => {
    const newStats = { ...session.stats };
    if (statDeltas) {
      Object.entries(statDeltas).forEach(([stat, delta]) => {
        newStats[stat] = Math.max(1, Math.min(20, (newStats[stat] || 10) + delta));
      });
    }
    const newChoices = choiceKey === 'continue'
      ? session.choices
      : [...session.choices, { sceneId: scene.id, choiceKey, timestamp: Date.now() }];
    const updatedSession = { ...session, stats: newStats, choices: newChoices };
    setSession(updatedSession);

    const nextIndex = currentSceneIndex + 1;
    const nextScene = session.campaign.scenes[nextIndex];

    if (nextScene?.type === 'signal_log') {
      setCurrentSceneIndex(nextIndex);
      setPhase(PHASES.SIGNAL_LOG);
      return;
    }
    if (nextScene?.type === 'boss') {
      setCurrentSceneIndex(nextIndex);
      setPhase(PHASES.DICE);
      return;
    }
    if (nextScene?.aiGenerated) {
      setCurrentSceneIndex(nextIndex);
      setIsBossInterlude(false);
      setPhase(PHASES.INTERLUDE);
      try {
        const content = await generateCGScene(updatedSession, nextScene, choiceKey);
        setAiContent(prev => ({ ...prev, [nextScene.id]: content }));
      } catch {
        setAiContent(prev => ({ ...prev, [nextScene.id]: nextScene.fallbackText }));
      }
      setPhase(PHASES.PLAYING);
    } else {
      setCurrentSceneIndex(nextIndex);
    }
  };

  const handleSignalLogComplete = (info) => {
    setPlayerInfo(info);
    setCurrentSceneIndex(currentSceneIndex + 1);
    setPhase(PHASES.PLAYING);
  };

  const handleDiceComplete = async (result) => {
    setDiceResult(result);
    const bossScene = session.campaign.scenes[currentSceneIndex];
    setIsBossInterlude(true);
    setPhase(PHASES.INTERLUDE);
    try {
      const content = await generateCGBossOutcome(session, bossScene, result);
      setAiContent(prev => ({ ...prev, [bossScene.id]: content }));
    } catch {
      setAiContent(prev => ({ ...prev, [bossScene.id]: bossScene.fallbackOutcomes[result.outcome] }));
    }
    setPhase(PHASES.PLAYING);
  };

  const handleEpilogue = () => {
    const profile = cgClassifyProfile(session, diceResult);
    setCivicProfile(profile);
    setPhase(PHASES.PROFILE);
  };

  const reset = () => {
    setPhase(PHASES.SELECT);
    setSession(null);
    setCurrentSceneIndex(0);
    setAiContent({});
    setDiceResult(null);
    setPlayerInfo(null);
    setCivicProfile(null);
  };

  const currentScene = session?.campaign?.scenes[currentSceneIndex];

  return (
    <div ref={topRef} className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #03080f 0%, #071a10 60%, #07111f 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,8,15,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold tracking-widest text-[#4ade80] uppercase">TOP 100</Link>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">CommonGround Simulator</span>
        </div>
        {phase !== PHASES.SELECT && (
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Mission Select
          </button>
        )}
      </nav>

      <AnimatePresence mode="wait">
        {phase === PHASES.SELECT && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CGCampaignSelect onSelect={startCampaign} />
          </motion.div>
        )}

        {phase === PHASES.PLAYING && currentScene && (
          <motion.div key={`scene-${currentScene.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <CGSceneView
              scene={currentScene}
              session={session}
              aiContent={aiContent[currentScene.id]}
              onChoice={handleChoice}
              onEpilogue={handleEpilogue}
              isEpilogue={currentScene.type === 'epilogue'}
              diceResult={diceResult}
            />
          </motion.div>
        )}

        {phase === PHASES.INTERLUDE && (
          <motion.div key="interlude" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TransitionInterlude isBoss={isBossInterlude} />
          </motion.div>
        )}

        {phase === PHASES.SIGNAL_LOG && (
          <motion.div key="signal-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CGSignalLog onComplete={handleSignalLogComplete} />
          </motion.div>
        )}

        {phase === PHASES.DICE && currentScene && (
          <motion.div key="dice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CGDiceRoll scene={currentScene} session={session} onComplete={handleDiceComplete} />
          </motion.div>
        )}

        {phase === PHASES.PROFILE && civicProfile && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CGPostMission
              profile={civicProfile}
              session={session}
              playerInfo={playerInfo}
              diceResult={diceResult}
              onPlayAgain={reset}
              onPlayOther={startCampaign}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}