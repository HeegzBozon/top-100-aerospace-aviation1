import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Calculator, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function HolisticScoringPanel() {
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: nominees, isLoading } = useQuery({
    queryKey: ['nominees-active'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }),
    initialData: []
  });

  const calculateScoreMutation = useMutation({
    mutationFn: (nominee_id) => base44.functions.invoke('calculateHolisticScore', { nominee_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['nominees-active']);
    }
  });

  const handleCalculateSingle = async () => {
    if (!selectedNomineeId) return;
    await calculateScoreMutation.mutateAsync(selectedNomineeId);
  };

  const handleCalculateAll = async () => {
    setBatchMode(true);
    for (const nominee of nominees) {
      try {
        await calculateScoreMutation.mutateAsync(nominee.id);
      } catch (error) {
        console.error(`Failed for ${nominee.name}:`, error);
      }
    }
    setBatchMode(false);
  };

  const nomineeWithScores = nominees.filter(n => n.holistic_score > 0);
  const avgScore = nomineeWithScores.length > 0
    ? nomineeWithScores.reduce((sum, n) => sum + n.holistic_score, 0) / nomineeWithScores.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            Holistic Scoring Engine v3.0
          </h2>
          <p className="text-sm text-gray-600">Multi-layer evaluation system</p>
        </div>
        <Button
          onClick={handleCalculateAll}
          disabled={batchMode || isLoading}
          style={{ background: brandColors.goldPrestige, color: 'white' }}
        >
          {batchMode ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate All ({nominees.length})
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.skyBlue + '20' }}>
              <Calculator className="w-6 h-6" style={{ color: brandColors.skyBlue }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nominees Scored</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {nomineeWithScores.length} / {nominees.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
              <TrendingUp className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {avgScore.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {nominees.length > 0 ? Math.round((nomineeWithScores.length / nominees.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Calculate Individual Score
        </h3>
        <div className="flex gap-3">
          <select
            value={selectedNomineeId}
            onChange={(e) => setSelectedNomineeId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          >
            <option value="">Select nominee...</option>
            {nominees.map(nominee => (
              <option key={nominee.id} value={nominee.id}>
                {nominee.name} {nominee.holistic_score > 0 ? `(${nominee.holistic_score.toFixed(1)})` : ''}
              </option>
            ))}
          </select>
          <Button
            onClick={handleCalculateSingle}
            disabled={!selectedNomineeId || calculateScoreMutation.isPending}
            style={{ background: brandColors.skyBlue, color: 'white' }}
          >
            {calculateScoreMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Calculate'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Top Scored Nominees
        </h3>
        <div className="space-y-3">
          {nomineeWithScores
            .sort((a, b) => b.holistic_score - a.holistic_score)
            .slice(0, 10)
            .map((nominee, index) => (
              <div key={nominee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium">{nominee.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    P:{nominee.perception_layer_score?.toFixed(0) || '-'}
                  </span>
                  <span className="text-gray-600">
                    O:{nominee.objective_layer_score?.toFixed(0) || '-'}
                  </span>
                  <span className="text-gray-600">
                    S:{nominee.sme_layer_score?.toFixed(0) || '-'}
                  </span>
                  <span className="text-xl font-bold" style={{ color: brandColors.goldPrestige }}>
                    {nominee.holistic_score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}