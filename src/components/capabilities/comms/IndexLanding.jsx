import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { getStandingsData } from "@/functions/getStandingsData";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import EditorialMasthead from "@/components/epics/02-signal-feed/publication/EditorialMasthead";
import EditorialTableOfContents from "@/components/epics/02-signal-feed/publication/EditorialTableOfContents";
import EditorialManifesto from "@/components/epics/02-signal-feed/publication/EditorialManifesto";
import EditorialPortraits from "@/components/epics/02-signal-feed/publication/EditorialPortraits";
import EditorialLedger from "@/components/epics/02-signal-feed/publication/EditorialLedger";
import SignalReport from "@/components/epics/02-signal-feed/publication/SignalReport";
import ArchiveExport from "@/components/epics/02-signal-feed/publication/ArchiveExport";
import EditorialClosing from "@/components/epics/02-signal-feed/publication/EditorialClosing";
import EnhancedProfilePanel from "@/components/epics/02-signal-feed/publication/EnhancedProfilePanel";
import ShareableCard from "@/components/epics/02-signal-feed/publication/ShareableCard";
import CountdownLanding from "@/components/epics/02-signal-feed/publication/CountdownLanding";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function IndexLanding() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [shareNominee, setShareNominee] = useState(null);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    window.openShareCard = (nominee) => setShareNominee(nominee);
    return () => { window.openShareCard = null; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const allSeasons = await base44.entities.Season.list('-created_date', 50);
        const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
        const activeSeason = allSeasons.find(s => s.status === 'voting_open' || s.status === 'active');
        const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;
        if (!selectedSeasonId) { setLoading(false); return; }

        const { data: standingsData } = await getStandingsData({ season: selectedSeasonId, sort: 'aura', dir: 'desc', page: 1, limit: 1000 });
        const standingsRows = standingsData?.standings?.rows || [];
        const rankedVotes = await base44.entities.RankedVote.filter({ season_id: selectedSeasonId });

        const scoreMap = {};
        standingsRows.forEach(n => { scoreMap[n.nomineeId] = { nomineeId: n.nomineeId, bordaScore: 0, totalVotes: 0, firstChoiceVotes: 0 }; });
        rankedVotes.forEach(vote => {
          if (!vote.ballot || !Array.isArray(vote.ballot)) return;
          vote.ballot.forEach((nomineeId, position) => {
            if (scoreMap[nomineeId]) {
              scoreMap[nomineeId].bordaScore += 100 - position;
              scoreMap[nomineeId].totalVotes += 1;
              if (position === 0) scoreMap[nomineeId].firstChoiceVotes += 1;
            }
          });
        });

        const rcvResults = Object.values(scoreMap).filter(n => n.totalVotes > 0).sort((a, b) => b.bordaScore - a.bordaScore).map((n, idx) => ({ ...n, rcvRank: idx + 1 }));
        const rcvMap = new Map(rcvResults.map(n => [n.nomineeId, { bordaScore: n.bordaScore, rcvRank: n.rcvRank, totalRcvVotes: n.totalVotes, firstChoiceVotes: n.firstChoiceVotes }]));
        const maxAura = Math.max(...standingsRows.map(n => n.aura || 0), 1);
        const maxBorda = Math.max(...rcvResults.map(n => n.bordaScore || 0), 1);

        const combined = standingsRows.map((nominee, index) => {
          const rcvInfo = rcvMap.get(nominee.nomineeId) || { bordaScore: 0, rcvRank: null, totalRcvVotes: 0 };
          const normalizedAura = ((nominee.aura || 0) / maxAura) * 100;
          const normalizedRcv = (rcvInfo.bordaScore / maxBorda) * 100;
          return { id: nominee.nomineeId, name: nominee.nomineeName, avatar_url: nominee.avatarUrl, title: nominee.title, company: nominee.company, country: nominee.country, aura_score: nominee.aura, elo_rating: nominee.elo_rating, borda_score: rcvInfo.bordaScore, combinedScore: normalizedAura * 0.5 + normalizedRcv * 0.5, auraRank: index + 1, rcvRank: rcvInfo.rcvRank };
        });

        combined.sort((a, b) => b.combinedScore - a.combinedScore);
        combined.forEach((n, i) => { n.finalRank = i + 1; });

        const top100Ids = combined.slice(0, 100).map(n => n.id);
        const fullNominees = await base44.entities.Nominee.filter({ id: { $in: top100Ids } });
        const nomineeMap = new Map(fullNominees.map(n => [n.id, n]));

        setNominees(combined.slice(0, 100).map(result => {
          const full = nomineeMap.get(result.id) || {};
          return { ...result, ...full, aura_score: result.aura_score, elo_rating: result.elo_rating, borda_score: result.borda_score, combinedScore: result.combinedScore, auraRank: result.auraRank, rcvRank: result.rcvRank, finalRank: result.finalRank, country: full.country || result.country, industry: full.industry || result.industry, avatar_url: full.avatar_url || full.photo_url || result.avatar_url };
        }));
      } catch (err) {
        console.error('IndexLanding load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: brandColors.cream }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: brandColors.goldPrestige }} />
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: brandColors.ink }}>Loading Index</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ background: brandColors.cream }}>
      {showCountdown && <CountdownLanding onReveal={() => setShowCountdown(false)} />}

      <EditorialMasthead />
      <section id="contents"><EditorialTableOfContents /></section>
      <section id="manifesto"><EditorialManifesto /></section>
      <section id="portraits"><EditorialPortraits nominees={nominees} onSelectNominee={setSelectedNominee} /></section>
      <section id="honorees"><EditorialLedger nominees={nominees} onSelectNominee={setSelectedNominee} /></section>
      <section id="signal-report" className="py-12 px-4 md:px-12" style={{ background: 'white' }}>
        <p className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: brandColors.skyBlue }}>Intelligence</p>
        <h2 className="text-2xl md:text-4xl font-light mb-8" style={{ fontFamily: 'Georgia, serif', color: brandColors.ink }}>The Signal Report</h2>
        <SignalReport nominees={nominees} />
      </section>
      <section id="archive" className="py-12 px-4 md:px-12" style={{ background: brandColors.cream }}>
        <p className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: brandColors.skyBlue }}>Continuity</p>
        <h2 className="text-2xl md:text-4xl font-light mb-8" style={{ fontFamily: 'Georgia, serif', color: brandColors.ink }}>Archive & Export</h2>
        <ArchiveExport nominees={nominees} />
      </section>
      <EditorialClosing />

      {selectedNominee && (
        <EnhancedProfilePanel
          nominee={selectedNominee}
          rank={selectedNominee.finalRank || nominees.findIndex(n => n.id === selectedNominee.id) + 1}
          onClose={() => setSelectedNominee(null)}
          onShare={(nominee) => setShareNominee(nominee)}
        />
      )}
      {shareNominee && (
        <ShareableCard
          nominee={shareNominee}
          rank={nominees.findIndex(n => n.id === shareNominee.id) + 1}
          onClose={() => setShareNominee(null)}
        />
      )}
    </div>
  );
}