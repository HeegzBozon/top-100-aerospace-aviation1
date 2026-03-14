import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, Target, Loader2, BookOpen, Calculator } from 'lucide-react';
import PostPublicationAnalytics from './PostPublicationAnalytics';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function ScoringAnalytics() {
  const [activeSubTab, setActiveSubTab] = useState('scoring');
  const { data: nominees, isLoading } = useQuery({
    queryKey: ['nominees-analytics'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  const scoredNominees = nominees.filter(n => n.holistic_score > 0);

  // Distribution data
  const distributionData = [
    { range: '0-20', count: scoredNominees.filter(n => n.holistic_score < 20).length },
    { range: '20-40', count: scoredNominees.filter(n => n.holistic_score >= 20 && n.holistic_score < 40).length },
    { range: '40-60', count: scoredNominees.filter(n => n.holistic_score >= 40 && n.holistic_score < 60).length },
    { range: '60-80', count: scoredNominees.filter(n => n.holistic_score >= 60 && n.holistic_score < 80).length },
    { range: '80-100', count: scoredNominees.filter(n => n.holistic_score >= 80).length },
  ];

  // Layer averages
  const layerAverages = {
    perception: scoredNominees.reduce((sum, n) => sum + (n.perception_layer_score || 0), 0) / scoredNominees.length,
    objective: scoredNominees.reduce((sum, n) => sum + (n.objective_layer_score || 0), 0) / scoredNominees.length,
    sme: scoredNominees.reduce((sum, n) => sum + (n.sme_layer_score || 0), 0) / scoredNominees.length,
    narrative: scoredNominees.reduce((sum, n) => sum + (n.narrative_layer_score || 0), 0) / scoredNominees.length,
    normalization: scoredNominees.reduce((sum, n) => sum + (n.normalization_layer_score || 0), 0) / scoredNominees.length,
  };

  const layerData = [
    { layer: 'Perception', score: layerAverages.perception },
    { layer: 'Objective', score: layerAverages.objective },
    { layer: 'SME', score: layerAverages.sme },
    { layer: 'Narrative', score: layerAverages.narrative },
    { layer: 'Normalization', score: layerAverages.normalization },
  ];

  // Correlation data (Holistic vs Aura)
  const correlationData = scoredNominees.map(n => ({
    holistic: n.holistic_score,
    aura: n.aura_score || 0,
    name: n.name
  }));

  const subTabs = [
    { id: 'scoring', label: 'Scoring & Calibration', icon: Calculator },
    { id: 'publication', label: 'Post-Publication', icon: BookOpen },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-200'
              }`}
              style={{ color: activeSubTab === tab.id ? brandColors.navyDeep : '#6b7280' }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conditional Content */}
      {activeSubTab === 'publication' ? (
        <PostPublicationAnalytics />
      ) : (
      <>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          Scoring Analytics & Calibration
        </h2>
        <p className="text-sm text-gray-600">System performance and weight optimization</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
            <div>
              <p className="text-sm text-gray-600">Avg Holistic Score</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {(scoredNominees.reduce((sum, n) => sum + n.holistic_score, 0) / scoredNominees.length || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <div>
              <p className="text-sm text-gray-600">Standard Deviation</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {(() => {
                  const avg = scoredNominees.reduce((sum, n) => sum + n.holistic_score, 0) / scoredNominees.length;
                  const variance = scoredNominees.reduce((sum, n) => sum + Math.pow(n.holistic_score - avg, 2), 0) / scoredNominees.length;
                  return Math.sqrt(variance).toFixed(1);
                })()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Top Scorer</p>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {Math.max(...scoredNominees.map(n => n.holistic_score)).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={brandColors.goldPrestige} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Layer Performance (Averages)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={layerData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="layer" type="category" />
            <Tooltip />
            <Bar dataKey="score" fill={brandColors.skyBlue} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
          Holistic vs Aura Correlation
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="holistic" name="Holistic Score" />
            <YAxis dataKey="aura" name="Aura Score" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={correlationData} fill={brandColors.goldPrestige} />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2">
          Correlation analysis between v3.0 Holistic scores and legacy Aura scores
        </p>
      </Card>
      </>
      )}
    </div>
  );
}