import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { BadgeCheck, BookOpen, Camera, DoorOpen, Download, Loader2, Settings2, LayoutGrid, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import useGlass from '@/hooks/useGlass';
import ShareableProfileCard from '@/components/profile/ShareableProfileCard';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import FellowIdentityHeader from '@/components/fellow-home/FellowIdentityHeader';
import FlightographyModule from '@/components/fellow-home/FlightographyModule';
import AccentCoverPicker from '@/components/bulletin-board/AccentCoverPicker';
import SeasonBand from '@/components/fellow-home/SeasonBand';
import InstrumentCluster from '@/components/fellow-home/InstrumentCluster';
import MastheadEditorial from '@/components/fellow-home/MastheadEditorial';
import BulletinBoardCluster from '@/components/bulletin-board/BulletinBoardCluster';
import { useStoryExperience } from '@/components/fellow-home/useStoryExperience';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import StoryViewer from '@/components/fellow-home/StoryViewer';
import StoryCreate from '@/components/fellow-home/StoryCreate';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import useEndorsementWall from '@/components/fellow-home/useEndorsementWall';
import { B, accentValue, accentForDiscipline, orderedModules } from '@/components/fellow-home/fellowHomeConfig';
import { preferredNominee, mergedIntoId } from '@/lib/nomineeMerge';
import { ensureFellowSettings } from '@/lib/ensureFellowSettings';
import GlassConsole from '@/components/handheld/GlassConsole';
import StudioPanel from '@/components/profile/StudioPanel';
import IntentStudioPanel from '@/components/profile/intent/IntentStudioPanel';
import InquiryDeskPanel from '@/components/profile/intent/InquiryDeskPanel';
import PresentationSettings from '@/components/profile-deck/PresentationSettings';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingEightVisibility, setSavingEightVisibility] = useState(false);
  const [saveError, setSaveError] = useState('');
  // The Studio: null is closed; an array of sitting ids opens the wizard on those
  // sittings (an empty array walks the whole studio from the lobby).
  const [wizard, setWizard] = useState(null);
  // The panel the console is holding. Null is the console's own menu.
  const [openPanel, setOpenPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  // On the glass the profile is read as a console: a menu of its own panels,
  // then one panel open at a time on the click wheel.
  const glass = useGlass();

  // Instrument cluster tab persists in the URL so returning Fellows land where they left off.
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'top100');
  const handleTabChange = (next) => {
    setTab(next);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('tab', next);
      window.history.replaceState({}, '', u);
    } catch {}
  };

  // The Eight stays in the masthead — jumping there surfaces it and scrolls up.
  const jumpToEight = () => {
    handleTabChange('top100');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { entries, approve } = useEndorsementWall(user?.email, nominee?.id);
  const story = useStoryExperience(user);
  const top100 = useMyTop100(user?.email);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (!currentUser?.email) return;

      // One person, one record: the copy the Fellow has claimed and verified outranks a
      // superseded duplicate for the same address, and a superseded row resolves to the
      // master it was folded into. Reading the raw first row is what told a Fellow who
      // already owned her profile that she still had to claim it.
      const rows = await base44.entities.Nominee.filter({ nominee_email: currentUser.email }).catch(() => []);
      let nom = preferredNominee(rows);
      const masterId = mergedIntoId(nom || {});
      if (masterId) nom = (await base44.entities.Nominee.get(masterId).catch(() => nom)) || nom;
      setNominee(nom);

      const found = await base44.entities.FellowProfileSettings.filter({ fellow_email: currentUser.email }).catch(() => []);
      // The row the whole Studio is assembled from, written once for a Fellow who has
      // never had one, so first arrival is a furnished page and not a set of empty states.
      const provisioned = found?.[0] || (await ensureFellowSettings(currentUser, nom).catch(() => null));
      setSettings(
        provisioned || {
          domain_accent: accentForDiscipline(nom?.discipline),
          cover_asset_id: 'none',
          module_order: [],
          six_word_story: currentUser.six_word_story || '',
        },
      );
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // Deep-link from "Add my own Viral Post" and similar CTAs — open the Studio
  // wizard on arrival, exactly as if the Fellow pressed the Update button.
  // Also stamp signup_referrer for acquisition attribution (once, never overwritten).
  useEffect(() => {
    if (user && new URLSearchParams(window.location.search).get('studio') === 'open') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      setWizard([]);
      if (ref && !user.signup_referrer) {
        base44.auth.updateMe({ signup_referrer: ref }).catch(() => {});
      }
      try {
        const u = new URL(window.location.href);
        u.searchParams.delete('studio');
        u.searchParams.delete('ref');
        window.history.replaceState({}, '', u);
      } catch {}
    }
  }, [user]);

  // Deep-link from the console's share drawer: land with the presentation
  // settings open, exactly as if the Fellow pressed Presentation.
  useEffect(() => {
    if (user && new URLSearchParams(window.location.search).get('settings') === 'presentation') {
      setPresentationOpen(true);
      try {
        const u = new URL(window.location.href);
        u.searchParams.delete('settings');
        window.history.replaceState({}, '', u);
      } catch {}
    }
  }, [user]);

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

  // Cluster grid layout — module order + visibility. Expression only; never touches measurement.
  const saveClusterLayout = async (order, hidden) => {
    const previous = settings;
    setSettings((s) => ({ ...s, cluster_module_order: order, cluster_hidden_modules: hidden }));
    try {
      if (settings?.id) {
        await base44.entities.FellowProfileSettings.update(settings.id, {
          cluster_module_order: order,
          cluster_hidden_modules: hidden,
        });
      } else {
        const created = await base44.entities.FellowProfileSettings.create({
          fellow_email: user.email,
          fellow_id: nominee?.id,
          domain_accent: settings?.domain_accent,
          cluster_module_order: order,
          cluster_hidden_modules: hidden,
        });
        setSettings(created);
      }
    } catch (error) {
      setSettings(previous);
    }
  };

  // Per-tile size overrides for the board grid. Expression only; never touches measurement.
  const saveClusterSizes = async (sizes) => {
    const previous = settings;
    setSettings((s) => ({ ...s, cluster_tile_sizes: sizes }));
    try {
      if (settings?.id) {
        await base44.entities.FellowProfileSettings.update(settings.id, { cluster_tile_sizes: sizes });
      } else {
        const created = await base44.entities.FellowProfileSettings.create({
          fellow_email: user.email,
          fellow_id: nominee?.id,
          domain_accent: settings?.domain_accent,
          cluster_tile_sizes: sizes,
        });
        setSettings(created);
      }
    } catch (error) {
      setSettings(previous);
    }
  };

  // Slide deck configuration — slide order, hidden slides, autoplay behavior.
  // Expression only; locked positions enforced client-side via resolveSlideOrder.
  const saveSlideConfig = async (patch) => {
    const previous = settings;
    setSettings((s) => ({ ...s, ...patch }));
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

  const blurbsContent = (
    <MastheadEditorial
      oneWord={user?.one_word}
      sixWordStory={settings?.six_word_story || user?.six_word_story}
      settings={settings}
      user={user}
      accent={accent}
      onUserUpdate={setUser}
      onSettingsUpdate={setSettings}
    />
  );

  // The profile's panels, built once. The desk stacks them down the page; the
  // glass hands the same panels to the console, which holds them one at a time.
  const identityNode = (
    <FellowIdentityHeader
      user={user}
      nominee={nominee}
      accent={accent}
      isOwner
      coverKey={settings?.cover_asset_id}
      sixWordStory={settings?.six_word_story || user?.six_word_story}
      onEditIdentity={() => setWizard([])}
      publicPath={publicPath}
      statusKey={settings?.status_key}
      savingStatus={savingStatus}
      onStatusChange={saveStatus}
      coverContent={
        <SeasonBand
          accent={accent}
          underTally={blurbsContent}
        />
      }
      hasStory={story.hasStory}
      onAvatarTap={story.onAvatarTap}
      clusterContent={
        <InstrumentCluster
          user={user}
          nominee={nominee}
          accent={accent}
          groups={story.groups}
          onOpen={story.openViewer}
          onAdd={story.openCreate}
          top100={top100.rankings}
          activeTab={tab}
          onTabChange={handleTabChange}
          top100Loading={top100.loading}
          storiesLoading={story.loading}
        />
      }
    />
  );

  const boardNode = (
    // Keyed on the board in the URL: an arriving deep link (the console's own
    // menu sends them) mounts the cluster fresh so it opens on that board.
    <BulletinBoardCluster
      key={new URLSearchParams(window.location.search).get('board') || 'board'}
      user={user}
      nominee={nominee}
      settings={settings}
      accent={accent}
      isOwner
      statusKey={settings?.status_key}
      savingStatus={savingStatus}
      onStatusChange={saveStatus}
      nextMove={{
        eightCount: top100.rankings.length,
        hasFlightography: !!(nominee?.career_history?.length || nominee?.education?.length || nominee?.skills?.length || nominee?.bio),
        hasSixWord: !!(settings?.six_word_story || user?.six_word_story),
      }}
      onJumpToEight={jumpToEight}
      onEditIdentity={() => setWizard([])}
      wallEntries={entries}
      onApproveWall={approve}
      publicPath={publicPath}
      flightography={fellowModules.flightography}
      tradingCard={<ShareableProfileCard user={user} nominee={nominee} onUserUpdate={setUser} />}
      personalize={
        <AccentCoverPicker
          settings={settings}
          accent={accent}
          saving={saving}
          error={saveError}
          onChange={savePersonalization}
        />
      }
      clusterOrder={settings?.cluster_module_order}
      clusterHidden={settings?.cluster_hidden_modules}
      onSaveLayout={saveClusterLayout}
      clusterSizes={settings?.cluster_tile_sizes}
      onSaveSizes={saveClusterSizes}
    />
  );

  const accountNode = (
    <>
      <Link to="/board" className="text-xs font-semibold uppercase tracking-[0.14em] hover:opacity-70 transition-opacity flex items-center gap-1.5" style={{ color: B.navy }}>
        <LayoutGrid className="w-3 h-3" /> Dashboard
      </Link>
      <button onClick={() => setPresentationOpen(true)} className="text-xs font-semibold uppercase tracking-[0.14em] hover:opacity-70 transition-opacity flex items-center gap-1.5" style={{ color: B.navy }}>
        <Settings2 className="w-3 h-3" /> Presentation
      </button>
      <button
        onClick={handleExportData}
        disabled={exporting}
        className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
      >
        {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        {exporting ? 'Exporting...' : 'Download my data'}
      </button>
    </>
  );

  // Identity locks to position 1. Flightography and The Studio are the record
  // itself — the career, and the sittings that write it — so they sit directly
  // under it, ahead of the boards.
  const panels = [
    { key: 'identity', label: 'Identity', hint: 'Masthead, status and the record', icon: BadgeCheck, node: <div className="px-3 pt-3">{identityNode}</div> },
    // The two doors and the desk they feed. Opening either is the Fellow's alone;
    // nothing here is scored or ordered.
    { key: 'door', label: 'The Door', hint: 'What you are open to', icon: DoorOpen, node: <IntentStudioPanel settings={settings} accent={accent} onSave={savePersonalization} saving={saving} error={saveError} /> },
    { key: 'desk', label: 'The Desk', hint: 'Who has written to you', icon: Mail, node: <InquiryDeskPanel user={user} accent={accent} /> },
    { key: 'flightography', label: 'Flightography', hint: 'Career record, schools and skills', icon: BookOpen, node: <div className="px-3 pt-3">{fellowModules.flightography}</div> },
    { key: 'studio', label: 'The Studio', hint: 'Three sittings, and the post that traveled', icon: Camera, node: <StudioPanel user={user} nominee={nominee} settings={settings} onOpenSitting={setWizard} /> },
    { key: 'board', label: 'Bulletin Board', hint: 'Instruments, boards and bulletins', icon: LayoutGrid, node: <div className="px-3 pt-3">{boardNode}</div> },
    { key: 'account', label: 'Account', hint: 'Your card, presentation and data', icon: Settings2, node: <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-3 py-4">{accountNode}</div> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: B.cream }}>
      <AnnouncementBanner />

      {glass ? (
        <GlassConsole
          kicker="Your profile"
          panels={panels}
          openKey={openPanel}
          onOpen={setOpenPanel}
          deepLinkParam="board"
        />
      ) : (
        <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6 max-w-6xl mx-auto space-y-5">
          {/* Position 1 — locked. Identity above credential. */}
          <div data-hh-module="Identity">{identityNode}</div>

          {/* The doors, and the desk they feed — read on the desk as well as the glass. */}
          <div data-hh-module="The Door" className="overflow-hidden rounded-2xl" style={{ background: 'rgba(255,255,255,0.45)', border: `1px solid ${B.border}` }}>
            <IntentStudioPanel
              settings={settings}
              accent={accent}
              onSave={savePersonalization}
              saving={saving}
              error={saveError}
            />
            <InquiryDeskPanel user={user} accent={accent} />
          </div>

          {/* Master instrument cluster — the Bulletin Board. Houses everything below the masthead. */}
          <div data-hh-module="Bulletin Board">{boardNode}</div>

          <div data-hh-module="Presentation" className="mt-8 flex justify-end gap-4">{accountNode}</div>
        </div>
      )}

      {/* Desktop dock spacing only — the handheld body reserves its own room. */}
      <div className="hidden h-28 md:block" />

      {wizard && (
        <ProfileWizard
          user={user}
          nominee={nominee}
          openWith={wizard}
          onClose={() => setWizard(null)}
          onSaved={loadUser}
        />
      )}

      {story.viewerIdx !== null && story.groups[story.viewerIdx] && (
        <StoryViewer
          groups={story.groups}
          startGroupIdx={story.viewerIdx}
          onClose={story.closeViewer}
          viewerEmail={user?.email}
        />
      )}
      {story.creating && (
        <StoryCreate user={user} accent={accent} onCreate={story.create} onClose={story.closeCreate} />
      )}

      {presentationOpen && (
        <PresentationSettings
          settings={settings}
          accent={accent}
          onChange={saveSlideConfig}
          onClose={() => setPresentationOpen(false)}
        />
      )}
    </div>
  );
}