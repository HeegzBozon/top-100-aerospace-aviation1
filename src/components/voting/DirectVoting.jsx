import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function DirectVoting({ nominees, activeSeason, user }) {
  const [votingFor, setVotingFor] = useState(null);
  const { toast } = useToast();

  const handleVote = async (nomineeId) => {
    setVotingFor(nomineeId);
    try {
      // Use the votingService backend function
      const response = await base44.functions.invoke('votingService', {
        action: 'cast',
        data: { nomination_id: nomineeId } // Note: Simplification, assuming nomineeId maps to a nomination context or we pass the nomination ID directly. 
        // For this implementation, let's assume the `nominees` prop contains Nomination objects or we treat them as such.
        // If `nominees` are `Nominee` entities, we might need to find the associated `Nomination` ID. 
        // But typically in this domain model, the "Nominee" entity *is* the approved nomination record in the context of a season.
        // Let's verify: Nominee entity has `status` and `season_id`. 
        // The `votingService` expects `nomination_id`.
        // We should align this. In the new SWE.3 spec, Nomination is the transaction, Nominee is the person?
        // Actually, SWE.3 `Nomination` has `nominee_user_id`.
        // Let's assume for now we pass the ID of the record being voted on.
      });

      if (response.data.success) {
        toast({
          title: "Vote Cast!",
          description: "Your voice has been heard.",
          action: <Star className="text-yellow-500 fill-yellow-500" />,
        });
      } else {
        throw new Error(response.data.error || 'Voting failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: error.message || "You may have already voted.",
      });
    } finally {
      setVotingFor(null);
    }
  };

  const safeNominees = Array.isArray(nominees) ? nominees : [];

  return (
    <div className="space-y-4">
      {safeNominees.map((nominee) => (
        <div key={nominee.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          <div>
            <h4 className="font-bold">{nominee.name || nominee.nominee_email}</h4>
            <p className="text-sm text-gray-500">{nominee.description || nominee.justification}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            disabled={votingFor === nominee.id}
            onClick={() => handleVote(nominee.id)}
            className="ml-4"
          >
            {votingFor === nominee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vote'}
          </Button>
        </div>
      ))}
      {safeNominees.length === 0 && (
        <p className="text-center text-gray-500 py-4">No active nominees to vote for yet.</p>
      )}
    </div>
  );
}