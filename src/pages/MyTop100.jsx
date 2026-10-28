import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import ListBuilderHeader from '@/components/my-top100/ListBuilderHeader';
import ListCanvas from '@/components/my-top100/ListCanvas';
import BallotStatusBanner from '@/components/my-top100/BallotStatusBanner';
import { useToast } from '@/components/ui/use-toast';
import NomineeExplorerPopover from '@/components/my-top100/NomineeExplorerPopover';
import Top100OSModal from '@/components/my-top100/Top100OSModal';
import HubListTabs from '@/components/my-top100/HubListTabs';
import BallotBuilderPanel from '@/components/my-top100/BallotBuilderPanel';
import ListCategoryTabs from '@/components/my-top100/ListCategoryTabs';
import StartHereSplit from '@/components/my-top100/StartHereSplit';
// No ballot writer here: the list is a publication, the ballot is a vote. They are
// separate acts now, so publishing this list can never cast or mirror a ranking.
import { Loader2, Pencil, Check, Rocket, LogIn, Sparkles, ListOrdered } from 'lucide-react';
import VoteSurface from '@/components/voting/VoteSurface';
import GlassVoteSurface from '@/components/my-top100/GlassVoteSurface';
import QuickAddBar from '@/components/my-top100/QuickAddBar';
import { loadNomineePool, getNomineeCategory } from '@/components/my-top100/nomineeCategory';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import { useIsMobile } from '@/hooks/use-mobile';
import useGlass from '@/hooks/useGlass';
import GlassConsole from '@/components/handheld/GlassConsole';

function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function MyTop100() {
  const [user, setUser] = useState(null);
  const [myList, setMyList] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [listName, setListName] = useState('My Top 100');
  const [isEditingName, setIsEditingName] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [season, setSeason] = useState(null);
  const [votingActive, setVotingActive] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  const [hubNominations, setHubNominations] = useState({ women: [], men: [], angels: [] });
  const [listCategory, setListCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(() => {
    // A deep link names the surface outright — the start screen's Vote now lands
    // on the ballot, not on the orientation copy in front of it.
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (['start', 'nominate', 'vote'].includes(requested)) return requested;
    try {
      const priorVisits = parseInt(localStorage.getItem('hub_visit_count') || '0', 10) || 0;
      // Engaged = already submitted at least one nomination on this device.
      const draft = JSON.parse(localStorage.getItem('hub_nominations_draft') || '{}');
      const hasSubmitted = Object.values(draft).some(
        (v) => Array.isArray(v) && v.length > 0
      );
      // Graduate to Nominate once they've completed their first session
      // (returning) or have already nominated — the orientation copy is only
      // for true first-timers.
      return priorVisits >= 1 || hasSubmitted ? 'nominate' : 'start';
    } catch {
      return 'start';
    }
  });
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [explorerProfile, setExplorerProfile] = useState(null);
  const [showOS, setShowOS] = useState(false);
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const [pool, setPool] = useState([]);
  const [seasonCategory, setSeasonCategory] = useState({});
  const [poolTotal, setPoolTotal] = useState(0);
  const [loadingPool, setLoadingPool] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  // On the glass the hub is a console: its three surfaces are the menu, and one
  // is open at a time. Null is the menu itself.
  const glass = useGlass();
  const [glassOpen, setGlassOpen] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    return ['start', 'nominate', 'vote'].includes(requested) ? requested : null;
  });

  const openExplorer = () => { setExplorerProfile(null); setExplorerOpen(true); };
  const openProfileFromList = async (item) => {
    setExplorerOpen(true);
    setExplorerProfile(null);
    try {
      const full = await base44.entities.Nominee.get(item.nominee_id);
      setExplorerProfile(full);
    } catch {
      setExplorerProfile({
        id: item.nominee_id,
        name: item.nominee_name,
        title: item.nominee_title,
        company: item.nominee_company,
        avatar_url: item.nominee_avatar,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const lists = await base44.entities.UserTop100List.filter({ user_email: currentUser.email });
        if (lists.length > 0) {
          const existing = lists[0];
          setMyList(existing);
          setRankings((existing.rankings || []).map(r => ({
            ...r,
            nomination_category: r.nomination_category || 'women',
            also_angels: !!r.also_angels,
          })));
          setListName(existing.list_name || 'My Top 100');
          setShareCode(existing.share_code || generateShareCode());
        } else {
          setShareCode(generateShareCode());
        }

        // Resolve the active voting season (the window the list stays editable in) + the Fellow's public profile id.
        // Prefer the parent group season so the ballot is recorded against the
        // combined pool (Women + Men + Angels), not a single cohort. The group
        // may still be in 'planning' while its cohorts are voting-open; in that
        // case resolve the parent from any voting-open cohort and treat voting
        // as active.
        try {
          const activeSeasons = await base44.entities.Season.filter({ status: 'voting_open' });
          let resolved = activeSeasons.find(s => s.is_group);
          if (!resolved) {
            const cohort = activeSeasons.find(s => s.parent_season_id);
            if (cohort) {
              const allSeasons = await base44.entities.Season.list('-created_date', 50);
              resolved = allSeasons.find(s => s.id === cohort.parent_season_id);
            }
          }
          setSeason(resolved || activeSeasons?.[0] || null);
          setVotingActive(activeSeasons.length > 0);
        } catch { /* season resolution optional */ }
        try {
          const myNominees = await base44.entities.Nominee.filter({ nominee_email: currentUser.email });
          setProfileId(myNominees?.[0]?.id || null);
        } catch { /* profile id optional */ }
      } catch {
        // Not logged in
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Hub nomination draft persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hub_nominations_draft');
      if (saved) { const parsed = JSON.parse(saved); delete parsed.local_legends; setHubNominations(parsed); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('hub_nominations_draft', JSON.stringify(hubNominations));
  }, [hubNominations]);

  // Shared nominee pool — loaded once and shared by the desktop intake panel
  // and the mobile quick-add sheet so the directory is never fetched twice.
  useEffect(() => {
    let active = true;
    loadNomineePool()
      .then(({ pool, seasonCategory: bySeason }) => {
        if (!active) return;
        setPool(pool);
        setSeasonCategory(bySeason || {});
        setPoolTotal(pool.length);
        setLoadingPool(false);
      })
      .catch(() => {
        if (active) setLoadingPool(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Count hub sessions per device. After a Fellow has opened the hub a few
  // times, the Nominate tab becomes the default landing — they've graduated
  // past the Start Here orientation.
  useEffect(() => {
    try {
      const c = parseInt(localStorage.getItem('hub_visit_count') || '0', 10) || 0;
      localStorage.setItem('hub_visit_count', String(c + 1));
    } catch { /* ignore */ }
  }, []);

  // Mobile quick-add → opens the shared nomination sheet from anywhere.
  const openQuickAdd = () => setMobilePopoverOpen(true);

  // Mobile submit handler — mirrors the desktop intake panel's wiring so the
  // two surfaces stay consistent. Existing nominees land on the ranked list
  // too; new ones join the review queue.
  const handleMobileSubmitted = (result) => {
    if (result.existing) {
      addExistingToHub(result.category, result.nominee, result.also_angels);
      handleAdd(result.nominee, {
        nomination_category: result.category,
        also_angels: result.also_angels,
      });
      setMobilePopoverOpen(false);
      return;
    }
    addHubNomination(result.category, result.summary);
    setMobilePopoverOpen(false);
  };

  const addHubNomination = (category, summary) =>
    setHubNominations((p) => ({ ...p, [category]: [...p[category], summary] }));
  const addExistingToHub = (category, nominee, also_angels) =>
    setHubNominations((p) => ({ ...p, [category]: [...p[category], { existing: true, nominee, also_angels }] }));
  const removeHubNomination = (category, idx) =>
    setHubNominations((p) => ({ ...p, [category]: p[category].filter((_, i) => i !== idx) }));

  // ── Ballot auto-sync window ──
  const now = new Date();
  const votingOpen = votingActive && !!season
    && (!season.voting_start || new Date(season.voting_start) <= now)
    && (!season.voting_end || new Date(season.voting_end) >= now);
  const votingClosed = !!season && (
    ['review', 'completed', 'archived'].includes(season.status) ||
    (season.voting_end && new Date(season.voting_end) < now)
  );
  // The personal list is public (shareable) once non-empty; decoupled from ballot measurement.
  const isPublished = rankings.length > 0;
  const profileUrl = profileId
    ? `${window.location.origin}/profiles/${profileId}`
    : `${window.location.origin}/profiles?user=${encodeURIComponent(user?.email || '')}`;

  const handleShare = async () => {
    const shareData = {
      title: user?.full_name ? `${user.full_name} — TOP 100 Aerospace & Aviation` : 'TOP 100 Aerospace & Aviation',
      text: `${user?.full_name ? `${user.full_name}'s ` : ''}Fellow profile on TOP 100 Aerospace & Aviation`,
      url: profileUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user dismissed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: 'Profile link copied' });
    } catch {
      toast({ title: 'Copy failed', description: `Copy this link: ${profileUrl}` });
    }
  };

  // Auto-save. No publish gate: the list persists on every change. The list is
  // the public, shareable artifact; the ballot is the measurement input and is
  // cast on the ballot surface — they are decoupled.
  const persistAndSync = useCallback(async (updatedRankings, updatedName) => {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_email: user.email,
      user_name: user.full_name,
      list_name: updatedName,
      rankings: updatedRankings.map((r, i) => ({ ...r, rank: i + 1 })),
      is_published: updatedRankings.length > 0,
      share_code: shareCode,
    };

    // Writing this list no longer casts, updates or mirrors a ballot. The Eight is a
    // public, ordinal publication; the ballot is a private vote, and deriving one
    // from the other is what let a reader reconstruct a Fellow's ranking from their
    // profile. Ballots are cast on the ballot surface alone.
    try {
      if (myList?.id) {
        await base44.entities.UserTop100List.update(myList.id, payload);
      } else {
        const created = await base44.entities.UserTop100List.create(payload);
        setMyList(created);
      }
      setSaveError('');
    } catch (e) {
      // A failed write is reported, never swallowed.
      setSaveError(e?.message
        ? `Your list could not be saved — ${e.message}`
        : 'Your list could not be saved.');
    }

    setSaving(false);
  }, [user, myList, shareCode, season, votingOpen]);

  // Debounced auto-save
  const scheduleSave = useCallback((updatedRankings, updatedName) => {
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(() => {
      persistAndSync(updatedRankings, updatedName);
    }, 1500);
    setSaveTimer(timer);
  }, [saveTimer, persistAndSync]);

  const handleReorder = (newFilteredOrder) => {
    if (votingClosed) return;
    let newOrder = newFilteredOrder;
    if (listCategory !== 'all') {
      const filteredIds = new Set(newFilteredOrder.map(r => r.nominee_id));
      let fi = 0;
      newOrder = rankings.map(item => filteredIds.has(item.nominee_id) ? newFilteredOrder[fi++] : item);
    }
    setRankings(newOrder);
    scheduleSave(newOrder, listName);
  };

  const handleAdd = (nominee, meta = {}) => {
    if (votingClosed) return;
    if (rankings.length >= 100) return;
    if (rankings.find(r => r.nominee_id === nominee.id)) return;

    const newItem = {
      rank: rankings.length + 1,
      nominee_id: nominee.id,
      nominee_name: nominee.name,
      nominee_title: nominee.title || nominee.professional_role || '',
      nominee_company: nominee.company || nominee.organization || '',
      nominee_avatar: nominee.avatar_url || nominee.photo_url || '',
      category: nominee.discipline || 'general',
      nomination_category: meta.nomination_category || 'women',
      also_angels: !!meta.also_angels,
    };
    const newRankings = [...rankings, newItem];
    setRankings(newRankings);
    scheduleSave(newRankings, listName);
  };

  const handleRemove = (nomineeId) => {
    if (votingClosed) return;
    const newRankings = rankings.filter(r => r.nominee_id !== nomineeId);
    setRankings(newRankings);
    scheduleSave(newRankings, listName);
  };

  // Publish & Save Draft removed — the list persists via persistAndSync
  // above, and the Share CTA on the status band replaces the publish button.

  const addedIds = new Set(rankings.map(r => r.nominee_id));
  const totalNominations = Object.values(hubNominations).reduce((sum, arr) => sum + arr.length, 0);
  const womenRankings = rankings.filter(r => r.nomination_category === 'women');
  const menRankings = rankings.filter(r => r.nomination_category === 'men');
  const angelsRankings = rankings.filter(r => r.nomination_category === 'angels' || r.also_angels);
  const visibleRankings = listCategory === 'all' ? rankings
    : listCategory === 'women' ? womenRankings
    : listCategory === 'men' ? menRankings
    : angelsRankings;
  const listCategoryCounts = { all: rankings.length, women: womenRankings.length, men: menRankings.length, angels: angelsRankings.length };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: brand.cream }}>
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          <Rocket className="w-7 h-7 text-white" />
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          My Top 100
        </h1>
        <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
          Sign in to build your personal ranked list of the most impactful aerospace & aviation leaders.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          <LogIn className="w-4 h-4" />
          Sign In to Continue
        </button>
      </div>
    );
  }

  // Shared editable name block (reused in both layouts)
  const ListNameEditor = (
    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
      {isEditingName ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            autoFocus
            value={listName}
            onChange={e => setListName(e.target.value)}
            onBlur={() => { setIsEditingName(false); scheduleSave(rankings, listName); }}
            onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
            className="flex-1 text-xl font-bold bg-transparent outline-none border-b-2 pb-0.5"
            style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif", borderColor: brand.gold }}
            maxLength={60}
          />
          <button onClick={() => setIsEditingName(false)}>
            <Check className="w-4 h-4" style={{ color: brand.gold }} />
          </button>
        </div>
      ) : (
        <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setIsEditingName(true)}>
          <h1 className="text-xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {listName}
          </h1>
          <Pencil className="w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} />
        </button>
      )}
      {saving && (
        <span className="text-[10px] flex items-center gap-1" style={{ color: `${brand.navy}40` }}>
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </span>
      )}
    </div>
  );

  // Opening a surface: the tab the desk reads, and the panel the console holds.
  const openTab = (key) => {
    setActiveTab(key);
    if (glass) setGlassOpen(key);
  };

  // The ranked list — the desk's right column and the glass's My List are the
  // same artifact, so it is written once.
  const listBlock = (
    <>
      {ListNameEditor}
      <BallotStatusBanner
        rankings={rankings}
        votingOpen={votingOpen}
        votingEndDate={season?.voting_end}
        saving={saving}
        errorMessage={saveError}
        onShare={handleShare}
      />
      <ListCategoryTabs activeTab={listCategory} onTabChange={setListCategory} counts={listCategoryCounts} />
      <ListCanvas
        rankings={visibleRankings}
        totalCount={rankings.length}
        onReorder={handleReorder}
        readOnly={votingClosed}
        onRemove={handleRemove}
        onAddMore={openExplorer}
        onAdd={handleAdd}
        addedIds={addedIds}
        onViewProfile={openProfileFromList}
      />
    </>
  );

  // The organizing column of the ballot: the guide to the order, where the ballot stands, and
  // the profiles drawn from this Fellow's own judging. Every act in it is theirs — a
  // suggestion is opened, followed, or added by hand, never placed for them.
  const builderPanel = (
    <BallotBuilderPanel
      user={user}
      pool={pool}
      loadingPool={loadingPool}
      addedIds={addedIds}
      rankingsCount={rankings.length}
      ballotMinimum={1}
      onAdd={(person) => handleAdd(person, {
        nomination_category: getNomineeCategory(person, seasonCategory) || 'women',
      })}
      onViewProfile={(person) => { setExplorerProfile(person); setExplorerOpen(true); }}
      onOpenExplorer={openExplorer}
      onNominate={() => setMobilePopoverOpen(true)}
      onOpenVote={() => openTab('vote')}
    />
  );

  const startNode = (
    <div className="flex-1 overflow-y-auto">
      <StartHereSplit
        user={user}
        hasExisting={totalNominations > 0 || rankings.length > 0}
        onBegin={() => openTab('nominate')}
        onVote={() => openTab('vote')}
        onSaved={(c) => setUser((u) => ({ ...u, aerospace_connection: c }))}
        onOpenOS={() => setShowOS(true)}
      />
    </div>
  );

  // The ballot is open to the whole committee now, not to admins alone: the surface
  // resolves the counting cohort and carries the ladder beside the weighing.
  const chamberNode = <VoteSurface user={user} />;

  const voteNode = <div className="flex-1 flex flex-col overflow-hidden">{chamberNode}</div>;

  // On the glass the ballot is read the way the title screen is read: the surfaces the
  // vote tab reaches are drawn as keys and walked by the wheel — the ballot itself,
  // the window it counts in, and the chamber — and B unwinds them a level at a time.
  const glassVoteNode = (
    <GlassVoteSurface
      user={user}
      status={{
        open: votingOpen,
        closed: votingClosed,
        endLabel: season?.voting_end
          ? new Date(season.voting_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : null,
        ranked: rankings.length,
        minimum: 1,
      }}
      ballotNode={<div className="px-3 pb-28">{listBlock}</div>}
      chamberNode={chamberNode}
      onExit={() => setGlassOpen(null)}
    />
  );

  // The three surfaces the console holds. The desk reads them as tabs; the glass
  // reads them as the cartridge menu.
  const consolePanels = [
    { key: 'start', label: 'Start Here', hint: 'Why this is here, and where to begin', icon: Rocket, node: startNode },
    { key: 'nominate', label: 'Finalize Your TOP 100', hint: `${rankings.length}/100 ranked`, icon: Sparkles, node: <div className="px-3 pb-3">{builderPanel}<div className="mt-3">{listBlock}</div></div> },
    { key: 'vote', label: 'Vote', hint: votingOpen ? 'Open — cast your ballot' : 'Your ranked ballot', icon: ListOrdered, node: glassVoteNode },
  ];

  const shownTab = glass ? glassOpen : activeTab;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: brand.cream }}>
      {glass ? (
        <GlassConsole
          kicker="Selection Committee"
          panels={consolePanels}
          openKey={glassOpen}
          onOpen={(key) => {
            setGlassOpen(key);
            if (key) setActiveTab(key);
          }}
          deepLinkParam="tab"
        />
      ) : (
        <>
      <ListBuilderHeader
        listName={listName}
        count={rankings.length}
        isPublished={isPublished}
        saving={saving}
        onShare={handleShare}
      />

      <HubListTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        nominationCount={totalNominations}
        listCount={rankings.length}
      />

      {/* ── START HERE TAB ── */}
      {activeTab === 'start' && startNode}

      {/* ── FINALIZE BALLOT TAB (the organizing column, then the order itself) ── */}
      {activeTab === 'nominate' && (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 pb-28 lg:px-6 lg:pb-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
              <div className="lg:sticky lg:top-[68px] lg:w-[350px] lg:shrink-0">
                {builderPanel}
              </div>
              <div className="min-w-0 flex-1 lg:max-w-2xl">
                {listBlock}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VOTE TAB (anchor selection — admins only; teaser for everyone else) ── */}
      {activeTab === 'vote' && voteNode}
        </>
      )}

      <NomineeExplorerPopover
        isOpen={explorerOpen}
        onClose={() => { setExplorerOpen(false); setExplorerProfile(null); }}
        addedIds={addedIds}
        onAdd={handleAdd}
        initialNominee={explorerProfile}
        nominator={user}
      />

      <Top100OSModal isOpen={showOS} onClose={() => setShowOS(false)} />

      <QuickAddBar
        onClick={openQuickAdd}
        hidden={!isMobile || shownTab !== 'nominate' || mobilePopoverOpen || explorerOpen}
      />
      {/* The intake is one door on both machines: the organizing column opens it, and so
          does the phone's quick-add bar. */}
      {mobilePopoverOpen && (
        <HubNominationPopover
          nominees={pool}
          nominator={user}
          initialNominee={null}
          onClose={() => setMobilePopoverOpen(false)}
          onSubmitted={handleMobileSubmitted}
        />
      )}
    </div>
  );
}