import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import useNewsstand from '@/components/newsstand/useNewsstand';
import { NEWSSTAND_TABS, RACKS } from '@/components/newsstand/newsstandConfig';
import NewsstandTabs from '@/components/newsstand/NewsstandTabs';
import NewsstandFrontPage from '@/components/newsstand/NewsstandFrontPage';
import NewsstandHeader from '@/components/newsstand/NewsstandHeader';
import NewsstandRack, { RackEmpty, RackShelf } from '@/components/newsstand/NewsstandRack';
import NewsstandCover from '@/components/newsstand/NewsstandCover';
import StockRow from '@/components/newsstand/StockRow';
import WireRack from '@/components/newsstand/WireRack';

// The Newsstand.
//
// A digital Hudson News, standing where the Chamber's counters do: one storefront for the
// house's whole printed output rather than a key per publication. The rack holds the bound
// editions; the folded sheets are the articles that ran inside them; the dispatch stand is
// where Fellows file their own writing; and the noticeboard by the door carries every
// release note the platform has shipped.
//
// An edition is read in the reader it was bound for, so pressing it leaves the stand. A
// dispatch or a note is printed where it stands: pressing it opens the piece under its own
// headline and the stand stays put. The ring walks the whole stock in the order it is
// drawn, so a hand on the wheel crosses all four racks without touching the glass.
export default function Newsstand() {
  const navigate = useNavigate();
  const stock = useNewsstand();
  const { sections } = stock;
  const [cursorKey, setCursorKey] = useState(null);
  const [openKey, setOpenKey] = useState(null);
  const [tabKey, setTabKey] = useState(NEWSSTAND_TABS[0].key);

  // The ring walks the leaf in front of it only: what is folded away is not stock until
  // its tab is opened.
  const racks = useMemo(() => RACKS.filter((rack) => rack.tab === tabKey), [tabKey]);
  // The rack of editions is set on the publications tab as its front page, so the list below
  // only carries the racks that follow it.
  const listRacks = useMemo(() => racks.filter((rack) => rack.key !== 'issues'), [racks]);
  const leadEdition = sections.issues[0] || null;
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

  const tabs = useMemo(
    () =>
      NEWSSTAND_TABS.map((tab) => ({
        ...tab,
        count: RACKS.filter((rack) => rack.tab === tab.key).reduce(
          (total, rack) => total + (sections[rack.key]?.length || 0),
          0,
        ),
      })),
    [sections],
  );

  // Turning a leaf puts the cursor on the first paper behind it, so the ring is never left
  // standing on something that has been folded away.
  const selectTab = useCallback((key) => {
    setTabKey(key);
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
            {tabKey === 'publications' ? (
              <div
                ref={(node) => {
                  if (leadEdition) itemRefs.current[leadEdition.key] = node;
                }}
              >
                <NewsstandFrontPage
                  item={leadEdition}
                  empty={RACKS[0].empty}
                  focused={!!leadEdition && cursorKey === leadEdition.key}
                  onOpen={() => {
                    if (!leadEdition) return;
                    setCursorKey(leadEdition.key);
                    take(leadEdition);
                  }}
                />
              </div>
            ) : null}

            <div className="mt-8 space-y-10">
            {listRacks.map((rack) => {
              const items = sections[rack.key] || [];
              const isRack = rack.key === 'issues';
              const isWire = rack.key === 'wire';

              return (
                <NewsstandRack key={rack.key} rack={rack} count={items.length}>
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