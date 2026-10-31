import { dayLabel } from './newsstandConfig';

// The newsletter, held as the record it is.
//
// Forty-one editions of "Insights and Spotlights", written by the founder and mailed
// weekly since February 2022. The archive is fixed: an edition is not edited after it
// goes out, so the series lives here as one ordered record rather than as forty-one
// separate posts — the same reason a bound volume stays bound.
//
// THE NUMBERING. Only the latest three editions carried "Issue #nn" in their own titles,
// which made the numbers look as though they disagreed with the dates. They do not: the
// series has been numbered all along and runs unbroken, newest first, from Issue 41 on
// 22 September 2026 back to Issue 1 on 8 February 2022. So the number is derived from
// position in the archive here, never typed by hand, and every edition is presented with
// the issue number its date gives it.
//
// Editions are held in date order, newest first. Nothing here is ordered, featured or
// weighted by anything but the day it was published.
export const NEWSLETTER = {
  name: 'Insights and Spotlights',
  title: 'TOP 100 Aerospace & Aviation — Insights and Spotlights',
  author: 'Matthew Higa',
  author_role: 'Founder | TOP 100 Aerospace & Aviation',
  page: 'https://www.linkedin.com/newsletters/6896445484261629952/',
  cadence: 'Weekly',
};

// The edition's own date, set at midday local rather than at midnight UTC, so the day
// printed on the board is the day it was mailed in every timezone the house reads in.
const EDITIONS = [
  {
    date: '2026-09-22T12:00:00',
    title: 'Nominations Closed. What Happens Next.',
    url: 'https://www.linkedin.com/pulse/nominations-closed-what-happens-next-matthew-higa-mpwze/',
    summary:
      '2026 nominations closed; voting and selection run into December, with the list going live New Year\u2019s Eve.',
  },
  {
    date: '2026-09-15T12:00:00',
    title: 'Last Call',
    url: 'https://www.linkedin.com/pulse/edition-40-last-call-matthew-higa-g7rrc/',
    summary:
      'Final nominations reminder, the selection timeline, and notes on fundraising and a planned product.',
  },
  {
    date: '2026-09-01T12:00:00',
    title: '2026 Nominations Closing Soon + Other Updates and Announcements',
    url: 'https://www.linkedin.com/pulse/2026-nominations-closing-soon-other-updates-matthew-higa-2clmc/',
    summary:
      'The deadline extended to 22 September, the selection method explained, and updates on funding and future plans.',
  },
  {
    date: '2026-05-06T12:00:00',
    title: 'Monthly Signal Report: May 2026',
    url: 'https://www.linkedin.com/pulse/monthly-signal-report-may-2026-matthew-higa-pvxuc/',
    summary:
      'An early-2026 sector review: commercial disruption, defense orders, Artemis II, and Season 4 nominations.',
  },
  {
    date: '2026-04-01T12:00:00',
    title: 'TOP 100 Grand Opening Day 2026 — Season 4',
    url: 'https://www.linkedin.com/pulse/top-100-grand-opening-day-2026-season-4-matthew-higa-0xaze/',
    summary:
      'Season 4 opens with parallel Women and Men directories, a new Angels index, and the season schedule.',
  },
  {
    date: '2026-01-01T12:00:00',
    title: 'Bingo Bango Bongo, whoop! Here It is',
    url: 'https://www.linkedin.com/pulse/bingo-bango-bongo-whoop-here-matthew-higa-0y9ae/',
    summary: 'A year-end note of gratitude for the 2025 season.',
  },
  {
    date: '2025-12-24T12:00:00',
    title: 'And so with that, the 2025 season comes to an end',
    url: 'https://www.linkedin.com/pulse/so-2025-season-comes-end-matthew-higa-ext5e/',
    summary:
      'The closing note for 2025, with results to be finalized for a January 1 announcement.',
  },
  {
    date: '2025-12-20T12:00:00',
    title: 'Day 8: 11,000+ Decisions: A Rose, Bud, and Thorn on the Voting Process',
    url: 'https://www.linkedin.com/pulse/day-8-11000-decisions-rose-bud-thorn-voting-process-matthew-higa-fwo1e/',
    summary: 'A retrospective on crossing 11,000 pairwise voting decisions.',
  },
  {
    date: '2025-12-19T12:00:00',
    title: 'Day 7: For The Record',
    url: 'https://www.linkedin.com/pulse/day-7-record-matthew-higa-vmx9e/',
    summary: 'Season 3 framed as a move from a live process to a fixed record.',
  },
  {
    date: '2025-12-18T12:00:00',
    title: 'Day 6: Connecting the Dots From Recognition to Opportunity',
    url: 'https://www.linkedin.com/pulse/day-6-connecting-dots-from-recognition-opportunity-matthew-higa-y3kpe/',
    summary:
      'Recognition leading to opportunity, previewing a talent exchange for Season 4.',
  },
  {
    date: '2025-12-17T12:00:00',
    title: 'Day 5: Setting the Future Standard',
    url: 'https://www.linkedin.com/pulse/day-5-setting-future-standard-matthew-higa-ghwre/',
    summary: 'What excellence should require beyond technical skill or pedigree.',
  },
  {
    date: '2025-12-16T12:00:00',
    title: 'Day 4: Citizenship in Community, Nation, and World',
    url: 'https://www.linkedin.com/pulse/day-4-citizenship-community-nation-world-matthew-higa-oqq1e/',
    summary: 'The mission, vision and values behind the project.',
  },
  {
    date: '2025-12-15T12:00:00',
    title: 'Day 3: The Invisible Architects',
    url: 'https://www.linkedin.com/pulse/day-3-invisible-architects-matthew-higa-tg3we/',
    summary:
      'A tribute to overlooked structural leadership, set alongside the case for women in aerospace.',
  },
  {
    date: '2025-12-14T12:00:00',
    title: 'Day 2: Built to Last',
    url: 'https://www.linkedin.com/pulse/day-2-built-last-matthew-higa-xemre/',
    summary:
      'A tribute to consistency and reliability in aviation, and to a record of contribution that holds.',
  },
  {
    date: '2025-12-13T12:00:00',
    title: 'Day 1: Impact, Integrity, and Influence',
    url: 'https://www.linkedin.com/pulse/day-1-impact-integrity-influence-matthew-higa-rwoqe/',
    summary:
      'Why credibility matters, and how the rebuilt 2025 voting system worked.',
  },
  {
    date: '2025-12-12T12:00:00',
    title: 'TOP 100 Women in Aerospace & Aviation Season 3: The Final Act',
    url: 'https://www.linkedin.com/pulse/top-100-women-aerospace-aviation-season-3-final-act-matthew-higa-opt7e/',
    summary: 'The launch of the Season 3 final voting sprint, with daily spotlights.',
  },
  {
    date: '2025-08-27T12:00:00',
    title: 'App Update: Fixes, Flow, and the Future',
    url: 'https://www.linkedin.com/pulse/app-update-fixes-flow-future-matthew-higa-jgtqc/',
    summary:
      'A new version of the app, fixing glitches, streamlining voting and extending the window.',
  },
  {
    date: '2025-08-21T12:00:00',
    title: 'Update & Roadmap',
    url: 'https://www.linkedin.com/pulse/update-roadmap-matthew-higa-ugwvc/',
    summary: 'A road-trip update on app turnout, the deadline extension, and the roadmap.',
  },
  {
    date: '2025-08-04T12:00:00',
    title: 'UPDATE: From the Road Back to the Runway',
    url: 'https://www.linkedin.com/pulse/update-breakthrough-matthew-higa-pc52c/',
    summary:
      'A return after travel, announcing nominee peer-ranked pairwise voting.',
  },
  {
    date: '2025-05-09T12:00:00',
    title: 'TOP 100: Sprint Update & Season 3 Backlog Reveal',
    url: 'https://www.linkedin.com/pulse/top-100-sprint-update-season-3-backlog-reveal-matthew-higa-jf1pc/',
    summary:
      'A sprint review tracing the project from an alumni experiment to TOP 100 Women.',
  },
  {
    date: '2025-03-19T12:00:00',
    title: 'From Nominations to Selection: The Next Phase of the TOP 100 Begins',
    url: 'https://www.linkedin.com/pulse/from-nominations-selection-next-phase-top-100-begins-matthew-higa-ckgwc/',
    summary:
      'Nominations closed; selection, verification and honoree notification explained.',
  },
  {
    date: '2025-03-05T12:00:00',
    title: 'Extending the Deadline: More Time to Nominate!',
    url: 'https://www.linkedin.com/pulse/extending-deadline-more-time-nominate-matthew-higa-yc2vc/',
    summary:
      'The deadline extended to 18 March 2025, plus fundraising goals and event feedback.',
  },
  {
    date: '2025-02-21T12:00:00',
    title: 'A Quick Shoutout',
    url: 'https://www.linkedin.com/pulse/quick-shoutout-matthew-higa-a04zc/',
    summary: 'A note of thanks, with 2025 nominations still open.',
  },
  {
    date: '2025-02-06T12:00:00',
    title: 'The DEI Rollback & Its Impact on Women in Aerospace & Aviation',
    url: 'https://www.linkedin.com/pulse/dei-rollback-its-impact-women-aerospace-aviation-matthew-higa-8ismc/',
    summary:
      'The impact of federal DEI changes on programs, scholarships and hiring transparency.',
  },
  {
    date: '2025-02-03T12:00:00',
    title: 'Midpoint Update: TOP 100 Women in Aerospace & Aviation — Season 3',
    url: 'https://www.linkedin.com/pulse/midpoint-update-top-100-women-aerospace-aviation-season-higa-nqcac/',
    summary: 'Midway through nominations, with a call for further nominations.',
  },
  {
    date: '2025-01-14T12:00:00',
    title: 'CES 2025 Scouting Report',
    url: 'https://www.linkedin.com/pulse/ces-2025-scouting-report-matthew-higa-gmugc/',
    summary: 'A condensed CES 2025 report on AI, cloud and aerospace.',
  },
  {
    date: '2025-01-07T12:00:00',
    title: 'First Round of Nominations Processed for the TOP 100 Women in Aerospace & Aviation 2025',
    url: 'https://www.linkedin.com/pulse/update-first-round-nominations-processed-top-100-women-matthew-higa-jyrzc/',
    summary:
      'The first-round nominee locations and industries, plus LinkedIn notes from nominees.',
  },
  {
    date: '2024-12-04T12:00:00',
    title: 'Nominations Are Now Open for the TOP 100 Women in Aerospace & Aviation 2025',
    url: 'https://www.linkedin.com/pulse/nominations-now-open-pineapple-empires-top-100-women-aerospace-higa-5b6hc/',
    summary: 'Season 3 opens, with the nomination process set out.',
  },
  {
    date: '2024-12-02T12:00:00',
    title: 'Breaking Hands Breaking Glass',
    url: 'https://www.linkedin.com/pulse/breaking-hands-glass-matthew-higa-qiclf/',
    summary:
      'A personal reflection on obstacles, impostor syndrome, and returning to the community.',
  },
  {
    date: '2024-06-19T12:00:00',
    title: 'Hello From The Other Side',
    url: 'https://www.linkedin.com/pulse/hello-from-other-side-matthew-higa-3esac/',
    summary:
      'A return after eight months of silence, recounting a rough year and renewed activity.',
  },
  {
    date: '2023-10-31T12:00:00',
    title: 'A Smoke Signal From The Void',
    url: 'https://www.linkedin.com/pulse/smoke-signal-from-void-matthew-higa-xsksf/',
    summary: 'Breaking silence after personal emergencies, and looking to 2024.',
  },
  {
    date: '2023-07-12T12:00:00',
    title: 'Open Nominations for the TOP 100 Professionals in Aviation & Aerospace 2023',
    url: 'https://www.linkedin.com/pulse/open-nominations-pineapple-empires-top-100-aviation-aerospace-higa/',
    summary: '2023 nominations opened as a community-driven, transparent process.',
  },
  {
    date: '2023-01-01T12:00:00',
    title: 'Congratulations to the TOP 100 Aerospace & Aviation Professionals to Follow 2022',
    url: 'https://www.linkedin.com/pulse/congratulations-top-100-aerospace-aviation-follow-linkedin-matt-higa/',
    summary: 'The 2022 overall list announced.',
  },
  {
    date: '2022-12-19T12:00:00',
    title: 'TOP 10 Most Liked Posts 2022',
    url: 'https://www.linkedin.com/pulse/top-10-aerospace-aviation-professionals-follow-linkedin-matt-higa/',
    summary: 'The most-liked posts of 2022, read together.',
  },
  {
    date: '2022-11-03T12:00:00',
    title: 'How Aerospace & Aviation Professionals Use LinkedIn to Thrive',
    url: 'https://www.linkedin.com/pulse/heres-how-top-aerospace-aviation-professionals-use-linkedin-matt-higa/',
    summary: '2022 nominations opened, with notes and testimonials.',
  },
  {
    date: '2022-10-03T12:00:00',
    title: 'TOP 100 Men in Aerospace & Aviation to Follow 2022',
    url: 'https://www.linkedin.com/pulse/top-100-men-aerospace-aviation-follow-linkedin-2022-matt-higa/',
    summary: 'The 2022 Men list, read by average post engagement.',
  },
  {
    date: '2022-06-20T12:00:00',
    title: 'Top Men in Aerospace and Aviation to Follow 2022',
    url: 'https://www.linkedin.com/pulse/top-men-aerospace-aviation-follow-linkedin-2022-matt-higa/',
    summary: 'Nominations opened for Top Men 2022.',
  },
  {
    date: '2022-05-31T12:00:00',
    title: 'TOP 100 Women in Aerospace & Aviation to Follow 2022',
    url: 'https://www.linkedin.com/pulse/top-100-women-aerospace-aviation-follow-linkedin-2022-matt-higa/',
    summary: 'The 2022 Women list, read by average post engagement.',
  },
  {
    date: '2022-04-01T12:00:00',
    title: 'Top Women in Aerospace and Aviation to Follow 2022',
    url: 'https://www.linkedin.com/pulse/top-women-aerospace-aviation-follow-linkedin-2022-matt-higa/',
    summary: 'Nominations opened for Top Women 2022.',
  },
  {
    date: '2022-03-07T12:00:00',
    title: 'What I\u2019ve Learned: The Top 100 Professionals to Follow',
    url: 'https://www.linkedin.com/pulse/what-ive-learned-top-100-aerospace-aviation-follow-linkedin-matt-higa/',
    summary: 'A data breakdown of the first Top 100.',
  },
  {
    date: '2022-02-08T12:00:00',
    title: 'How To Be One Of The Top 100 Aerospace and Aviation to Follow',
    url: 'https://www.linkedin.com/pulse/how-one-top-100-aerospace-aviation-follow-linkedin-matt-higa/',
    summary: 'How to be nominated, and how the numbering worked.',
  },
];

// Newest first, numbered from the foot of the archive: Issue 41 is the most recent,
// Issue 1 the first. Derived, so the two can never drift apart.
export const NEWSLETTER_EDITIONS = EDITIONS.map((edition, index) => ({
  ...edition,
  issue: EDITIONS.length - index,
}));

export const NEWSLETTER_COUNT = NEWSLETTER_EDITIONS.length;

// A paper off the board. The edition is printed where it stands — its summary opens under
// the headline — and the link takes the reader out to the edition as it was mailed.
export const newsletterNotes = () =>
  NEWSLETTER_EDITIONS.map((edition) => ({
    key: `newsletter-${edition.issue}`,
    rack: 'newsletter',
    number: edition.issue,
    kicker: 'The newsletter',
    title: edition.title,
    meta: [NEWSLETTER.author, dayLabel(edition.date)].filter(Boolean).join(' · '),
    teaser: edition.summary,
    body: edition.summary,
    html: false,
    link: edition.url,
    expandable: true,
  }));