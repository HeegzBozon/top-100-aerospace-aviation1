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
import NominateIntakePanel from '@/components/my-top100/NominateIntakePanel';
import HubListTabs from '@/components/my-top100/HubListTabs';
import ListCategoryTabs from '@/components/my-top100/ListCategoryTabs';
import StartHereSplit from '@/components/my-top100/StartHereSplit';
import { saveRankedVote } from '@/functions/saveRankedVote';
import { Loader2, Pencil, Check, Rocket, LogIn } from 'lucide-react';
import AnchorVoting from '@/components/voting/AnchorVoting';
import VoteComingSoon from '@/components/my-top100/VoteComingSoon';
import NominateViewToggle from '@/components/my-top100/NominateViewToggle';
import QuickAddBar from '@/components/my-top100/QuickAddBar';
import MobileNominateView from '@/components/my-top100/MobileNominateView';
import ContextualTip from '@/components/my-top100/ContextualTip';
import { loadNomineePool } from '@/components/my-top100/nomineeCategory';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [profileId, setProfileId] = useState(null);
  const [syncError, setSyncError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  const [hubNominations, setHubNominations] = useState({ women: [], men: [], angels: [] });
  const [listCategory, setListCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const c = parseInt(localStorage.getItem('hub_visit_count') || '0', 10) || 0;
      return c >= 2 ? 'nominate' : 'start';
    } catch {
      return 'start';
    }
  });
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [explorerProfile, setExplorerProfile] = useState(null);
  const [showOS, setShowOS] = useState(false);
  const [nominateView, setNominateView] = useState('nominate');
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const [pool, setPool] = useState([]);
  const [poolTotal, setPoolTotal] = useState(0);
  const [loadingPool, setLoadingPool] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

        // Resolve active voting season (ballot auto-sync window) + the Fellow's public profile id.
        try {
          const activeSeasons = await base44.entities.Season.filter({ status: 'voting_open' });
          setSeason(activeSeasons?.[0] || null);
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
      .then(({ pool }) => {
        if (!active) return;
        setPool(pool);
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

  // Remember the last-used side of the in-tab toggle, per Fellow.
  useEffect(() => {
    if (!user) return;
    try {
      const v = localStorage.getItem(`nominate_view_${user.email}`);
      if (v === 'nominate' || v === 'mylist') setNominateView(v);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`nominate_view_${user.email}`, nominateView);
    } catch { /* ignore */ }
  }, [nominateView, user]);

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
  const votingOpen = !!season && season.status === 'voting_open'
    && (!season.voting_start || new Date(season.voting_start) <= now)
    && (!season.voting_end || new Date(season.voting_end) >= now);
  const votingClosed = !!season && (
    ['review', 'completed', 'archived'].includes(season.status) ||
    (season.voting_end && new Date(season.voting_end) < now)
  );
  const ballotLive = votingOpen && rankings.length >= 3;
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

  // Auto-save + ballot auto-sync. No publish gate: the list persists on every
  // change and the ranked ballot upserts automatically while the voting window
  // is open. The list is the public, shareable artifact; the ballot is the
  // measurement input — they are decoupled.
  const persistAndSync = useCallback(async (updatedRankings, updatedName) => {
    if (!user) return;
    setSaving(true);

    const isLive = votingOpen && updatedRankings.length >= 3;
    const payload = {
      user_email: user.email,
      user_name: user.full_name,
      list_name: updatedName,
      rankings: updatedRankings.map((r, i) => ({ ...r, rank: i + 1 })),
      is_published: updatedRankings.length > 0,
      share_code: shareCode,
      ballot_submitted: isLive,
      ...(isLive ? { ballot_submitted_at: new Date().toISOString() } : {}),
    };

    try {
      if (myList?.id) {
        await base44.entities.UserTop100List.update(myList.id, payload);
      } else {
        const created = await base44.entities.UserTop100List.create(payload);
        setMyList(created);
      }
    } catch { /* persist error — surfaced via syncError if ballot also fails */ }

    // Auto-sync the ranked ballot only while the season voting window is open.
    // Below the 3-nominee threshold the ballot is cleared (not counted) rather
    // than stored, so a sub-threshold list never registers as a live ballot.
    if (votingOpen && season?.id) {
      try {
        const ballot = updatedRankings.length >= 3 ? updatedRankings.map((r) => r.nominee_id) : [];
        await saveRankedVote({ season_id: season.id, ballot });
        setSyncError('');
      } catch {
        setSyncError("Ballot sync failed — your list is saved. We'll retry on your next change.");
      }
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

  // Publish & Save Draft removed — the ballot auto-syncs via persistAndSync
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

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: brand.cream }}>
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
      {activeTab === 'start' && (
        <div className="flex-1 overflow-y-auto">
          <StartHereSplit
            user={user}
            hasExisting={totalNominations > 0 || rankings.length > 0}
            onBegin={() => setActiveTab('nominate')}
            onVote={() => setActiveTab('vote')}
            onSaved={(c) => setUser((u) => ({ ...u, aerospace_connection: c }))}
            onOpenOS={() => setShowOS(true)}
          />
        </div>
      )}

      {/* ── NOMINATE TAB (split: intake on the left, ranked list on the right) ── */}
      {activeTab === 'nominate' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop: two-column split */}
          <div className="hidden lg:flex flex-1 gap-6 px-6 pb-6 max-w-7xl mx-auto w-full overflow-hidden">
            {/* Left: nominate intake (search-first) */}
            <div className="flex-1 min-w-0 sticky top-[60px] self-start overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              <NominateIntakePanel
                submittedNominations={hubNominations}
                onAddNomination={addHubNomination}
                onRemoveNomination={removeHubNomination}
                onAddExisting={(nominee, meta) => {
                  addExistingToHub(meta.category, nominee, meta.also_angels);
                  handleAdd(nominee, { nomination_category: meta.category, also_angels: meta.also_angels });
                }}
                nominator={user}
                addedIds={addedIds}
                onOpenExplorer={openExplorer}
                pool={pool}
                poolTotal={poolTotal}
                loadingPool={loadingPool}
              />
            </div>
            {/* Right: Top 100 ranked list */}
            <div className="flex-1 min-w-0 max-w-xl flex flex-col overflow-hidden">
              {ListNameEditor}
              <BallotStatusBanner
                rankings={rankings}
                ballotLive={ballotLive}
                votingOpen={votingOpen}
                votingEndDate={season?.voting_end}
                saving={saving}
                syncError={syncError}
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
            </div>
          </div>

          {/* Mobile: in-tab toggle between Nominate and My List */}
          <div className="lg:hidden flex flex-col flex-1 overflow-y-auto">
            <NominateViewToggle
              value={nominateView}
              onChange={setNominateView}
              nominateCount={totalNominations}
              listCount={rankings.length}
            />

            {nominateView === 'nominate' ? (
              <MobileNominateView
                user={user}
                submittedNominations={hubNominations}
                onRemoveNomination={removeHubNomination}
                addedIds={addedIds}
                onOpenExplorer={openExplorer}
              />
            ) : (
              <div className="px-4 pt-3 pb-28">
                <div className="mb-3">
                  <ContextualTip userEmail={user?.email} tipKey="nominate_hub_mylist">
                    {votingOpen
                      ? 'This is your ranked Top 100 — it doubles as your ballot while voting is open. Drag to reorder. You rank; the institution measures.'
                      : 'This is your ranked Top 100 — your personal, shareable ranking. Nominations go to our review queue; ballot measurement opens with the voting window.'}
                  </ContextualTip>
                </div>
                {ListNameEditor}
                <BallotStatusBanner
                  rankings={rankings}
                  ballotLive={ballotLive}
                  votingOpen={votingOpen}
                  votingEndDate={season?.voting_end}
                  saving={saving}
                  syncError={syncError}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VOTE TAB (anchor selection — admins only; teaser for everyone else) ── */}
      {activeTab === 'vote' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {user?.role === 'admin' ? <AnchorVoting user={user} /> : <VoteComingSoon />}
        </div>
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
        hidden={!isMobile || activeTab !== 'nominate' || mobilePopoverOpen || explorerOpen}
      />
      {isMobile && mobilePopoverOpen && (
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