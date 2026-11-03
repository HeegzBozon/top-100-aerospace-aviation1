import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The God's Eye: one reading of the whole record. Every collection the platform keeps is
// counted — the registry below is the complete inventory of this app's entities — and the
// handful of numbers worth reading at a glance are gathered beside them. Counts only:
// nothing here reads a record's contents, and nothing here is measurement. The counters
// describe the platform's own housekeeping, never a Fellow.

const ALL = ["ASPICEAssessment", "AcceleratorCohort", "AcceleratorEnrollment", "AcceleratorMilestone", "Achievement", "AdminReview", "AeroFrontierSave", "AgendaItem", "AgentHandoff", "AgentLinkage", "AgentSkill", "AgentTeam", "AgileReleaseTrain", "Application", "ArtemisArticleData", "ArtemisFellow", "ArticleDiscussion", "ArticleEditRequest", "ArticleRevision", "Asset", "AuraSnapshot", "AvailabilityException", "AvailabilityRule", "BioSubmission", "Blocker", "Booking", "BugPairwiseVote", "BugRankedVote", "BugUrgencyVote", "Bulletin", "Capability", "CareerPitch", "CareerResource", "CashOutRequest", "Category", "ChannelCategory", "CheckInLog", "ChessChallenge", "ChessClubProfile", "ChessGame", "Classified", "ClientNote", "ColonyMapLayout", "ColonyNpcConfig", "ColonySave", "Competition", "ConferenceAttendance", "ConferenceContact", "ConferenceHost", "ConferenceObjective", "ConferencePlan", "ConferenceReferral", "ConferenceRoom", "ConferenceRoomNote", "ConferenceRsvp", "Connection", "Constellation", "ContactMessage", "ContentIdea", "Contribution", "Conversation", "Council", "CourseProgress", "CraftingRecipe", "Credit", "CreditTransaction", "DailyObjective", "Decision", "DemoDay", "DemoDayRSVP", "DiscoveryResponse", "DockItem", "DomainNetwork", "EmailTemplate", "Employer", "Endorsement", "EpisodeIntake", "Event", "EventComment", "Favorite", "Feature", "Feedback", "FellowBusinessCard", "FellowEdition", "FellowProfileSettings", "FestivalStamp", "Follow", "FundingRound", "GameArtifact", "GameBadge", "GameMission", "GamePlayer", "GameSession", "GeneratedNarrative", "GraphEdge", "GraphNode", "HabitLog", "HangarUpgrade", "HangoutSession", "Harness", "HeroVideo", "Honoree", "HonoreeMention", "HonoreeSprite", "HuddleSession", "HuddleUpdate", "IdeaPairwiseVote", "IdeaRankedVote", "IdempotencyRecord", "ImportJob", "InboxEntry", "InboxItemState", "Initiative", "Institution", "InterestSignal", "IntroRequest", "InvestorProfile", "IssueFeedback", "Job", "JournalEntry", "KBArticle", "KeyResult", "Keybinding", "LaunchPartyMessage", "League", "LinkedInContact", "LiveExpertCommentary", "LiveReaction", "LiveReactionPoll", "LiveReactionVote", "LiveSession", "LiveStreamComment", "LiveStreamLead", "LocalLegendNomination", "MagazineArticle", "MagazineIssue", "MagazinePage", "MeetingRequest", "MentorCheckIn", "MeritSnapshot", "Message", "Nomination", "NominationIntake", "Nominee", "NomineeCard", "NomineeEvaluation", "NomineeTag", "Notification", "Objective", "OnboardingPackage", "Opportunity", "Organization", "PageComment", "PairwiseVote", "ParkingLotItem", "PartnershipInquiry", "PatronClick", "PatronDeal", "PatronReport", "Payment", "PersonalTask", "Photo", "PlanningActivity", "PlanningStep", "PlayerInventory", "PlayerMission", "Poll", "Post", "PressKit", "ProcessAreaScore", "Profile", "ProfileActivity", "ProfileEditRequest", "ProfileEndorsement", "ProfileInquiry", "Program", "ProviderApplication", "ProviderTier", "ProviderVerification", "PublicationWaitlist", "PublishingCycle", "Quest", "RailItem", "RankedVote", "Ranking", "ReadinessScore", "Referral", "Reflection", "Release", "Resource", "Review", "RewardGrant", "RoadmapItem", "Rsvp", "SMEEvaluation", "ScheduledPost", "ScoreAudit", "ScoreConfig", "ScoreSnapshot", "Season", "SeasonalPlan", "Service", "ServiceAnalytics", "ServiceExchange", "ServicePackage", "ServiceUnit", "SessionAction", "SessionTemplate", "SignalCard", "Skill", "SocialChannel", "SolutionTrain", "Sponsor", "SponsorDecision", "SponsorSlot", "SpotlightVote", "Sprint", "Standing", "StandingsColumnConfig", "StartupProfile", "StatusUpdate", "Story", "StoryFragment", "Streak", "Stream", "StreamProgramBinding", "Subsystem", "Survey", "SurveyResponse", "TestCase", "TestSession", "Testimonial", "TipEntry", "User", "UserQuest", "UserTop100List", "Vote", "VotingContribution", "Waitlist", "Work", "WorkCredit", "WorkshopTactic"];

// The reading, by the part of the house it belongs to. Anything not named here still
// counts — it falls into the last group, so the inventory is never partial.
const DOMAINS = [
  { key: 'people', label: 'People & identity', entities: ["Nominee", "Profile", "ProfileActivity", "Follow", "Connection", "Endorsement", "ProfileEndorsement", "FellowProfileSettings", "FellowBusinessCard", "ProfileInquiry", "ProfileEditRequest", "UserTop100List", "NomineeCard", "NomineeEvaluation", "NomineeTag", "MeritSnapshot", "SMEEvaluation", "StatusUpdate", "JournalEntry", "Reflection", "PersonalTask", "HabitLog", "Streak", "BioSubmission", "LinkedInContact"] },
  { key: 'selection', label: 'Nominations & selection', entities: ["Season", "SeasonalPlan", "NominationIntake", "Nomination", "PairwiseVote", "RankedVote", "SpotlightVote", "Vote", "VotingContribution", "AuraSnapshot", "ScoreSnapshot", "ScoreAudit", "ScoreConfig", "Standing", "Ranking", "AdminReview", "League", "Competition", "LocalLegendNomination"] },
  { key: 'editorial', label: 'Editorial & publications', entities: ["MagazineIssue", "MagazinePage", "MagazineArticle", "IssueFeedback", "PageComment", "ArticleDiscussion", "ArticleRevision", "ArticleEditRequest", "FellowEdition", "KBArticle", "Post", "ScheduledPost", "Bulletin", "PublishingCycle", "PressKit", "HeroVideo", "Story", "StoryFragment", "TipEntry", "Photo", "Resource", "Release", "ContentIdea", "EpisodeIntake"] },
  { key: 'conference', label: 'Conferences & the circuit', entities: ["ConferenceRoom", "ConferenceRsvp", "ConferenceAttendance", "ConferenceRoomNote", "ConferenceContact", "ConferenceReferral", "ConferenceHost", "ConferenceObjective", "ConferencePlan", "MeetingRequest", "Referral", "Event", "EventComment", "Rsvp", "HangoutSession"] },
  { key: 'chamber', label: 'Chamber, availability & opportunity', entities: ["Job", "Service", "ServicePackage", "ServiceUnit", "ServiceExchange", "ServiceAnalytics", "Booking", "Opportunity", "Classified", "CareerResource", "CareerPitch", "StartupProfile", "InvestorProfile", "FundingRound", "Organization", "Employer", "Institution", "PartnershipInquiry", "IntroRequest", "Application", "ProviderApplication", "ProviderTier", "ProviderVerification"] },
  { key: 'signals', label: 'Signals & the reputation graph', entities: ["GraphNode", "GraphEdge", "Constellation", "SignalCard", "InterestSignal", "Contribution", "Work", "WorkCredit", "Honoree", "HonoreeMention", "HonoreeSprite", "ArtemisFellow", "Achievement", "RewardGrant", "FestivalStamp", "Quest", "UserQuest", "DailyObjective", "CourseProgress", "OnboardingPackage"] },
  { key: 'comms', label: 'Comms & community', entities: ["Conversation", "Message", "Notification", "ChannelCategory", "Feedback", "ContactMessage", "Testimonial", "Review", "Poll", "LiveSession", "LiveReaction", "LiveReactionPoll", "LiveReactionVote", "LiveStreamComment", "LiveStreamLead", "LaunchPartyMessage", "HuddleSession", "HuddleUpdate", "MentorCheckIn", "CheckInLog"] },
  { key: 'programs', label: 'Programs & growth', entities: ["AcceleratorCohort", "AcceleratorEnrollment", "AcceleratorMilestone", "Program", "DiscoveryResponse", "Survey", "SurveyResponse", "Waitlist", "PublicationWaitlist", "DemoDay", "DemoDayRSVP", "Initiative", "Objective", "KeyResult", "RoadmapItem", "Sprint", "AgileReleaseTrain", "SolutionTrain", "PlanningActivity", "PlanningStep", "Blocker", "ParkingLotItem", "AgendaItem", "Decision", "Council"] },
  { key: 'patronage', label: 'Patronage & money', entities: ["Payment", "Sponsor", "SponsorSlot", "SponsorDecision", "PatronDeal", "PatronReport", "PatronClick", "Credit", "CreditTransaction", "CashOutRequest", "IdempotencyRecord"] },
  { key: 'colony', label: 'Colony & instruments', entities: ["ColonySave", "ColonyMapLayout", "ColonyNpcConfig", "GameArtifact", "GameMission", "GamePlayer", "GameSession", "PlayerInventory", "PlayerMission", "HangarUpgrade", "CraftingRecipe", "AeroFrontierSave", "ChessGame", "ChessChallenge", "ChessClubProfile", "Keybinding", "DockItem", "RailItem", "Favorite", "InboxEntry", "InboxItemState"] },
];

const HIGHLIGHTS = [
  { key: 'members', label: 'App users', entity: 'User' },
  { key: 'nominees', label: 'Nominees on record', entity: 'Nominee' },
  { key: 'intake', label: 'Nominations received', entity: 'NominationIntake' },
  { key: 'pairwise', label: 'Pairwise ballots', entity: 'PairwiseVote' },
  { key: 'ranked', label: 'Ranked ballots', entity: 'RankedVote' },
  { key: 'spotlight', label: 'Spotlights given', entity: 'SpotlightVote' },
  { key: 'claims', label: 'Profiles claimed', entity: 'Nominee', query: { claim_status: 'approved' } },
  { key: 'messages', label: 'Messages sent', entity: 'Message' },
  { key: 'endorsements', label: 'Endorsements', entity: 'Endorsement' },
  { key: 'introductions', label: 'Introductions requested', entity: 'IntroRequest' },
  { key: 'jobs', label: 'Jobs on the board', entity: 'Job' },
  { key: 'issues', label: 'Magazine issues', entity: 'MagazineIssue' },
  { key: 'pages', label: 'Magazine pages', entity: 'MagazinePage' },
  { key: 'notes', label: 'Reader notes & corrections', entity: 'IssueFeedback' },
  { key: 'rsvps', label: 'Conference RSVPs', entity: 'ConferenceRsvp' },
  { key: 'signals', label: 'Signal cards', entity: 'SignalCard' },
];

const chunk = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

// The pass is a few hundred counters, so a reading is kept for a few minutes: a second
// visit to the surface is instant, and Re-read asks for a fresh one.
const CACHE_MS = 5 * 60 * 1000;
let cache = null;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (!body?.fresh && cache && Date.now() - cache.at < CACHE_MS) {
      return Response.json({ ...cache.payload, cached: true });
    }

    const db = base44.asServiceRole.entities;

    // Users cannot be counted through count(), so the register is read whole.
    const readUsers = async () => {
      try {
        const list = await db.User.list();
        return Array.isArray(list) ? list.length : (list?.items?.length ?? null);
      } catch {
        return null;
      }
    };

    const countOne = async (name, query) => {
      try {
        if (name === 'User' && !query) return await readUsers();
        return await db[name].count(query);
      } catch {
        return null;
      }
    };

    // Every collection, counted in small batches so the worker never opens more than a
    // handful of connections at once. A batch is held to six: the counter throttles when
    // it is asked for more at a time, and a throttled count reads as a missing one.
    const counts = {};
    const missed = [];
    const sweep = async (names) => {
      for (const batch of chunk(names, 6)) {
        const results = await Promise.allSettled(batch.map((name) => countOne(name)));
        results.forEach((res, i) => {
          const value = res.status === 'fulfilled' ? res.value : null;
          counts[batch[i]] = value;
          if (value === null) missed.push(batch[i]);
        });
      }
    };

    await sweep(ALL);

    // Anything the counter refused is asked for once more, one at a time, before a null
    // is allowed to stand for it — a missing collection would otherwise read as empty.
    if (missed.length) {
      for (const name of missed) {
        await new Promise((r) => setTimeout(r, 40));
        counts[name] = await countOne(name);
      }
    }

    const highlights = [];
    for (const batch of chunk(HIGHLIGHTS, 6)) {
      const results = await Promise.allSettled(batch.map((h) => countOne(h.entity, h.query)));
      results.forEach((res, i) => {
        highlights.push({
          key: batch[i].key,
          label: batch[i].label,
          value: res.status === 'fulfilled' ? res.value : null,
        });
      });
    }

    // Money is the one thing worth a sum rather than a count.
    let collectedCents = null;
    try {
      const agg = await db.Payment.aggregate({ query: { status: 'succeeded' }, sum: ['amount_cents'] });
      collectedCents = agg?.rows?.[0]?.sum_amount_cents ?? 0;
    } catch {
      collectedCents = null;
    }

    const assigned = new Set(DOMAINS.flatMap((d) => d.entities));
    const domains = DOMAINS.map((d) => ({
      key: d.key,
      label: d.label,
      entities: d.entities.map((name) => ({ name, count: counts[name] ?? null })),
    }));
    const rest = ALL.filter((name) => !assigned.has(name));
    if (rest.length) {
      domains.push({
        key: 'other',
        label: 'Elsewhere in the record',
        entities: rest.map((name) => ({ name, count: counts[name] ?? null })),
      });
    }

    const total = Object.values(counts).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);

    const payload = {
      generated_at: new Date().toISOString(),
      collections: ALL.length,
      total,
      collectedCents,
      highlights,
      domains,
    };
    cache = { at: Date.now(), payload };
    return Response.json(payload);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}