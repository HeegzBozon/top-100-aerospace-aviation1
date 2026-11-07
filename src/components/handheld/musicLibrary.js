// THE RECORD LIBRARY
//
// The machine's music is recorded, not synthesized. Eight masters, each one cleared
// for commercial use under Creative Commons Attribution (BY or BY-SA), held with the
// app's own files so nothing is hotlinked from a third party while a record plays.
//
// The credit travels with the record — artist, licence and the page it came from —
// and is printed wherever the record is playing. That credit is the condition of the
// licence, not a courtesy: it must not be dropped from a surface that shows the title.
//
// The audio host below is the platform's own media delivery for this app's public
// files. If a master is ever replaced, put the new file's address here and nothing
// else on the machine has to move.

const HOST = 'https://media.base44.com/files/public/68996845be6727838fdb822e';

const record = (id, title, artist, file, licence, credit) => ({
  id,
  title,
  artist,
  licence,
  credit,
  src: `${HOST}/${file}`,
});

export const LIBRARY = {
  // Lounge and warm: the arrivals side of the campus.
  downForYou: record(
    'down-for-you', 'Down For You', 'DJ Quincy Ortiz', '13ad654bc_down-for-you.mp3',
    'CC BY 3.0', 'https://www.jamendo.com/track/1355554',
  ),
  // Deep house: the working floor.
  deepHouse: record(
    'deep-house', 'deep house', 'fabtdv', '8b9a4224e_deep-house.mp3',
    'CC BY-SA 3.0', 'https://www.jamendo.com/track/788398',
  ),
  haussperling: record(
    'haussperling', '11 Haussperling', 'Hasenchat', '060e0c017_haussperling.mp3',
    'CC BY 3.0', 'https://www.jamendo.com/track/1215471',
  ),
  hotToIce: record(
    'hot-to-ice', '01 From Hot To Ice', 'Hasenchat', '7d11596e4_hot-to-ice.mp3',
    'CC BY-SA 3.0', 'https://www.jamendo.com/track/1268129',
  ),
  // Funk and drive: the media floor and the arcade.
  electroFunk: record(
    'electro-funk', 'Electro funk', 'iNDEX', 'f2f7e33fa_electro-funk.mp3',
    'CC BY-SA 3.0', 'https://www.jamendo.com/track/1447766',
  ),
  ankleInjuries: record(
    'ankle-injuries', 'Ankle Injuries', 'Vibrant', '98ada7c86_ankle-injuries.mp3',
    'CC BY-SA 3.0', 'https://www.jamendo.com/track/125261',
  ),
  // Ambient: the pavilion, and the lounge after hours.
  ambientVoyager: record(
    'ambient-voyager', 'Ambient Voyager', 'Zeropage', 'dcbd8c6b2_ambient-voyager.mp3',
    'CC BY 3.0', 'https://www.jamendo.com/track/20231',
  ),
  ambientFlight: record(
    'ambient-flight', 'Ambient Flight', 'Zeropage', '05538c370_ambient-flight.mp3',
    'CC BY 3.0', 'https://www.jamendo.com/track/20237',
  ),
};

// The console's own deck: the record that plays when no room has asked for its own.
export const HOUSE_DECK = [
  LIBRARY.deepHouse,
  LIBRARY.electroFunk,
  LIBRARY.hotToIce,
  LIBRARY.downForYou,
  LIBRARY.haussperling,
  LIBRARY.ankleInjuries,
];