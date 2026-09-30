import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Calculator, BarChart3, Shield } from 'lucide-react';
import SeasonCommandCenter from '@/components/admin/SeasonCommandCenter';
import RankedVoteManager from '@/components/admin/RankedVoteManager';
import HolisticScoringPanel from '@/components/admin/HolisticScoringPanel';
import ScoringAnalytics from '@/components/admin/ScoringAnalytics';
import VerificationDashboard from '@/components/admin/VerificationDashboard';

// Selection phase — voting status, scoring, analytics, and verification folded into one surface.
export default function SelectionPhase({ season, onNavigate }) {
  const [sub, setSub] = useState('voting');
  return (
    <div className="space-y-4">
      <Tabs value={sub} onValueChange={setSub}>
        <TabsList className="bg-editorial-cream">
          <TabsTrigger value="voting" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Voting</TabsTrigger>
          <TabsTrigger value="rcv" className="gap-1.5"><Calculator className="w-3.5 h-3.5" /> RCV Scoring</TabsTrigger>
          <TabsTrigger value="holistic" className="gap-1.5"><Calculator className="w-3.5 h-3.5" /> Holistic</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Analytics</TabsTrigger>
          <TabsTrigger value="verification" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Verification</TabsTrigger>
        </TabsList>
        <TabsContent value="voting" className="mt-4"><SeasonCommandCenter onNavigate={onNavigate} /></TabsContent>
        <TabsContent value="rcv" className="mt-4"><RankedVoteManager /></TabsContent>
        <TabsContent value="holistic" className="mt-4"><HolisticScoringPanel /></TabsContent>
        <TabsContent value="analytics" className="mt-4"><ScoringAnalytics /></TabsContent>
        <TabsContent value="verification" className="mt-4"><VerificationDashboard /></TabsContent>
      </Tabs>
    </div>
  );
}