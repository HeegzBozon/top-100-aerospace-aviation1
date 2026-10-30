import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { useNavHint } from '@/components/handheld/faceHint';
import { useConsoleFace, RADIO } from '@/components/handheld/consoleMode';
import { MAGAZINE_PALETTE as P, layoutLabel } from '@/components/magazine/magazineConfig';
import {
  buildArchiveEntries,
  buildEntryFields,
  buildOptionEntries,
  buildSurfaceEntries,
  buildSurfaces,
} from '@/components/magazine/glass/studioEntries';
import GlassStudioList from '@/components/magazine/glass/GlassStudioList';
import GlassStudioFieldRow from '@/components/magazine/glass/GlassStudioFieldRow';
import GlassStudioPageRead from '@/components/magazine/glass/GlassStudioPageRead';
import {
  ArticlesReadout,
  BlueprintReadout,
  InventoryReadout,
  IssueReadout,
  PagesReadout,
  PublishReadout,
} from '@/components/magazine/glass/GlassStudioReadout';

const getStage = () => document.querySelector('[data-handheld-screen]') || document.querySelector('.hh-stage');
const isTyping = () => !!document.activeElement?.matches?.('input, textarea');

// The Magazine Studio, on the glass.
//
// One editor, four levels deep, and the ring never leaves the hand:
//
//   0  the archive        issues, the alchemy from the 2025 edition, a blank issue
//   1  the issue          Blueprint · Articles · Pages · Preview & Publish
//   2  a surface          its sections, its articles, its pages, its keys
//   3  one entry          the fields of a section or an article, or a page read whole
//   4  one choice         the options of a field, stepped through and taken
//
// The cursor law holds at every level (docs/handheld-cursor-rules.md): a list stops
// at its ends, a turn past one is handed to the glass, and nothing wraps. B walks back
// up the levels one at a time and, from the archive, leaves the studio to the console.
//
// Copy is written, not dragged: A puts the cursor into a line — the keys come up and
// the chin goes, so the glass keeps its whole picture — and the line is banked when
// the cursor leaves it. A choice is taken by walking its options, which is why a
// status can be set with a thumb alone.
export default function StudioGlass({
  issues = [],
  selectedIssue = null,
  articles = [],
  pages = [],
  loading = false,
  loadingDetail = false,
  error = null,
  alchemizing = false,
  actions = {},
}) {
  const navigate = useNavigate();
  // The studio prints the keys of the face on the case.
  const keyHint = useNavHint();
  const faceIsRadio = useConsoleFace() === RADIO;

  const [level, setLevel] = useState(0);
  const [surface, setSurface] = useState(null);
  const [entry, setEntry] = useState(null);
  const [optionField, setOptionField] = useState(null);
  const [cursor, setCursor] = useState(0);

  const sections = useMemo(() => selectedIssue?.sections || [], [selectedIssue]);

  // ── What the ring walks at each level ───────────────────────────────────────
  const surfaces = useMemo(
    () => buildSurfaces(selectedIssue, { articles, pages }),
    [selectedIssue, articles, pages],
  );

  const entries = useMemo(() => {
    if (level === 0) return buildArchiveEntries({ issues, error, alchemizing });
    if (level === 1) return surfaces;
    if (level === 2) return buildSurfaceEntries({ surface, issue: selectedIssue, articles, pages });
    if (level === 4) return buildOptionEntries(optionField?.field);
    return [];
  }, [level, surface, issues, surfaces, articles, pages, selectedIssue, optionField, alchemizing, error]);

  // ── The fields of the entry standing open ───────────────────────────────────
  const fields = useMemo(
    () => buildEntryFields({ entry, issue: selectedIssue, articles }),
    [entry, selectedIssue, articles],
  );

  const openPage = entry?.kind === 'page' ? pages.find((page) => page.id === entry.id) || null : null;

  // ── Refs the console's own hands read ───────────────────────────────────────
  const levelRef = useRef(level);
  levelRef.current = level;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const entryRef = useRef(entry);
  entryRef.current = entry;
  const inputRefs = useRef([]);
  const rowRefs = useRef([]);

  const listFor = () => (levelRef.current === 3 ? fieldsRef.current : entriesRef.current);

  const land = (target) => {
    const list = listFor();
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  };

  // ── Writing ─────────────────────────────────────────────────────────────────
  const commitField = (key, value) => {
    const open = entryRef.current;
    if (!open) return;
    if (key === '__delete') {
      if (open.kind === 'section') {
        actions.updateIssue(selectedIssue.id, { sections: sections.filter((section) => section.id !== open.id) });
      } else if (open.kind === 'article') {
        actions.deleteArticle(open.id);
      }
      setEntry(null);
      setLevel(2);
      setCursor(0);
      return;
    }
    if (open.kind === 'section') {
      actions.updateIssue(selectedIssue.id, {
        sections: sections.map((section) => (section.id === open.id ? { ...section, [key]: value } : section)),
      });
      return;
    }
    if (open.kind === 'article') {
      actions.updateArticle(open.id, { [key]: value });
      return;
    }
    if (open.kind === 'issue') {
      actions.updateIssue(selectedIssue.id, { [key]: value });
    }
  };

  const openOptions = (field, index) => {
    setOptionField({ field, index });
    setCursor(Math.max(0, field.options.findIndex((option) => option.value === field.value)));
    setLevel(4);
  };

  const takeOption = (listIndex) => {
    const option = entriesRef.current[listIndex];
    if (!option || !optionField) return;
    commitField(optionField.field.key, option.value);
    setLevel(3);
    setCursor(optionField.index);
  };

  // ── The studio's own commands ───────────────────────────────────────────────
  const runAction = (action) => {
    switch (action) {
      case 'retry':
        actions.retry?.();
        break;
      case 'alchemize':
        Promise.resolve(actions.alchemizeIssue?.()).then((created) => {
          if (!created) return;
          setSurface(null);
          setEntry(null);
          setCursor(0);
          setLevel(1);
        }).catch(() => {});
        break;
      case 'new-issue':
        Promise.resolve(actions.createIssue?.()).then((created) => {
          if (!created) return;
          setSurface(null);
          setEntry(null);
          setCursor(0);
          setLevel(1);
        }).catch(() => {});
        break;
      case 'masthead':
        setEntry({ kind: 'issue' });
        setCursor(0);
        setLevel(3);
        break;
      case 'add-section': {
        const order = sections.length;
        actions.updateIssue(selectedIssue.id, {
          sections: [...sections, { id: `sec-${Date.now()}`, name: `Section ${order + 1}`, section_type: 'evergreen', section_group: 'well', order }],
        });
        break;
      }
      case 'new-article':
        Promise.resolve(actions.createArticle?.({ title: 'Untitled Article', article_type: 'evergreen', status: 'drafting' })).then((created) => {
          if (!created) return;
          setEntry({ kind: 'article', id: created.id });
          setCursor(0);
          setLevel(3);
        }).catch(() => {});
        break;
      case 'generate-pages':
        actions.generatePages?.();
        break;
      case 'publish':
        actions.publish?.();
        break;
      case 'unpublish':
        actions.unpublish?.();
        break;
      case 'open-reader':
        navigate(`/magazine/${selectedIssue.id}`);
        break;
      case 'delete-issue':
        actions.deleteIssue?.(selectedIssue.id);
        setSurface(null);
        setEntry(null);
        setCursor(0);
        setLevel(0);
        break;
      default:
        break;
    }
  };

  const open = (target) => {
    if (!target) return;
    if (target.kind === 'issue') {
      actions.selectIssue?.(target.id);
      setSurface(null);
      setEntry(null);
      setCursor(0);
      setLevel(1);
      return;
    }
    if (target.kind === 'surface') {
      setSurface(target.key);
      setEntry(null);
      setCursor(0);
      setLevel(2);
      return;
    }
    if (target.kind === 'section' || target.kind === 'article' || target.kind === 'page') {
      setEntry({ kind: target.kind, id: target.id });
      setCursor(0);
      setLevel(3);
      return;
    }
    if (target.action) runAction(target.action);
  };

  // The issue is closed (or deleted) under the studio: everything above the archive
  // goes with it.
  useEffect(() => {
    if (selectedIssue || level === 0) return;
    setLevel(0);
    setSurface(null);
    setEntry(null);
    setOptionField(null);
    setCursor(0);
  }, [selectedIssue, level]);

  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [level, surface, entry?.id, optionField?.field?.key]);

  useEffect(() => {
    if (level !== 3) return;
    rowRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, level, entry?.id]);

  // ── The console's handle on the studio ──────────────────────────────────────
  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => listFor().map((item) => item.label),
      index: () => cursorRef.current,
      // Rotation walks; a page being read and a line being written into are the two
      // places it declines, so the glass takes the turn and scrolls instead.
      step: (direction) => {
        if (isTyping()) return null;
        if (levelRef.current === 3 && entryRef.current?.kind === 'page') return null;
        return land(cursorRef.current + direction);
      },
      // Back and forward on the ring turn the page of the issue being proved.
      page: (direction) => {
        if (levelRef.current === 3 && entryRef.current?.kind === 'page') return turnPage(direction);
        return land(cursorRef.current + direction);
      },
      goTo: (i) => land(i),
      enter: () => {
        if (isTyping()) return true;
        const depth = levelRef.current;
        if (depth === 4) {
          takeOption(cursorRef.current);
          return true;
        }
        if (depth === 3) {
          const field = fieldsRef.current[cursorRef.current];
          if (!field) return false;
          if (field.kind === 'action') {
            commitField('__delete', true);
            return true;
          }
          if (field.kind === 'choice') {
            openOptions(field, cursorRef.current);
            return true;
          }
          inputRefs.current[cursorRef.current]?.focus();
          return true;
        }
        const target = entriesRef.current[cursorRef.current];
        if (!target) return false;
        open(target);
        return true;
      },
      back: () => {
        if (isTyping()) {
          document.activeElement?.blur?.();
          return true;
        }
        const depth = levelRef.current;
        if (depth === 4) {
          setLevel(3);
          setCursor(optionField?.index ?? 0);
          return true;
        }
        if (depth === 3) {
          setEntry(null);
          setLevel(2);
          setCursor(0);
          return true;
        }
        if (depth === 2) {
          setSurface(null);
          setLevel(1);
          setCursor(0);
          return true;
        }
        if (depth === 1) {
          actions.backToIssues?.();
          setLevel(0);
          setCursor(0);
          return true;
        }
        return false;
      },
    };
  }

  // The page being proved, turned one at a time: the ends of the issue stop the ring
  // rather than wrapping it round.
  function turnPage(direction) {
    const open = entryRef.current;
    if (!open) return null;
    const i = pages.findIndex((page) => page.id === open.id);
    const target = i + direction;
    if (i < 0 || target < 0 || target >= pages.length) return null;
    setEntry({ kind: 'page', id: pages[target].id });
    setCursor(target);
    return `${String(pages[target].page_number).padStart(2, '0')} · ${layoutLabel(pages[target].layout_type)}`;
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, level, surface, entry?.id, entries.length, fields.length, loading, error, alchemizing, pages.length, articles.length]);

  // ── The glass ───────────────────────────────────────────────────────────────
  if (level === 3 && openPage) {
    const i = pages.findIndex((page) => page.id === openPage.id);
    return (
      <GlassStudioPageRead
        page={openPage}
        issue={selectedIssue}
        articles={articles}
        pageNumber={i + 1}
        totalPages={pages.length}
        onTurn={(direction) => turnPage(direction)}
        onBack={() => { setEntry(null); setLevel(2); setCursor(0); }}
      />
    );
  }

  if (level === 3) {
    if (!fields.length) {
      return (
        <GlassStudioList
          kicker="Entry"
          entries={[]}
          note={<p className="text-[10px]" style={{ color: 'rgba(30,58,90,0.6)' }}>This entry is no longer in the issue.</p>}
          empty={null}
          onBack={() => { setEntry(null); setLevel(2); setCursor(0); }}
        />
      );
    }
    const entryTitle = entry?.kind === 'article'
      ? (articles.find((a) => a.id === entry.id)?.title || 'Article')
      : entry?.kind === 'section'
        ? (sections.find((s) => s.id === entry.id)?.name || 'Section')
        : selectedIssue?.title;

    return (
      <div className="px-3 pb-5 pt-3">
        <div className="flex items-center justify-between gap-3 pb-2" style={{ borderBottom: '1px solid rgba(30,58,90,0.12)' }}>
          <p className="truncate text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
            {entry?.kind === 'issue' ? 'Masthead fields' : entryTitle}
          </p>
          <p className="flex-none text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
            {keyHint({ open: 'Write' })}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {fields.map((field, i) => (
            <div key={field.key} ref={(el) => (rowRefs.current[i] = el)}>
              <GlassStudioFieldRow
                field={field}
                index={i}
                focused={i === cursor}
                inputRef={(el) => (inputRefs.current[i] = el)}
                onCommit={commitField}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kicker = level === 0
    ? 'Magazine Studio — The Archive'
    : level === 1
      ? `${selectedIssue?.title || 'Issue'}`
      : surface === 'blueprint'
        ? 'Blueprint'
        : surface === 'articles'
          ? 'Articles'
          : surface === 'pages'
            ? 'Pages'
            : 'Preview & Publish';

  const note = level === 0
    ? <InventoryReadout issues={issues} error={error} alchemizing={alchemizing} />
    : level === 1
      ? <IssueReadout issue={selectedIssue} loadingDetail={loadingDetail} />
      : level === 2
        ? surface === 'blueprint'
          ? <BlueprintReadout issue={selectedIssue} sectionCount={sections.length} />
          : surface === 'articles'
            ? <ArticlesReadout articles={articles} />
            : surface === 'pages'
              ? <PagesReadout pages={pages} />
              : <PublishReadout issue={selectedIssue} articles={articles} pages={pages} />
        : null;

  const hint = level === 4
    ? keyHint({ open: 'Take' })
    : level === 0
      ? keyHint({ open: 'Open' })
      : `${keyHint({ open: 'Open' })} · ${faceIsRadio ? 'BACK Back' : 'B Back'}`;

  const back = level === 0 ? null : () => {
    if (level === 2) { setSurface(null); setLevel(1); setCursor(0); return; }
    actions.backToIssues?.();
    setLevel(0);
    setCursor(0);
  };

  return (
    <GlassStudioList
      kicker={kicker}
      hint={hint}
      note={note}
      entries={entries}
      cursor={cursor}
      onOpen={(i, target) => { setCursor(i); if (level === 4) takeOption(i); else open(target); }}
      onBack={back}
      empty={(
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          {loading ? 'Waking the archive…' : 'Nothing here yet.'}
        </p>
      )}
    />
  );
}