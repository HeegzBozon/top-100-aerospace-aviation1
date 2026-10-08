import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, FileText, User, Award, Clock } from 'lucide-react';
import { MAGAZINE_PALETTE as P, ARTICLE_TYPES, ARTICLE_STATUSES, articleTypeLabel, articleStatusLabel, articleStatusColor, sectionTypeLabel } from '@/components/magazine/magazineConfig';
import ArticleEditor from '@/components/magazine/ArticleEditor';

const TYPE_ICONS = {
  evergreen: FileText,
  profile: User,
  feature: Award,
  results_reserved: Clock,
};

export default function ArticleInventory({ issue, articles, onCreate, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const sections = issue.sections || [];

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (filterSection !== 'all' && a.section_id !== filterSection) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (search && !a.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [articles, filterSection, filterStatus, search]);

  const handleCreate = async () => {
    const res = await onCreate({ title: 'Untitled Article', article_type: 'evergreen', status: 'reserved' });
    setEditing(res);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(30,58,90,0.3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full"
            style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.12)', color: P.navy, outline: 'none' }}
          />
        </div>
        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="mag-select">
          <option value="all">All Sections</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mag-select">
          <option value="all">All Statuses</option>
          {ARTICLE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button onClick={handleCreate} className="mag-btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4 inline mr-1" /> New Article
        </button>
      </div>

      {/* Article List */}
      {!filtered.length ? (
        <div className="text-center py-20">
          <FileText className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(30,58,90,0.2)' }} />
          <p className="text-sm" style={{ color: 'rgba(30,58,90,0.5)' }}>
            {articles.length ? 'No articles match your filters.' : 'No articles yet. Create one to begin drafting.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((article) => {
            const Icon = TYPE_ICONS[article.article_type] || FileText;
            const section = sections.find((s) => s.id === article.section_id);
            return (
              <div
                key={article.id}
                onClick={() => setEditing(article)}
                className="group flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-md"
                style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.08)' }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(30,58,90,0.05)' }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: P.navy }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: P.navy }}>{article.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: articleStatusColor(ARTICLE_STATUSES, article.status) + '18', color: articleStatusColor(ARTICLE_STATUSES, article.status) }}>
                      {articleStatusLabel(article.status)}
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(30,58,90,0.45)' }}>
                      {articleTypeLabel(article.article_type)}
                    </span>
                    {section && <span className="text-[10px]" style={{ color: 'rgba(30,58,90,0.45)' }}>· {section.name}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}
                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(30,58,90,0.4)' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Sheet */}
      {editing && (
        <ArticleEditor
          article={editing}
          issue={issue}
          onSave={async (data) => { const updated = await onUpdate(editing.id, data); setEditing(updated); return updated; }}
          onClose={() => setEditing(null)}
          onDelete={async () => { await onDelete(editing.id); setEditing(null); }}
        />
      )}

      <style>{`
        .mag-select {
          padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 9999px; background: #fff;
          border: 1px solid rgba(30,58,90,0.12); color: ${P.navy}; outline: none; cursor: pointer;
        }
        .mag-btn-primary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: ${P.navy}; color: ${P.cream}; border: 0; cursor: pointer; transition: opacity 0.2s;
        }
        .mag-btn-primary:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}