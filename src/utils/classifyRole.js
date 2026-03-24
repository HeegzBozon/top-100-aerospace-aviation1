/**
 * Classify a military aircraft by typecode or model string.
 * Returns one of: Fighter, Bomber, Transport, Tanker, AWACS, Recon, Helicopter, Drone
 * or null for unknown.
 */
export function classifyRole(typecode = '') {
  const t = (typecode || '').toUpperCase();
  if (!t) return null;

  // Fighters
  if (/^F[-\s]?1[56789]|^F[-\s]?22|^F[-\s]?35|^F[-\s]?16|^F[-\s]?18|TYPHOON|RAFALE|GRIPEN|MIRAGE|MIG[-\s]?2[19]|MIG[-\s]?3[12]|SU[-\s]?2[47]|SU[-\s]?3[057]|J[-\s]?20|J[-\s]?10|JF[-\s]?17|HAWK|HORNET|SUPER\s*HORNET/.test(t)) return 'Fighter';

  // Bombers
  if (/^B[-\s]?[12279]|TU[-\s]?9[05]|TU[-\s]?160|XIAN\s*H[-\s]?6|LANCER|SPIRIT|STRATOFORTRESS|BLACKJACK/.test(t)) return 'Bomber';

  // Tankers
  if (/^KC[-\s]?|TANKER|TRISTAR|VOYAGER|IL[-\s]?78|A330\s*MRTT|A310\s*MRTT|707|DC[-\s]?8/.test(t) && !/AWACS/.test(t)) return 'Tanker';

  // AWACS / AEW&C
  if (/^E[-\s]?[23]|AWACS|SENTRY|WEDGETAIL|PHALCON|HAWKEYE|E[-\s]?767|A[-\s]?50|IL[-\s]?76\s*AEW|CAEW/.test(t)) return 'AWACS';

  // Recon / ISR
  if (/^U[-\s]?2|^SR[-\s]?71|^RC[-\s]?|^EP[-\s]?|SENTINEL|GLOBAL\s*HAWK|RIVET\s*JOINT|JSTARS|NIMROD\s*MRA|POSEIDON|ORION|CROWN\s*JEWEL|AIRSEVEN/.test(t)) return 'Recon';

  // Drones / UCAV
  if (/PREDATOR|REAPER|MQ[-\s]?[19]|MQ[-\s]?4|RQ[-\s]?4|RQ[-\s]?170|DRONE|UAV|UCAV|HERON|WING\s*LOONG|CH[-\s]?4|BAYRAKTAR/.test(t)) return 'Drone';

  // Helicopters
  if (/HELICOP|CHINOOK|BLACKHAWK|APACHE|SEA\s*HAWK|LYNX|MERLIN|COUGAR|PUMA|NH[-\s]?90|MH[-\s]?60|UH[-\s]?60|CH[-\s]?47|AH[-\s]?64|AS[-\s]?332|EC[-\s]?725|MI[-\s]?8|MI[-\s]?17|MI[-\s]?24|MI[-\s]?26|KA[-\s]?52/.test(t)) return 'Helicopter';

  // Transports (broad catch — after all specifics)
  if (/^C[-\s]?[15][307]|^C[-\s]?130|^C[-\s]?17|GALAXY|HERCULES|GLOBEMASTER|ATLAS|A400|IL[-\s]?76|AN[-\s]?[127][02468]|BELUGA|TRANSPORT|CASA|CN[-\s]?235|C[-\s]?295|Y[-\s]?20/.test(t)) return 'Transport';

  return null;
}
