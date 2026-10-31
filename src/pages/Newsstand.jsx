import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import useNewsstand from '@/components/newsstand/useNewsstand';
import { DEFAULT_TAB_KEY, NEWSSTAND_TABS, RACKS } from '@/components/newsstand/newsstandConfig';
import NewsstandTabs from '@/components/newsstand/NewsstandTabs';
import NewsstandSubTabs from '@/components/newsstand/NewsstandSubTabs';
import NewsstandFrontPage from '@/components/newsstand/NewsstandFrontPage';
import NewsstandHeader from '@/components/newsstand/NewsstandHeader';
import NewsstandRack, { RackEmpty, RackShelf } from '@/components/newsstand/NewsstandRack';
import NewsstandCover from '@/components/newsstand/NewsstandCover';
import StockRow from '@/components/newsstand/StockRow';
import WireRack from '@/components/newsstand/WireRack';

// The Newsstand.
//
// A digital Hudson News, standing where the Chamber's counters do: one storefront for the
// house's whole printed output rather than a key per publication. Volumes is the rack of
// bound volumes — as many as the archive holds. Issues is what sits inside them: the
// spotlights, one page per honoree, and the articles written around them. Notes is what the
// house says out loud, the wire on one side and the release notes on the other — and it is
// the leaf the stand opens on.
//
// A volume or a spotlight is read on its own page, so pressing it leaves the stand. A
// dispatch or a note is printed where it stands: pressing it opens the piece under its own
// headline and the stand stays put. The ring walks the leaf in front of it in the order it
// is drawn, so a hand on the wheel crosses every rack of that leaf without touching the glass.
export default function Newsstand() {
  const navigate = useNavigate();
  const stock = useNewsstand();
  const { sections } = stock;
  const [cursorKey, setCursorKey] = useState(null);
  const [openKey, setOpenKey] = useState(null);
  const [tabKey, setTabKey] = useState(DEFAULT_TAB_KEY);
  const [subKey, setSubKey] = useState(null);

  // The ring walks the leaf in front of it only: what is folded away is not stock until its
  // tab is opened — and a leaf with sections inside it opens on its first section.
  const subs = useMemo(
    () => NEWSSTAND_TABS.find((tab) => tab.key === tabKey)?.subs || [],
    [tabKey],
  );
  const activeSub = subs.length ? subs.find((sub) => sub.key === subKey)?.key || subs[0].key : null;
  const racks = useMemo(
    () => RACKS.filter((rack) => rack.tab === tabKey && (!rack.sub || rack.sub === activeSub)),
    [tabKey, activeSub],
  );
  // The live volume is set as the front page of its tab, so the rack below it carries the rest
  // of the archive rather than printing that volume twice.
  const leadVolume = sections.volumes[0] || null;
  const itemsFor = useCallback(
    (rack) => {
      const list = sections[rack.key] || [];
      return tabKey === 'volumes' && rack.key === 'volumes' && leadVolume ? list.slice(1) : list;
    },
    [sections, tabKey, leadVolume],
  );
  const stockItems = useMemo(
    () => racks.flatMap((rack) => sections[rack.key] || []),
    [racks, sections],
  );

  const itemsRef = useRef(stockItems);
  itemsRef.current = stockItems;
  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;
  const openRef = useRef(openKey);
  openRef.current = openKey;
  const itemRefs = useRef({});

  // A fresh stand opens on its first paper; nothing is left pointing at stock that is no
  // longer out.
  useEffect(() => {
    if (!stockItems.length) return;
    if (stockItems.some((item) => item.key === cursorRef.current)) return;
    cursorRef.current = stockItems[0].key;
    setCursorKey(stockItems[0].key);
  }, [stockItems]);

  useEffect(() => {
    if (!cursorKey) return;
    itemRefs.current[cursorKey]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [cursorKey]);

  const land = useCallback((target) => {
    const list = itemsRef.current;
    if (target < 0 || target >= list.length) return null;
    cursorRef.current = list[target].key;
    setCursorKey(list[target].key);
    return list[target].title;
  }, []);

  const here = useCallback(
    () => Math.max(0, itemsRef.current.findIndex((item) => item.key === cursorRef.current)),
    [],
  );

  const take = useCallback(
    (item) => {
      if (!item) return false;
      // A post off the wire lives on the network it was published to, so the stand hands it
      // over rather than opening it in the glass.
      if (item.href) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
        return true;
      }
      if (item.to) {
        navigate(item.to);
        return true;
      }
      if (!item.expandable) return false;
      setOpenKey((prev) => (prev === item.key ? null : item.key));
      return true;
    },
    [navigate],
  );

  const countOf = useCallback(
    (list) => list.reduce((total, rack) => total + (sections[rack.key]?.length || 0), 0),
    [sections],
  );

  // Every leaf prints its weight, and so does every section inside it.
  const tabs = useMemo(
    () =>
      NEWSSTAND_TABS.map((tab) => {
        const tabRacks = RACKS.filter((rack) => rack.tab === tab.key);
        return {
          ...tab,
          count: countOf(tabRacks),
          subs: (tab.subs || []).map((sub) => ({
            ...sub,
            count: countOf(tabRacks.filter((rack) => rack.sub === sub.key)),
          })),
        };
      }),
    [countOf],
  );
  const activeTab = tabs.find((tab) => tab.key === tabKey);

  // Turning a leaf puts the cursor on the first paper behind it, so the ring is never left
  // standing on something that has been folded away.
  const selectTab = useCallback((key) => {
    setTabKey(key);
    setSubKey(null);
    setOpenKey(null);
    setCursorKey(null);
  }, []);

  const selectSub = useCallback((key) => {
    setSubKey(key);
    setOpenKey(null);
    setCursorKey(null);
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => itemsRef.current.map((item) => item.title),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction * 3),
      goTo: (index) => land(index),
      enter: () => take(itemsRef.current.find((item) => item.key === cursorRef.current)),
      back: () => {
        if (!openRef.current) return false;
        setOpenKey(null);
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, openKey, stockItems.length]);

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:px-8 md:pb-20 md:pt-12">
        <NewsstandHeader />

        <NewsstandTabs tabs={tabs} activeKey={tabKey} onSelect={selectTab} />
        <NewsstandSubTabs
          tabs={activeTab?.subs || []}
          activeKey={activeSub}
          onSelect={selectSub}
        />

        {stock.loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.gold }} />
          </div>
        ) : stock.error ? (
          <div
            className="mt-8 rounded-[3px] px-4 py-10 text-center"
            style={{ border: `1px solid ${C.border}`, background: C.surface }}
          >
            <p className="font-heading text-[18px]" style={{ color: C.navy }}>
              The stand is shuttered.
            </p>
            <p className="mt-1 text-[11.5px]" style={{ color: C.muted }}>
              {stock.error}
            </p>
            <button type="button" onClick={stock.reload} className={`${BTN_BASE} mt-4`} style={BTN.navy}>
              Try again
            </button>
          </div>
        ) : (
          <>
            {tabKey === 'volumes' ? (
              <div
                ref={(node) => {
                  if (leadVolume) itemRefs.current[leadVolume.key] = node;
                }}
              >
                <NewsstandFrontPage
                  item={leadVolume}
                  empty={RACKS[0].empty}
                  focused={!!leadVolume && cursorKey === leadVolume.key}
                  onOpen={() => {
                    if (!leadVolume) return;
                    setCursorKey(leadVolume.key);
                    take(leadVolume);
                  }}
                />
              </div>
            ) : null}

            <div className="mt-8 space-y-10">
            {racks.map((rack) => {
              const items = itemsFor(rack);
              const isRack = rack.key === 'volumes';
              const isWire = rack.key === 'wire';

              return (
                <NewsstandRack key={rack.key} rack={rack} count={(sections[rack.key] || []).length}>
                  {isWire ? (
                    <WireRack
                      rack={rack}
                      items={items}
                      wire={stock.wire}
                      cursorKey={cursorKey}
                      registerRef={(item, node) => {
                        itemRefs.current[item.key] = node;
                      }}
                      onFocus={setCursorKey}
                      onOpen={take}
                    />
                  ) : items.length === 0 ? (
                    <RackEmpty rack={rack} />
                  ) : isRack ? (
                    <>
                      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
                        {items.map((item) => (
                          <div
                            key={item.key}
                            ref={(node) => {
                              itemRefs.current[item.key] = node;
                            }}
                            className="w-[43%] shrink-0 snap-start md:w-auto"
                          >
                            <NewsstandCover
                              item={item}
                              focused={cursorKey === item.key}
                              onOpen={() => {
                                setCursorKey(item.key);
                                take(item);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <RackShelf />
                    </>
                  ) : (
                    <div>
                      {items.map((item, index) => (
                        <div
                          key={item.key}
                          ref={(node) => {
                            itemRefs.current[item.key] = node;
                          }}
                        >
                          <StockRow
                            item={item}
                            index={index}
                            focused={cursorKey === item.key}
                            open={openKey === item.key}
                            onFocus={() => setCursorKey(item.key)}
                            onOpen={() => take(item)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </NewsstandRack>
              );
            })}
            </div>
          </>
        )}

        <p className="mt-10 text-[10px] leading-relaxed" style={{ color: C.muted }}>
          The stand carries the record only. Nothing on it is ordered, featured or priced by
          payment, and a Fellow&rsquo;s own writing is published as they filed it.
        </p>
      </div>
    </div>
  );
}