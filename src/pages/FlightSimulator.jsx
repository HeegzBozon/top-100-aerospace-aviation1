import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import GameEngine from '@/components/flight-sim/GameEngine';
import CampaignSelect from '@/components/flight-sim/CampaignSelect';
import SceneView from '@/components/flight-sim/SceneView';
import DiceRoll from '@/components/flight-sim/DiceRoll';
import SignalLog from '@/components/flight-sim/SignalLog';
import PostMissionJourney from '@/components/flight-sim/PostMissionJourney';
import TransitionInterlude from '@/components/flight-sim/TransitionInterlude';
import { CAMPAIGNS } from '@/components/flight-sim/campaigns';
import { classifyProfile } from '@/components/flight-sim/classifyProfile';
import { ChevronLeft } from 'lucide-react';

export const GAME_PHASES = {
  SELECT: 'select',
  PLAYING: 'playing',
  SIGNAL_LOG: 'signal_log',
  DICE: 'dice',
  PROFILE: 'profile',
  INTERLUDE: 'interlude',
};

export default function FlightSimulator() {
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState(GAME_PHASES.SELECT);
  const [debriefStatus, setDebriefStatus] = useState(null);

  useEffect(() => {
    if (searchParams.get('debrief') === 'success') {
      setDebriefStatus('success');
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // Trigger report generation after Stripe redirect
        import('@/functions/generateFlightDebriefReport').then(({ generateFlightDebriefReport }) => {
          generateFlightDebriefReport({ stripe_session_id: sessionId }).catch(() => {});
        });
      }
    }
  }, []);
  const [session, setSession] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [aiContent, setAiContent] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [isBossInterlude, setIsBossInterlude] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [flightProfile, setFlightProfile] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase, currentSceneIndex]);

  const startCampaign = (campaignId) => {
    const campaign = CAMPAIGNS[campaignId];
    const initialStats = { ...campaign.baseStats };
    setSession({
      campaignId,
      campaign,
      stats: initialStats,
      choices: [],
      startedAt: Date.now(),
    });
    setCurrentSceneIndex(0);
    setAiContent({});
    setDiceResult(null);
    setFlightProfile(null);
    setPhase(GAME_PHASES.PLAYING);
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
      setPhase(GAME_PHASES.SIGNAL_LOG);
      return;
    }

    if (nextScene?.type === 'boss') {
      setCurrentSceneIndex(nextIndex);
      setPhase(GAME_PHASES.DICE);
      return;
    }

    if (nextScene?.aiGenerated) {
      setCurrentSceneIndex(nextIndex);
      setIsBossInterlude(false);
      setPhase(GAME_PHASES.INTERLUDE);
      try {
        const content = await GameEngine.generateSceneContent(updatedSession, nextScene, choiceKey, null);
        setAiContent(prev => ({ ...prev, [nextScene.id]: content }));
      } catch (e) {
        setAiContent(prev => ({ ...prev, [nextScene.id]: nextScene.fallbackText }));
      }
      setPhase(GAME_PHASES.PLAYING);
    } else {
      setCurrentSceneIndex(nextIndex);
    }
  };

  const handleSignalLogComplete = (info) => {
    setPlayerInfo(info);
    const nextIndex = currentSceneIndex + 1;
    setCurrentSceneIndex(nextIndex);
    setPhase(GAME_PHASES.PLAYING);
  };

  const handleDiceComplete = async (result) => {
    setDiceResult(result);
    const bossScene = session.campaign.scenes[currentSceneIndex];
    setIsBossInterlude(true);
    setPhase(GAME_PHASES.INTERLUDE);
    try {
      const content = await GameEngine.generateBossOutcome(session, bossScene, result);
      setAiContent(prev => ({ ...prev, [bossScene.id]: content }));
    } catch (e) {
      setAiContent(prev => ({ ...prev, [bossScene.id]: bossScene.fallbackOutcomes[result.outcome] }));
    }
    setPhase(GAME_PHASES.PLAYING);
  };

  const handleEpilogue = () => {
    const profile = classifyProfile(session, diceResult);
    setFlightProfile(profile);
    setPhase(GAME_PHASES.PROFILE);
  };

  const reset = () => {
    setPhase(GAME_PHASES.SELECT);
    setSession(null);
    setCurrentSceneIndex(0);
    setAiContent({});
    setDiceResult(null);
    setPlayerInfo(null);
    setFlightProfile(null);
  };

  const currentScene = session?.campaign?.scenes[currentSceneIndex];

  return (
    <div ref={topRef} className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #03080f 0%, #07111f 60%, #0d1f36 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,8,15,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Flight Simulator</span>
        </div>
        {phase !== GAME_PHASES.SELECT && (
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Mission Select
          </button>
        )}
      </nav>

      <AnimatePresence mode="wait">
        {phase === GAME_PHASES.SELECT && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CampaignSelect onSelect={startCampaign} />
          </motion.div>
        )}

        {phase === GAME_PHASES.PLAYING && currentScene && (
          <motion.div key={`scene-${currentScene.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <SceneView
              scene={currentScene}
              session={session}
              aiContent={aiContent[currentScene.id]}
              loadingAI={loadingAI}
              onChoice={handleChoice}
              onEpilogue={handleEpilogue}
              isEpilogue={currentScene.type === 'epilogue'}
              diceResult={diceResult}
            />
          </motion.div>
        )}

        {phase === GAME_PHASES.INTERLUDE && (
          <motion.div key="interlude" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TransitionInterlude isBoss={isBossInterlude} />
          </motion.div>
        )}

        {phase === GAME_PHASES.SIGNAL_LOG && (
          <motion.div key="signal-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SignalLog onComplete={handleSignalLogComplete} />
          </motion.div>
        )}

        {phase === GAME_PHASES.DICE && currentScene && (
          <motion.div key="dice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DiceRoll scene={currentScene} session={session} onComplete={handleDiceComplete} />
          </motion.div>
        )}

        {phase === GAME_PHASES.PROFILE && flightProfile && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PostMissionJourney
              profile={flightProfile}
              session={session}
              playerInfo={playerInfo}
              onPlayAgain={reset}
              onPlayOther={startCampaign}
              diceResult={diceResult}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}