/**
 * HANGAR LAYERS × EARTH–SPACE LAYERS
 * Canonical Unified Model v1.0
 * 
 * Layers 0-2: Physical Hangar (Ground → Structure → Objects)
 * Layers 3-4: Abstract Systems (Gameplay + UI overlays)
 * Layers 5-16: Atmospheric/Space Stack (Surface → Interplanetary)
 */

export const LAYER_TYPES = {
  PHYSICAL_GROUND: 'physical_ground',
  PHYSICAL_STRUCTURE: 'physical_structure', 
  PHYSICAL_OBJECTS: 'physical_objects',
  SYSTEM_GAMEPLAY: 'system_gameplay',
  SYSTEM_UI: 'system_ui',
  ATMOSPHERIC: 'atmospheric',
  ORBITAL: 'orbital',
  DEEP_SPACE: 'deep_space',
};

export const LAYERS = {
  // === PHYSICAL HANGAR LAYERS ===
  0: {
    id: 0,
    name: 'Ground Plane Foundation',
    shortName: 'Ground',
    type: LAYER_TYPES.PHYSICAL_GROUND,
    altitudeMin: 0,
    altitudeMax: 0,
    color: '#4a5568',
    description: 'Physical foundation + game base terrain',
    subLayers: [
      { id: '0.1', name: 'Ground slab / asphalt' },
      { id: '0.2', name: 'Embedded lights / markings' },
      { id: '0.3', name: 'Drainage + terrain contours' },
    ],
    gameUses: ['Anchor for all structures', 'Zero objects placed here'],
    unlockRequirement: null, // Always unlocked
  },

  1: {
    id: 1,
    name: 'Hangar Structural Layer',
    shortName: 'Structure',
    type: LAYER_TYPES.PHYSICAL_STRUCTURE,
    altitudeMin: 0,
    altitudeMax: 60,
    color: '#2d3748',
    description: 'Walls, corridors, chambers, observation deck, rotunda dome',
    zones: [
      'Airside Wing',
      'Space Systems Wing', 
      'R&D Labs',
      'Lightning Arena',
      'Hall of Fame Gallery',
      'Hall of Legends Rotunda',
      'Archive Vault',
    ],
    gameUses: ['Pure architecture', 'No items yet'],
    unlockRequirement: null,
  },

  2: {
    id: 2,
    name: 'Objects & Exhibits Layer',
    shortName: 'Exhibits',
    type: LAYER_TYPES.PHYSICAL_OBJECTS,
    altitudeMin: 0,
    altitudeMax: 60,
    color: '#718096',
    description: 'All physical items inside the Hangar',
    examples: [
      'Aircraft, rockets, satellites',
      'Podiums, simulators, consoles',
      'Holograms, displays, plaques',
      'Seats, railings, kiosks',
    ],
    gameUses: ['Populates the interior'],
    unlockRequirement: null,
  },

  // === ABSTRACT SYSTEM LAYERS (Overlay, not spatial) ===
  3: {
    id: 3,
    name: 'Interactive Mechanics Layer',
    shortName: 'Gameplay',
    type: LAYER_TYPES.SYSTEM_GAMEPLAY,
    altitudeMin: null, // Non-spatial
    altitudeMax: null,
    color: '#9f7aea',
    description: 'Triggers, portals, mission nodes, event scripting',
    examples: [
      'Pairwise voting rooms',
      'Blind Trial pods',
      'Daily Trials Gate',
      'Card Collection interactions',
      'Hologram activation',
    ],
    gameUses: ['Overlays on physical layers'],
    unlockRequirement: null,
  },

  4: {
    id: 4,
    name: 'UI & Overlay Layer',
    shortName: 'UI',
    type: LAYER_TYPES.SYSTEM_UI,
    altitudeMin: null,
    altitudeMax: null,
    color: '#4fd1c5',
    description: 'In-world markers, icons, outlines, text, direction arrows',
    gameUses: ['Presentation layer over all physical/spatial layers'],
    unlockRequirement: null,
  },

  // === ATMOSPHERIC LAYERS ===
  5: {
    id: 5,
    name: 'Surface Airspace',
    shortName: 'Surface',
    type: LAYER_TYPES.ATMOSPHERIC,
    altitudeMin: 0,
    altitudeMax: 1000, // meters
    altitudeDisplay: '0–1 km',
    color: '#68d391',
    description: 'Drones, VTOLs, hangar airspace',
    gameUses: ['Drone course', 'Low-altitude flight trials'],
    vehicles: ['drone', 'vtol', 'helicopter'],
    transitionFrom: { layer: 2, method: 'launch_pad', duration: 3000 },
    unlockRequirement: { insightPoints: 100 },
  },

  6: {
    id: 6,
    name: 'Lower Troposphere',
    shortName: 'Low Tropo',
    type: LAYER_TYPES.ATMOSPHERIC,
    altitudeMin: 1000,
    altitudeMax: 6000,
    altitudeDisplay: '1–6 km',
    color: '#4299e1',
    description: 'Regional aviation, turboprops',
    gameUses: ['Regional flight missions', 'Weather introduction'],
    vehicles: ['turboprop', 'light_aircraft', 'glider'],
    transitionFrom: { layer: 5, method: 'climb', duration: 5000 },
    unlockRequirement: { insightPoints: 250 },
  },

  7: {
    id: 7,
    name: 'Upper Troposphere',
    shortName: 'Up Tropo',
    type: LAYER_TYPES.ATMOSPHERIC,
    altitudeMin: 6000,
    altitudeMax: 12000,
    altitudeDisplay: '6–12 km',
    color: '#3182ce',
    description: 'Commercial jet cruise altitude',
    gameUses: ['Airline operations simulations', 'Weather missions'],
    vehicles: ['commercial_jet', 'private_jet', 'cargo_aircraft'],
    transitionFrom: { layer: 6, method: 'climb', duration: 6000 },
    unlockRequirement: { insightPoints: 500 },
  },

  8: {
    id: 8,
    name: 'Stratosphere',
    shortName: 'Strato',
    type: LAYER_TYPES.ATMOSPHERIC,
    altitudeMin: 12000,
    altitudeMax: 50000,
    altitudeDisplay: '12–50 km',
    color: '#2b6cb0',
    description: 'Supersonic aircraft, near-space view',
    gameUses: ['High-altitude aircraft showcase', 'Mach challenges'],
    vehicles: ['supersonic_jet', 'u2_spyplane', 'high_altitude_balloon'],
    transitionFrom: { layer: 7, method: 'supersonic_climb', duration: 8000 },
    unlockRequirement: { insightPoints: 1000, rank: 'Silver' },
  },

  9: {
    id: 9,
    name: 'Mesosphere',
    shortName: 'Meso',
    type: LAYER_TYPES.ATMOSPHERIC,
    altitudeMin: 50000,
    altitudeMax: 85000,
    altitudeDisplay: '50–85 km',
    color: '#1a365d',
    description: 'Meteor layer. No aircraft can sustain flight.',
    gameUses: ['Suborbital rocket simulations', 'Transition missions'],
    vehicles: ['suborbital_rocket', 'x15_spaceplane'],
    transitionFrom: { layer: 8, method: 'rocket_boost', duration: 10000 },
    unlockRequirement: { insightPoints: 2000, rank: 'Gold' },
  },

  // === SPACE LAYERS ===
  10: {
    id: 10,
    name: 'Thermosphere',
    shortName: 'Thermo',
    type: LAYER_TYPES.ORBITAL,
    altitudeMin: 85000,
    altitudeMax: 600000,
    altitudeDisplay: '85–600 km',
    color: '#0d1b2a',
    description: 'Aurora, ISS altitude range',
    gameUses: ['Spacewalk missions', 'Orbital mechanics puzzles', 'Satellite service challenges'],
    vehicles: ['space_capsule', 'shuttle', 'space_station'],
    transitionFrom: { layer: 9, method: 'orbital_insertion', duration: 15000 },
    unlockRequirement: { insightPoints: 3500, rank: 'Gold' },
  },

  11: {
    id: 11,
    name: 'Kármán Line',
    shortName: 'Kármán',
    type: LAYER_TYPES.ORBITAL,
    altitudeMin: 100000,
    altitudeMax: 100000,
    altitudeDisplay: '100 km',
    color: '#ffd700',
    description: 'The boundary of space',
    gameUses: ['Prestige unlock event', 'Ascension checkpoint'],
    vehicles: ['any_orbital'],
    transitionFrom: { layer: 10, method: 'crossing_ceremony', duration: 5000 },
    unlockRequirement: { insightPoints: 5000, rank: 'Platinum' },
    isPrestigeLayer: true,
  },

  12: {
    id: 12,
    name: 'Low Earth Orbit',
    shortName: 'LEO',
    type: LAYER_TYPES.ORBITAL,
    altitudeMin: 160000,
    altitudeMax: 2000000,
    altitudeDisplay: '160–2,000 km',
    color: '#1e3a5a',
    description: 'Satellites, ISS, Hubble',
    gameUses: ['Satellite deployment', 'Station operations', 'Debris avoidance'],
    vehicles: ['space_station', 'satellite', 'crew_capsule'],
    transitionFrom: { layer: 11, method: 'orbital_maneuver', duration: 8000 },
    unlockRequirement: { insightPoints: 7500, rank: 'Platinum' },
  },

  13: {
    id: 13,
    name: 'Medium Earth Orbit',
    shortName: 'MEO',
    type: LAYER_TYPES.ORBITAL,
    altitudeMin: 2000000,
    altitudeMax: 35786000,
    altitudeDisplay: '2,000–35,786 km',
    color: '#2a4365',
    description: 'GPS and navigation satellites',
    gameUses: ['Navigation constellation management', 'Signal relay missions'],
    vehicles: ['gps_satellite', 'navigation_probe'],
    transitionFrom: { layer: 12, method: 'transfer_orbit', duration: 12000 },
    unlockRequirement: { insightPoints: 10000, rank: 'BlackBox' },
  },

  14: {
    id: 14,
    name: 'Geostationary Orbit',
    shortName: 'GEO',
    type: LAYER_TYPES.ORBITAL,
    altitudeMin: 35786000,
    altitudeMax: 35786000,
    altitudeDisplay: '35,786 km',
    color: '#3c4f76',
    description: 'Geostationary ring',
    gameUses: ['Communications satellite ops', 'Earth observation'],
    vehicles: ['geo_satellite', 'comms_relay'],
    transitionFrom: { layer: 13, method: 'hohmann_transfer', duration: 15000 },
    unlockRequirement: { insightPoints: 15000, rank: 'BlackBox' },
  },

  15: {
    id: 15,
    name: 'High Earth Orbit / Cislunar',
    shortName: 'Cislunar',
    type: LAYER_TYPES.DEEP_SPACE,
    altitudeMin: 35786000,
    altitudeMax: 384400000, // To the Moon
    altitudeDisplay: '35,786–384,400 km',
    color: '#1a1a2e',
    description: 'Artemis trajectories, Lunar Gateway',
    gameUses: ['Lunar mission planning', 'Gateway operations'],
    vehicles: ['orion_capsule', 'lunar_gateway', 'lunar_lander'],
    transitionFrom: { layer: 14, method: 'trans_lunar_injection', duration: 20000 },
    unlockRequirement: { insightPoints: 25000, rank: 'BlackBox', special: 'lunar_certification' },
  },

  16: {
    id: 16,
    name: 'Interplanetary Space',
    shortName: 'Deep Space',
    type: LAYER_TYPES.DEEP_SPACE,
    altitudeMin: 384400000,
    altitudeMax: Infinity,
    altitudeDisplay: 'Beyond the Moon',
    color: '#0a0a0f',
    description: 'Deep space operations',
    gameUses: ['Mars missions', 'Asteroid belt exploration', 'Probe management'],
    vehicles: ['mars_transit', 'deep_space_probe', 'asteroid_miner'],
    transitionFrom: { layer: 15, method: 'interplanetary_burn', duration: 30000 },
    unlockRequirement: { insightPoints: 50000, rank: 'BlackBox', special: 'deep_space_certification' },
    isFutureExpansion: true,
  },
};

// Layer groupings for UI
export const LAYER_GROUPS = {
  hangar: {
    name: 'Hangar Complex',
    layers: [0, 1, 2],
    icon: 'building',
  },
  systems: {
    name: 'Game Systems',
    layers: [3, 4],
    icon: 'settings',
    isOverlay: true,
  },
  atmosphere: {
    name: 'Atmospheric Stack',
    layers: [5, 6, 7, 8, 9],
    icon: 'cloud',
  },
  orbital: {
    name: 'Orbital Space',
    layers: [10, 11, 12, 13, 14],
    icon: 'satellite',
  },
  deepSpace: {
    name: 'Deep Space',
    layers: [15, 16],
    icon: 'rocket',
  },
};

// Vehicle definitions
export const VEHICLES = {
  // Surface (Layer 5)
  drone: { name: 'Recon Drone', maxAltitude: 500, speed: 50, icon: '🛸' },
  vtol: { name: 'VTOL Craft', maxAltitude: 1000, speed: 150, icon: '🚁' },
  helicopter: { name: 'Helicopter', maxAltitude: 3000, speed: 200, icon: '🚁' },
  
  // Lower Troposphere (Layer 6)
  turboprop: { name: 'Turboprop', maxAltitude: 7000, speed: 400, icon: '✈️' },
  light_aircraft: { name: 'Light Aircraft', maxAltitude: 5000, speed: 250, icon: '🛩️' },
  glider: { name: 'Glider', maxAltitude: 4000, speed: 100, icon: '🪂' },
  
  // Upper Troposphere (Layer 7)
  commercial_jet: { name: 'Commercial Jet', maxAltitude: 13000, speed: 900, icon: '✈️' },
  private_jet: { name: 'Private Jet', maxAltitude: 15000, speed: 850, icon: '🛩️' },
  cargo_aircraft: { name: 'Cargo Aircraft', maxAltitude: 12000, speed: 750, icon: '📦' },
  
  // Stratosphere (Layer 8)
  supersonic_jet: { name: 'Supersonic Jet', maxAltitude: 20000, speed: 2200, icon: '🚀' },
  u2_spyplane: { name: 'U-2 Spyplane', maxAltitude: 21000, speed: 800, icon: '🔍' },
  high_altitude_balloon: { name: 'High-Altitude Balloon', maxAltitude: 40000, speed: 20, icon: '🎈' },
  
  // Mesosphere (Layer 9)
  suborbital_rocket: { name: 'Suborbital Rocket', maxAltitude: 100000, speed: 5000, icon: '🚀' },
  x15_spaceplane: { name: 'X-15 Spaceplane', maxAltitude: 108000, speed: 7274, icon: '🛫' },
  
  // Orbital+ (Layers 10-16)
  space_capsule: { name: 'Space Capsule', maxAltitude: Infinity, speed: 28000, icon: '🛸' },
  shuttle: { name: 'Space Shuttle', maxAltitude: 600000, speed: 28000, icon: '🚀' },
  space_station: { name: 'Space Station', maxAltitude: 420000, speed: 27600, icon: '🛰️' },
  orion_capsule: { name: 'Orion Capsule', maxAltitude: Infinity, speed: 39000, icon: '🌙' },
  lunar_gateway: { name: 'Lunar Gateway', maxAltitude: Infinity, speed: 3600, icon: '🏠' },
  mars_transit: { name: 'Mars Transit Vehicle', maxAltitude: Infinity, speed: 50000, icon: '🔴' },
};

// Transition methods
export const TRANSITIONS = {
  launch_pad: {
    name: 'Launch Pad Departure',
    animation: 'vertical_lift',
    sound: 'engine_start',
    particles: 'exhaust',
  },
  climb: {
    name: 'Gradual Climb',
    animation: 'ascending_spiral',
    sound: 'engine_hum',
    particles: 'contrails',
  },
  supersonic_climb: {
    name: 'Supersonic Climb',
    animation: 'afterburner_boost',
    sound: 'sonic_boom',
    particles: 'shockwave',
  },
  rocket_boost: {
    name: 'Rocket Boost',
    animation: 'rocket_ignition',
    sound: 'rocket_roar',
    particles: 'flame_plume',
  },
  orbital_insertion: {
    name: 'Orbital Insertion',
    animation: 'circularization_burn',
    sound: 'space_ambience',
    particles: 'thruster_puffs',
  },
  crossing_ceremony: {
    name: 'Kármán Line Crossing',
    animation: 'prestige_fanfare',
    sound: 'achievement_unlock',
    particles: 'stardust',
  },
  orbital_maneuver: {
    name: 'Orbital Maneuver',
    animation: 'orbit_transfer',
    sound: 'thruster_burst',
    particles: 'ion_trail',
  },
  transfer_orbit: {
    name: 'Transfer Orbit',
    animation: 'elliptical_path',
    sound: 'deep_space_hum',
    particles: 'solar_wind',
  },
  hohmann_transfer: {
    name: 'Hohmann Transfer',
    animation: 'hohmann_ellipse',
    sound: 'precision_burn',
    particles: 'orbital_debris',
  },
  trans_lunar_injection: {
    name: 'Trans-Lunar Injection',
    animation: 'escape_trajectory',
    sound: 'tli_burn',
    particles: 'earth_departure',
  },
  interplanetary_burn: {
    name: 'Interplanetary Burn',
    animation: 'deep_space_cruise',
    sound: 'cosmic_silence',
    particles: 'ion_drive',
  },
};

// Helper functions
export const getLayerById = (id) => LAYERS[id];
export const getLayersByType = (type) => Object.values(LAYERS).filter(l => l.type === type);
export const getPhysicalLayers = () => Object.values(LAYERS).filter(l => l.altitudeMin !== null);
export const getSystemLayers = () => Object.values(LAYERS).filter(l => l.altitudeMin === null);
export const getUnlockedLayers = (player) => {
  return Object.values(LAYERS).filter(layer => {
    if (!layer.unlockRequirement) return true;
    const req = layer.unlockRequirement;
    if (req.insightPoints && (player?.insight_points || 0) < req.insightPoints) return false;
    if (req.rank && !meetsRankRequirement(player?.prestige_rank, req.rank)) return false;
    if (req.special && !player?.special_certifications?.includes(req.special)) return false;
    return true;
  });
};

const RANK_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'BlackBox'];
const meetsRankRequirement = (playerRank, requiredRank) => {
  const playerIndex = RANK_ORDER.indexOf(playerRank || 'Bronze');
  const requiredIndex = RANK_ORDER.indexOf(requiredRank);
  return playerIndex >= requiredIndex;
};

export default LAYERS;