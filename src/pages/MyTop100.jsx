import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import ListBuilderHeader from '@/components/my-top100/ListBuilderHeader';
import ListCanvas from '@/components/my-top100/ListCanvas';
import NomineeSearchDrawer from '@/components/my-top100/NomineeSearchDrawer';
import ShareCard from '@/components/my-top100/ShareCard';
import PublishBanner from '@/components/my-top100/PublishBanner';
import DesktopSearchPanel from '@/components/my-top100/DesktopSearchPanel';
import NomineeExplorerPopover from '@/components/my-top100/NomineeExplorerPopover';
import Top100OSModal from '@/components/my-top100/Top100OSModal';
import NominationHub from '@/components/my-top100/NominationHub';
import HubListTabs from '@/components/my-top100/HubListTabs';
import ListCategoryTabs from '@/components/my-top100/ListCategoryTabs';
import StartHereSplit from '@/components/my-top100/StartHereSplit';
import { saveRankedVote } from '@/functions/saveRankedVote';
import { Loader2, Pencil, Check, Rocket, LogIn, ListOrdered } from 'lucide-react';

function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function MyTop100() {
  const [user, setUser] = useState(null);
  const [myList, setMyList] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [listName, setListName] = useState('My Top 100');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  const [hubNominations, setHubNominations] = useState({ women: [], men: [], angels: [] });
  const [listCategory, setListCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('start');
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [explorerProfile, setExplorerProfile] = useState(null);
  const [showOS, setShowOS] = useState(false);

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
          setIsPublished(existing.is_published || false);
          setShareCode(existing.share_code || generateShareCode());
        } else {
          setShareCode(generateShareCode());
        }
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

  const addHubNomination = (category, summary) =>
    setHubNominations((p) => ({ ...p, [category]: [...p[category], summary] }));
  const addExistingToHub = (category, nominee, also_angels) =>
    setHubNominations((p) => ({ ...p, [category]: [...p[category], { existing: true, nominee, also_angels }] }));
  const removeHubNomination = (category, idx) =>
    setHubNominations((p) => ({ ...p, [category]: p[category].filter((_, i) => i !== idx) }));

  // Debounced auto-save
  const scheduleSave = useCallback((updatedRankings, updatedName, updatedPublished) => {
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(() => {
      persistList(updatedRankings, updatedName, updatedPublished, false);
    }, 1500);
    setSaveTimer(timer);
  }, [saveTimer, myList, shareCode, user]);

  const persistList = async (updatedRankings, updatedName, updatedPublished, showSaving = true) => {
    if (!user) return;
    if (showSaving) setSaving(true);

    const payload = {
      user_email: user.email,
      user_name: user.full_name,
      list_name: updatedName,
      rankings: updatedRankings.map((r, i) => ({ ...r, rank: i + 1 })),
      is_published: updatedPublished,
      share_code: shareCode,
      ballot_submitted: updatedPublished,
      ...(updatedPublished ? { ballot_submitted_at: new Date().toISOString() } : {}),
    };

    if (myList?.id) {
      await base44.entities.UserTop100List.update(myList.id, payload);
    } else {
      const created = await base44.entities.UserTop100List.create(payload);
      setMyList(created);
    }

    if (showSaving) setSaving(false);
  };

  const handleReorder = (newFilteredOrder) => {
    let newOrder = newFilteredOrder;
    if (listCategory !== 'all') {
      const filteredIds = new Set(newFilteredOrder.map(r => r.nominee_id));
      let fi = 0;
      newOrder = rankings.map(item => filteredIds.has(item.nominee_id) ? newFilteredOrder[fi++] : item);
    }
    setRankings(newOrder);
    scheduleSave(newOrder, listName, isPublished);
  };

  const handleAdd = (nominee, meta = {}) => {
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
    scheduleSave(newRankings, listName, isPublished);
  };

  const handleRemove = (nomineeId) => {
    const newRankings = rankings.filter(r => r.nominee_id !== nomineeId);
    setRankings(newRankings);
    scheduleSave(newRankings, listName, isPublished);
  };

  const handlePublish = async () => {
    setSaving(true);
    setIsPublished(true);
    await persistList(rankings, listName, true, false);

    // Submit as ranked choice ballot via the voting engine
    try {
      const activeSeason = await base44.entities.Season.filter({ status: 'voting_open' });
      const seasonId = activeSeason?.[0]?.id;
      if (seasonId) {
        const ballot = rankings.map(r => r.nominee_id);
        await saveRankedVote({ season_id: seasonId, ballot });
      }
    } catch (e) {
      console.warn('Ballot submission skipped:', e.message);
    }

    setSaving(false);
    setShowShare(true);
  };

  const handleSaveDraft = async () => {
    await persistList(rankings, listName, false, true);
  };

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
            onBlur={() => { setIsEditingName(false); scheduleSave(rankings, listName, isPublished); }}
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
        onShare={() => setShowShare(true)}
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
            onVote={() => setActiveTab('list')}
            onSaved={(c) => setUser((u) => ({ ...u, aerospace_connection: c }))}
            onOpenOS={() => setShowOS(true)}
          />
        </div>
      )}

      {/* ── NOMINATE TAB ── */}
      {activeTab === 'nominate' && (
        <div className="flex-1 overflow-y-auto lg:max-w-3xl lg:mx-auto lg:w-full">
          <NominationHub
            submittedNominations={hubNominations}
            onAddNomination={addHubNomination}
            onRemoveNomination={removeHubNomination}
            onAddExisting={(nominee, meta) => {
              addExistingToHub(meta.category, nominee, meta.also_angels);
              handleAdd(nominee, { nomination_category: meta.category, also_angels: meta.also_angels });
            }}
            nominator={user}
          />
          {rankings.length > 0 && (
            <div className="px-4 pb-6 pt-2">
              <button
                onClick={() => setActiveTab('list')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{ background: 'white', border: `1px solid ${brand.navy}15`, color: brand.navy }}
              >
                <ListOrdered className="w-4 h-4" style={{ color: brand.gold }} />
                View your Top 100 list ({rankings.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MY LIST TAB ── */}
      {activeTab === 'list' && (
        <>
          {/* Desktop: two-column */}
          <div className="hidden lg:flex flex-1 gap-6 px-6 pb-6 max-w-7xl mx-auto w-full overflow-hidden">
            <div className="w-80 xl:w-96 shrink-0 sticky top-[60px] self-start overflow-hidden" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              <DesktopSearchPanel addedIds={addedIds} onAdd={handleAdd} onOpenExplorer={openExplorer} onViewProfile={(n) => { setExplorerProfile(n); setExplorerOpen(true); }} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              {ListNameEditor}
              <PublishBanner
                rankings={rankings}
                isPublished={isPublished}
                saving={saving}
                onPublish={handlePublish}
                onSaveDraft={handleSaveDraft}
              />
              <ListCategoryTabs activeTab={listCategory} onTabChange={setListCategory} counts={listCategoryCounts} />
              <ListCanvas
                rankings={visibleRankings}
                totalCount={rankings.length}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onAddMore={() => {}}
                onAdd={handleAdd}
                addedIds={addedIds}
                onViewProfile={openProfileFromList}
              />
            </div>
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden flex flex-col flex-1">
            {ListNameEditor}
            <PublishBanner
              rankings={rankings}
              isPublished={isPublished}
              saving={saving}
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
            />
            <div className="flex-1">
              <ListCategoryTabs activeTab={listCategory} onTabChange={setListCategory} counts={listCategoryCounts} />
              <ListCanvas
                rankings={visibleRankings}
                totalCount={rankings.length}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onAddMore={() => setShowSearch(true)}
                onAdd={handleAdd}
                addedIds={addedIds}
                onViewProfile={openProfileFromList}
              />
            </div>

            {rankings.length < 100 && (
              <div className="fixed bottom-6 right-4 z-20">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowSearch(true)}
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                >
                  +
                </motion.button>
              </div>
            )}

            <NomineeSearchDrawer
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onAdd={handleAdd}
              addedIds={addedIds}
            />
          </div>
        </>
      )}

      <ShareCard
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        rankings={rankings}
        userName={user?.full_name}
        listName={listName}
        shareCode={shareCode}
      />

      <NomineeExplorerPopover
        isOpen={explorerOpen}
        onClose={() => { setExplorerOpen(false); setExplorerProfile(null); }}
        addedIds={addedIds}
        onAdd={handleAdd}
        initialNominee={explorerProfile}
      />

      <Top100OSModal isOpen={showOS} onClose={() => setShowOS(false)} />
    </div>
  );
}