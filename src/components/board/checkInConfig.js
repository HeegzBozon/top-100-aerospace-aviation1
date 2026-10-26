// The check-in model. Onboarding steps and the daily loop are both generated
// from the state of the other Board columns — never typed by hand, never a
// standing to-do list. A task appears because the record says it is owed, and it
// disappears the moment it is true.

// Onboarding — the first track. Each step reads the record itself: the panel
// clears as the Fellow works, with nothing to maintain separately.
export const ONBOARDING_STEPS = [
  {
    key: "portrait",
    title: "Portrait and headline",
    blurb: "What an introducer sees first.",
    to: "/Profile",
    done: (s) => Boolean(s.user?.avatar_url && (s.user?.headline || s.user?.industry_role)),
  },
  {
    key: "discipline",
    title: "Declare your discipline",
    blurb: "It sets your accent, your network, and your normalization.",
    to: "/Profile",
    done: (s) => Boolean(s.discipline || s.user?.industry_role),
  },
  {
    key: "eight",
    title: "Seat your Eight",
    blurb: "Eight places. Ordered, public, and yours.",
    to: "/selection-committee",
    done: (s) => (s.placed || 0) >= 8,
  },
  {
    key: "availability",
    title: "Declare availability",
    blurb: "The expert network runs on declared availability.",
    to: "/Profile?board=intros",
    done: (s) => (s.availability || 0) > 0,
  },
  {
    key: "verification",
    title: "Verify your record",
    blurb: "Verification is what an institution stands on.",
    to: "/Profile",
    done: (s) => Boolean(s.verified),
  },
  {
    key: "dispatch",
    title: "Post your first dispatch",
    blurb: "One thing worth putting on the record.",
    to: "/Profile?board=dispatch",
    done: (s) => (s.dispatches || 0) > 0,
  },
];

// The daily loop. Every generator reads the state of a column and returns the
// one next thing that column is asking of the Fellow, or nothing at all.
export const DAILY_GENERATORS = [
  (s) =>
    (s.placed || 0) < 8
      ? {
          key: "seat-eight",
          column: "season",
          title: `Seat ${8 - (s.placed || 0)} more in your Eight`,
          meta: `${s.placed || 0} of 8 placed. Position 1 reads as position 1.`,
          to: "/selection-committee",
        }
      : null,
  (s) =>
    s.phase?.key === "voting"
      ? {
          key: "cast-vote",
          column: "season",
          title: "Vote the pool",
          meta: s.phase.targetLabel ? `Voting closes ${s.phase.targetLabel}.` : "Voting is open.",
          to: "/selection-committee",
        }
      : null,
  (s) =>
    s.phase?.key === "nominations"
      ? {
          key: "enter-nomination",
          column: "season",
          title: "Enter a nomination",
          meta: s.phase.targetLabel ? `Nominations close ${s.phase.targetLabel}.` : "Nominations are open.",
          to: "/selection-committee",
        }
      : null,
  (s) =>
    (s.roomsOpen || 0) > 0 && (s.roomRsvps || 0) === 0
      ? {
          key: "rsvp-room",
          column: "development",
          title: "Declare a mission room",
          meta: `${s.roomsOpen} open at the shows this season.`,
          to: "/Profile?board=conference",
        }
      : null,
  (s) =>
    (s.dispatches || 0) === 0
      ? {
          key: "first-dispatch",
          column: "development",
          title: "Post your first dispatch",
          meta: "Put one thing you know on the record.",
          to: "/Profile?board=dispatch",
        }
      : {
          key: "note-today",
          column: "development",
          title: "Note one thing from today",
          meta: "A field note keeps the record alive.",
          to: "/Profile?board=dispatch",
        },
  (s) =>
    (s.availability || 0) === 0
      ? {
          key: "open-availability",
          column: "business",
          title: "Declare availability",
          meta: "Introductions only begin where availability is declared.",
          to: "/Profile?board=intros",
        }
      : null,
  (s) =>
    (s.pendingConnections || 0) > 0
      ? {
          key: "answer-connection",
          column: "business",
          title: `Answer ${s.pendingConnections} introduction${s.pendingConnections === 1 ? "" : "s"}`,
          meta: "Somebody has asked for you.",
          to: "/Profile",
        }
      : null,
  (s) =>
    (s.openRoles || 0) > 0
      ? {
          key: "scan-roles",
          column: "recruiting",
          title: "Scan the job board",
          meta: `${s.openRoles} role${s.openRoles === 1 ? "" : "s"} posted to the chamber.`,
          to: "/Profile?board=jobs",
        }
      : null,
  // The anchor of the daily loop: a record is worth what is current on it.
  () => ({
    key: "sync-record",
    column: "identity",
    title: "Sync your record",
    meta: "Confirm what is on your profile is current.",
    to: "/Profile",
  }),
];

const MAX_DAILY = 6;

export function buildDailyTasks(state, handledKeys = []) {
  const handled = new Set(handledKeys);
  const seen = new Set();
  return DAILY_GENERATORS.map((generate) => generate(state))
    .filter(Boolean)
    .filter((task) => (seen.has(task.key) ? false : seen.add(task.key)))
    .slice(0, MAX_DAILY)
    .map((task) => ({ ...task, handled: handled.has(task.key) }));
}

export function buildOnboarding(state) {
  return ONBOARDING_STEPS.map((step) => ({ ...step, done: step.done(state) }));
}

const pad = (value) => String(value).padStart(2, "0");

// The local calendar day. The loop is the Fellow's day, not UTC's.
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dayLabel(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// Consecutive days synced, counting back from today — or from yesterday, so a
// streak stays alive until the day is actually over.
export function streakFrom(logs, today = dayKey()) {
  const days = new Set(logs.map((log) => log.day_key).filter(Boolean));
  if (!days.size) return 0;

  const cursor = new Date();
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}