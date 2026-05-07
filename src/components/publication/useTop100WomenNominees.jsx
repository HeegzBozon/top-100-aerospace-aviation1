import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getStandingsData } from '@/functions/getStandingsData';

export default function useTop100WomenNominees() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCombinedResults = async () => {
      try {
        const allSeasons = await base44.entities.Season.list('-created_date', 50);
        const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
        const activeSeason = allSeasons.find(s => ['completed', 'voting_open', 'active'].includes(s.status));
        const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;

        if (!selectedSeasonId) {
          setLoading(false);
          return;
        }

        const [standingsResponse, rankedVotes] = await Promise.all([
          getStandingsData({ season: selectedSeasonId, sort: 'aura', dir: 'desc', page: 1, limit: 1000 }),
          base44.entities.RankedVote.filter({ season_id: selectedSeasonId }, '-created_date', 10000),
        ]);

        const standingsRows = standingsResponse?.data?.standings?.rows || [];
        const scoreMap = {};

        standingsRows.forEach(nominee => {
          scoreMap[nominee.nomineeId] = {
            nomineeId: nominee.nomineeId,
            bordaScore: 0,
            totalVotes: 0,
            firstChoiceVotes: 0,
          };
        });

        rankedVotes.forEach(vote => {
          if (!Array.isArray(vote.ballot)) return;
          vote.ballot.forEach((nomineeId, position) => {
            if (!scoreMap[nomineeId]) return;
            scoreMap[nomineeId].bordaScore += 100 - position;
            scoreMap[nomineeId].totalVotes += 1;
            if (position === 0) scoreMap[nomineeId].firstChoiceVotes += 1;
          });
        });

        const rcvResults = Object.values(scoreMap)
          .filter(nominee => nominee.totalVotes > 0)
          .sort((a, b) => b.bordaScore - a.bordaScore)
          .map((nominee, index) => ({ ...nominee, rcvRank: index + 1 }));

        const rcvMap = new Map(rcvResults.map(nominee => [nominee.nomineeId, nominee]));
        const maxAura = Math.max(...standingsRows.map(nominee => nominee.aura || 0), 1);
        const maxBorda = Math.max(...rcvResults.map(nominee => nominee.bordaScore || 0), 1);

        const combined = standingsRows.map((nominee, index) => {
          const rcvInfo = rcvMap.get(nominee.nomineeId) || { bordaScore: 0, rcvRank: null };
          const normalizedAura = ((nominee.aura || 0) / maxAura) * 100;
          const normalizedRcv = (rcvInfo.bordaScore / maxBorda) * 100;

          return {
            id: nominee.nomineeId,
            name: nominee.nomineeName,
            avatar_url: nominee.avatarUrl,
            title: nominee.title,
            company: nominee.company,
            country: nominee.country,
            aura_score: nominee.aura,
            elo_rating: nominee.elo_rating,
            borda_score: rcvInfo.bordaScore,
            combinedScore: (normalizedAura * 0.5) + (normalizedRcv * 0.5),
            auraRank: index + 1,
            rcvRank: rcvInfo.rcvRank,
          };
        }).sort((a, b) => b.combinedScore - a.combinedScore);

        combined.forEach((nominee, index) => { nominee.finalRank = index + 1; });

        const top100Ids = new Set(combined.slice(0, 100).map(nominee => nominee.id));
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const nomineeMap = new Map(allNominees.filter(nominee => top100Ids.has(nominee.id)).map(nominee => [nominee.id, nominee]));

        setNominees(combined.slice(0, 100).map(result => {
          const fullNominee = nomineeMap.get(result.id) || {};
          return {
            ...result,
            ...fullNominee,
            aura_score: result.aura_score,
            elo_rating: result.elo_rating,
            borda_score: result.borda_score,
            combinedScore: result.combinedScore,
            auraRank: result.auraRank,
            rcvRank: result.rcvRank,
            finalRank: result.finalRank,
            country: fullNominee.country || result.country,
            industry: fullNominee.industry || result.industry,
            avatar_url: fullNominee.avatar_url || fullNominee.photo_url || result.avatar_url,
          };
        }));
      } finally {
        setLoading(false);
      }
    };

    loadCombinedResults();
  }, []);

  return { nominees, loading };
}