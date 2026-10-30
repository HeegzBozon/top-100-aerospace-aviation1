import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import HubRow, { RowCta } from '@/components/faq/HubRow';
import KbArticle from '@/components/faq/KbArticle';
import SectionKeys from '@/components/faq/SectionKeys';
import CourseRail from '@/components/mission/CourseRail';
import useCourseProgress from '@/components/mission/useCourseProgress';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import revealCursor from '@/components/handheld/revealCursor';
import { HUB_SECTIONS, KB_CHAPTERS, KB_ROWS, rowsFor } from '@/components/faq/faqConfig';

// FAQ · Knowledge base · Support — the hub.
//
// It replaces the read-only course page with the same knowledge, laid out so a wheel can
// drive it. Two levels, which is all a ring and a confirm key can hold: three sections,
// then the rows inside one. A turn walks, # opens, the back key leaves a section. The
// keypad's figures press the number printed on the row, so on the radio face the same
// list is reachable without the wheel.
//
// Opening a knowledge base article is reading it: the record is written as you open, and
// the rail above the list counts what has been read.
const keyFor = (section, level, index) => {
  if (level === 'sections') return `section-${HUB_SECTIONS[index]?.key || HUB_SECTIONS[0].key}`;
  const row = rowsFor(section)[index];
  return row ? `row-${section}-${row.key}` : null;
};

export default function FaqHub() {
  const navigate = useNavigate();
  const { read, markRead } = useCourseProgress();

  const [section, setSection] = useState('faq');
  const [level, setLevel] = useState('sections');
  const [cursor, setCursor] = useState(0);
  const [openKey, setOpenKey] = useState(null);

  const sectionRef = useRef(section);
  sectionRef.current = section;
  const levelRef = useRef(level);
  levelRef.current = level;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  const readSet = new Set(read);
  const rows = rowsFor(section);
  const activeSection = HUB_SECTIONS.find((item) => item.key === section) || HUB_SECTIONS[0];
  const readCount = KB_ROWS.filter((row) => readSet.has(row.key)).length;

  const openSection = useCallback((key) => {
    setSection(key);
    setLevel('rows');
    setCursor(0);
    cursorRef.current = 0;
    setOpenKey(null);
  }, []);

  const backToSections = useCallback(() => {
    const at = HUB_SECTIONS.findIndex((item) => item.key === sectionRef.current);
    setLevel('sections');
    setCursor(at < 0 ? 0 : at);
    cursorRef.current = at < 0 ? 0 : at;
    setOpenKey(null);
  }, []);

  const openRow = useCallback(
    (row) => {
      if (!row) return;
      if (row.to) {
        navigate(row.to);
        return;
      }
      if (sectionRef.current === 'kb') markRead(row.key);
      setOpenKey((prev) => (prev === row.key ? null : row.key));
    },
    [navigate, markRead],
  );

  // The wheel's own arithmetic: a turn lands on the neighbour inside the level it is on,
  // and declines at the ends so the console hands the turn to the glass and the page
  // reads on.
  const land = useCallback((target) => {
    const list = levelRef.current === 'sections' ? HUB_SECTIONS : rowsFor(sectionRef.current);
    if (target < 0 || target >= list.length) return null;
    cursorRef.current = target;
    setCursor(target);
    return list[target].label;
  }, []);

  const actions = useRef(null);
  actions.current = {
    enter: () => {
      if (levelRef.current === 'sections') {
        openSection(HUB_SECTIONS[cursorRef.current].key);
        return true;
      }
      openRow(rowsFor(sectionRef.current)[cursorRef.current]);
      return true;
    },
    back: () => {
      if (levelRef.current === 'rows') {
        backToSections();
        return true;
      }
      return false;
    },
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () =>
        (levelRef.current === 'sections' ? HUB_SECTIONS : rowsFor(sectionRef.current)).map((item) => item.label),
      index: () => cursorRef.current,
      step: (direction) => land(cursorRef.current + direction),
      page: (direction) => land(cursorRef.current + direction),
      goTo: (i) => land(i),
      code: () => {
        if (levelRef.current === 'sections') return HUB_SECTIONS[cursorRef.current]?.index || null;
        return String(cursorRef.current + 1);
      },
      goToCode: (code) => {
        const list = levelRef.current === 'sections' ? HUB_SECTIONS : rowsFor(sectionRef.current);
        const target =
          levelRef.current === 'sections'
            ? list.findIndex((item) => item.index === String(code))
            : Number(code) - 1;
        if (target < 0 || target >= list.length) return null;
        const label = land(target);
        if (label) actions.current.enter();
        return label;
      },
      enter: () => actions.current.enter(),
      back: () => actions.current.back(),
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [section, level, cursor, openKey, readCount]);

  useEffect(() => {
    revealCursor(keyFor(section, level, cursor));
  }, [section, level, cursor]);

  const jumpToChapter = (chapterIndex) => {
    const chapter = KB_CHAPTERS[chapterIndex];
    if (!chapter) return;
    const target = KB_ROWS.findIndex((row) => row.chapterKey === chapter.key);
    if (target < 0) return;
    cursorRef.current = target;
    setCursor(target);
  };

  const chaptersForRail = KB_CHAPTERS.map((chapter) => ({
    ...chapter,
    readCount: chapter.modules.filter((module) => readSet.has(module.key)).length,
  }));

  return (
    <div className="hh-slide-window hh-scroll-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      <div
        className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-screen"
        style={{ background: B.cream }}
      >
        <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-4 pb-4 pt-5 md:mx-auto md:w-full md:max-w-3xl md:px-8 md:pb-16 md:pt-12">
          <header className="shrink-0">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
              FAQ &middot; Knowledge base &middot; Support
            </p>
            <h1
              className="mt-1.5 font-heading text-[1.85rem] leading-[1.05] md:text-5xl"
              style={{ color: B.navy }}
            >
              Answers, the record, and a way to reach us.
            </h1>
            <p className="mt-2 max-w-xl text-[11.5px] leading-relaxed md:text-[13px]" style={{ color: B.muted }}>
              The FAQ answers what people ask first. The knowledge base is the institution written
              down. Support is where a correction, a claim or a fault goes. Turn the ring to walk, #
              to open.
            </p>
          </header>

          {level === 'sections' ? (
            <div className="mt-4 md:mt-8">
              <SectionKeys
                sections={HUB_SECTIONS}
                cursorIndex={cursor}
                onOpen={openSection}
                counts={{ faq: rowsFor('faq').length, kb: rowsFor('kb').length, support: rowsFor('support').length }}
              />
            </div>
          ) : (
            <>
              <div className="mt-4 flex shrink-0 items-center gap-2 md:mt-6">
                <button
                  type="button"
                  onClick={backToSections}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.2em]"
                  style={{ borderColor: 'rgba(30,58,90,0.24)', color: B.navy }}
                >
                  <ArrowLeft className="h-2.5 w-2.5" />
                  Sections
                </button>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: 'rgba(30,58,90,0.45)' }}
                >
                  {activeSection.index} · {activeSection.label}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed md:text-[12.5px]" style={{ color: B.muted }}>
                {activeSection.lede}
              </p>

              {section === 'kb' ? (
                <CourseRail
                  chapters={chaptersForRail}
                  activeChapter={Math.max(
                    0,
                    KB_CHAPTERS.findIndex((chapter) => chapter.key === rows[cursor]?.chapterKey),
                  )}
                  readCount={readCount}
                  total={KB_ROWS.length}
                  onJump={jumpToChapter}
                />
              ) : null}

              <div className="mt-2">
                {rows.map((row, i) => (
                  <HubRow
                    key={row.key}
                    hhKey={`row-${section}-${row.key}`}
                    index={i + 1}
                    label={row.label}
                    kicker={row.kicker}
                    open={openKey === row.key}
                    active={cursor === i}
                    hint={row.to ? 'Press # to open' : null}
                    onClick={() => {
                      cursorRef.current = i;
                      setCursor(i);
                      openRow(row);
                    }}
                  >
                    {section === 'kb' ? <KbArticle module={row.module} /> : null}

                    {section !== 'kb'
                      ? row.body?.map((para) => (
                          <p
                            key={para.slice(0, 24)}
                            className="mt-2 max-w-2xl text-[11.5px] leading-relaxed md:text-[12.5px]"
                            style={{ color: B.muted }}
                          >
                            {para}
                          </p>
                        ))
                      : null}

                    {row.cta ? <RowCta label={row.cta.label} to={row.cta.to} /> : null}
                  </HubRow>
                ))}
              </div>
            </>
          )}

          <div
            className="mt-4 flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-[7.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(30,58,90,0.4)' }}
          >
            <span>Turn to walk</span>
            <span style={{ color: 'rgba(30,58,90,0.22)' }}>/</span>
            <span># to open</span>
            <span style={{ color: 'rgba(30,58,90,0.22)' }}>/</span>
            <span>Back to leave a section</span>
          </div>
        </div>
      </div>
    </div>
  );
}