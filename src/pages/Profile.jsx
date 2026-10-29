import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { BadgeCheck, DoorOpen, Loader2, Mail, Settings2 } from 'lucide-react';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import useGlass from '@/hooks/useGlass';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import PresentationSettings from '@/components/profile-deck/PresentationSettings';
import IntentStudioPanel from '@/components/profile/intent/IntentStudioPanel';
import InquiryDeskPanel from '@/components/profile/intent/InquiryDeskPanel';
import GlassConsole from '@/components/handheld/GlassConsole';
import ProfileHero from '@/components/profile/essentials/ProfileHero';
import ProfileVerification from '@/components/profile/essentials/ProfileVerification';
import ProfileDossierLeft from '@/components/profile/essentials/ProfileDossierLeft';
import ProfileDossierRight from '@/components/profile/essentials/ProfileDossierRight';
import ProfileAccountRow from '@/components/profile/essentials/ProfileAccountRow';
import { B, accentValue, accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import { preferredNominee, mergedIntoId } from '@/lib/nomineeMerge';
import { ensureFellowSettings } from '@/lib/ensureFellowSettings';

// The Fellow's own record: identity first, then the credential, then the dossier.
// Everything a profile needs to be a profile, and nothing the OS already carries.
const VERIFICATION_LABEL = {
  unverified: 'Unverified record',
  self_verified: 'Self-verified record',
  partially_verified: 'Partially verified record',
  fully_verified: 'Fully verified record',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // The Studio: null is closed; an array of sitting ids opens the wizard on those
  // sittings (an empty array walks the whole studio from the lobby).
  const [wizard, setWizard] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const glass = useGlass();

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (!currentUser?.email) return;

      // One person, one record: the copy the Fellow has claimed and verified outranks a
      // superseded duplicate for the same address, and a superseded row resolves to the
      // master it was folded into.
      const rows = await base44.entities.Nominee.filter({ nominee_email: currentUser.email }).catch(() => []);
      let nom = preferredNominee(rows);
      const masterId = mergedIntoId(nom || {});
      if (masterId) nom = (await base44.entities.Nominee.get(masterId).catch(() => nom)) || nom;
      setNominee(nom);

      const found = await base44.entities.FellowProfileSettings.filter({ fellow_email: currentUser.email }).catch(() => []);
      // The row the record is assembled from, written once for a Fellow who has never
      // had one, so first arrival is a furnished page and not a set of empty states.
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
      <div className="flex min-h-screen items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: B.copper }} />
      </div>
    );
  }

  const accent = accentValue(settings?.domain_accent);
  const verificationLabel =
    VERIFICATION_LABEL[nominee?.verified_status] || VERIFICATION_LABEL.unverified;

  const record = (
    <>
      <ProfileHero
        user={user}
        nominee={nominee}
        settings={settings}
        verificationLabel={verificationLabel}
      />
      <ProfileVerification nominee={nominee} claimStatus={nominee?.claim_status} />
      <div className="grid grid-cols-1 gap-10 px-6 pt-10 lg:grid-cols-[2fr_1fr] lg:gap-20 lg:px-40 lg:pt-[40px]">
        <ProfileDossierLeft nominee={nominee} />
        <ProfileDossierRight nominee={nominee} />
      </div>

      {/* The two member surfaces the record carries: what the Fellow is open to,
          and who has written to them. Neither is scored, ordered, or featured. */}
      <div className="px-6 lg:px-40">
        <section className="pd-sec">
          <h2 className="pd-label mb-6">Availability</h2>
          <IntentStudioPanel
            settings={settings}
            accent={accent}
            onSave={savePersonalization}
            saving={saving}
            error={saveError}
          />
        </section>
        <section className="pd-sec">
          <h2 className="pd-label mb-6">Enquiries</h2>
          <InquiryDeskPanel user={user} accent={accent} />
        </section>
      </div>
    </>
  );

  const accountRow = (
    <ProfileAccountRow
      onOpenStudio={() => setWizard([])}
      onOpenPresentation={() => setPresentationOpen(true)}
      onExport={handleExportData}
      exporting={exporting}
    />
  );

  const panels = [
    {
      key: 'record',
      label: 'Record',
      hint: 'Masthead, verification and the dossier',
      icon: BadgeCheck,
      node: record,
    },
    {
      key: 'door',
      label: 'The Door',
      hint: 'What you are open to',
      icon: DoorOpen,
      node: (
        <div className="px-3 pt-3">
          <IntentStudioPanel
            settings={settings}
            accent={accent}
            onSave={savePersonalization}
            saving={saving}
            error={saveError}
          />
        </div>
      ),
    },
    {
      key: 'desk',
      label: 'The Desk',
      hint: 'Who has written to you',
      icon: Mail,
      node: (
        <div className="px-3 pt-3">
          <InquiryDeskPanel user={user} accent={accent} />
        </div>
      ),
    },
    {
      key: 'account',
      label: 'Account',
      hint: 'Presentation and your data',
      icon: Settings2,
      node: accountRow,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: B.cream, color: B.navy }}>
      {glass ? (
        <GlassConsole
          kicker="Your record"
          panels={panels}
          openKey={openPanel}
          onOpen={setOpenPanel}
        />
      ) : (
        <>
          {record}
          {accountRow}
        </>
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