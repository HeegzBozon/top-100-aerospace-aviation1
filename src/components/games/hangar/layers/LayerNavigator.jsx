import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayer } from './LayerManager';
import { LAYERS, LAYER_GROUPS } from './LayerConfig';
import { 
  ChevronUp, ChevronDown, Lock, Unlock, Rocket, 
  Building, Settings, Cloud, Satellite, Star,
  ArrowLeft, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
  holoCyan: '#00d4ff',
};

const groupIcons = {
  building: Building,
  settings: Settings,
  cloud: Cloud,
  satellite: Satellite,
  rocket: Rocket,
};

function LayerCard({ layer, isUnlocked, isCurrent, onSelect }) {
  const Icon = layer.id >= 10 ? Star : layer.id >= 5 ? Cloud : Building;
  
  return (
    <motion.button
      whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
      whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
      onClick={() => isUnlocked && onSelect(layer.id)}
      className={`
        w-full p-3 rounded-lg text-left transition-all
        ${isCurrent ? 'ring-2' : ''}
        ${isUnlocked ? 'cursor-pointer hover:bg-white/10' : 'cursor-not-allowed opacity-50'}
      `}
      style={{
        background: isCurrent ? `${layer.color}30` : 'rgba(255,255,255,0.05)',
        borderColor: isCurrent ? brandColors.goldPrestige : 'transparent',
        ringColor: brandColors.goldPrestige,
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: layer.color }}
        >
          {isUnlocked ? (
            <Icon className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-4 h-4 text-white/70" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-mono">L{layer.id}</span>
            <span className="text-white font-medium truncate">{layer.shortName}</span>
          </div>
          {layer.altitudeDisplay && (
            <div className="text-xs text-white/50">{layer.altitudeDisplay}</div>
          )}
        </div>
        {!isUnlocked && layer.unlockRequirement && (
          <div className="text-xs text-white/40">
            {layer.unlockRequirement.insightPoints} IP
          </div>
        )}
      </div>
    </motion.button>
  );
}

function LayerGroup({ group, layers, unlockedIds, currentLayer, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(
    layers.some(l => l.id === currentLayer)
  );
  const GroupIcon = groupIcons[group.icon] || Building;
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white transition-colors"
      >
        <GroupIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{group.name}</span>
        {group.isOverlay && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/30 text-purple-300">
            Overlay
          </span>
        )}
        <ChevronDown 
          className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-2">
              {layers.map(layer => (
                <LayerCard
                  key={layer.id}
                  layer={layer}
                  isUnlocked={unlockedIds.includes(layer.id)}
                  isCurrent={layer.id === currentLayer}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LayerNavigator({ isOpen, onClose }) {
  const { 
    currentLayer, 
    unlockedLayerIds, 
    initiateTransition,
    ascend,
    descend,
    returnToHangar,
    getAvailableVehicles,
    currentVehicle,
    setCurrentVehicle,
  } = useLayer();
  
  const [showVehicleSelect, setShowVehicleSelect] = useState(false);
  const [pendingLayerId, setPendingLayerId] = useState(null);
  
  const currentLayerData = LAYERS[currentLayer];
  const availableVehicles = getAvailableVehicles();
  
  const handleLayerSelect = (layerId) => {
    // If going up and vehicles are required
    if (layerId > currentLayer && layerId >= 5) {
      const targetLayer = LAYERS[layerId];
      if (targetLayer.vehicles && targetLayer.vehicles.length > 0) {
        setPendingLayerId(layerId);
        setShowVehicleSelect(true);
        return;
      }
    }
    
    initiateTransition(layerId);
    onClose?.();
  };
  
  const handleVehicleSelect = (vehicleId) => {
    setCurrentVehicle(vehicleId);
    if (pendingLayerId) {
      initiateTransition(pendingLayerId, vehicleId);
      setPendingLayerId(null);
    }
    setShowVehicleSelect(false);
    onClose?.();
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative h-full w-80 max-w-full bg-slate-900/95 backdrop-blur-md overflow-hidden"
        style={{ borderLeft: `1px solid ${brandColors.navyDeep}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4 border-b"
          style={{ borderColor: `${brandColors.navyDeep}40` }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Layer Navigator
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Current layer indicator */}
          <div 
            className="p-3 rounded-lg"
            style={{ background: `${currentLayerData.color}20` }}
          >
            <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
              Current Layer
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                style={{ background: currentLayerData.color }}
              >
                {currentLayer}
              </div>
              <div>
                <div className="text-white font-medium">{currentLayerData.name}</div>
                {currentLayerData.altitudeDisplay && (
                  <div className="text-xs text-white/50">{currentLayerData.altitudeDisplay}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { ascend(); onClose?.(); }}
              disabled={currentLayer >= 16}
              className="flex-1 text-white border-white/20 hover:bg-white/10"
            >
              <ChevronUp className="w-4 h-4 mr-1" /> Ascend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { descend(); onClose?.(); }}
              disabled={currentLayer <= 0}
              className="flex-1 text-white border-white/20 hover:bg-white/10"
            >
              <ChevronDown className="w-4 h-4 mr-1" /> Descend
            </Button>
          </div>
          
          {currentLayer > 2 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { returnToHangar(); onClose?.(); }}
              className="w-full mt-2 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            >
              <Building className="w-4 h-4 mr-2" /> Return to Hangar
            </Button>
          )}
        </div>
        
        {/* Layer list */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {Object.entries(LAYER_GROUPS).map(([key, group]) => (
            <LayerGroup
              key={key}
              group={group}
              layers={group.layers.map(id => LAYERS[id])}
              unlockedIds={unlockedLayerIds}
              currentLayer={currentLayer}
              onSelect={handleLayerSelect}
            />
          ))}
        </div>
        
        {/* Vehicle selector */}
        {currentVehicle && (
          <div 
            className="p-4 border-t"
            style={{ borderColor: `${brandColors.navyDeep}40` }}
          >
            <div className="text-xs text-white/50 uppercase tracking-wider mb-2">
              Current Vehicle
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <span className="text-2xl">{currentVehicle.icon}</span>
              <div>
                <div className="text-white font-medium">{currentVehicle.name}</div>
                <div className="text-xs text-white/50">
                  Max: {currentVehicle.maxAltitude >= 1000000 ? '∞' : `${currentVehicle.maxAltitude / 1000} km`}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Vehicle selection modal */}
      <AnimatePresence>
        {showVehicleSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
            onClick={() => setShowVehicleSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4"
              style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 
                className="text-xl font-semibold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Select Vehicle
              </h3>
              <div className="space-y-2">
                {availableVehicles.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle.id)}
                    className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-4"
                  >
                    <span className="text-3xl">{vehicle.icon}</span>
                    <div>
                      <div className="text-white font-medium">{vehicle.name}</div>
                      <div className="text-xs text-white/50">
                        Speed: {vehicle.speed} km/h • Max: {vehicle.maxAltitude >= 1000000 ? '∞' : `${vehicle.maxAltitude / 1000} km`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}