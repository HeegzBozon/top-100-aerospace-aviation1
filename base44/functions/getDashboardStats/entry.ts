import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = await req.json().catch(() => ({}));
    const seasonId = payload.seasonId;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch data in parallel with smaller batch sizes
    let recentUsers = [];
    let recentVotes = [];
    let totalNominees = [];

    try {
      recentUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    } catch (e) { console.error('User fetch error:', e.message); }

    try {
      if (seasonId && seasonId !== 'all') {
        recentVotes = await base44.asServiceRole.entities.PairwiseVote.filter({ season_id: seasonId }, '-created_date', 5000);
      } else {
        recentVotes = await base44.asServiceRole.entities.PairwiseVote.list('-created_date', 5000);
      }
    } catch (e) { console.error('Vote fetch error:', e.message); }

    try {
      if (seasonId && seasonId !== 'all') {
        totalNominees = await base44.asServiceRole.entities.Nominee.filter({ season_id: seasonId }, '-created_date', 5000);
      } else {
        totalNominees = await base44.asServiceRole.entities.Nominee.list('-created_date', 5000);
      }
    } catch (e) { console.error('Nominee fetch error:', e.message); }

    const totalUsers = recentUsers.length;
    const usersToday = recentUsers.filter(u => new Date(u.created_date) >= today).length;
    const usersYesterday = recentUsers.filter(u => { const d = new Date(u.created_date); return d >= yesterday && d < today; }).length;
    const userTrend = usersYesterday > 0 ? ((usersToday - usersYesterday) / usersYesterday) * 100 : 0;

    const votesToday = recentVotes.filter(v => new Date(v.created_date) >= today).length;
    const votesYesterday = recentVotes.filter(v => { const d = new Date(v.created_date); return d >= yesterday && d < today; }).length;
    const votesLast7 = recentVotes.filter(v => new Date(v.created_date) >= sevenDaysAgo);
    const dailyTrend = votesYesterday > 0 ? ((votesToday - votesYesterday) / votesYesterday) * 100 : 0;

    const todayVoters = new Set(recentVotes.filter(v => new Date(v.created_date) >= today).map(v => v.voter_email));
    const yesterdayVoters = new Set(recentVotes.filter(v => { const d = new Date(v.created_date); return d >= yesterday && d < today; }).map(v => v.voter_email));
    const dauTrend = yesterdayVoters.size > 0 ? ((todayVoters.size - yesterdayVoters.size) / yesterdayVoters.size) * 100 : 0;

    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyData[d.toISOString().split('T')[0]] = { votes: 0, users: 0 };
    }
    votesLast7.forEach(v => { const k = new Date(v.created_date).toISOString().split('T')[0]; if (dailyData[k]) dailyData[k].votes++; });
    recentUsers.forEach(u => { const k = new Date(u.created_date).toISOString().split('T')[0]; if (dailyData[k]) dailyData[k].users++; });

    const nominationsThisWeek = totalNominees.filter(n => new Date(n.created_date) >= sevenDaysAgo).length;
    const nominationsToday = totalNominees.filter(n => new Date(n.created_date) >= today).length;

    return new Response(JSON.stringify({
      success: true,
      data: {
        votesToday,
        votesYesterday,
        votesLast7Days: votesLast7.length,
        dailyAverage: Math.round(votesLast7.length / 7),
        dailyTrend,
        dauToday: todayVoters.size,
        dauYesterday: yesterdayVoters.size,
        dauTrend,
        usersToday,
        usersYesterday,
        userTrend,
        totalUsers,
        totalNominees: totalNominees.length,
        nominationsThisWeek,
        nominationsToday,
        dailyVotes: Object.entries(dailyData).map(([date, d]) => ({ date, votes: d.votes })),
        dailyNewUsers: Object.entries(dailyData).map(([date, d]) => ({ date, users: d.users })),
        hourlyVotingPattern: [],
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});