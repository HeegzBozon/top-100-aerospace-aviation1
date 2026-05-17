export const CAMPAIGNS = {
  'C-01': {
    id: 'C-01',
    title: 'The Right Stuff',
    archetype: 'Test Pilot',
    primaryStats: ['VELOCITY', 'RESILIENCE', 'MANEUVER'],
    setting: 'Edwards Air Force Base, Mojave Desert',
    tagline: 'Speed versus survival. The machine versus the human. The record versus the pilot.',
    badge: '✈',
    available: true,
    baseStats: {
      altitude: 10, velocity: 12, payload: 10, range: 9, resilience: 11, maneuver: 10,
    },
    scenes: [
      {
        id: 'prologue',
        type: 'choice',
        title: 'First Flight',
        beat: 'Prologue',
        aiGenerated: false,
        text: `The Mojave desert at 5 AM smells like jet fuel and possibility. You've been assigned to the X-program—the elite test pilot cadre at Edwards. Before your first official flight brief, the chief test pilot, Col. Hargrove, asks you one question over bad coffee in the ready room:\n\n"How'd you end up here?"`,
        choices: [
          {
            key: 'engineering',
            label: 'Engineering scholarship. I wanted to understand the machine before I flew it.',
            statDeltas: { payload: 2, velocity: -1, altitude: 1 },
          },
          {
            key: 'military',
            label: 'Military academy. I flew because I had to. Now I can\'t stop.',
            statDeltas: { resilience: 2, maneuver: 1, range: -1 },
          },
        ],
      },
      {
        id: 'scene1',
        type: 'choice',
        title: 'The Brief',
        beat: 'Scene 1',
        aiGenerated: false,
        text: `The X-29A. Forward-swept wings, digital fly-by-wire, aerodynamically unstable by design. The flight envelope card is 47 pages. Briefing is at 0600.\n\nYour co-pilot Mara Grayson has flown it twelve times. "The sim doesn't prepare you for the feedback rate," she says. "You have to feel it." There are four hours before you strap in.`,
        choices: [
          {
            key: 'manual',
            label: 'Study the manual. Every system. Every limit. You fly the numbers.',
            statDeltas: { payload: 2, maneuver: -1, velocity: 1 },
          },
          {
            key: 'instincts',
            label: 'Spend the time in the cockpit mock-up. Hands on everything. You fly by feel.',
            statDeltas: { maneuver: 2, velocity: 1, payload: -1 },
          },
        ],
      },
      {
        id: 'scene2',
        type: 'choice',
        title: 'The Mach Run',
        beat: 'Scene 2',
        aiGenerated: true,
        fallbackText: `The altimeter reads 52,000 feet. The Mojave is a brown postage stamp below you. You've been climbing through Mach 1.4 when the engine temperature gauge creeps into the yellow. Not red. Yellow.\n\nThe flight test engineer in your ear: "We're showing elevated EGT. Your call, pilot."\n\nPush through to Mach 1.8 and hold the data point, or pull back and live to fly tomorrow.`,
        choices: [
          {
            key: 'throttle',
            label: 'Full throttle. The data point is the mission. Yellow isn\'t red.',
            statDeltas: { velocity: 2, resilience: 1, payload: -1 },
          },
          {
            key: 'pullback',
            label: 'Controlled reduction. Live to fly the next envelope expansion.',
            statDeltas: { payload: 2, altitude: 1, velocity: -1 },
          },
        ],
      },
      {
        id: 'signal_log',
        type: 'signal_log',
        title: 'Save Your Progress',
        beat: 'Scene 3',
      },
      {
        id: 'scene4',
        type: 'choice',
        title: 'The Mentor',
        beat: 'Scene 4',
        aiGenerated: true,
        fallbackText: `Three days after the Mach run, retired test pilot Dr. Jacqueline Cochran—who once held the women's airspeed record and broke it four times—shows up unannounced at the ready room. She's consulting for the program.\n\nShe sits across from you with coffee. "You made the right call up there," she says. "Or the wrong one. Depends what you're optimizing for." She slides a notebook across the table. It's full of margins-notes from thirty years of envelope expansions.\n\n"Read it, or don't. Your call."`,
        choices: [
          {
            key: 'wisdom',
            label: 'Take the notebook. Read every page that night.',
            statDeltas: { payload: 2, range: 2, altitude: 1 },
          },
          {
            key: 'challenge',
            label: '"I appreciate it. But I need to build my own instincts." Push the notebook back.',
            statDeltas: { maneuver: 2, velocity: 1, resilience: 1 },
          },
        ],
      },
      {
        id: 'boss',
        type: 'boss',
        title: 'The Flame-Out',
        beat: 'Boss Moment',
        rollStats: ['resilience', 'maneuver'],
        setup: `At 73,000 feet, the left engine dies.\n\nNo warning. One second the sky is yours. The next, you're in a 90-degree dive at Mach 2.3 with one engine, a compromised hydraulics system, and a ground that's getting very specific.\n\nThe book says eject. Your stats say otherwise.`,
        rollLabel: 'Roll RESILIENCE + MANEUVER',
        fallbackOutcomes: {
          critical_success: 'You execute a textbook single-engine recovery. The aircraft responds. You bring it home at 200 knots on one engine. The flight test community will talk about this for years.',
          success: 'You fight the aircraft for 47 seconds. It cooperates, mostly. You land hard, gear intact, adrenaline at maximum. Damaged aircraft, intact pilot. That\'s a win.',
          fail: 'You almost save it. The aircraft departs controlled flight at 8,000 feet. You eject cleanly. The X-29A becomes a footnote in the accident database. You become a cautionary tale—the kind that gets told so people learn.',
          critical_fail: 'The hydraulics cascade. You have 3 seconds to decide. You eject at low altitude, barely enough for the chute to deploy. The aircraft is gone. You\'re alive. Some days that\'s the whole mission.',
        },
        aiGenerated: true,
      },
      {
        id: 'epilogue',
        type: 'epilogue',
        title: 'The Record',
        beat: 'Epilogue',
        text: `The debrief lasts six hours. The data cards take three days to analyze. At the end of it, Col. Hargrove puts a single note in your personnel file.\n\nYou don't see what it says.\n\nBut you know what kind of pilot you are now. You've always known. The envelope just confirmed it.`,
      },
    ],
  },

  'C-02': {
    id: 'C-02',
    title: 'Mission Critical',
    archetype: 'Flight Director',
    primaryStats: ['ALTITUDE', 'RANGE', 'PAYLOAD'],
    setting: 'Mission Control, Johnson Space Center',
    tagline: 'The call that saves the crew versus the call that follows the protocol.',
    badge: '🚀',
    available: false,
    baseStats: {
      altitude: 12, velocity: 9, payload: 12, range: 11, resilience: 10, maneuver: 9,
    },
    scenes: [],
  },
};