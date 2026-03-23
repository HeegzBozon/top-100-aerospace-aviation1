import { createContext, useContext, useState, useCallback } from 'react';
import { LAYERS, TRANSITIONS, VEHICLES, getUnlockedLayers, getLayerById } from './LayerConfig';
import { useGame } from '../../GameContext';

const LayerContext = createContext(null);

export function LayerProvider({ children }) {
  const { player, updatePlayer, awardInsightPoints } = useGame();
  
  // Current layer state
  const [currentLayer, setCurrentLayer] = useState(2); // Start at Exhibits layer
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionData, setTransitionData] = useState(null);
  
  // Layer history for breadcrumb/navigation
  const [layerHistory, setLayerHistory] = useState([2]);
  
  // Unlocked layers based on player progress
  const unlockedLayers = getUnlockedLayers(player);
  const unlockedLayerIds = unlockedLayers.map(l => l.id);
  
  // Check if a layer is accessible
  const canAccessLayer = useCallback((layerId) => {
    return unlockedLayerIds.includes(layerId);
  }, [unlockedLayerIds]);
  
  // Get next layer in the stack
  const getNextLayer = useCallback((direction = 'up') => {
    const current = currentLayer;
    const next = direction === 'up' ? current + 1 : current - 1;
    
    // Skip system layers (3, 4) when navigating spatially
    if (next === 3 || next === 4) {
      return direction === 'up' ? 5 : 2;
    }
    
    if (next < 0 || next > 16) return null;
    return next;
  }, [currentLayer]);
  
  // Initiate layer transition
  const initiateTransition = useCallback(async (targetLayerId, vehicleId = null) => {
    const targetLayer = getLayerById(targetLayerId);
    if (!targetLayer) {
      console.error('Invalid target layer:', targetLayerId);
      return false;
    }
    
    // Check if player can access
    if (!canAccessLayer(targetLayerId)) {
      console.warn('Layer locked:', targetLayerId, targetLayer.unlockRequirement);
      return { success: false, reason: 'locked', requirement: targetLayer.unlockRequirement };
    }
    
    // Get transition method
    const transition = targetLayer.transitionFrom;
    const transitionConfig = transition ? TRANSITIONS[transition.method] : null;
    
    // Set vehicle if provided
    if (vehicleId) {
      const vehicle = VEHICLES[vehicleId];
      if (vehicle) {
        setCurrentVehicle({ id: vehicleId, ...vehicle });
      }
    }
    
    // Start transition
    setIsTransitioning(true);
    setTransitionData({
      from: currentLayer,
      to: targetLayerId,
      method: transitionConfig,
      duration: transition?.duration || 3000,
      startTime: Date.now(),
    });
    
    // Animate progress
    const duration = transition?.duration || 3000;
    const startTime = Date.now();
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setTransitionProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        // Transition complete
        completeTransition(targetLayerId);
      }
    };
    
    requestAnimationFrame(animateProgress);
    return { success: true };
  }, [currentLayer, canAccessLayer]);
  
  // Complete the transition
  const completeTransition = useCallback(async (targetLayerId) => {
    const previousLayer = currentLayer;
    
    setCurrentLayer(targetLayerId);
    setLayerHistory(prev => [...prev, targetLayerId]);
    setIsTransitioning(false);
    setTransitionProgress(0);
    setTransitionData(null);
    
    // Award points for first-time layer visits
    const visitedLayers = player?.visited_layers || [];
    if (!visitedLayers.includes(targetLayerId)) {
      const layer = getLayerById(targetLayerId);
      const pointsAwarded = layer.id >= 10 ? 500 : layer.id >= 5 ? 100 : 25;
      
      await updatePlayer({ 
        visited_layers: [...visitedLayers, targetLayerId] 
      });
      await awardInsightPoints(pointsAwarded);
      
      // Special handling for prestige layers
      if (layer.isPrestigeLayer) {
        // Trigger special ceremony
        console.log('PRESTIGE LAYER REACHED:', layer.name);
      }
    }
  }, [currentLayer, player, updatePlayer, awardInsightPoints]);
  
  // Quick ascend (go up one layer)
  const ascend = useCallback((vehicleId) => {
    const nextLayer = getNextLayer('up');
    if (nextLayer !== null) {
      return initiateTransition(nextLayer, vehicleId);
    }
    return { success: false, reason: 'at_top' };
  }, [getNextLayer, initiateTransition]);
  
  // Quick descend (go down one layer)
  const descend = useCallback(() => {
    const nextLayer = getNextLayer('down');
    if (nextLayer !== null) {
      return initiateTransition(nextLayer);
    }
    return { success: false, reason: 'at_bottom' };
  }, [getNextLayer, initiateTransition]);
  
  // Return to hangar (layer 2)
  const returnToHangar = useCallback(() => {
    if (currentLayer <= 2) return { success: false, reason: 'already_in_hangar' };
    
    // Quick descent animation
    setIsTransitioning(true);
    setTransitionData({
      from: currentLayer,
      to: 2,
      method: TRANSITIONS.orbital_maneuver,
      duration: 5000,
      isEmergencyReturn: true,
    });
    
    setTimeout(() => {
      setCurrentLayer(2);
      setCurrentVehicle(null);
      setIsTransitioning(false);
      setTransitionData(null);
    }, 5000);
    
    return { success: true };
  }, [currentLayer]);
  
  // Get current layer data
  const getCurrentLayerData = useCallback(() => {
    return getLayerById(currentLayer);
  }, [currentLayer]);
  
  // Get available vehicles for current layer
  const getAvailableVehicles = useCallback(() => {
    const layer = getLayerById(currentLayer);
    if (!layer?.vehicles) return [];
    
    return layer.vehicles.map(vId => ({
      id: vId,
      ...VEHICLES[vId],
    }));
  }, [currentLayer]);
  
  const value = {
    // State
    currentLayer,
    currentVehicle,
    isTransitioning,
    transitionProgress,
    transitionData,
    layerHistory,
    unlockedLayers,
    unlockedLayerIds,
    
    // Methods
    canAccessLayer,
    initiateTransition,
    ascend,
    descend,
    returnToHangar,
    getCurrentLayerData,
    getAvailableVehicles,
    setCurrentVehicle,
    
    // Config access
    LAYERS,
    VEHICLES,
    TRANSITIONS,
  };
  
  return (
    <LayerContext.Provider value={value}>
      {children}
    </LayerContext.Provider>
  );
}

export function useLayer() {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayer must be used within LayerProvider');
  }
  return context;
}

export default LayerProvider;