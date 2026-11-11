// THE FIVE STREAMS — the journeys grouped by the value each one delivers, not by the team
// that happens to own a screen.
//
// A stream owns its journey end to end: the door, the record, the instrument and the answer
// that goes back to the person. That is the whole reason for the grouping. Every graded
// finding on this desk sits at a handoff between two houses, and a handoff only closes when
// one group answers for the far side of it.
//
// The train scaffolding the app already carries (AgileReleaseTrain, SolutionTrain, Feature)
// holds no records; what the house actually runs on is Sprint, Objective, KeyResult and
// Blocker. So the streams are named here rather than revived as a new tier — this file is a
// reading of who owns what, not another system to keep.

import { FINDINGS } from "./funnelRegistry";

export const STREAMS = [
  {
    id: "selection",
    name: "Selection",
    house: "Selection Committee · The Weighing",
    objective:
      "A name is put forward, answered the same day, and carried to the cohort that decides.",
    guardrail:
      "Nothing on this stream may read a running tally, a tier or a vote. The stream runs the weighing; it never reads the result back into the door.",
    deadline:
      "The ballot closes with the season. Its instrument has to land before the next window opens.",
    funnels: ["nomination", "ballot", "local-legends"],
  },
  {
    id: "identity",
    name: "Identity",
    house: "Identity Desk · The Registry",
    objective:
      "A person takes ownership of their own record and is told the decision either way.",
    guardrail:
      "Personalisation may reorder expression and may never obscure, reorder or soften verification.",
    funnels: ["discovery", "claim"],
  },
  {
    id: "availability",
    name: "Availability",
    house: "The Chamber · Availability Layer",
    objective:
      "A Fellow is asked for their time and hears about the ask before it goes cold.",
    guardrail:
      "Availability state and every transaction on this stream stay out of discovery ordering. No score is placed against a person.",
    funnels: ["introductions", "providers", "jobs"],
  },
  {
    id: "audience",
    name: "Audience",
    house: "The Masthead · The Colony · The Newsstand",
    objective:
      "A reader who arrives is handed something worth returning for, and can leave on their own terms.",
    guardrail:
      "Counts are read, never targeted. No stream is measured by a number it can raise simply by asking for it.",
    note:
      "No graded finding falls on this stream, and that is the reading: each journey here is counted at the finish line, and the answer owed after it is a promise with no schedule behind it.",
    funnels: ["dispatch", "meetups", "waitlist"],
  },
  {
    id: "commercial",
    name: "Commercial",
    house: "The Sponsorship · Mission Rooms · The Gate",
    objective:
      "A sponsor or partner who reaches for the house is answered by a person, not by a form.",
    guardrail:
      "Sponsorship attributes and confers no selection weight. Attribution is Sponsor of Record and is never read by discovery, measurement or scoring.",
    funnels: ["patronage", "conferences", "ground-control"],
  },
];

// Two readings are not a stream's work: one is a decision only the house can take, the
// other is a gate every stream has to pass wherever availability is rendered.
export const OFF_STREAM = [
  {
    id: "portfolio",
    label: "A portfolio decision, not a stream's",
    stream: "availability",
    title: "The jobs journey has a destination and no door",
    body:
      "Build the apply action on the posting, or retire the entity and its review surface with it. No stream can carry a promise the house has not decided to keep.",
    findingIds: ["F2"],
  },
  {
    id: "gate",
    label: "A gate every stream passes",
    stream: "availability",
    title: "A five-point score is rendered against a person",
    body:
      "The exchange prints a rating out of five against availability, which the availability layer forbids whatever the entity was built for. An acceptance criterion on every stream, never a story in one.",
    findingIds: ["F8"],
  },
];

const OFF_STREAM_IDS = OFF_STREAM.flatMap((item) => item.findingIds);

// The graded findings on a stream's own journeys, minus the two the house has to settle.
export function findingsOfStream(streamId) {
  const stream = STREAMS.find((entry) => entry.id === streamId);
  if (!stream) return [];
  return FINDINGS.filter(
    (finding) =>
      stream.funnels.includes(finding.funnel) && !OFF_STREAM_IDS.includes(finding.id),
  );
}

// Readings that belong to the house's instrument rather than to any one stream.
export const CROSS_CUTTING = FINDINGS.filter((finding) => finding.funnel === "all");

export const streamOfFunnel = (funnelId) =>
  STREAMS.find((stream) => stream.funnels.includes(funnelId)) || null;