// THE JOURNEY MAP — every door into the house, and who walks through it.
//
// A journey is the whole road a person travels to reach a record: the door they arrive at,
// the handoff that asks them to sign in, the surface where the work is done, and the record
// that is left behind. Only one of these roads is walked and watched today; the rest are
// mapped as suggestions, so the desk can see the shape of them before anything is built.
//
// Suggested journeys are deliberately not full scripts. They name the actor, the promise
// the road makes, and the canonical surfaces and entities that would carry it — enough to
// plan against, short of committing a build.

export const JOURNEYS = [
  {
    id: 'analyst',
    title: 'New Analyst Journey',
    status: 'mapped',
    actor: 'A visitor invited to serve',
    promise: 'From the sealed invitation to the first Crosscheck, without a wrong turn.',
    steps: [
      'The invitation gate at the ballot',
      'The handoff — sign in or create the account, returning to the ballot',
      'The mission briefing',
      'The first Crosscheck, four professionals in order',
      'The contribution recorded against the analyst',
    ],
    surfaces: ['VoteGate', '/vote', 'VoteSurface', 'VotingContribution'],
    note: 'Walked in a read-only preview. Cards, holds, notes and ballots cannot be changed.',
  },
  {
    id: 'nominator',
    title: 'Nominator Journey',
    status: 'suggested',
    actor: 'A peer who names someone',
    promise: 'A nomination filed in three stages, and a nominator who knows it landed.',
    steps: [
      'Arrival at the selection committee letter',
      'About you, then the person nominated',
      'The review stage, read back before filing',
      'Confirmation, and the ballot notice that follows',
    ],
    surfaces: ['NominationForm', 'NominationIntake', 'sendBallotNotice'],
  },
  {
    id: 'induction',
    title: 'Fellow Induction',
    status: 'suggested',
    actor: 'A nominee, named by a peer',
    promise: 'Named, invited, claimed and given a record worth sharing.',
    steps: [
      'The nomination arrives and the record is created',
      'The invitation to claim the profile',
      'The claim itself, by email or LinkedIn match',
      'The record completed — identity, verification, the Eight',
      'The first edition the Fellow appears in',
    ],
    surfaces: ['Nominee', 'claimNomineeProfile', '/profiles/:id', 'RecordWorkspace'],
  },
  {
    id: 'claim',
    title: 'Claim & Verification',
    status: 'suggested',
    actor: 'A Fellow whose record is unclaimed, or contested',
    promise: 'An instant self-claim, or a reviewed one, ending in a verified band.',
    steps: [
      'The claim banner on the unclaimed record',
      'The match — email or LinkedIn — or the fall to review',
      'The masthead reading the claim',
      'The verified band on the public record',
    ],
    surfaces: ['NomineeClaimPanel', 'ClaimsReviewManager', 'Nominee.claim_status'],
  },
  {
    id: 'record',
    title: 'Fellow Record Journey',
    status: 'suggested',
    actor: 'A Fellow signing in to their own record',
    promise: 'An empty record becomes a curated one, without a blank field anywhere.',
    steps: [
      'First sign-in and the settings initialised',
      'The identity header and verification locked in place',
      'Flightography, below the fold',
      'The Eight, curated and ordered',
      'The record shared as a card',
    ],
    surfaces: ['FellowProfileSettings', 'RecordWorkspace', 'UserTop100List'],
  },
  {
    id: 'introduction',
    title: 'Introduction Journey',
    status: 'suggested',
    actor: 'A Fellow making an introduction request',
    promise: 'Availability read, an introduction asked for, and an answer either way.',
    steps: [
      'Availability found in the expert network',
      'The introduction requested',
      'The request read and accepted or declined',
      'The exchange that follows',
    ],
    surfaces: ['Service', 'IntroRequest', 'ServiceExchange'],
  },
  {
    id: 'patron',
    title: 'Sponsor Journey',
    status: 'suggested',
    actor: 'A sponsor reading the media kit',
    promise: 'Attribution, never placement — a sponsor of record, agreed and reported.',
    steps: [
      'The media kit read at the offer',
      'The rate card and the enquiry',
      'The slot released to the sponsor',
      'The cadence and the report due',
    ],
    surfaces: ['/mediakit', 'PatronDeal', 'patronIntake', 'patronReports'],
  },
  {
    id: 'host',
    title: 'Conference Host Journey',
    status: 'suggested',
    actor: 'A host bringing a room onto the circuit',
    promise: 'Apply, publish the room, fill it, and come back with the debrief.',
    steps: [
      'The host application',
      'Approval and the room published',
      'RSVPs, targets and capture in the room',
      'Attendance verified',
      'The debrief and the follow-up',
    ],
    surfaces: ['ConferenceHostApply', 'ConferenceRoom', 'ConferenceRsvp', 'verifyConferenceAttendance'],
  },
  {
    id: 'edition',
    title: 'Edition Journey',
    status: 'suggested',
    actor: 'A reader of the edition',
    promise: 'A waitlist signup becomes a reader who returns with each issue.',
    steps: [
      'The edition or the waitlist found',
      'The signup taken, and the subscription confirmed',
      'The issue read, page by page',
      'The archive and the next cycle',
    ],
    surfaces: ['PublicationWaitlist', 'NewsletterSignup', 'MagazineReader'],
  },
];