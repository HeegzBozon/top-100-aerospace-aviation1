import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download } from 'lucide-react';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import { syncProfileActivity } from '@/functions/syncProfileActivity';
import HomeDock from '@/components/home-v3/HomeDock';
import ShareableProfileCard from '@/components/profile/ShareableProfileCard';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import FellowIdentityHeader from '@/components/fellow-home/FellowIdentityHeader';
import TheEight from '@/components/fellow-home/TheEight';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';
import FlightographyModule from '@/components/fellow-home/FlightographyModule';
import PersonalizationBar from '@/components/fellow-home/PersonalizationBar';
import ActivityStream from '@/components/fellow-home/ActivityStream';
import FellowLeftRail from '@/components/fellow-home/FellowLeftRail';
import SeasonBand from '@/components/fellow-home/SeasonBand';
import FellowBlurbs from '@/components/fellow-home/FellowBlurbs';
import StoriesBar from '@/components/fellow-home/StoriesBar';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import useEndorsementWall from '@/components/fellow-home/useEndorsementWall';
import { B, accentValue, accentForDiscipline, orderedModules } from '@/components/fellow-home/fellowHomeConfig';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [events, setEvents] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingEightVisibility, setSavingEightVisibility] = useState(false);
  const [saveError, setSaveError] = useState('');
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

      const found = await base44.entities.FellowProfileSettings.filter({ fellow_email: currentUser.email }).catch(() => []);
      if (found?.[0]) {
        setSettings(found[0]);
      } else {
        // Unconfigured Fellows get an accent derived from their primary discipline.
        setSettings({
          domain_accent: accentForDiscipline(nom?.discipline),
          cover_asset_id: 'none',
          module_order: [],
          six_word_story: currentUser.six_word_story || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(false);
    try {
      const res = await syncProfileActivity({});
      setEvents(res?.data?.events || []);
    } catch (error) {
      setActivityError(true);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => { loadActivity(); }, [loadActivity]);

  const acknowledgeActivity = async () => {
    const ids = events.map((e) => e.id);
    setEvents([]);
    await Promise.all(ids.map((id) => base44.entities.ProfileActivity.update(id, { seen: true }).catch(() => {})));
  };

  const savePersonalization = async (patch) => {
    const previous = settings;
    setSettings((s) => ({ ...s, ...patch }));
    setSaving(true);
    setSaveError('');
    try {
      const res = await saveProfileSettings(patch);
      if (res?.data?.settings) setSettings(res.data.settings);
    } catch (error) {
      setSettings(previous);
      setSaveError(error?.response?.data?.error || 'That change was rejected.');
    } finally {
      setSaving(false);
    }
  };

  // Status is a curated key, saved directly on the settings record.
  const saveStatus = async (statusKey) => {
    const previous = settings;
    setSettings((s) => ({ ...s, status_key: statusKey }));
    setSavingStatus(true);
    const patch = { status_key: statusKey, status_set_at: new Date().toISOString() };
    try {
      if (settings?.id) {
        await base44.entities.FellowProfileSettings.update(settings.id, patch);
      } else {
        const created = await base44.entities.FellowProfileSettings.create({
          fellow_email: user.email,
          fellow_id: nominee?.id,
          domain_accent: settings?.domain_accent,
          ...patch,
        });
        setSettings(created);
      }
    } catch (error) {
      setSettings(previous);
    } finally {
      setSavingStatus(false);
    }
  };

  // Public visibility of the ranked positions. Expression only — never touches measurement.
  const saveEightVisibility = async (next) => {
    const previous = settings;
    setSettings((s) => ({ ...s, eight_public: next }));
    setSavingEightVisibility(true);
    try {
      if (settings?.id) {
        await base44.entities.FellowProfileSettings.update(settings.id, { eight_public: next });
      } else {
        const created = await base44.entities.FellowProfileSettings.create({
          fellow_email: user.email,
          fellow_id: nominee?.id,
          domain_accent: settings?.domain_accent,
          eight_public: next,
        });
        setSettings(created);
      }
    } catch (error) {
      setSettings(previous);
    } finally {
      setSavingEightVisibility(false);
    }
  };

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

  const accent = accentValue(settings?.domain_accent);
  const order = orderedModules(settings?.module_order);
  const publicPath = nominee?.id
    ? `/profiles/${nominee.id}`
    : `/ProfileView?user=${encodeURIComponent(user?.email || '')}`;

  const fellowModules = {
    eight: (
      <TheEight
        key="eight"
        rankings={rankings}
        isOwner
        accent={accent}
        isPublic={settings?.eight_public !== false}
        savingVisibility={savingEightVisibility}
        onVisibilityChange={saveEightVisibility}
      />
    ),
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
    flightography: (
      <FlightographyModule
        key="flightography"
        nominee={nominee}
        user={user}
        accent={accent}
        onNomineeUpdate={setNominee}
        onUserUpdate={setUser}
      />
    ),
  };

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: B.cream }}>
      <AnnouncementBanner />
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6 max-w-6xl mx-auto space-y-5">
        {/* Position 1 — locked. Identity above credential. */}
        <FellowIdentityHeader
          user={user}
          nominee={nominee}
          accent={accent}
          isOwner
          coverKey={settings?.cover_asset_id}
          sixWordStory={settings?.six_word_story || user?.six_word_story}
          onEditIdentity={() => setWizardOpen(true)}
          publicPath={publicPath}
          coverContent={<SeasonBand accent={accent} />}
        />

        {/* Position 2 — locked. Present and quiet. */}


        {/* Retro two-column: rail left, working surface right */}
        <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] gap-5 items-start">
          <aside className="lg:sticky lg:top-4">
            <FellowLeftRail
              user={user}
              nominee={nominee}
              accent={accent}
              statusKey={settings?.status_key}
              savingStatus={savingStatus}
              onStatusChange={saveStatus}
              viewCount={settings?.profile_view_count || 0}
              endorsementCount={entries.filter((e) => e.moderation_status === 'approved').length}
              publicPath={publicPath}
            />
          </aside>

          <div className="space-y-5 min-w-0">
            <StoriesBar user={user} accent={accent} />
            <FellowBlurbs settings={settings} user={user} accent={accent} />
            <ActivityStream
              loading={activityLoading}
              error={activityError}
              events={events}
              accent={accent}
              onAcknowledge={events.length ? acknowledgeActivity : null}
            />

            <div className="flex items-start justify-end gap-3 flex-wrap">
              <PersonalizationBar
                settings={settings}
                order={order}
                accent={accent}
                saving={saving}
                error={saveError}
                onChange={savePersonalization}
              />
            </div>

            {/* Positions 3+ — Fellow-configured order */}
            {order.map((key) => fellowModules[key])}

            <ShareableProfileCard user={user} nominee={nominee} onUserUpdate={setUser} />
            {nominee && <NomineeNewsSection nomineeId={nominee.id} />}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
          >
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
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