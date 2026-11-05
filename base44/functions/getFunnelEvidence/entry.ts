import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// THE LIVE SIDE OF THE FUNNEL AUDIT.
//
// The audit itself is read from the code (see funnelRegistry.js). What this returns is the
// only part that moves: how much each journey actually holds. Counts and groupings only, one
// record type at a time, admin only. Nothing here reads a Fellow's measurement, and a
// collection that cannot be read is reported as such rather than counted as zero.

const NOMINATION_SURVEY_ID = '69f45633daacf496cacd8666';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const unreadable = [];

    const count = async (key, entity, query = {}) => {
      try {
        const value = await db[entity].count(query);
        return typeof value === 'number' ? value : null;
      } catch {
        unreadable.push(key);
        return null;
      }
    };

    // A grouping, or null when the collection could not be read. Null and empty are kept
    // apart on purpose: "no rows" is a finding, "not readable" is a hole in the audit.
    const breakdown = async (key, entity, field, query = {}) => {
      try {
        const res = await db[entity].aggregate({ query, groupBy: field });
        return Array.isArray(res?.rows) ? res.rows : [];
      } catch {
        unreadable.push(key);
        return null;
      }
    };

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const jobs = {
      submissions: () => count('submissions', 'SurveyResponse', { survey_id: NOMINATION_SURVEY_ID }),
      recent: () => count('recent', 'SurveyResponse', { survey_id: NOMINATION_SURVEY_ID, created_date: { $gte: since } }),
      people: () => count('people', 'NominationIntake', { survey_id: NOMINATION_SURVEY_ID }),
      legendsAll: () => count('legendsAll', 'LocalLegendNomination'),
      legendsHub: () => count('legendsHub', 'LocalLegendNomination', { survey_id: NOMINATION_SURVEY_ID }),
      dispatchTotal: () => count('dispatchTotal', 'NewsletterSignup'),
      dispatchRecent: () => count('dispatchRecent', 'NewsletterSignup', { created_date: { $gte: since } }),
      discoveryTotal: () => count('discoveryTotal', 'DiscoveryResponse'),
      discoveryRecent: () => count('discoveryRecent', 'DiscoveryResponse', { created_date: { $gte: since } }),
      discoveryRows: () => breakdown('discoveryRows', 'DiscoveryResponse', 'status'),
      claimRows: () => breakdown('claimRows', 'Nominee', 'claim_status'),
      inquiryTotal: () => count('inquiryTotal', 'ProfileInquiry'),
      introTotal: () => count('introTotal', 'IntroRequest'),
      inquiryRows: () => breakdown('inquiryRows', 'ProfileInquiry', 'status'),
      rsvpTotal: () => count('rsvpTotal', 'ConferenceRsvp'),
      attendanceTotal: () => count('attendanceTotal', 'ConferenceAttendance'),
      referralTotal: () => count('referralTotal', 'ConferenceReferral'),
      patronTotal: () => count('patronTotal', 'PatronDeal'),
      patronRows: () => breakdown('patronRows', 'PatronDeal', 'status'),
      payments: () => count('payments', 'Payment'),
      paymentRows: () => breakdown('paymentRows', 'Payment', 'product'),
      providerTotal: () => count('providerTotal', 'ProviderApplication'),
      providerRows: () => breakdown('providerRows', 'ProviderApplication', 'status'),
      jobs: () => count('jobs', 'Job'),
      applications: () => count('applications', 'Application'),
      pairwise: () => count('pairwise', 'PairwiseVote'),
      ranked: () => count('ranked', 'RankedVote'),
      rsvps: () => count('rsvps', 'Rsvp'),
      waitlistTotal: () => count('waitlistTotal', 'PublicationWaitlist'),
    };

    // Six at a time: a Worker holds six connections, and one heavy read must not starve the rest.
    const keys = Object.keys(jobs);
    const values = [];
    for (let i = 0; i < keys.length; i += 6) {
      const slice = keys.slice(i, i + 6);
      values.push(...(await Promise.all(slice.map((key) => jobs[key]()))));
    }
    const r = Object.fromEntries(keys.map((key, index) => [key, values[index]]));

    const bucket = (rows, field, value) =>
      rows ? rows.find((row) => row?.[field] === value)?.count || 0 : null;

    const spread = (rows, field) =>
      rows === null
        ? 'not read'
        : rows.length === 0
          ? 'nothing held'
          : rows
              .slice(0, 5)
              .map((row) => `${row?.[field] || 'unset'} ${row?.count || 0}`)
              .join(' · ');

    const metric = (key, label, value, note) => ({
      key,
      label,
      value: value === null ? 'not read' : value,
      note: note || '',
    });

    const funnels = {
      nomination: [
        metric('submissions', 'Submissions filed', r.submissions),
        metric('recent', 'Filed in 30 days', r.recent),
        metric('people', 'People put forward', r.people),
        metric('legends', 'Local Legends filed', r.legendsAll),
      ],
      dispatch: [
        metric('dispatchTotal', 'Addresses held', r.dispatchTotal),
        metric('dispatchRecent', 'Joined in 30 days', r.dispatchRecent),
      ],
      'local-legends': [
        metric('legendsTotal', 'Legends filed', r.legendsAll),
        metric(
          'legendsApplyOnly',
          'Through the apply page',
          r.legendsAll !== null && r.legendsHub !== null ? r.legendsAll - r.legendsHub : null,
          'The rest came through the nomination hub',
        ),
      ],
      discovery: [
        metric('discoveryTotal', 'Questionnaires filed', r.discoveryTotal),
        metric('discoveryRecent', 'Filed in 30 days', r.discoveryRecent),
        metric('discoveryStatus', 'Statuses in play', r.discoveryRows === null ? null : r.discoveryRows.length, spread(r.discoveryRows, 'status')),
      ],
      claim: [
        metric('claimUnclaimed', 'Unclaimed records', bucket(r.claimRows, 'claim_status', 'unclaimed')),
        metric('claimPending', 'Held for review', bucket(r.claimRows, 'claim_status', 'pending')),
        metric('claimApproved', 'Claimed', bucket(r.claimRows, 'claim_status', 'approved')),
      ],
      introductions: [
        metric('inquiryTotal', 'Enquiries filed', r.inquiryTotal),
        metric('introTotal', 'Introductions asked for', r.introTotal),
        metric('inquiryStatus', 'Statuses in play', r.inquiryRows === null ? null : r.inquiryRows.length, spread(r.inquiryRows, 'status')),
      ],
      conferences: [
        metric('rsvpTotal', 'Seats declared', r.rsvpTotal),
        metric('attendanceTotal', 'Attendance verified', r.attendanceTotal),
        metric('referralTotal', 'Referrals made', r.referralTotal),
      ],
      patronage: [
        metric('patronDeals', 'Deals on file', r.patronTotal),
        metric('patronStatus', 'Statuses in play', r.patronRows === null ? null : r.patronRows.length, spread(r.patronRows, 'status')),
      ],
      'ground-control': [
        metric('payments', 'Settlements on file', r.payments),
        metric('paymentProducts', 'Products settled', r.paymentRows === null ? null : r.paymentRows.length, spread(r.paymentRows, 'product')),
      ],
      providers: [
        metric('providerTotal', 'Applications filed', r.providerTotal),
        metric('providerStatus', 'Statuses in play', r.providerRows === null ? null : r.providerRows.length, spread(r.providerRows, 'status')),
      ],
      jobs: [
        metric('jobs', 'Postings on the board', r.jobs),
        metric('applications', 'Applications recorded', r.applications, 'No surface writes this record type'),
      ],
      ballot: [
        metric('pairwise', 'Comparisons cast', r.pairwise),
        metric('ranked', 'Ranked ballots cast', r.ranked),
      ],
      meetups: [metric('rsvps', 'Answers on file', r.rsvps)],
      waitlist: [metric('waitlistTotal', 'Asking to be told', r.waitlistTotal)],
    };

    return Response.json({
      generated_at: new Date().toISOString(),
      funnels,
      unreadable,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}