import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, ArrowRight, ListOrdered } from 'lucide-react';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import HomeDock from '@/components/home-v3/HomeDock';
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
import ProfileDeck from '@/components/profile-deck/ProfileDeck';
import PresentationSettings from '@/components/profile-deck/PresentationSettings';
import IdentitySlide from '@/components/profile-deck/slides/IdentitySlide';
import VerificationSlide from '@/components/profile-deck/slides/VerificationSlide';
import BlurbSlide from '@/components/profile-deck/slides/BlurbSlide';
import DocumentsSlide from '@/components/profile-deck/slides/DocumentsSlide';
import EightSlide from '@/components/profile-deck/slides/EightSlide';
import FlightographySlide from '@/components/profile-deck/slides/FlightographySlide';
import { resolveSlideOrder } from '@/components/profile-deck/slideDeckConfig';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingEightVisibility, setSavingEightVisibility] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);

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

      const nominees = await base44.entities.Nominee.filter({ nominee_email: currentUser.email }).catch(() => []);
      const nom = nominees?.[0] || null;
      setNominee(nom);

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

  useEffect(() => { loadUser(); }, [loadUser]);

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

  const slideOrder = resolveSlideOrder(settings);

  const slides = slideOrder.map((key) => {
    switch (key) {
      case 'identity':
        return {
          key, label: 'Identity', content: (
            <IdentitySlide
              user={user} nominee={nominee} accent={accent} coverKey={settings?.cover_asset_id}
              isOwner onEdit={() => setWizardOpen(true)} hasStory={story.hasStory} onAvatarTap={story.onAvatarTap}
              publicPath={publicPath}
            />
          ),
        };
      case 'verification':
        return { key, label: 'Credential', content: <VerificationSlide nominee={nominee} accent={accent} /> };
      case 'blurb':
        return {
          key, label: 'Editorial', content: (
            <BlurbSlide user={user} settings={settings} accent={accent} onUserUpdate={setUser} onSettingsUpdate={setSettings} />
          ),
        };
      case 'documents':
        return { key, label: 'Documents', content: <DocumentsSlide user={user} accent={accent} onUserUpdate={setUser} /> };
      case 'eight':
        return {
          key, label: 'The Eight', content: (
            <EightSlide rankings={top100.rankings} isOwner accent={accent} isPublic={settings?.eight_public}
              savingVisibility={savingEightVisibility} onVisibilityChange={saveEightVisibility} loading={top100.loading} />
          ),
        };
      case 'flightography':
        return {
          key, label: 'Flightography', content: (
            <FlightographySlide nominee={nominee} user={user} accent={accent} onNomineeUpdate={setNominee} onUserUpdate={setUser} />
          ),
        };
      default:
        return null;
    }
  }).filter(Boolean);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: B.navyDeep }}>
      <ProfileDeck
        slides={slides}
        settings={settings}
        accent={accent}
        isOwner
        onOpenPresentation={() => setPresentationOpen(true)}
      />

      <HomeDock />

      {wizardOpen && (
        <ProfileWizard
          user={user}
          nominee={nominee}
          onClose={() => setWizardOpen(false)}
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