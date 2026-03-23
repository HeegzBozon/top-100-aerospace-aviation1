
import { useEffect, useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { saveRankedVote } from '@/functions/saveRankedVote';
import { getUserRankedVote } from '@/functions/getUserRankedVote';
import { Season } from '@/entities/Season';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Vote, CheckCircle, Loader2 } from 'lucide-react';
import { isEqual } from 'lodash';

export default function RcvBallotManager({ 
    userTop100List, 
    onBallotSaved, 
    className = '' 
}) {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedBallot, setLastSavedBallot] = useState([]);
    
    const { toast } = useToast();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const user = await User.me().catch(() => null);
                setCurrentUser(user);

                const seasons = await Season.list('-start_date');
                const activeSeason = seasons.find(s => 
                    ['voting_open', 'nominations_open', 'active'].includes(s.status)
                ) || seasons[0];

                if (activeSeason) {
                    setCurrentSeason(activeSeason);
                    if (user) {
                        await loadExistingBallot(activeSeason.id);
                    }
                }
            } catch (error) {
                console.error('Failed to load season:', error);
            }
        };
        loadInitialData();
    }, []);

    const hasUnsavedChanges = useMemo(() => {
        const currentBallotIds = userTop100List.map(item => item.nomineeId);
        return !isEqual(currentBallotIds.sort(), lastSavedBallot.sort()) || !isEqual(currentBallotIds, lastSavedBallot);
    }, [userTop100List, lastSavedBallot]);


    const loadExistingBallot = async (seasonId) => {
        try {
            const { data } = await getUserRankedVote({ season_id: seasonId });
            if (data.success && data.ballot) {
                setLastSavedBallot(data.ballot);
            }
        } catch (error) {
            console.error('Failed to load existing ballot:', error);
        }
    };

    const handleSaveBallot = async () => {
        if (!currentUser || !currentSeason) {
             toast({
                variant: "destructive",
                title: "Login Required",
                description: "Please log in to save your ballot."
            });
            return;
        }

        // The original code had a check for userTop100List.length === 0 here.
        // The new prompt implies that clearing the ballot (0 length) is a valid save operation,
        // so this check should be removed if it prevents saving an empty list.
        // Keeping it out as per the implicit change in prompt, allowing saving of empty lists.
        // If an empty ballot save should be prevented, this check should be re-added here.

        setIsSaving(true);
        try {
            const ballot = userTop100List.map(item => item.nomineeId);
            const { data } = await saveRankedVote({ 
                season_id: currentSeason.id, 
                ballot 
            });

            if (data && data.success) {
                setLastSavedBallot(ballot);
                const message = ballot.length > 0 
                    ? `Your TOP ${ballot.length} ranked choice ballot has been saved.`
                    : 'Your ballot has been cleared.';
                toast({
                    title: "Ballot Saved!",
                    description: message
                });
                if (onBallotSaved) {
                    onBallotSaved(ballot);
                }
            } else {
                throw new Error(data?.error || data?.message || 'Failed to save ballot');
            }
        } catch (error) {
            console.error('Failed to save ballot:', error);
            // Extract the actual error message
            let errorMessage = error.message || 'Could not save your ballot. Please try again.';
            
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: errorMessage
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!currentSeason || !currentUser) return null;

    const ballotLength = userTop100List.length;
    // canSave now allows saving an empty ballot if it has unsaved changes,
    // as it might be an intentional clearing of the ballot.
    const canSave = hasUnsavedChanges; 

    return (
        <div className={`bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-4 flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-3">
                <Vote className="w-5 h-5 text-purple-500" />
                <div>
                    <h3 className="font-semibold text-[var(--text)]">
                        Your Ranked Choice Ballot
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                        {ballotLength > 0 
                            ? `${ballotLength} nominees in your ranking${hasUnsavedChanges ? '' : ' (all changes saved)'}`
                            : 'Add nominees to create your ballot'
                        }
                    </p>
                </div>
            </div>
            
            {canSave ? (
                <Button 
                    onClick={handleSaveBallot} 
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save My Ranking'}
                </Button>
            ) : lastSavedBallot.length > 0 ? ( // This checks if there's a previously saved ballot to show 'Saved' status
                <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Saved</span>
                </div>
            ) : ( // If lastSavedBallot is empty and there are no unsaved changes, it means the ballot is effectively cleared and saved.
                  // Display 'Saved' for an empty but saved ballot too.
                <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Saved</span>
                </div>
            )}
        </div>
    );
}
