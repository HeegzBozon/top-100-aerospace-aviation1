import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, BookOpen, Plus, ArrowLeft } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import IssueList from '@/components/magazine/IssueList';
import IssueBlueprint from '@/components/magazine/IssueBlueprint';
import ArticleInventory from '@/components/magazine/ArticleInventory';
import PageComposer from '@/components/magazine/PageComposer';
import PreviewPublish from '@/components/magazine/PreviewPublish';

const TABS = [
  { key: 'blueprint', label: 'Blueprint' },
  { key: 'articles', label: 'Articles' },
  { key: 'pages', label: 'Pages' },
  { key: 'publish', label: 'Preview & Publish' },
];

export default function MagazineStudio() {
  const { toast } = useToast();
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState('blueprint');
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin check
  useEffect(() => {
    base44.auth.me().then((u) => {
      setIsAdmin(u.role === 'admin');
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });
  }, []);

  // Load issues
  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.MagazineIssue.filter({}, { sort: '-created_date', limit: 50 });
      setIssues(res.items || []);
    } catch (e) {
      toast({ title: 'Error loading issues', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authChecked && isAdmin) loadIssues();
  }, [authChecked, isAdmin, loadIssues]);

  // Load articles + pages when issue selected
  const loadDetail = useCallback(async (issueId) => {
    setLoadingDetail(true);
    try {
      const [artRes, pageRes] = await Promise.all([
        base44.entities.MagazineArticle.filter({ issue_id: issueId }, { sort: 'order', limit: 200 }),
        base44.entities.MagazinePage.filter({ issue_id: issueId }, { sort: 'page_number', limit: 200 }),
      ]);
      setArticles(artRes.items || []);
      setPages(pageRes.items || []);
    } catch (e) {
      toast({ title: 'Error loading issue detail', variant: 'destructive' });
    } finally {
      setLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedIssue) loadDetail(selectedIssue.id);
  }, [selectedIssue?.id]); // eslint-disable-line

  // Issue CRUD
  const createIssue = async () => {
    try {
      const res = await base44.entities.MagazineIssue.create({
        title: 'New Issue',
        status: 'draft',
        assembly_mode: 'native',
        sections: [],
      });
      setIssues([res, ...issues]);
      setSelectedIssue(res);
      setTab('blueprint');
      toast({ title: 'Issue created' });
    } catch (e) {
      toast({ title: 'Error creating issue', variant: 'destructive' });
    }
  };

  const updateIssue = async (id, data) => {
    try {
      const res = await base44.entities.MagazineIssue.update(id, data);
      setIssues(issues.map((i) => (i.id === id ? res : i)));
      setSelectedIssue(res);
      return res;
    } catch (e) {
      toast({ title: 'Error updating issue', variant: 'destructive' });
      throw e;
    }
  };

  const deleteIssue = async (id) => {
    try {
      await base44.entities.MagazineIssue.delete(id);
      // Also delete related articles and pages
      await base44.entities.MagazineArticle.deleteMany({ issue_id: id });
      await base44.entities.MagazinePage.deleteMany({ issue_id: id });
      setIssues(issues.filter((i) => i.id !== id));
      if (selectedIssue?.id === id) setSelectedIssue(null);
      toast({ title: 'Issue deleted' });
    } catch (e) {
      toast({ title: 'Error deleting issue', variant: 'destructive' });
    }
  };

  // Article CRUD
  const createArticle = async (data) => {
    try {
      const res = await base44.entities.MagazineArticle.create({
        issue_id: selectedIssue.id,
        status: 'reserved',
        order: articles.length,
        ...data,
      });
      setArticles([...articles, res]);
      return res;
    } catch (e) {
      toast({ title: 'Error creating article', variant: 'destructive' });
      throw e;
    }
  };

  const updateArticle = async (id, data) => {
    try {
      const res = await base44.entities.MagazineArticle.update(id, data);
      setArticles(articles.map((a) => (a.id === id ? res : a)));
      return res;
    } catch (e) {
      toast({ title: 'Error updating article', variant: 'destructive' });
      throw e;
    }
  };

  const deleteArticle = async (id) => {
    try {
      await base44.entities.MagazineArticle.delete(id);
      setArticles(articles.filter((a) => a.id !== id));
      toast({ title: 'Article deleted' });
    } catch (e) {
      toast({ title: 'Error deleting article', variant: 'destructive' });
    }
  };

  // Page CRUD
  const createPage = async (data) => {
    try {
      const res = await base44.entities.MagazinePage.create({
        issue_id: selectedIssue.id,
        page_number: pages.length + 1,
        status: 'draft',
        content_blocks: [],
        ...data,
      });
      setPages([...pages, res].sort((a, b) => a.page_number - b.page_number));
      return res;
    } catch (e) {
      toast({ title: 'Error creating page', variant: 'destructive' });
      throw e;
    }
  };

  const updatePage = async (id, data) => {
    try {
      const res = await base44.entities.MagazinePage.update(id, data);
      setPages(pages.map((p) => (p.id === id ? res : p)).sort((a, b) => a.page_number - b.page_number));
      return res;
    } catch (e) {
      toast({ title: 'Error updating page', variant: 'destructive' });
      throw e;
    }
  };

  const deletePage = async (id) => {
    try {
      await base44.entities.MagazinePage.delete(id);
      setPages(pages.filter((p) => p.id !== id));
      toast({ title: 'Page deleted' });
    } catch (e) {
      toast({ title: 'Error deleting page', variant: 'destructive' });
    }
  };

  // Auto-generate editorial pages from the issue blueprint + articles
  const generatePages = async () => {
    if (!selectedIssue) return;
    try {
      // Clear existing pages first
      if (pages.length > 0) {
        await base44.entities.MagazinePage.deleteMany({ issue_id: selectedIssue.id });
        setPages([]);
      }

      const newPages = [];
      let pageNum = 1;

      // 1. Cover page
      newPages.push({
        issue_id: selectedIssue.id,
        page_number: pageNum++,
        layout_type: 'cover',
        status: 'draft',
        content_blocks: [],
        background_image_url: selectedIssue.cover_image_url || '',
      });

      // 2. Masthead / contributors page
      newPages.push({
        issue_id: selectedIssue.id,
        page_number: pageNum++,
        layout_type: 'masthead',
        status: 'draft',
        content_blocks: [
          { type: 'heading', text: selectedIssue.title || '', level: 1 },
          { type: 'byline', text: selectedIssue.cover_kicker || '' },
        ],
      });

      // 3. Table of contents
      newPages.push({
        issue_id: selectedIssue.id,
        page_number: pageNum++,
        layout_type: 'toc',
        status: 'draft',
        content_blocks: [
          { type: 'heading', text: 'Contents', level: 1 },
        ],
      });

      // 4. Editor's letter / preface (if present)
      if (selectedIssue.preface) {
        newPages.push({
          issue_id: selectedIssue.id,
          page_number: pageNum++,
          layout_type: 'article',
          status: 'draft',
          content_blocks: [
            { type: 'kicker', text: 'Editor\'s Letter' },
            { type: 'heading', text: 'A Word from the Editor', level: 1 },
            { type: 'body', text: selectedIssue.preface },
          ],
        });
      }

      // 5. One page per article, ordered by section then article.order
      const sections = selectedIssue.sections || [];
      const sortedArticles = [...articles].sort((a, b) => {
        const sa = sections.findIndex((s) => s.id === a.section_id);
        const sb = sections.findIndex((s) => s.id === b.section_id);
        if (sa !== sb) return sa - sb;
        return (a.order || 0) - (b.order || 0);
      });

      sortedArticles.forEach((art) => {
        const section = sections.find((s) => s.id === art.section_id);
        const blocks = [
          { type: 'kicker', text: section?.name || '' },
          { type: 'heading', text: art.title || '', level: 1 },
        ];
        if (art.subtitle) blocks.push({ type: 'body', text: art.subtitle });
        if (art.writer_credit) blocks.push({ type: 'byline', text: art.writer_credit });
        if (art.body) blocks.push({ type: 'body', text: art.body });
        if (art.pull_quote) {
          newPages.push({
            issue_id: selectedIssue.id,
            page_number: pageNum++,
            layout_type: 'pull_quote',
            status: 'draft',
            content_blocks: [
              { type: 'pull_quote', text: art.pull_quote, attribution: art.pull_quote_attribution || '' },
            ],
          });
        }
        newPages.push({
          issue_id: selectedIssue.id,
          page_number: pageNum++,
          layout_type: 'article',
          article_id: art.id,
          section_id: art.section_id || '',
          status: 'draft',
          content_blocks: blocks,
          background_image_url: art.hero_image_url || '',
        });
      });

      // 6. Colophon
      newPages.push({
        issue_id: selectedIssue.id,
        page_number: pageNum++,
        layout_type: 'colophon',
        status: 'draft',
        content_blocks: [
          { type: 'heading', text: 'Colophon', level: 1 },
          { type: 'body', text: selectedIssue.colophon || '' },
        ],
      });

      const created = await base44.entities.MagazinePage.bulkCreate(newPages);
      setPages((created.records || []).sort((a, b) => a.page_number - b.page_number));
      toast({ title: 'Pages generated', description: `${newPages.length} pages created from the issue blueprint.` });
    } catch (e) {
      toast({ title: 'Error generating pages', variant: 'destructive' });
    }
  };

  // Publish flow
  const publishIssue = async () => {
    try {
      const updated = await updateIssue(selectedIssue.id, {
        status: 'published',
        published_date: new Date().toISOString(),
      });
      // Bulk update articles and pages to published
      const articleIds = articles.map((a) => a.id);
      const pageIds = pages.map((p) => p.id);
      if (articleIds.length) await base44.entities.MagazineArticle.bulkUpdate(articleIds.map((id) => ({ id, status: 'published' })));
      if (pageIds.length) await base44.entities.MagazinePage.bulkUpdate(pageIds.map((id) => ({ id, status: 'published' })));
      setArticles(articles.map((a) => ({ ...a, status: 'published' })));
      setPages(pages.map((p) => ({ ...p, status: 'published' })));
      toast({ title: 'Issue published', description: 'The digital magazine is now live.' });
    } catch (e) {
      toast({ title: 'Error publishing issue', variant: 'destructive' });
    }
  };

  const unpublishIssue = async () => {
    try {
      await updateIssue(selectedIssue.id, { status: 'draft' });
      const articleIds = articles.map((a) => a.id);
      const pageIds = pages.map((p) => p.id);
      if (articleIds.length) await base44.entities.MagazineArticle.bulkUpdate(articleIds.map((id) => ({ id, status: 'laid_out' })));
      if (pageIds.length) await base44.entities.MagazinePage.bulkUpdate(pageIds.map((id) => ({ id, status: 'draft' })));
      setArticles(articles.map((a) => ({ ...a, status: 'laid_out' })));
      setPages(pages.map((p) => ({ ...p, status: 'draft' })));
      toast({ title: 'Issue unpublished' });
    } catch (e) {
      toast({ title: 'Error unpublishing', variant: 'destructive' });
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.navyVoid }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: P.gold }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: P.navyVoid }}>
        <div>
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: P.gold }} />
          <h2 className="text-xl font-serif mb-2" style={{ color: P.cream }}>Editor access required</h2>
          <p className="text-sm" style={{ color: 'rgba(250,248,245,0.6)' }}>
            The Magazine Studio is available to editors only.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.navyVoid }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: P.gold }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: P.cream }}>
      {/* Masthead */}
      <div className="border-b" style={{ borderColor: 'rgba(30,58,90,0.12)', background: P.cream }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedIssue && (
              <button
                onClick={() => setSelectedIssue(null)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-60"
                style={{ color: P.navy }}
              >
                <ArrowLeft className="w-4 h-4" /> All Issues
              </button>
            )}
            {!selectedIssue && (
              <h1 className="text-lg font-serif tracking-tight" style={{ color: P.navy }}>
                Magazine Studio
              </h1>
            )}
          </div>
          {selectedIssue && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap"
                  style={{
                    background: tab === t.key ? P.navy : 'transparent',
                    color: tab === t.key ? P.cream : P.navy,
                    border: `1px solid ${tab === t.key ? P.navy : 'rgba(30,58,90,0.2)'}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!selectedIssue ? (
          <IssueList issues={issues} onSelect={setSelectedIssue} onCreate={createIssue} onDelete={deleteIssue} />
        ) : loadingDetail ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: P.navy }} />
          </div>
        ) : tab === 'blueprint' ? (
          <IssueBlueprint issue={selectedIssue} articles={articles} pages={pages} onUpdate={updateIssue} />
        ) : tab === 'articles' ? (
          <ArticleInventory
            issue={selectedIssue}
            articles={articles}
            onCreate={createArticle}
            onUpdate={updateArticle}
            onDelete={deleteArticle}
          />
        ) : tab === 'pages' ? (
          <PageComposer
            issue={selectedIssue}
            pages={pages}
            articles={articles}
            onCreate={createPage}
            onUpdate={updatePage}
            onDelete={deletePage}
            onGenerate={generatePages}
          />
        ) : (
          <PreviewPublish
            issue={selectedIssue}
            articles={articles}
            pages={pages}
            onPublish={publishIssue}
            onUnpublish={unpublishIssue}
          />
        )}
      </div>
    </div>
  );
}