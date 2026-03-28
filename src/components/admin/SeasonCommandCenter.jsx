import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getDashboardStats } from '@/functions/getDashboardStats';
import { base44 } from '@/api/base44Client';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw, Loader2, Rocket, Target, Database,
  Users, Shield, BarChart3, Trophy, ScrollText,
  UserPlus, Building2
} from 'lucide-react';
import VoteLedger from '@/components/admin/VoteLedger';
import ResultsDashboard from '@/components/admin/ResultsDashboard';
import AdvancedAnalyticsPanel from '@/components/admin/AdvancedAnalyticsPanel';
import S4NominationTracker from '@/components/admin/S4NominationTracker';
import S4MissionBriefing from '@/components/admin/s4/S4MissionBriefing';
import S4FlightographyTracker from '@/components/admin/s4/S4FlightographyTracker';
import S4SeedNetwork from '@/components/admin/s4/S4SeedNetwork';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8' };

export default function SeasonCommandCenter({ onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('mission');
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [season, setSeason] = useState(null);
  const [editingSeasonId, setEditingSeasonId] = useState(null);
  const [editSeasonData, setEditSeasonData] = useState(null);
  const { toast } = useToast();
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const allSeasons = await base44.entities.Season.list('-created_date', 50);
      setSeasons(allSeasons);

      let targetSeasonId = selectedSeasonId;
      if (!targetSeasonId && allSeasons.length > 0) {
        const s4 = allSeasons.find(s => s.name?.includes('Season 4') && s.status !== 'completed' && s.status !== 'archived');
        const active = allSeasons.find(s => s.status === 'nominations_open' || s.status === 'voting_open');
        const target = s4 || active || allSeasons[0];
        targetSeasonId = target.id;
        setSelectedSeasonId(targetSeasonId);
      }

      const activeSeason = allSeasons.find(s => s.id === targetSeasonId);
      setSeason(activeSeason || null);

      if (activeSeason) {
        const allNominees = await base44.entities.Nominee.list('-created_date', 5000);
        const seasonNominees = allNominees.filter(n => n.season_id === activeSeason.id || !n.season_id);
        setNominees(seasonNominees);
      }
    } catch (err) {
      console.error('Error loading season data:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedSeasonId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEditSeason = () => {
    if (season) {
      setEditSeasonData({
        name: season.name,
        voting_start: season.voting_start?.split('T')[0],
        voting_end: season.voting_end?.split('T')[0],
        nomination_start: season.nomination_start?.split('T')[0],
        nomination_end: season.nomination_end?.split('T')[0],
      });
      setEditingSeasonId(season.id);
    }
  };

  const handleSaveSeason = async () => {
    try {
      await base44.entities.Season.update(editingSeasonId, editSeasonData);
      toast({ title: "Season Updated", description: "Season dates and settings have been saved." });
      setEditingSeasonId(null);
      setEditSeasonData(null);
      loadData();
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update season." });
    }
  };

  const subTabs = [
    { id: 'mission', label: 'Mission Brief', icon: Rocket },
    { id: 'flightography', label: 'Flightography', icon: Database },
    { id: 'seedNetwork', label: 'Seed Network', icon: Users },
    { id: 'nominations', label: 'Nominations', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'ledger', label: 'Vote Ledger', icon: ScrollText },
  ];

  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #2a4f7a)` }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: brand.navy }}>Season Command Center</h2>
            <p className="text-xs text-gray-500">Operational Intelligence · {season?.name || 'Loading…'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {seasons.length > 0 && (
            <Select value={selectedSeasonId} onValueChange={(v) => { setSelectedSeasonId(v); }}>
              <SelectTrigger className="w-56 text-sm" style={{ borderColor: brand.gold }}>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading}
            style={{ borderColor: brand.gold, color: brand.navy }}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleEditSeason} style={{ borderColor: brand.gold, color: brand.navy }}>
            Edit Season
          </Button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200 px-6 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-[#1e3a5a]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={isActive ? { borderBottomColor: brand.gold, color: brand.navy } : {}}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Season Modal */}
      {editingSeasonId && editSeasonData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader><CardTitle>Edit Season Dates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Season Name</label>
                <input type="text" value={editSeasonData.name}
                  onChange={(e) => setEditSeasonData({ ...editSeasonData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['nomination_start', 'nomination_end', 'voting_start', 'voting_end'].map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium mb-1 block capitalize">{field.replace(/_/g, ' ')}</label>
                    <input type="date" value={editSeasonData[field] || ''}
                      onChange={(e) => setEditSeasonData({ ...editSeasonData, [field]: e.target.value })}
                      className="w-full px-3 py-2 border rounded" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setEditingSeasonId(null); setEditSeasonData(null); }}>Cancel</Button>
                <Button onClick={handleSaveSeason}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {loading && !nominees.length ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.gold }} />
          </div>
        ) : (
          <>
            {activeSubTab === 'mission' && (
              <S4MissionBriefing nominees={nominees} season={season} />
            )}
            {activeSubTab === 'flightography' && (
              <S4FlightographyTracker nominees={nominees} />
            )}
            {activeSubTab === 'seedNetwork' && (
              <S4SeedNetwork nominees={nominees} />
            )}
            {activeSubTab === 'nominations' && (
              <S4NominationTracker seasonId={selectedSeasonId} />
            )}
            {activeSubTab === 'analytics' && (
              <AdvancedAnalyticsPanel seasonId={selectedSeasonId} onNavigate={onNavigate} />
            )}
            {activeSubTab === 'results' && <ResultsDashboard />}
            {activeSubTab === 'ledger' && <VoteLedger />}
          </>
        )}
      </div>
    </div>
  );
}