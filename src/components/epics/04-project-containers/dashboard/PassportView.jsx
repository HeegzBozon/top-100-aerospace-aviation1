import { useState, useEffect, useCallback } from 'react';
import { Nominee } from '@/entities/Nominee';
import { NomineeCard } from '@/entities/NomineeCard';
import { Season } from '@/entities/Season';
import { FestivalStamp } from '@/entities/FestivalStamp';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { awardStardust } from '@/functions/awardStardust';
import { awardFestivalStamp } from '@/functions/awardFestivalStamp';
import { useToast } from "@/components/ui/use-toast";
import {
  Award,
  ClipboardCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function PassportView({ user, setUser }) {
  const [claimedProfile, setClaimedProfile] = useState(null);
  const [festivalStamps, setFestivalStamps] = useState([]);
  const [nomineeCards, setNomineeCards] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const isSME = user?.role === 'admin' || user?.is_sme === true;

  const loadPassportData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get active season
      const seasons = await Season.list('-created_date');
      const currentSeason = seasons.find(s => s.status === 'active') || seasons[0];
      setActiveSeason(currentSeason);
      
      // Check for claimed profile
      const claimedProfiles = await Nominee.filter({ claimed_by_user_email: user.email });
      if (claimedProfiles.length > 0) {
        setClaimedProfile(claimedProfiles[0]);
      }

      if (currentSeason) {
        // Load stamps
        const stamps = await FestivalStamp.filter({ user_email: user.email, season_id: currentSeason.id });
        setFestivalStamps(stamps);

        // Load cards
        const allCards = await NomineeCard.filter({ user_email: user.email, season_id: currentSeason.id });
        const cardsToDisplay = allCards.slice(0, 12);
        setNomineeCards(cardsToDisplay);

        // Load nominees for cards
        const nomineeIds = cardsToDisplay.map(card => card.nominee_id);
        if (nomineeIds.length > 0) {
          const nomineeData = await Nominee.filter({ id: { $in: nomineeIds } });
          setNominees(nomineeData);
        } else {
          setNominees([]);
        }
      }
    } catch (error) {
      console.error('Error loading passport data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPassportData();
  }, [loadPassportData]);

  const handleCardShare = async (nominee, cardData) => {
    try {
      await awardStardust({
        user_email: user.email,
        action_type: 'nominee_share'
      });

      if (activeSeason) {
        await awardFestivalStamp({
          stamp_type: 'nominee_share',
          stamp_name: 'Card Sharer',
          description: `Shared ${nominee.name}'s digital card`,
          season_id: activeSeason.id,
          metadata: { nominee_id: nominee.id, card_number: cardData.card_number }
        });
      }

      const shareUrl = `${window.location.origin}${createPageUrl('Arena')}?nominee=${nominee.id}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Card Shared! 🎉",
        description: `Link copied to clipboard! +8 Stardust earned.`
      });
      
      loadPassportData();
    } catch (error) {
      toast({ variant: "destructive", title: "Share Failed", description: "Unable to share card." });
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--muted)]">Loading Passport...</div>;

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Nomination Review Council Link */}
      {isSME && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Link to={createPageUrl('SMEPortal')}>
            <Card className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 border-[var(--accent)]/30 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-2.5 md:p-4 flex items-center gap-2.5 md:gap-4">
                <div className="p-2 rounded-full bg-[var(--accent)]/20 shrink-0">
                  <ClipboardCheck className="w-4 h-4 md:w-6 md:h-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs md:text-base text-[var(--text)] truncate">Review Council</h3>
                  <p className="text-[10px] md:text-sm text-[var(--muted)] truncate">Review nominees</p>
                </div>
                <Award className="w-4 h-4 text-[var(--accent)] shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}
    </div>
  );
}