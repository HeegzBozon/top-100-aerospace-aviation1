import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnifiedProfileEditor from '@/components/dashboard/UnifiedProfileEditor';
import HomeDock from '@/components/home-v3/HomeDock';
import ShareableProfileCard from '@/components/profile/ShareableProfileCard';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import ResearchStatsCard from '@/components/profile/ResearchStatsCard';
import ProfileWizardLaunch from '@/components/profile/wizard/ProfileWizardLaunch';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import FellowIdentityHeader from '@/components/fellow-home/FellowIdentityHeader';
import TheEight from '@/components/fellow-home/TheEight';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';
import PersonalizationBar from '@/components/fellow-home/PersonalizationBar';
import ReturnState from '@/components/fellow-home/ReturnState';
import SeasonPulse from '@/components/fellow-home/SeasonPulse';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import useEndorsementWall from '@/components/fellow-home/useEndorsementWall';
import { B, accentValue, orderedModules } from '@/components/fellow-home/fellowHomeConfig';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [appearances, setAppearances] = useState(0);
  const [newSince, setNewSince] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { entries, approve } = useEndorsementWall(user?.email, nominee?.id);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (!currentUser?.email) return;

      const nominees = await base44.entities.Nominee.filter({ nominee_email: currentUser.email }).catch(() => []);
      const nom = nominees?.[0] || null;
      setNominee(nom);

      const lists = await base44.entities.UserTop100List.filter({ user_email: currentUser.email }, '-updated_date', 1).catch(() => []);
      setRankings(lists?.[0]?.rankings || []);

      // Return-state signals
      const lastSeen = currentUser?.profile_last_seen ? new Date(currentUser.profile_last_seen) : null;
      const wall = await base44.entities.Endorsement.filter({ nominee_email: currentUser.email }, '-created_date', 50).catch(() => []);
      setNewSince(lastSeen ? (wall || []).filter((e) => e.kind === 'authored' && new Date(e.created_date) > lastSeen).length : 0);

      if (nom?.id) {
        const others = await base44.entities.UserTop100List.list('-updated_date', 200).catch(() => []);
        setAppearances(
          (others || []).filter(
            (l) => l.user_email !== currentUser.email && (l.rankings || []).slice(0, 8).some((r) => r.nominee_id === nom.id)
          ).length
        );
      }
      base44.auth.updateMe({ profile_last_seen: new Date().toISOString() }).catch(() => {});
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${user?.email?.replace('@', '_at_') || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: B.gold }} />
      </div>
    );
  }

  const accent = accentValue(user?.accent_color);
  const order = orderedModules(user?.module_order);

  const savePersonalization = async (patch) => {
    setUser((u) => ({ ...u, ...patch }));
    await base44.auth.updateMe(patch);
  };

  const fellowModules = {
    eight: <TheEight key="eight" rankings={rankings} isOwner accent={accent} />,
    wall: (
      <EndorsementWall
        key="wall"
        entries={entries}
        isOwner
        canWrite={false}
        isAdmin={user?.role === 'admin'}
        accent={accent}
        onSubmit={() => {}}
        onApprove={approve}
      />
    ),
  };

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: B.cream }}>
      {/* Rotating announcement banner from the home surface */}
      <AnnouncementBanner />
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6 max-w-6xl mx-auto space-y-5">
        {/* Identity — the home surface starts with who you are */}
        <FellowIdentityHeader
          user={user}
          nominee={nominee}
          accent={accent}
          isOwner
          onEditIdentity={() => setWizardOpen(true)}
        />

        <ReturnState
          newEndorsements={newSince}
          appearances={appearances}
          emptySlots={8 - Math.min(8, rankings.length)}
          accent={accent}
        />

        {/* Season countdowns + live info, carried over from Home */}
        <SeasonPulse />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to={`/ProfileView?user=${encodeURIComponent(user?.email || '')}`}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: B.navy }}
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Link>
          <PersonalizationBar user={user} order={order} accent={accent} onChange={savePersonalization} />
        </div>

        <ProfileWizardLaunch user={user} nominee={nominee} onSaved={loadUser} />

        {order.map((key) => fellowModules[key])}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Profile Editor */}
          <div className="lg:col-span-2">
            <UnifiedProfileEditor user={user} />
          </div>

          {/* RIGHT COLUMN - Shareable Card + Nominee sections */}
          <div className="space-y-6">
            <ShareableProfileCard user={user} nominee={nominee} onUserUpdate={setUser} />
            <ResearchStatsCard nominee={nominee} user={user} onNomineeUpdate={setNominee} onUserUpdate={setUser} />
            {nominee && (
              <>
                <NomineeCareerHistorySection nominee={nominee} />
                <NomineeContributionsSection nomineeId={nominee.id} />
                <NomineeNewsSection nomineeId={nominee.id} />
              </>
            )}
          </div>
        </div>

        {/* Data Export - Subtle Link */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
          >
            {exporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            {exporting ? 'Exporting...' : 'Download my data'}
          </button>
        </div>
      </div>

      <div className="h-28" />
      <HomeDock />

      {wizardOpen && (
        <ProfileWizard
          user={user}
          nominee={nominee}
          onClose={() => setWizardOpen(false)}
          onSaved={loadUser}
        />
      )}
    </div>
  );
}