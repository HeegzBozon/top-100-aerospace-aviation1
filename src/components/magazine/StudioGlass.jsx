import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Eye,
  FileText,
  Layers,
  LayoutList,
  PencilLine,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Type,
  User,
} from 'lucide-react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import {
  ARTICLE_STATUSES,
  ARTICLE_TYPES,
  ISSUE_STATUSES,
  MAGAZINE_PALETTE as P,
  SECTION_GROUPS,
  SECTION_TYPES,
  articleStatusLabel,
  layoutLabel,
  sectionGroupLabel,
  sectionTypeLabel,
  statusLabel,
} from '@/components/magazine/magazineConfig';
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

  const [level, setLevel] = useState(0);
  const [surface, setSurface] = useState(null);
  const [entry, setEntry] = useState(null);
  const [optionField, setOptionField] = useState(null);
  const [cursor, setCursor] = useState(0);

  const sections = useMemo(() => selectedIssue?.sections || [], [selectedIssue]);
  const published = selectedIssue?.status === 'published';

  const sectionName = (id) => sections.find((section) => section.id === id)?.name || 'Unassigned';

  // ── What the ring walks at each level ───────────────────────────────────────
  const surfaces = useMemo(() => {
    if (!selectedIssue) return [];
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    return [
      { key: 'blueprint', kind: 'surface', label: 'Blueprint', hint: `${plural(sections.length, 'section')} · ${statusLabel(ISSUE_STATUSES, selectedIssue.status)}`, icon: LayoutList },
      { key: 'articles', kind: 'surface', label: 'Articles', hint: plural(articles.length, 'article'), icon: FileText },
      { key: 'pages', kind: 'surface', label: 'Pages', hint: plural(pages.length, 'page'), icon: Layers },
      { key: 'publish', kind: 'surface', label: 'Preview & Publish', hint: published ? 'Live to readers' : 'Draft — not published', icon: Send },
    ];
  }, [selectedIssue, sections.length, articles.length, pages.length, published]);

  const entries = useMemo(() => {
    if (level === 0) {
      const list = [];
      if (error) {
        list.push({ key: 'retry', tone: 'action', action: 'retry', label: 'Try the archive again', hint: error, icon: RefreshCw });
      }
      list.push(
        { key: 'alchemize', tone: 'action', action: 'alchemize', label: 'Alchemize from TOP 100 Women 2025', hint: alchemizing ? 'Binding the edition…' : 'Nine sections · a hundred honorees · composed pages', icon: Sparkles },
        { key: 'new-issue', tone: 'action', action: 'new-issue', label: 'New blank issue', hint: 'An empty blueprint to start from', icon: Plus },
      );
      issues.forEach((issue) => list.push({
        key: `issue:${issue.id}`,
        kind: 'issue',
        id: issue.id,
        label: issue.title,
        hint: `${statusLabel(ISSUE_STATUSES, issue.status)} · ${issue.assembly_mode === 'pdf' ? 'PDF upload' : 'Native composition'}`,
        icon: BookOpen,
      }));
      return list;
    }

    if (level === 1) return surfaces;

    if (level === 2 && surface === 'blueprint') {
      if (!sections.length) {
        return [
          { key: 'alchemize-blank', tone: 'action', action: 'alchemize', label: 'Bind the 2025 edition as a new issue', hint: 'Nine sections, its articles and its pages', icon: Sparkles },
          { key: 'masthead', tone: 'action', action: 'masthead', label: 'Masthead fields', hint: selectedIssue.title, icon: PencilLine },
          { key: 'add-section', tone: 'action', action: 'add-section', label: 'Add a section', icon: Plus },
        ];
      }
      return [
        { key: 'masthead', tone: 'action', action: 'masthead', label: 'Masthead fields', hint: selectedIssue.title, icon: PencilLine },
        ...sections.map((section) => ({
          key: `section:${section.id}`,
          kind: 'section',
          id: section.id,
          label: section.name,
          hint: `${sectionTypeLabel(section.section_type)} · ${sectionGroupLabel(section.section_group || 'well')}`,
          icon: Type,
        })),
        { key: 'add-section', tone: 'action', action: 'add-section', label: 'Add a section', icon: Plus },
      ];
    }

    if (level === 2 && surface === 'articles') {
      return [
        ...articles.map((article) => ({
          key: `article:${article.id}`,
          kind: 'article',
          id: article.id,
          label: article.title,
          hint: `${articleStatusLabel(article.status)} · ${sectionName(article.section_id)}`,
          icon: article.article_type === 'profile' ? User : FileText,
        })),
        { key: 'new-article', tone: 'action', action: 'new-article', label: 'New article', icon: Plus },
      ];
    }

    if (level === 2 && surface === 'pages') {
      return [
        { key: 'compose', tone: 'action', action: 'generate-pages', label: 'Compose pages from the blueprint', hint: 'Cover, contents, dividers, articles, colophon', icon: RefreshCw },
        ...pages.map((page) => ({
          key: `page:${page.id}`,
          kind: 'page',
          id: page.id,
          label: `${String(page.page_number).padStart(2, '0')} · ${layoutLabel(page.layout_type)}`,
          hint: (page.content_blocks || []).find((block) => block.type === 'heading')?.text
            || (page.content_blocks || [])[0]?.text
            || page.chapter_label
            || 'Read the page',
          icon: Layers,
        })),
      ];
    }

    if (level === 2 && surface === 'publish') {
      return [
        published
          ? { key: 'unpublish', tone: 'action', action: 'unpublish', label: 'Take the issue back to draft', icon: RefreshCw }
          : { key: 'publish', tone: 'action', action: 'publish', label: 'Publish the issue', hint: 'Live to readers', icon: Send },
        { key: 'reader', tone: 'action', action: 'open-reader', label: 'Open in the reader', hint: 'The issue as a reader sees it', icon: Eye },
        { key: 'delete-issue', tone: 'action', action: 'delete-issue', label: 'Delete this issue', icon: Trash2 },
      ];
    }

    if (level === 4) {
      const field = optionField?.field;
      if (!field) return [];
      return field.options.map((option) => ({
        key: `option:${option.value}`,
        kind: 'option',
        value: option.value,
        label: option.label,
        hint: option.value === field.value ? 'Current' : '',
      }));
    }

    return [];
  }, [level, surface, issues, surfaces, sections, articles, pages, selectedIssue, published, optionField, alchemizing, error, sectionName]);

  // ── The fields of the entry standing open ───────────────────────────────────
  const fields = useMemo(() => {
    if (level !== 3 || !entry) return [];
    const choice = (key, label, options, value) => ({
      key,
      label,
      kind: 'choice',
      value,
      options: options.map((option) => ({ value: option.key, label: option.label })),
    });
    const remove = (label) => ({ key: '__delete', label, kind: 'action' });

    if (entry.kind === 'section') {
      const section = sections.find((s) => s.id === entry.id);
      if (!section) return [];
      return [
        { key: 'name', label: 'Section name', kind: 'text', value: section.name || '' },
        choice('section_type', 'Section type', SECTION_TYPES, section.section_type),
        choice('section_group', 'Part of the book', SECTION_GROUPS, section.section_group || 'well'),
        remove('Delete this section'),
      ];
    }

    if (entry.kind === 'article') {
      const article = articles.find((a) => a.id === entry.id);
      if (!article) return [];
      return [
        { key: 'title', label: 'Headline', kind: 'text', value: article.title || '' },
        { key: 'subtitle', label: 'Standfirst', kind: 'text', value: article.subtitle || '' },
        { key: 'teaser', label: 'Contents line', kind: 'text', value: article.teaser || '' },
        { key: 'writer_credit', label: 'Byline', kind: 'text', value: article.writer_credit || '' },
        { key: 'body', label: 'Copy', kind: 'long', value: article.body || '' },
        choice('article_type', 'Article type', ARTICLE_TYPES, article.article_type),
        choice('status', 'Status', ARTICLE_STATUSES, article.status),
        remove('Delete this article'),
      ];
    }

    if (entry.kind === 'issue') {
      return [
        { key: 'title', label: 'Issue title', kind: 'text', value: selectedIssue.title || '' },
        { key: 'subtitle', label: 'Issue subtitle', kind: 'text', value: selectedIssue.subtitle || '' },
        { key: 'cover_kicker', label: 'Cover line', kind: 'text', value: selectedIssue.cover_kicker || '' },
        { key: 'preface', label: "Editor's letter", kind: 'long', value: selectedIssue.preface || '' },
        { key: 'colophon', label: 'Colophon', kind: 'long', value: selectedIssue.colophon || '' },
      ];
    }

    return [];
  }, [level, entry, sections, articles, selectedIssue]);

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
            ◀▶ Walk · A Write
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
    ? '◀▶ Walk · A Take'
    : level === 0
      ? '◀▶ Walk · A Open'
      : '◀▶ Walk · A Open · B Back';

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