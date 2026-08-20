import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import HomeDock from '@/components/home-v3/HomeDock';
import ShareableProfileCard from '@/components/profile/ShareableProfileCard';
import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';
import ResearchStatsCard from '@/components/profile/ResearchStatsCard';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import FellowIdentityHeader from '@/components/fellow-home/FellowIdentityHeader';
import TheEight from '@/components/fellow-home/TheEight';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';
import PersonalizationBar from '@/components/fellow-home/PersonalizationBar';
import ReturnState from '@/components/fellow-home/ReturnState';
import { B, accentValue, orderedModules } from '@/components/fellow-home/fellowHomeConfig';

export default function FellowHome() {
  const viewedEmail = new URLSearchParams(window.location.search).get('user');

  const [me, setMe] = useState(null);
  const [owner, setOwner] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [appearances, setAppearances] = useState(0);
  const [newSince, setNewSince] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = !!me && (!viewedEmail || viewedEmail === me.email);
  const ownerEmail = isOwner ? me?.email : viewedEmail;

  const load = useCallback(async () => {
    const currentUser = await base44.auth.me().catch(() => null);
    setMe(currentUser);
    const email = (!viewedEmail || viewedEmail === currentUser?.email) ? currentUser?.email : viewedEmail;
    if (!email) { setLoading(false); return; }

    const self = email === currentUser?.email;
    let ownerRecord = self ? currentUser : null;
    if (!self) {
      const found = await base44.entities.User.filter({ email }).catch(() => []);
      ownerRecord = found?.[0] || null;
    }

    const nominees = await base44.entities.Nominee.filter({ nominee_email: email }).catch(() => []);
    const nom = nominees?.[0] || null;
    setNominee(nom);
    setOwner(ownerRecord || { email, full_name: nom?.name, avatar_url: nom?.avatar_url, six_word_story: nom?.six_word_story, headline: nom?.title });

    const lists = await base44.entities.UserTop100List.filter({ user_email: email }, '-updated_date', 1).catch(() => []);
    const ranks = lists?.[0]?.rankings || [];
    setRankings(ranks);

    const wall = await base44.entities.Endorsement.filter({ nominee_email: email }, '-created_date', 50).catch(() => []);
    setEndorsements(wall || []);

    if (self) {
      const lastSeen = currentUser?.profile_last_seen ? new Date(currentUser.profile_last_seen) : null;
      setNewSince(lastSeen ? (wall || []).filter((e) => new Date(e.created_date) > lastSeen).length : 0);

      if (nom?.id) {
        const others = await base44.entities.UserTop100List.list('-updated_date', 200).catch(() => []);
        setAppearances(
          (others || []).filter(
            (l) => l.user_email !== email && (l.rankings || []).slice(0, 8).some((r) => r.nominee_id === nom.id)
          ).length
        );
      }
      base44.auth.updateMe({ profile_last_seen: new Date().toISOString() }).catch(() => {});
    }

    setLoading(false);
  }, [viewedEmail]);

  useEffect(() => { load(); }, [load]);

  // Live wall updates while the Fellow is on the page
  useEffect(() => {
    if (!ownerEmail) return;
    return base44.entities.Endorsement.subscribe((event) => {
      if (event?.data?.nominee_email !== ownerEmail) return;
      setEndorsements((prev) => {
        const rest = prev.filter((e) => e.id !== event.data.id);
        return event.type === 'delete' ? rest : [event.data, ...rest];
      });
    });
  }, [ownerEmail]);

  const accent = accentValue(owner?.accent_color);
  const order = orderedModules(owner?.module_order);

  const savePersonalization = async (patch) => {
    setOwner((o) => ({ ...o, ...patch }));
    await base44.auth.updateMe(patch);
  };

  const submitEndorsement = async (body) => {
    await base44.entities.Endorsement.create({
      nominee_id: nominee?.id || owner?.id || ownerEmail,
      nominee_email: ownerEmail,
      endorser_email: me.email,
      kind: 'authored',
      body,
      author_name: me.full_name || me.email,
      author_avatar_url: me.avatar_url,
      author_headline: me.headline,
      moderation_status: 'pending',
    });
    const wall = await base44.entities.Endorsement.filter({ nominee_email: ownerEmail }, '-created_date', 50);
    setEndorsements(wall || []);
  };

  const approveEndorsement = async (id) => {
    await base44.entities.Endorsement.update(id, { moderation_status: 'approved' });
    setEndorsements((prev) => prev.map((e) => (e.id === id ? { ...e, moderation_status: 'approved' } : e)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: B.gold }} />
      </div>
    );
  }

  const modules = {
    eight: <TheEight key="eight" rankings={rankings} isOwner={isOwner} accent={accent} />,
    wall: (
      <EndorsementWall
        key="wall"
        entries={endorsements}
        isOwner={isOwner}
        canWrite={!!me && !isOwner}
        isAdmin={me?.role === 'admin'}
        accent={accent}
        onSubmit={submitEndorsement}
        onApprove={approveEndorsement}
      />
    ),
    record: (
      <div key="record" className="space-y-5">
        <ResearchStatsCard nominee={nominee} user={isOwner ? me : owner} onNomineeUpdate={setNominee} onUserUpdate={setOwner} />
        {nominee && (
          <>
            <NomineeCareerHistorySection nominee={nominee} />
            <NomineeContributionsSection nomineeId={nominee.id} />
            <NomineeNewsSection nomineeId={nominee.id} />
          </>
        )}
      </div>
    ),
    card: <ShareableProfileCard key="card" user={isOwner ? me : owner} nominee={nominee} onUserUpdate={setMe} />,
  };

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: B.cream }}>
      <div className="px-3 md:px-6 py-4 md:py-7 max-w-5xl mx-auto space-y-5">
        <FellowIdentityHeader
          user={isOwner ? me : owner}
          nominee={nominee}
          accent={accent}
          isOwner={isOwner}
          onEditIdentity={() => setWizardOpen(true)}
        />

        {isOwner && (
          <ReturnState
            newEndorsements={newSince}
            appearances={appearances}
            emptySlots={8 - Math.min(8, rankings.length)}
            accent={accent}
          />
        )}

        {isOwner && (
          <div className="flex justify-end">
            <PersonalizationBar user={me} order={order} accent={accent} onChange={savePersonalization} />
          </div>
        )}

        {order.map((key) => modules[key])}
      </div>

      <div className="h-28" />
      <HomeDock />

      {wizardOpen && (
        <ProfileWizard
          user={me}
          nominee={nominee}
          onClose={() => setWizardOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}