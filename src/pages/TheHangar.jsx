import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProvider, useGame } from '@/components/epics/03-mission-rooms/games/GameContext';
import { HangarScene } from '@/components/epics/03-mission-rooms/games/hangar';
import { OutsideScene } from '@/components/epics/03-mission-rooms/games/hangar';
import { UnifiedGameHUD } from '@/components/epics/03-mission-rooms/games/hangar';
import { HangarAudio } from '@/components/epics/03-mission-rooms/games/hangar';
import { InteractionPrompt } from '@/components/epics/03-mission-rooms/games/hangar';
import { AreaDiscoveryToast } from '@/components/epics/03-mission-rooms/games/hangar';
import { ArtifactPickup } from '@/components/epics/03-mission-rooms/games/hangar';
import { HologramDisplay } from '@/components/epics/03-mission-rooms/games/hangar';
import { InventoryPanel } from '@/components/epics/03-mission-rooms/games/hangar';
import { PauseMenu } from '@/components/epics/03-mission-rooms/games/hangar';
import { MiniGameHub } from '@/components/epics/03-mission-rooms/games/minigames';
import { MissionBoard } from '@/components/epics/03-mission-rooms/games/missions';
import { OnboardingSequence } from '@/components/epics/03-mission-rooms/games/hangar';
import { LayerProvider, useLayer, LayerNavigator, LayerTransitionOverlay } from '@/components/epics/03-mission-rooms/games/hangar/layers';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Nominee } from '@/entities/Nominee';
import { ArrowLeft, Maximize2, Volume2, VolumeX, Loader2, Layers } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
};

const areaNames = {
  entrance: 'Main Entrance',
  stardust_gateway: 'Stardust Gateway',
  launch_complex_01a: 'Launch Complex 01A',
  launch_complex_01b: 'Launch Complex 01B',
  assembly_spire: 'Assembly Spire',
  mythos_theater_1: 'Mythos Theater 1',
  mythos_theater_2: 'Mythos Theater 2',
  aurora_hall: 'Aurora Hall',
  hangar_entrance: 'Sky Cadet Hangar Entrance',
  campus: 'Space Center Campus',
  central_atrium: 'Central Atrium',
  north_wing: 'North Wing',
  south_wing: 'South Wing',
  east_gallery: 'East Gallery',
  west_terminal: 'West Terminal',
};

function HangarGame() {
  const { player, updatePlayer, addArtifact, awardInsightPoints, loading } = useGame();
  const { currentLayer, isTransitioning } = useLayer();
  
  // Check URL params for spawn location
  const urlParams = new URLSearchParams(window.location.search);
  const spawnParam = urlParams.get('spawn');
  const initialArea = spawnParam === 'launch_complex' ? 'launch_complex_01a' : 'central_atrium';
  
  const [currentArea, setCurrentArea] = useState(initialArea);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showLayerNav, setShowLayerNav] = useState(false);
  // Start outside if spawning at launch complex, inside otherwise
  const [showOutside, setShowOutside] = useState(spawnParam === 'launch_complex');
  const [cameraMode, setCameraMode] = useState('follow'); // 'follow' or 'manual'
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showMissionBoard, setShowMissionBoard] = useState(false);
  
  // Interaction state
  const [nearbyInteractable, setNearbyInteractable] = useState(null);
  const [discoveredArea, setDiscoveredArea] = useState(null);
  const [pickedUpArtifact, setPickedUpArtifact] = useState(null);
  const [viewingNominee, setViewingNominee] = useState(null);
  
  // Rate limit protection - enforce 2s cooldown between ANY API calls
  const areaUpdateTimerRef = useRef(null);
  const lastApiCallRef = useRef(0);
  const apiCallQueue = useRef([]);

  // Check for first-time user and show onboarding
  useEffect(() => {
    if (!loading && player) {
      const hasCompletedOnboarding = localStorage.getItem(`hangar_onboarding_${player.user_email}`);
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [loading, player]);

  const handleOnboardingComplete = () => {
    if (player) {
      localStorage.setItem(`hangar_onboarding_${player.user_email}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    if (player) {
      localStorage.setItem(`hangar_onboarding_${player.user_email}`, 'true');
    }
    setShowOnboarding(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Escape for pause menu
      if (e.key === 'Escape') {
        if (showOnboarding || showWelcome) return;
        if (showInventory) {
          setShowInventory(false);
        } else {
          setShowPauseMenu(prev => !prev);
        }
        return;
      }
      
      // Don't process other keys if paused or in modal
      if (showOnboarding || showPauseMenu || showInventory) return;

      // Inventory toggle
      if (e.key === 'i' || e.key === 'I') {
        setShowInventory(prev => !prev);
      }

      // Layer navigator toggle
      if (e.key === 'l' || e.key === 'L') {
        setShowLayerNav(prev => !prev);
      }

      // Toggle outside view
      if (e.key === 'o' || e.key === 'O') {
        setShowOutside(prev => !prev);
      }

      // Toggle camera mode (C key)
      if (e.key === 'c' || e.key === 'C') {
        setCameraMode(prev => prev === 'follow' ? 'manual' : 'follow');
      }

      // R&D Lab toggle
      if (e.key === 'r' || e.key === 'R') {
        setShowMiniGames(prev => !prev);
      }

      // Interaction (X key only)
      if (e.key === 'x' || e.key === 'X') {
        if (nearbyInteractable) {
          handleInteraction(nearbyInteractable);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nearbyInteractable, showOnboarding, showPauseMenu, showInventory, showWelcome]);

  // Rate-limited API caller with 2s cooldown
  const makeApiCall = useCallback(async (apiFunction, fallbackDelay = 2000) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    const minDelay = 2000; // 2 seconds minimum between any API calls
    
    if (timeSinceLastCall < minDelay) {
      const waitTime = minDelay - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    try {
      lastApiCallRef.current = Date.now();
      return await apiFunction();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, []);

  // Handle area changes with aggressive debouncing
  const handleAreaChange = useCallback((newArea) => {
    if (newArea === currentArea) return;
    
    setCurrentArea(newArea);
    
    const unlockedAreas = player?.hangar_unlocked_areas || ['main_hall'];
    const isNewDiscovery = !unlockedAreas.includes(newArea);
    
    if (isNewDiscovery && player) {
      if (areaUpdateTimerRef.current) {
        clearTimeout(areaUpdateTimerRef.current);
      }
      
      areaUpdateTimerRef.current = setTimeout(async () => {
        try {
          const updatedAreas = [...unlockedAreas, newArea];
          // Combine updates into single call to reduce API requests
          await makeApiCall(async () => {
            await updatePlayer({ hangar_unlocked_areas: updatedAreas });
          });
          await makeApiCall(async () => {
            await awardInsightPoints(50);
          });
          setDiscoveredArea(newArea);
        } catch (error) {
          console.error('Area update failed:', error);
        }
      }, 1500); // Increased debounce to 1.5s
    }
  }, [currentArea, player, updatePlayer, awardInsightPoints, makeApiCall]);

  // Handle interactions with rate limiting
  const handleInteraction = async (interactable) => {
    switch (interactable.type) {
      case 'artifact':
        if (interactable.mesh) {
          interactable.mesh.userData.collected = true;
          interactable.mesh.visible = false;
        }
        try {
          const artifact = await makeApiCall(async () => {
            return await addArtifact({
              artifact_id: interactable.id,
              name: interactable.name,
              description: interactable.description,
              category: interactable.category || 'lore',
              rarity: interactable.rarity || 'common',
              source_game: 'hangar'
            });
          });
          setPickedUpArtifact(artifact);
          await makeApiCall(async () => {
            await awardInsightPoints(interactable.points || 25);
          });
        } catch (error) {
          console.error('Artifact collection failed:', error);
        }
        break;
        
      case 'nominee':
        const nominees = await Nominee.filter({ id: interactable.nomineeId });
        if (nominees.length > 0) {
          setViewingNominee(nominees[0]);
        }
        break;
        
      case 'building_entrance':
        // Toggle back to inside hangar
        setShowOutside(false);
        break;
        
      case 'terminal':
        if (interactable.id === 'nominee_terminal') {
          setShowMiniGames(true);
        } else if (interactable.id === 'mission_control') {
          setShowOutside(true);
        }
        break;
    }
    setNearbyInteractable(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <p className="text-white/60">Initializing Hangar Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene - Toggle between inside and outside */}
      {showOutside ? (
        <OutsideScene 
          onAreaChange={handleAreaChange}
          onInteractableNear={setNearbyInteractable}
          cameraMode={cameraMode}
        />
      ) : (
        <HangarScene 
          onAreaChange={handleAreaChange}
          onInteractableNear={setNearbyInteractable}
          cameraMode={cameraMode}
        />
      )}

      {/* Ambient Audio */}
      <HangarAudio isMuted={isMuted} currentArea={currentArea} />

      {/* Unified Game HUD */}
      <UnifiedGameHUD
        player={player}
        currentArea={currentArea}
        areaName={areaNames[currentArea]}
        showOutside={showOutside}
        onToggleOutside={() => setShowOutside(!showOutside)}
        onToggleMissions={() => setShowMissionBoard(true)}
        onToggleEvaluation={() => setShowMiniGames(true)}
        onToggleLayerNav={() => setShowLayerNav(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleFullscreen={toggleFullscreen}
        cameraMode={cameraMode}
        onToggleCameraMode={() => setCameraMode(prev => prev === 'follow' ? 'manual' : 'follow')}
      />

      {/* Onboarding Sequence */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingSequence
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </AnimatePresence>

      {/* Interaction Prompt */}
      <InteractionPrompt
        isVisible={!!nearbyInteractable && !showWelcome && !showOnboarding}
        type={nearbyInteractable?.type}
        label={nearbyInteractable?.promptLabel || 'Press X to interact'}
        subLabel={nearbyInteractable?.promptSubLabel}
        isLocked={nearbyInteractable?.isLocked}
      />

      {/* Area Discovery Toast */}
      <AreaDiscoveryToast
        area={discoveredArea}
        isNew={!!discoveredArea}
        onDismiss={() => setDiscoveredArea(null)}
      />

      {/* Artifact Pickup Modal */}
      <ArtifactPickup
        artifact={pickedUpArtifact}
        onDismiss={() => setPickedUpArtifact(null)}
      />

      {/* Nominee Hologram Display */}
      {viewingNominee && (
        <HologramDisplay
          nominee={viewingNominee}
          onClose={() => setViewingNominee(null)}
        />
      )}

      {/* Inventory Panel */}
      <InventoryPanel
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Pause Menu */}
      <PauseMenu
        isOpen={showPauseMenu}
        onResume={() => setShowPauseMenu(false)}
        onSettings={() => {}}
        onHelp={() => setShowOnboarding(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Layer Navigation */}
      <LayerNavigator
        isOpen={showLayerNav}
        onClose={() => setShowLayerNav(false)}
      />

      {/* Layer Transition Overlay */}
      <LayerTransitionOverlay />

      {/* Mission Board */}
      <MissionBoard
        isOpen={showMissionBoard}
        onClose={() => setShowMissionBoard(false)}
      />

      {/* Mini Game Hub */}
      <MiniGameHub
        isOpen={showMiniGames}
        onClose={() => setShowMiniGames(false)}
        onInsightAwarded={(points) => awardInsightPoints(points)}
      />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-slate-900 to-black rounded-2xl p-8 max-w-lg w-full text-center"
              style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
            >
              {/* Logo/Icon */}
              <div className="text-6xl mb-4">🛩️</div>
              
              <div 
                className="text-4xl mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'white' }}
              >
                The Hangar
              </div>
              <p className="text-white/50 text-sm uppercase tracking-widest mb-6">
                TOP 100 Aerospace & Aviation
              </p>
              
              <p className="text-white/70 mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Explore the aerospace universe. Discover heritage, meet innovators, 
                collect artifacts, and unlock your prestige rank.
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-8 text-left">
                <h4 className="font-semibold mb-3 text-white" style={{ color: brandColors.goldPrestige }}>Controls</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">W A S D</span>
                      <span>Move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">X</span>
                      <span>Interact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">I</span>
                      <span>Inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">O</span>
                      <span>Outside</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">L</span>
                      <span>Layers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">ESC</span>
                      <span>Menu</span>
                    </div>
                  </div>
              </div>

              {/* Player rank preview */}
              {player && (
                <div className="flex items-center justify-center gap-3 mb-6 text-sm">
                  <span className="text-white/50">Your Rank:</span>
                  <span className="font-bold" style={{ color: brandColors.goldPrestige }}>
                    {player.prestige_rank || 'Bronze'}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">{player.insight_points || 0} IP</span>
                </div>
              )}
              
              <Button
                onClick={() => setShowWelcome(false)}
                className="w-full py-6 text-lg font-semibold text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Enter The Hangar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TheHangar() {
  return (
    <GameProvider>
      <LayerProvider>
        <HangarGame />
      </LayerProvider>
    </GameProvider>
  );
}