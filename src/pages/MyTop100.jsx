import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import CommitteeMasthead from '@/components/my-top100/CommitteeMasthead';
import ListCanvas from '@/components/my-top100/ListCanvas';
import ManifestMasthead from '@/components/my-top100/ManifestMasthead';
import BallotStatusBanner from '@/components/my-top100/BallotStatusBanner';
import { useToast } from '@/components/ui/use-toast';
import NomineeExplorerPopover from '@/components/my-top100/NomineeExplorerPopover';
import Top100OSModal from '@/components/my-top100/Top100OSModal';
import HubListTabs from '@/components/my-top100/HubListTabs';
import BallotBuilderPanel from '@/components/my-top100/BallotBuilderPanel';
import ManifestToCrosscheck from '@/components/my-top100/ManifestToCrosscheck';
import ListCategoryTabs from '@/components/my-top100/ListCategoryTabs';
import PersonalStandings from '@/components/my-top100/PersonalStandings';
import PreFlightSurface from '@/components/my-top100/PreFlightSurface';
// No ballot writer here: the list is a publication, the ballot is a vote. They are
// separate acts now, so publishing this list can never cast or mirror a ranking.
import { Loader2, Rocket, LogIn, Sparkles, ListOrdered, Route } from 'lucide-react';
import FlightPlan from '@/components/flight-plan/FlightPlan';
import useAnalystOffice from '@/components/voting/useAnalystOffice';
import useFlightUnveiling from '@/components/flight-plan/useFlightUnveiling';
import AnalystPromotion from '@/components/voting/AnalystPromotion';
import VoteSurface from '@/components/voting/VoteSurface';
import GateExportKey from '@/components/vote/GateExportKey';
import GlassVoteSurface from '@/components/my-top100/GlassVoteSurface';
import GlassNominateSurface from '@/components/my-top100/GlassNominateSurface';
import QuickAddBar from '@/components/my-top100/QuickAddBar';
import { loadNomineePool, getNomineeCategory } from '@/components/my-top100/nomineeCategory';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import { useIsMobile } from '@/hooks/use-mobile';
import useGlass from '@/hooks/useGlass';
import GlassConsole from '@/components/handheld/GlassConsole';
import MissionBriefing from '@/components/mission/MissionBriefing';
import useMissionBriefing from '@/components/mission/useMissionBriefing';

function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// The surface the committee was last left on, held for the session rather than the
// device: a Fellow's place in their own work, not a setting.
const COMMITTEE_TAB_KEY = 'top100_committee_tab';

// The surfaces of the committee, in the order the keys are drawn: Pre-Flight (the letter and
// the check-in), the Manifest, the Crosscheck, then the Flight Plan — the field an Analyst
// reads the rest from, once the first set has made them one.
const COMMITTEE_TABS = ['start', 'nominate', 'vote', 'flight'];

// The Invitation was a key of its own until it was folded into Pre-Flight as the first of its
// two sub-keys, so an address — or a note left in the session — that still names it opens
// Pre-Flight rather than falling through to the Manifest.
const normalizeTab = (key) => (key === 'invitation' ? 'start' : key);

// `initialTab` is for a door that already knows which surface it opens: /vote is sent to a
// Fellow in a post or a message and promises the ballot, so it mounts the committee on the
// Crosscheck rather than drawing a second frame around the same ballot. A `?tab=` in the
// address still outranks it, and so does the session's own note.
export default function MyTop100({ initialTab = null } = {}) {
  const [user, setUser] = useState(null);
  const [myList, setMyList] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [listName, setListName] = useState('My Top 100');
  const [isEditingName, setIsEditingName] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [season, setSeason] = useState(null);
  const [seasonIds, setSeasonIds] = useState([]);
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
    const requested = normalizeTab(new URLSearchParams(window.location.search).get('tab'));
    if (COMMITTEE_TABS.includes(requested)) return requested;
    // The door that knows where it goes stands next in line.
    if (COMMITTEE_TABS.includes(initialTab)) return initialTab;
    // Where the session was left, this morning or an hour ago: a Fellow working the
    // committee comes back to the surface they were on rather than being walked back to
    // the Manifest every time. The session's own note, so tomorrow opens afresh.
    try {
      const held = normalizeTab(sessionStorage.getItem(COMMITTEE_TAB_KEY));
      if (COMMITTEE_TABS.includes(held)) return held;
    } catch { /* nothing held */ }
    // Everyone opens on the Manifest, however new they are: the order is where ranked
    // choice is learned, and the Crosscheck only means anything once there is an order to
    // weigh. Pre-Flight is one key away, and so is the letter.
    return 'nominate';
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
  // The office the Fellow holds. An Associate Analyst has not been graduated into the desk
  // that reads the field from, so the Flight Plan stays shut — and off the keys — until the
  // standing says otherwise.
  const [officeRevision, setOfficeRevision] = useState(0);
  const office = useAnalystOffice(user, officeRevision);
  // The desk the office unlocks is struck until it has been opened once.
  const unveiling = useFlightUnveiling({
    email: user?.email,
    status: office.status,
    isAnalyst: office.isAnalyst,
  });
  // On the glass the hub is a console: its three surfaces are the menu, and one
  // is open at a time. Null is the menu itself.
  const glass = useGlass();
  const [glassOpen, setGlassOpen] = useState(() => {
    const requested = normalizeTab(new URLSearchParams(window.location.search).get('tab'));
    if (COMMITTEE_TABS.includes(requested)) return requested;
    return COMMITTEE_TABS.includes(initialTab) ? initialTab : null;
  });
  // The briefing is read once, and it belongs to nominating: it opens the first time a
  // Fellow stands on the Nominate surface, and never again after that — not on a reload,
  // not on the Vote surface. Afterwards it is one press away on the ballot's own key.
  const surfaceTab = glass ? glassOpen : activeTab;
  const briefing = useMissionBriefing(
    user,
    !loading && !!user?.email && surfaceTab === 'nominate',
  );

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

        // A door that promises the Crosscheck still opens on the Manifest for an Analyst who
        // has not built one: the order is the concept the weighing is learned on, so a new
        // Analyst is set down where they can build it rather than in front of a ballot they
        // have nothing to weigh yet.
        const built = (lists[0]?.rankings || []).length;
        if (initialTab === 'vote' && built === 0) {
          setActiveTab('nominate');
          setGlassOpen((open) => (open === 'vote' ? 'nominate' : open));
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
          // Ballots are stamped with a cohort, so the personal column is scoped to the
          // group season and every open cohort under it.
          setSeasonIds(
            (resolved ? [resolved.id] : []).concat(activeSeasons.map((s) => s.id)),
          );
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

  // The surface the committee was left on, kept for the life of the session. The deep
  // link still wins — an address that names a tab is an instruction, not a memory.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab')) return;
    try { sessionStorage.setItem(COMMITTEE_TAB_KEY, activeTab); } catch { /* ignore */ }
  }, [activeTab]);

  // A deep link, or a tab remembered from an earlier session, may name a surface the Fellow
  // has not been graduated into. Once the standing is read, an Associate Analyst is set down
  // on the Manifest rather than left in front of a desk that is not theirs yet.
  useEffect(() => {
    if (office.status !== 'ready' || office.isAnalyst) return;
    setActiveTab((tab) => (tab === 'flight' ? 'nominate' : tab));
    setGlassOpen((open) => (open === 'flight' ? 'nominate' : open));
  }, [office.status, office.isAnalyst]);

  // The key stops glowing the moment the desk is opened: the halo always means one thing —
  // a surface that has not been read yet.
  useEffect(() => {
    if (activeTab === 'flight' || glassOpen === 'flight') unveiling.markSeen();
  }, [activeTab, glassOpen, unveiling.markSeen]);

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

  // A record's cohort belongs to the record, not to the moment it was added. An entry
  // written before that was so carries a stale label and reads under the wrong view —
  // a woman listed under the men. Once the pool is in hand, any stored category that
  // the record's own season contradicts is corrected in place and saved, so the
  // Manifest reads every name under the cohort its record actually belongs to. Only the
  // two views are aligned: a record filed as an angel keeps its label, Angels being no
  // view of this ballot.
  useEffect(() => {
    if (loadingPool || !user || !pool.length || !rankings.length) return;
    const byId = new Map(pool.map(n => [n.id, n]));
    let changed = false;
    const aligned = rankings.map(r => {
      const resolved = getNomineeCategory(byId.get(r.nominee_id), seasonCategory);
      if (resolved !== 'women' && resolved !== 'men') return r;
      if (resolved === r.nomination_category) return r;
      changed = true;
      return { ...r, nomination_category: resolved };
    });
    if (!changed) return;
    setRankings(aligned);
    scheduleSave(aligned, listName);
  }, [loadingPool, user, pool, seasonCategory, rankings, listName, scheduleSave]);

  // The glass always arranges the whole ballot — the cohorts are counted off that one
  // order, so there is no filtered subset to merge it back into.
  const handleReorderAll = (newOrder) => {
    if (votingClosed) return;
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
  // There is one TOP 100, and Women and Men are readings of it: the same ballot, filtered,
  // each record keeping the place it holds on the whole. Neither view is a list of its own,
  // so neither is reordered or saved on its own.
  const womenRankings = rankings.filter(r => r.nomination_category === 'women');
  const menRankings = rankings.filter(r => r.nomination_category === 'men');
  const filtered = listCategory === 'women' ? womenRankings
    : listCategory === 'men' ? menRankings
    : rankings;
  const visibleRankings = filtered.map(r => ({
    ...r,
    list_place: rankings.findIndex(x => x.nominee_id === r.nominee_id) + 1,
  }));
  const listCategoryCounts = { all: rankings.length, women: womenRankings.length, men: menRankings.length };

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
          The Selection Committee
        </h1>
        <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: `${brand.navy}60` }}>
          Sign in to serve as an Analyst: build your Manifest — your own TOP 100, in order — and measure the field in the Crosscheck.
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
  // Opening a surface: the tab the desk reads, and the panel the console holds.
  const openTab = (key) => {
    setActiveTab(key);
    if (glass) setGlassOpen(key);
  };

  // The ranked list — the desk's right column and the glass's My List are the
  // same artifact, so it is written once.
  const listBlock = (
    <>
      <ManifestMasthead
        listName={listName}
        editing={isEditingName}
        onChange={setListName}
        onBeginEdit={() => setIsEditingName(true)}
        onEndEdit={() => {
          setIsEditingName(false);
          scheduleSave(rankings, listName);
        }}
        saving={saving}
        count={rankings.length}
        note="Who would you choose?"
      />
      <BallotStatusBanner
        rankings={rankings}
        votingOpen={votingOpen}
        votingEndDate={season?.voting_end}
        saving={saving}
        errorMessage={saveError}
        onShare={handleShare}
      />
      <ListCategoryTabs activeTab={listCategory} onTabChange={setListCategory} counts={listCategoryCounts} />
      {/* The Fellow's own Crosscheck standings read as a tab of the Manifest, so the field
          their own judgements have carried sits beside the order they are setting rather
          than only in the column beside it. */}
      {listCategory === 'crosscheck' ? (
        <PersonalStandings
          className="mt-3"
          user={user}
          pool={pool}
          loadingPool={loadingPool}
          addedIds={addedIds}
          seasonIds={seasonIds}
          onAdd={(person) => handleAdd(person, {
            nomination_category: getNomineeCategory(person, seasonCategory) || 'women',
          })}
          onViewProfile={openProfileFromList}
          onOpenVote={() => openTab('vote')}
        />
      ) : (
      <ListCanvas
        rankings={visibleRankings}
        totalCount={rankings.length}
        onReorder={handleReorderAll}
        readOnly={votingClosed || listCategory !== 'all'}
        onRemove={handleRemove}
        onAddMore={openExplorer}
        onAdd={handleAdd}
        addedIds={addedIds}
        onViewProfile={openProfileFromList}
        emptyTitle={listCategory === 'men' ? 'No men listed yet' : 'No women listed yet'}
        emptyNote="This is a view of your TOP 100. Nominate from All; this view follows the same order."
      />
      )}
    </>
  );

  // The organizing column of the ballot: the guide to the order, where the ballot stands, and
  // the profiles drawn from this Fellow's own judging. Every act in it is theirs — a
  // suggestion is opened, followed, or added by hand, never placed for them.
  const builderPanel = (
    <BallotBuilderPanel
      user={user}
      pool={pool}
      seasonIds={seasonIds}
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
      onOpenBriefing={() => briefing.setOpen(true)}
    />
  );

  // The step past the order, held at the right margin while the window is open. It states
  // itself only once there are two names to weigh; the shut window closes it.
  const crosscheckNode = !votingClosed ? (
    <ManifestToCrosscheck count={rankings.length} onOpenVote={() => openTab('vote')} />
  ) : null;

  // Pre-Flight: the letter that convened the committee and the check-in that answers it,
  // read as two keys on one desk. The surface owns the sub-key, so accepting the letter
  // turns to the Boarding Pass rather than leaving the tab. The operator can still take the
  // letter away as a file.
  const preflightNode = (
    <PreFlightSurface
      user={user}
      hasExisting={totalNominations > 0 || rankings.length > 0}
      onBegin={() => openTab('nominate')}
      onVote={() => openTab('vote')}
      onOpenOS={() => setShowOS(true)}
      adminKey={user?.role === 'admin' ? (
        <div className="shrink-0 border-b border-editorial-copper/30 bg-editorial-cream px-4 py-2">
          <GateExportKey />
        </div>
      ) : null}
    />
  );

  // The ballot is open to the whole committee now, not to admins alone: the surface
  // resolves the counting cohort and carries the ladder beside the weighing.
  const chamberNode = <VoteSurface user={user} onSetRecorded={() => setOfficeRevision((n) => n + 1)} />;

  const voteNode = <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{chamberNode}</div>;

  // The Flight Plan: the Analyst's own desk rather than the field's. It reads standing from
  // the contribution record and files the specialty the rest of the platform steers by.
  const flightNode = <FlightPlan user={user} onOpenVote={() => openTab('vote')} />;

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

  // The nominating surface on the glass is built for the glass: one objective at the head,
  // the ballot under the thumb, and the intake behind a single copper key rather than a
  // bar across the bottom of the picture.
  const glassNominateNode = (
    <GlassNominateSurface
      rankings={rankings}
      totalCount={rankings.length}
      counts={listCategoryCounts}
      readOnly={votingClosed}
      pool={pool}
      seasonCategory={seasonCategory}
      addedIds={addedIds}
      loadingPool={loadingPool}
      onReorder={handleReorderAll}
      onRemove={handleRemove}
      onView={openProfileFromList}
      onNominate={openQuickAdd}
      onAdd={(person) => handleAdd(person, {
        nomination_category: getNomineeCategory(person, seasonCategory) || 'women',
      })}
      onBriefing={() => briefing.setOpen(true)}
    />
  );

  // The three surfaces the console holds. The desk reads them as tabs; the glass
  // reads them as the cartridge menu.
  const consolePanels = [
    { key: 'start', label: 'Pre-Flight', hint: 'The letter, and your credentials', icon: Rocket, node: preflightNode },
    { key: 'nominate', label: 'Manifest', hint: `${rankings.length}/100 on the Manifest`, icon: Sparkles, node: glassNominateNode },
    { key: 'vote', label: 'Crosscheck', hint: votingOpen ? 'Open — begin your analysis' : 'The analysis, when the window opens', icon: ListOrdered, node: glassVoteNode },
    ...(office.isAnalyst
      ? [{
          key: 'flight',
          label: 'Flight Plan',
          hint: unveiling.glowing
            ? 'Newly unlocked — the field you read the industry from'
            : 'The field you read the industry from',
          icon: Route,
          node: <div className="px-3 pb-28">{flightNode}</div>,
        }]
      : []),
  ];

  const shownTab = glass ? glassOpen : activeTab;

  return (
    <div
      className={`min-h-screen flex flex-col relative ${!glass && activeTab === 'vote' ? 'imac-fit' : ''}`}
      style={{ background: brand.cream }}
    >
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
      <CommitteeMasthead
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
        showFlightPlan={office.isAnalyst}
        glowTab={unveiling.glowing ? 'flight' : null}
      />

      {/* ── PRE-FLIGHT — the letter that convened the committee, and the check-in ── */}
      {activeTab === 'start' && preflightNode}

      {/* ── THE MANIFEST (the guide at the margin, the publication itself on the page) ── */}
      {activeTab === 'nominate' && (
        <div className="flex-1 overflow-y-auto bg-editorial-sand/45">
          <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 lg:px-6 lg:pb-12 lg:pt-7">
            {/* Three columns on a desk: the guide at the left margin, the publication on the
                page, and the next step standing at the right margin rather than trailing the
                list. On a phone the guide and the next step stay together at the head, so the
                way on is never a scroll past a hundred names. */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_248px] lg:items-start lg:gap-8">
              <aside className="border-t-2 border-editorial-copper pt-4 lg:sticky lg:top-[64px]">
                {builderPanel}
                <div className="lg:hidden">{crosscheckNode}</div>
              </aside>
              <div className="min-w-0 border border-editorial-copper/25 bg-editorial-cream px-5 py-6 lg:px-7 lg:py-7">
                {listBlock}
              </div>
              <aside className="hidden lg:sticky lg:top-[64px] lg:block">
                {crosscheckNode || (
                  <p className="border-t-2 border-editorial-copper pt-3.5 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                    Next · The Crosscheck
                  </p>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* ── VOTE TAB (anchor selection — admins only; teaser for everyone else) ── */}
      {activeTab === 'vote' && voteNode}

      {/* ── FLIGHT PLAN — the specialty an Analyst reads the field from ── */}
      {activeTab === 'flight' && office.isAnalyst && (
        <div className="flex-1 overflow-y-auto bg-editorial-sand/45">{flightNode}</div>
      )}
        </>
      )}

      {/* The graduation, announced once: the thirtieth set opens the desk. It waits while the
          ballot holds the glass — the ballot names the office on the set that earns it, and the
          desk hands over the key when the Fellow is back at it. */}
      <AnalystPromotion
        office={office}
        email={user?.email}
        name={user?.full_name}
        hold={activeTab === 'vote' || glassOpen === 'vote'}
        onOpenFlight={() => openTab('flight')}
      />

      <NomineeExplorerPopover
        isOpen={explorerOpen}
        onClose={() => { setExplorerOpen(false); setExplorerProfile(null); }}
        addedIds={addedIds}
        onAdd={handleAdd}
        initialNominee={explorerProfile}
        nominator={user}
      />

      <Top100OSModal isOpen={showOS} onClose={() => setShowOS(false)} />

      {/* The briefing the hub opens belongs to the surface it opens on: the ballot's
          ladder when the committee is standing on Vote, the field's when it is nominating. */}
      <MissionBriefing
        open={briefing.open}
        onOpenChange={(next) => (next ? briefing.setOpen(true) : briefing.close())}
        section={shownTab === 'nominate' ? 'nominate' : 'vote'}
      />

      <QuickAddBar
        onClick={openQuickAdd}
        hidden={!isMobile || glass || shownTab !== 'nominate' || mobilePopoverOpen || explorerOpen}
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