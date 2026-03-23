import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UserPlus, Mail, Award, Loader2, CheckCircle } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function SMEAssignmentPanel() {
  const [smeEmail, setSmeEmail] = useState('');
  const [credentials, setCredentials] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const { data: evaluations, isLoading: evalsLoading } = useQuery({
    queryKey: ['all-sme-evaluations'],
    queryFn: () => base44.entities.SMEEvaluation.list(),
    initialData: []
  });

  const sendInviteMutation = useMutation({
    mutationFn: async ({ email, credentials }) => {
      return base44.integrations.Core.SendEmail({
        to: email,
        subject: 'Invitation: TOP 100 SME Evaluation Panel',
        body: `You've been invited to join the TOP 100 Aerospace & Aviation SME Evaluation Panel.\n\nCredentials: ${credentials}\n\nAccess the portal at: ${window.location.origin}/SMEPortal\n\nThank you for your expertise!`
      });
    }
  });

  const handleInvite = () => {
    if (!smeEmail || !credentials) return;
    sendInviteMutation.mutate({ email: smeEmail, credentials });
    setSmeEmail('');
    setCredentials('');
  };

  // Get SME stats
  const smeEmails = new Set(evaluations.map(e => e.evaluator_email));
  const smeStats = Array.from(smeEmails).map(email => ({
    email,
    count: evaluations.filter(e => e.evaluator_email === email).length,
    avgConfidence: evaluations
      .filter(e => e.evaluator_email === email)
      .reduce((sum, e) => sum + (e.confidence_level || 0), 0) / 
      evaluations.filter(e => e.evaluator_email === email).length || 0
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          SME Management
        </h2>
        <p className="text-sm text-gray-600">Invite and manage subject matter experts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <div>
              <p className="text-sm text-gray-600">Active SMEs</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {smeStats.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {evaluations.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
            <div>
              <p className="text-sm text-gray-600">Avg per SME</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {smeStats.length > 0 ? Math.round(evaluations.length / smeStats.length) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Invite New SME
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">SME Email</label>
            <Input
              type="email"
              value={smeEmail}
              onChange={(e) => setSmeEmail(e.target.value)}
              placeholder="expert@aerospace.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Credentials/Expertise</label>
            <Input
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="PhD Aerospace Engineering, 20 years at NASA"
            />
          </div>
          <Button
            onClick={handleInvite}
            disabled={!smeEmail || !credentials || sendInviteMutation.isPending}
            className="w-full"
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            {sendInviteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Active SMEs ({smeStats.length})
        </h3>
        <div className="space-y-3">
          {smeStats.map(sme => (
            <div key={sme.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium" style={{ color: brandColors.navyDeep }}>{sme.email}</p>
                <p className="text-sm text-gray-600">
                  {sme.count} evaluations • Avg confidence: {(sme.avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}