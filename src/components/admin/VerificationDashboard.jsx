import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, XCircle, Loader2, Eye } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function VerificationDashboard() {
  const [selectedNominee, setSelectedNominee] = useState(null);
  const queryClient = useQueryClient();

  const { data: nominees, isLoading } = useQuery({
    queryKey: ['nominees-verification'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }),
    initialData: []
  });

  const updateVerificationMutation = useMutation({
    mutationFn: ({ nomineeId, field, value }) => 
      base44.entities.Nominee.update(nomineeId, {
        verification_status: {
          ...nominees.find(n => n.id === nomineeId)?.verification_status,
          [field]: value
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['nominees-verification']);
    }
  });

  const pendingVerification = nominees.filter(n => {
    const vs = n.verification_status || {};
    return !vs.linkedin_verified || !vs.employer_verified || !vs.metrics_validated;
  });

  const fullyVerified = nominees.filter(n => {
    const vs = n.verification_status || {};
    return vs.linkedin_verified && vs.employer_verified && vs.metrics_validated && vs.sme_reviewed;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            Verification Dashboard
          </h2>
          <p className="text-sm text-gray-600">Cross-validation and fraud prevention</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {pendingVerification.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {fullyVerified.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {nominees.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Flagged</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                0
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Pending Verification ({pendingVerification.length})
        </h3>
        <div className="space-y-4">
          {pendingVerification.map(nominee => {
            const vs = nominee.verification_status || {};
            return (
              <div key={nominee.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold" style={{ color: brandColors.navyDeep }}>
                      {nominee.name}
                    </h4>
                    <p className="text-sm text-gray-600">{nominee.title} at {nominee.company}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedNominee(nominee.id === selectedNominee ? null : nominee.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {selectedNominee === nominee.id ? 'Hide' : 'Review'}
                  </Button>
                </div>

                {selectedNominee === nominee.id && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <span className="text-sm">LinkedIn Verified</span>
                      <Button
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          nomineeId: nominee.id,
                          field: 'linkedin_verified',
                          value: !vs.linkedin_verified
                        })}
                        style={{ 
                          background: vs.linkedin_verified ? '#10b981' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {vs.linkedin_verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <span className="text-sm">Employer Verified</span>
                      <Button
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          nomineeId: nominee.id,
                          field: 'employer_verified',
                          value: !vs.employer_verified
                        })}
                        style={{ 
                          background: vs.employer_verified ? '#10b981' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {vs.employer_verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <span className="text-sm">Metrics Validated</span>
                      <Button
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          nomineeId: nominee.id,
                          field: 'metrics_validated',
                          value: !vs.metrics_validated
                        })}
                        style={{ 
                          background: vs.metrics_validated ? '#10b981' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {vs.metrics_validated ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded">
                      <span className="text-sm">SME Reviewed</span>
                      <Button
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          nomineeId: nominee.id,
                          field: 'sme_reviewed',
                          value: !vs.sme_reviewed
                        })}
                        style={{ 
                          background: vs.sme_reviewed ? '#10b981' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {vs.sme_reviewed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}