// THE FUNNEL LEDGER — the house's journeys, drawn from the code rather than from intent.
//
// Every row here was read out of the repository: the door is a route or a mounted panel, the
// record is the entity the step writes, the event is the name passed to the platform's
// analytics, and the nurture is the function or workflow that follows up. Where a step has no
// instrument, the row says so. This file is the audit and nothing in it is computed from a
// Fellow's data; the live counts beside it are read by getFunnelEvidence.

export const AUDIT_READ_ON = "2026-11-05";

export const AUDIT_METHOD =
  "Read from the repository: every route in App.jsx, every analytics call, every entity write and every GoHighLevel hand-off. Stages without an instrument are recorded as having none rather than assumed to work.";

const R = "recorded";
const P = "partial";
const M = "missing";
const U = "unverified";

export const FUNNELS = [
  {
    id: "nomination",
    name: "Nomination",
    house: "Selection Committee",
    gist: "A reader puts a name forward. The house's only route to a new candidate.",
    doors: ["/selection-committee", "the nominate popovers on the hub", "the nominee sheet"],
    records: ["SurveyResponse", "NominationIntake", "LocalLegendNomination"],
    stages: [
      { label: "Hub opened", mark: "nomination_form_viewed", status: R, note: "Fires when the hub is on the glass, preview included and labelled." },
      { label: "First character typed", mark: "nomination_form_started", status: R, note: "Once per visit, not once per keystroke." },
      { label: "Each stage advanced", mark: "nomination_stage_advanced", status: R, note: "About you, then Women, Men, Angels, Local Legends, Review." },
      { label: "The stage left on", mark: "nomination_stage_abandoned", status: R, note: "Fired on the way out and on a tab closing." },
      { label: "Refused by validation", mark: "nomination_submit_rejected", status: R, note: "Names the field the hub held the page for." },
      { label: "Filed", mark: "SurveyResponse row", status: R, note: "Counted on this desk and on the nomination panel." },
    ],
    nurture: [
      { label: "Admin told a filing arrived", mechanism: "notifyAdminNomination · Notify Admin on New Nomination", status: "live" },
      { label: "Nominator told it landed", mechanism: "nothing sends to the nominator", status: "missing" },
      { label: "Nominators handed to the CRM", mechanism: "exportOutreachList, run by hand", status: "manual" },
    ],
    evidence: ["submissions", "recent", "people", "legends"],
    gap: "The best-instrumented journey in the house, and the only one that never writes back to the person who did the work.",
  },
  {
    id: "dispatch",
    name: "Dispatch",
    house: "The Masthead",
    gist: "A reader hands over an address for the newsletter.",
    doors: ["/subscribe", "the foot of both viral volumes", "below every public record"],
    records: ["NewsletterSignup"],
    stages: [
      { label: "Invitation seen", mark: "newsletter_invite_viewed", status: R, note: "One per entry point, so the volume and the record page can be told apart." },
      { label: "Reached for it", mark: "newsletter_invite_clicked", status: R, note: "" },
      { label: "First character typed", mark: "newsletter_form_started", status: R, note: "" },
      { label: "Address refused", mark: "newsletter_submit_rejected", status: R, note: "Empty or malformed, rejected at the source." },
      { label: "Accepted", mark: "NewsletterSignup row", status: R, note: "One row per address per entry point." },
    ],
    nurture: [
      { label: "Welcome and every issue", mechanism: "GoHighLevel workflow behind the subscriber tag", status: "live" },
      { label: "Segmentation", mechanism: "createGhlSmartLists", status: "live" },
      { label: "Leaving the list", mechanism: "the Emails tab resubscribe request", status: "live" },
    ],
    evidence: ["dispatchTotal", "dispatchRecent"],
    gap: "The journey is complete on this side. Whether the mail actually goes is settled in GoHighLevel, which this app cannot read.",
  },
  {
    id: "local-legends",
    name: "Local Legends",
    house: "The Chamber",
    gist: "A town's own people put forward a local business worth knowing.",
    doors: ["/local-legends", "/local-legends/apply"],
    records: ["LocalLegendNomination"],
    stages: [
      { label: "Page read", mark: "nothing", status: M, note: "No event, so the traffic to the invitation cannot be seen." },
      { label: "Form begun", mark: "nothing", status: M, note: "" },
      { label: "Filed", mark: "LocalLegendNomination row", status: R, note: "Carries survey_id when it came through the nomination hub, so the two doors can be counted apart." },
      { label: "Reviewed", mark: "status field", status: P, note: "An admin sets the status by hand; nothing records when it changed." },
    ],
    nurture: [
      { label: "Handed to the CRM", mechanism: "syncLocalLegendToGhl, called by the form", status: "live" },
      { label: "Reviewed by the desk", mechanism: "LocalLegendsManager, by hand", status: "manual" },
      { label: "Nominator told it landed", mechanism: "nothing", status: "missing" },
    ],
    evidence: ["legendsTotal", "legendsApplyOnly"],
    gap: "Reads, starts and drop-offs are invisible; only the filing is counted.",
  },
  {
    id: "discovery",
    name: "Discovery",
    house: "Identity Desk",
    gist: "A visitor answers the orientation questionnaire, and the answers set their route.",
    doors: ["/discovery", "/DiscoveryQuestionnaire", "/onboarding"],
    records: ["DiscoveryResponse"],
    stages: [
      { label: "Questionnaire opened", mark: "nothing", status: M, note: "" },
      { label: "Sections walked", mark: "section_completion field", status: P, note: "Written with the record at the end, so it cannot report a reader who left halfway." },
      { label: "Filed", mark: "DiscoveryResponse row", status: R, note: "" },
      { label: "Handed to the CRM", mark: "syncDiscoveryToGhl", status: R, note: "" },
    ],
    nurture: [
      { label: "Handed to the CRM", mechanism: "syncDiscoveryToGhl, called on review", status: "live" },
      { label: "Answer followed up", mechanism: "nothing addressed to the reader", status: "missing" },
    ],
    evidence: ["discoveryTotal", "discoveryRecent", "discoveryStatus"],
    gap: "The one journey whose whole purpose is routing has no idea how many readers abandon it.",
  },
  {
    id: "claim",
    name: "Profile claim",
    house: "The Registry",
    gist: "A person named on the roster takes ownership of their own record.",
    doors: ["the claim panel on a public record", "/ClaimProfile"],
    records: ["Nominee.claim_status", "Nominee.claim_method", "Nominee.claimed_by_user_id"],
    stages: [
      { label: "Panel seen", mark: "nothing", status: M, note: "The banner is mounted on the record but never counted." },
      { label: "Identity verified", mark: "claim_method", status: P, note: "Email match or LinkedIn match is stored; the attempt itself is not an event." },
      { label: "Held for review", mark: "claim_status = pending", status: P, note: "A state, not a step, so the queue depth is readable but its history is not." },
      { label: "Approved", mark: "claim_status = approved", status: R, note: "" },
      { label: "Refused", mark: "claim_status = rejected", status: P, note: "Stored, and told to nobody." },
    ],
    nurture: [
      { label: "Approved claimant welcomed", mechanism: "Claim Approved Welcome workflow", status: "live" },
      { label: "Queue worked", mechanism: "ClaimsReviewManager, by hand", status: "manual" },
      { label: "Refused or held claimant told", mechanism: "claimNomineeProfile sends no mail", status: "missing" },
    ],
    evidence: ["claimUnclaimed", "claimPending", "claimApproved"],
    gap: "The only journey where a refusal is silent: a person is left waiting on a decision the house already made.",
  },
  {
    id: "introductions",
    name: "Introductions",
    house: "Availability Layer",
    gist: "A visitor asks to reach a Fellow for work or for a deal.",
    doors: ["/classifieds", "the availability module on a record"],
    records: ["ProfileInquiry", "IntroRequest"],
    stages: [
      { label: "Board or module read", mark: "nothing", status: M, note: "" },
      { label: "Enquiry filed", mark: "ProfileInquiry row", status: R, note: "mode says whether it was work or a deal." },
      { label: "Introduction asked for", mark: "IntroRequest row", status: R, note: "" },
      { label: "Fellow opened the desk", mark: "FellowProfileSettings.inquiry_last_seen_at", status: P, note: "Says they looked, not what they answered." },
      { label: "Replied", mark: "status field", status: P, note: "" },
    ],
    nurture: [
      { label: "Fellow told an enquiry arrived", mechanism: "submitProfileInquiry sends no mail", status: "missing" },
      { label: "Reply sent", mechanism: "by hand, from the desk", status: "manual" },
    ],
    evidence: ["inquiryTotal", "inquiryStatus", "introTotal"],
    gap: "The busiest commercial surface in the house, and the enquiry reaches the Fellow only if they happen to open their desk.",
  },
  {
    id: "conferences",
    name: "Conference circuit",
    house: "Mission Rooms",
    gist: "A Fellow picks a conference, works it from the inside, and comes home with people.",
    doors: ["/conferences/discover", "/conferences/attend/:roomId", "/conferences/:id"],
    records: ["ConferenceRsvp", "ConferenceAttendance", "ConferenceReferral"],
    stages: [
      { label: "Circuit browsed", mark: "nothing", status: M, note: "" },
      { label: "Journey opened", mark: "nothing", status: M, note: "" },
      { label: "Seat declared", mark: "ConferenceRsvp row", status: R, note: "" },
      { label: "Attendance verified", mark: "ConferenceAttendance row", status: R, note: "" },
      { label: "Referral made", mark: "ConferenceReferral row", status: R, note: "Two-sided consent is tracked in the record." },
    ],
    nurture: [
      { label: "Referral messages", mechanism: "sendReferralMessage · respondToReferral", status: "live" },
      { label: "Follow-up after the room closes", mechanism: "nothing scheduled", status: "missing" },
    ],
    evidence: ["rsvpTotal", "attendanceTotal", "referralTotal"],
    gap: "The work inside the room is recorded well; the days after it are not followed up at all.",
  },
  {
    id: "patronage",
    name: "Sponsor of Record",
    house: "The Sponsorship",
    gist: "A sponsor asks for attribution against a room or an issue.",
    doors: ["/mediakit", "the inquiry form on the rate card"],
    records: ["PatronDeal", "PatronReport"],
    stages: [
      { label: "Rate card read", mark: "nothing", status: M, note: "" },
      { label: "Inquiry filed", mark: "PatronDeal row, by patronIntake", status: R, note: "" },
      { label: "Gate review", mark: "gate state on the deal", status: P, note: "" },
      { label: "Placement", mark: "placement on the deal", status: P, note: "" },
      { label: "Report issued", mark: "patronReports workflow", status: R, note: "" },
    ],
    nurture: [
      { label: "Inquiry acknowledged", mechanism: "patronIntake sends mail", status: "live" },
      { label: "Cadence", mechanism: "Patron Cadence workflow", status: "live" },
      { label: "Reports due", mechanism: "Patron Reports Due workflow", status: "live" },
      { label: "Slot release", mechanism: "Patron Slot Release workflow", status: "live" },
    ],
    evidence: ["patronDeals", "patronStatus"],
    gap: "The best-nurtured funnel in the house, and the one whose front door is counted least.",
  },
  {
    id: "ground-control",
    name: "Ground Control",
    house: "The Gate",
    gist: "A hand-raiser buys a seat in the room.",
    doors: ["/ground-control", "the starter checkout"],
    records: ["Payment", "User entitlement"],
    stages: [
      { label: "Hand raised", mark: "GoHighLevel contact plus trigger tag", status: R, note: "captureGroundControlLead; the row lives in the CRM, not here." },
      { label: "Checkout opened", mark: "nothing", status: M, note: "" },
      { label: "Paid", mark: "Payment row, succeeded", status: R, note: "Written by the Stripe webhook." },
      { label: "Entitled", mark: "checkEntitlements", status: P, note: "Computed from payment, not recorded as a step." },
    ],
    nurture: [
      { label: "Loom and the follow-up sequence", mechanism: "GoHighLevel workflow behind the tag", status: "live" },
      { label: "Receipt", mechanism: "the payment provider", status: "unverified" },
    ],
    evidence: ["payments", "paymentProducts"],
    gap: "Leads and settlements are both counted; the gap between them, where the money is actually lost, is not.",
  },
  {
    id: "providers",
    name: "Provider applications",
    house: "The Chamber",
    gist: "Someone asks to be listed as available to the network.",
    doors: ["the Chamber practice pages", "the provider application form"],
    records: ["ProviderApplication", "ProviderTier", "Service"],
    stages: [
      { label: "Application opened", mark: "nothing", status: M, note: "" },
      { label: "Filed", mark: "ProviderApplication row", status: R, note: "" },
      { label: "Approved", mark: "approveProvider · Weekly Provider Tier Update", status: P, note: "" },
      { label: "Listed", mark: "Service row", status: R, note: "" },
    ],
    nurture: [
      { label: "Approved provider told", mechanism: "by hand", status: "manual" },
      { label: "Applicant told it was received", mechanism: "nothing", status: "missing" },
    ],
    evidence: ["providerTotal", "providerStatus"],
    gap: "An applicant hears nothing until a person remembers to write.",
  },
  {
    id: "jobs",
    name: "Jobs and applications",
    house: "The Chamber",
    gist: "A posting on the board, and the person who answers it.",
    doors: ["/classifieds", "the featured job checkout"],
    records: ["Job", "Application"],
    stages: [
      { label: "Job posted", mark: "Job row", status: R, note: "" },
      { label: "Posting read", mark: "nothing", status: M, note: "" },
      { label: "Applied", mark: "Application row", status: M, note: "No surface and no function writes this entity." },
      { label: "Employer reviewed", mark: "nothing", status: M, note: "" },
    ],
    nurture: [
      { label: "Anything", mechanism: "nothing found for this journey", status: "missing" },
    ],
    evidence: ["jobs", "applications"],
    gap: "The destination exists and has never been written to: a table with no door.",
  },
  {
    id: "ballot",
    name: "Ballot",
    house: "The Weighing",
    gist: "A Fellow weighs names, and the weighing is sealed.",
    doors: ["/vote", "the ballot gate on the hub"],
    records: ["PairwiseVote", "RankedVote"],
    stages: [
      { label: "Ballot link opened", mark: "ballot_link_open", status: P, note: "The only event in the journey, and it carries the source only." },
      { label: "Weighing begun", mark: "nothing", status: M, note: "" },
      { label: "Vote cast", mark: "PairwiseVote / RankedVote rows", status: R, note: "Written per comparison, with test ballots flagged." },
      { label: "Sealed", mark: "Ballot Notice campaign", status: R, note: "One send per campaign, deduplicated by address." },
    ],
    nurture: [
      { label: "Notice to the cohort", mechanism: "Ballot Notice workflow · sendBallotNotice", status: "live" },
      { label: "Reminder to those who did not weigh", mechanism: "nothing", status: "missing" },
    ],
    evidence: ["pairwise", "ranked"],
    gap: "Votes are counted precisely and the ladder that produces them is one rung deep, so a quiet cohort cannot be told from an unreachable one.",
  },
  {
    id: "meetups",
    name: "Meetups and RSVP",
    house: "The Colony",
    gist: "An invitation to a room, and the answer to it.",
    doors: ["/meetups", "/meetups/:eventId", "/rsvp"],
    records: ["Rsvp"],
    stages: [
      { label: "Invitation read", mark: "nothing", status: M, note: "" },
      { label: "Answered", mark: "Rsvp row", status: R, note: "" },
      { label: "Attended", mark: "nothing", status: M, note: "" },
      { label: "Followed up", mark: "nothing", status: M, note: "" },
    ],
    nurture: [
      { label: "Anything after the answer", mechanism: "nothing found", status: "missing" },
    ],
    evidence: ["rsvps"],
    gap: "An answer is stored and never acted on.",
  },
  {
    id: "waitlist",
    name: "Publication waitlist",
    house: "The Newsstand",
    gist: "A reader asks to be told when something opens.",
    doors: ["the publication waitlist surfaces", "/travel-advisory"],
    records: ["PublicationWaitlist"],
    stages: [
      { label: "Asked", mark: "PublicationWaitlist row", status: R, note: "" },
      { label: "Told when it opened", mark: "notifyWaitlist, invoked by hand", status: P, note: "" },
    ],
    nurture: [
      { label: "Opening notice", mechanism: "notifyWaitlist, run by hand", status: "manual" },
    ],
    evidence: ["waitlistTotal"],
    gap: "A promise to write, with no schedule behind it.",
  },
];

export const FINDINGS = [
  {
    id: "F1",
    funnel: "all",
    severity: "critical",
    confidence: "confirmed",
    title: "Two of fourteen journeys record their own stages",
    statement:
      "Stage-level events exist for Nomination and Dispatch. The ballot records its door and nothing after it. The other eleven journeys write a record at the end and no evidence at all about how anyone reached it.",
    evidence: "19 analytics calls across src: 7 in the nomination flow, 6 in the dispatch flow, 1 at the ballot door, the rest on viral posts and the concierge.",
    remedy: "Instrument the four highest-intent journeys next: Local Legends, Discovery, claim, ballot. Door, first action, and the step left on.",
  },
  {
    id: "F2",
    funnel: "jobs",
    severity: "critical",
    confidence: "confirmed",
    title: "The jobs journey has a destination with no door",
    statement:
      "No page and no function writes an Application record. The entity, its fields and its review surface all exist; nothing creates a row, so no posting has ever received one.",
    evidence: "No Application.create or bulkCreate call anywhere in src or base44/functions.",
    remedy: "Decide the journey: build the apply action on the posting, or retire the entity and the employer review surface with it.",
  },
  {
    id: "F3",
    funnel: "introductions",
    severity: "high",
    confidence: "confirmed",
    title: "An enquiry reaches the Fellow only if they open their desk",
    statement:
      "submitProfileInquiry stores the enquiry and sends no mail. The only trace on the Fellow's side is inquiry_last_seen_at, which records that they looked, never that they were told.",
    evidence: "submitProfileInquiry contains no SendEmail call; FellowProfileSettings carries inquiry_last_seen_at for the desk.",
    remedy: "Send one notice per enquiry to the Fellow, batched daily so a busy week does not become a mail storm.",
  },
  {
    id: "F4",
    funnel: "nomination",
    severity: "high",
    confidence: "confirmed",
    title: "The nominator is never told their filing landed",
    statement:
      "The filing notifies the admins and stops. The person who spent the visit writing it receives nothing, at the exact moment the house is asking them to do it again next cycle.",
    evidence: "notifyAdminNomination sends to the desk; the nomination components and fileNomination contain no send at all.",
    remedy: "One acknowledgement mail at filing, carrying what was filed and the invitation to file again.",
  },
  {
    id: "F5",
    funnel: "ballot",
    severity: "high",
    confidence: "confirmed",
    title: "A quiet cohort cannot be told from an unreachable one",
    statement:
      "The ballot records that a link was opened and that votes exist. It does not record a weighing begun, a weighing abandoned, or a cohort member who never arrived, so turnout is measured only among people who already turned out.",
    evidence: "One call site: ballot_link_open in Vote.jsx. PairwiseVote, RankedVote and AnchorVote are written by separate functions.",
    remedy: "Add began and left events to the weighing surface, carrying cohort and progress only.",
  },
  {
    id: "F6",
    funnel: "claim",
    severity: "high",
    confidence: "confirmed",
    title: "A refused claim is silent",
    statement:
      "Approved claimants receive the welcome workflow. Held and refused claimants receive nothing, so a person who tried to take ownership of their own record waits on a decision that has already been made.",
    evidence: "Claim Approved Welcome workflow exists; claimNomineeProfile sends no mail and claim_status rejected has no follow-up.",
    remedy: "One message per decision, including refusal, with the route to the desk if it was wrong.",
  },
  {
    id: "F7",
    funnel: "patronage",
    severity: "high",
    confidence: "confirmed",
    title: "Three doors open onto one sponsorship funnel",
    statement:
      "PartnershipInquiryModal exists twice, once under sponsors and once under the epics copy, and ChamberPractice writes the same entity from a third form. Each behaves slightly differently and none records that it was used.",
    evidence: "PartnershipInquiry.create in src/components/sponsors, src/components/epics/08-sponsor-commercial/sponsors, and src/pages/ChamberPractice.",
    remedy: "Keep one form and one write path, and add the inquiry event to it.",
  },
  {
    id: "F8",
    funnel: "introductions",
    severity: "medium",
    confidence: "confirmed",
    title: "A five-point score is rendered against a person",
    statement:
      "The capital exchange stores requester_rating and provider_rating and ExchangeManager prints them out of five. That is a score on a person's availability, which the house's own rule forbids on this layer, whatever the entity was built for.",
    evidence: "ServiceExchange.requester_rating and provider_rating; ExchangeManager renders the value with /5 in two copies.",
    remedy: "Decide whether the exchange belongs on this platform at all; if it does, remove the score from the surface and from the entity.",
  },
  {
    id: "F9",
    funnel: "all",
    severity: "medium",
    confidence: "confirmed",
    title: "God's Eye counts collections, not journeys",
    statement:
      "The one surface that reads everything has no field for an owner, a stage or a follow-up. It can say how many records exist in 200-odd types and cannot say where a person stopped.",
    evidence: "getGodsEye returns per-collection counts grouped by domain; no funnel, stage or owner dimension.",
    remedy: "Keep God's Eye as the count and let this desk carry the journey, as it now does.",
  },
  {
    id: "F10",
    funnel: "conferences",
    severity: "medium",
    confidence: "likely",
    title: "Nothing follows up once the room closes",
    statement:
      "Attendance is verified and referrals are carried by their own messages, but no schedule reaches the Fellow in the week after a conference, when the follow-up actually decides the outcome.",
    evidence: "Referral messaging exists; the workflow list contains no post-conference sequence.",
    remedy: "One scheduled follow-up per verified attendance, carrying the people they met.",
  },
  {
    id: "F11",
    funnel: "patronage",
    severity: "medium",
    confidence: "confirmed",
    title: "A meeting request notifies nobody",
    statement:
      "bookPartnershipMeeting stores the request and sends no mail, so a partner asking for time waits on someone noticing.",
    evidence: "bookPartnershipMeeting contains no SendEmail call.",
    remedy: "Notify the desk on creation, and the requester on acceptance.",
  },
  {
    id: "F12",
    funnel: "local-legends",
    severity: "medium",
    confidence: "confirmed",
    title: "Two journeys are counted at the finish line only",
    statement:
      "Local Legends and Discovery record the record and nothing before it. Both have an invitation, a form and a reason to leave, and none of the three is counted.",
    evidence: "No analytics call in LocalLegendsApply, DiscoveryQuestionnaire or their components.",
    remedy: "Same three instruments as the nomination hub: seen, started, left on which section.",
  },
  {
    id: "F13",
    funnel: "all",
    severity: "medium",
    confidence: "unknown",
    title: "What the CRM does behind the tags cannot be read here",
    statement:
      "Welcome sequences, smart lists and the Loom delivery are triggered by tags written from this app. Whether the mail goes, and to whom, is settled inside GoHighLevel, so no delivery or opening rate can be reported on any desk.",
    evidence: "subscribeNewsletter and captureGroundControlLead write contacts and tags; no read of workflow outcomes.",
    remedy: "Accept the boundary on the desk, or read campaign outcomes back through the CRM API into one summary.",
  },
  {
    id: "F14",
    funnel: "all",
    severity: "low",
    confidence: "confirmed",
    title: "Events can be named here but not totalled",
    statement:
      "Every stage event lives on the platform's analytics, not in a collection, so this desk can list a ladder and cannot count it. Event numbers are read on the Analytics page, in a second tab.",
    evidence: "base44.analytics.track is fire-and-forget; no entity stores an event row.",
    remedy: "Leave as is, or mirror the six ladder events into one small collection if in-app attribution is worth the write.",
  },
];

export const ROADMAP = [
  {
    rank: 1,
    title: "Acknowledge the nomination",
    funnel: "nomination",
    why: "The house asks for a favour and currently answers it with silence. One mail at filing, carrying what was filed.",
    severity: "high",
    effort: "small",
    closes: ["F4"],
  },
  {
    rank: 2,
    title: "Tell a Fellow an enquiry arrived",
    funnel: "introductions",
    why: "The commercial surface depends on it. One daily digest per Fellow, not one mail per enquiry.",
    severity: "high",
    effort: "small",
    closes: ["F3"],
  },
  {
    rank: 3,
    title: "Instrument the four silent journeys",
    funnel: "all",
    why: "Local Legends, Discovery, claim and ballot: door, first action, step left on. This is the difference between a funnel and a total.",
    severity: "critical",
    effort: "medium",
    closes: ["F1", "F5", "F12"],
  },
  {
    rank: 4,
    title: "Decide the jobs journey",
    funnel: "jobs",
    why: "Either build the apply action on the posting or retire the entity and its review surface. A destination with no door is a promise the house cannot keep.",
    severity: "critical",
    effort: "medium",
    closes: ["F2"],
  },
  {
    rank: 5,
    title: "One sponsorship form",
    funnel: "patronage",
    why: "Three copies of one form drift apart, and none is counted. Keep one and record it.",
    severity: "high",
    effort: "small",
    closes: ["F7"],
  },
  {
    rank: 6,
    title: "Answer every claim decision",
    funnel: "claim",
    why: "Refusal is the only silent outcome left in the house. One message per decision, including a refusal.",
    severity: "high",
    effort: "small",
    closes: ["F6"],
  },
  {
    rank: 7,
    title: "Follow up after the room closes",
    funnel: "conferences",
    why: "The week after a conference is where the value is made, and nothing is scheduled there.",
    severity: "medium",
    effort: "medium",
    closes: ["F10"],
  },
  {
    rank: 8,
    title: "Settle the capital exchange score",
    funnel: "introductions",
    why: "A five-point score against a person must not sit on this layer. Decide the entity's home or remove the score.",
    severity: "medium",
    effort: "small",
    closes: ["F8"],
  },
  {
    rank: 9,
    title: "Notify on a meeting request",
    funnel: "patronage",
    why: "One mail on creation, one on acceptance. The request currently waits on someone noticing.",
    severity: "medium",
    effort: "small",
    closes: ["F11"],
  },
];

export const funnelById = (id) => FUNNELS.find((funnel) => funnel.id === id) || null;

export const funnelName = (id) => (id === "all" ? "Across the house" : funnelById(id)?.name || id);

export const coverageOf = (funnel) => {
  const total = funnel.stages.length;
  const recorded = funnel.stages.filter((stage) => stage.status === "recorded").length;
  return { recorded, total, ratio: total ? recorded / total : 0 };
};

export const findingsFor = (id) =>
  FINDINGS.filter((finding) => (id === "all" ? true : finding.funnel === id || finding.funnel === "all"));

export const severityCounts = () =>
  FINDINGS.reduce((acc, finding) => ({ ...acc, [finding.severity]: (acc[finding.severity] || 0) + 1 }), {});

export const gapsFor = (id) => findingsFor(id).filter((finding) => finding.severity === "critical" || finding.severity === "high");