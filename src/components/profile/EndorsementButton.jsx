import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2, Shield } from 'lucide-react';

export default function EndorsementButton({ nomineeId, fieldName, user }) {
  const [endorsements, setEndorsements] = useState([]);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEndorsements();
  }, [nomineeId, fieldName]);

  const loadEndorsements = async () => {
    try {
      const data = await base44.entities.ProfileEndorsement.filter({
        nominee_id: nomineeId,
        field_name: fieldName
      });
      setEndorsements(data);
      setHasEndorsed(data.some(e => e.endorsed_by === user?.email));
    } catch (error) {
      console.error('Error loading endorsements:', error);
    }
  };

  const handleEndorse = async () => {
    if (!user) {
      toast.error('Please log in to endorse');
      return;
    }

    setLoading(true);
    try {
      if (hasEndorsed) {
        // Remove endorsement
        const existing = endorsements.find(e => e.endorsed_by === user.email);
        if (existing) {
          await base44.entities.ProfileEndorsement.delete(existing.id);
          toast.success('Endorsement removed');
        }
      } else {
        // Add endorsement
        await base44.entities.ProfileEndorsement.create({
          nominee_id: nomineeId,
          field_name: fieldName,
          endorsed_by: user.email,
          endorsement_type: 'verified_info'
        });

        // Award Stardust
        await base44.functions.invoke('awardStardust', {
          user_email: user.email,
          action_type: 'profile_endorsement'
        });

        toast.success('Endorsed! +3 Stardust');
      }
      await loadEndorsements();
    } catch (error) {
      console.error('Error endorsing:', error);
      toast.error('Failed to endorse');
    } finally {
      setLoading(false);
    }
  };

  if (endorsements.length === 0 && !user) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {endorsements.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <Shield className="w-3 h-3" />
          {endorsements.length} verified
        </Badge>
      )}
      {user && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEndorse}
          disabled={loading}
          className={hasEndorsed ? 'text-green-600' : 'text-gray-600'}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {hasEndorsed ? 'Verified' : 'Verify'}
        </Button>
      )}
    </div>
  );
}