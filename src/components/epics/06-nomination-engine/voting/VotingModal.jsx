import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PairwiseVoting } from '@/components/epics/06-nomination-engine/voting';
import { RankedChoiceVoting } from '@/components/epics/06-nomination-engine/voting';

export default function VotingModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('perception');
  const [activeSeason, setActiveSeason] = useState(null);
  const [votingNominees, setVotingNominees] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const seasons = await base44.entities.Season.list('-created_date', 50);
      
      // Find the active season - prefer voting_open, then nominations_open
      const currentSeason = seasons.find(s => s.status === 'voting_open') 
        || seasons.find(s => s.status === 'nominations_open')
        || seasons[0];
      setActiveSeason(currentSeason);

      if (currentSeason) {
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const activeNominees = allNominees.filter(n => n.season_id === currentSeason.id);
        console.log('Season:', currentSeason.name, 'Nominees found:', activeNominees.length);
        setVotingNominees(activeNominees);
      }
    } catch (error) {
      console.error('Failed to load voting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Cast Your Vote</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Loading nominees...</p>
          </div>
        ) : activeSeason?.status === 'nominations_open' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Voting Not Yet Open</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're currently in the nomination period for {activeSeason?.name || 'this season'}. 
              Voting will open once nominations close. Check back soon!
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Voting starts: {activeSeason?.voting_start ? new Date(activeSeason.voting_start).toLocaleDateString() : 'TBD'}
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-4 mb-8 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="perception" 
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:shadow-lg data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:hover:border-blue-300 data-[state=inactive]:hover:shadow-sm"
              >
                <Eye className="w-8 h-8 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">Perception</div>
                  <div className="text-xs text-[var(--muted)] mt-1">Compare head-to-head</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="reputation" 
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all data-[state=active]:border-purple-500 data-[state=active]:bg-purple-50 data-[state=active]:shadow-lg data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:hover:border-purple-300 data-[state=inactive]:hover:shadow-sm"
              >
                <Trophy className="w-8 h-8 data-[state=active]:text-purple-600 data-[state=inactive]:text-gray-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">Reputation</div>
                  <div className="text-xs text-[var(--muted)] mt-1">Rank your top choices</div>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perception">
              <PairwiseVoting
                nominees={votingNominees}
                season={activeSeason}
                currentUser={user}
              />
            </TabsContent>

            <TabsContent value="reputation">
              <RankedChoiceVoting
                nominees={votingNominees}
                season={activeSeason}
                currentUser={user}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}