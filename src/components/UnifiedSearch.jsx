import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Award, Users, Calendar, FileText, Sparkles, BookOpen, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function UnifiedSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ nominees: [], events: [], articles: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!query.trim()) {
      setResults({ nominees: [], events: [], articles: [], tags: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchLower = query.toLowerCase();
        
        // Search nominees
        const allNominees = await base44.entities.Nominee.list('-created_date', 100);
        const matchingNominees = allNominees.filter(n => 
          n.name?.toLowerCase().includes(searchLower) ||
          n.company?.toLowerCase().includes(searchLower) ||
          n.title?.toLowerCase().includes(searchLower)
        ).slice(0, 5);

        // Search events
        const allEvents = await base44.entities.Event.list('-event_date', 50);
        const matchingEvents = allEvents.filter(e =>
          e.title?.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower)
        ).slice(0, 3);

        // Search KB articles
        const allArticles = await base44.entities.KBArticle.list('-created_date', 50);
        const matchingArticles = allArticles.filter(a =>
          a.title?.toLowerCase().includes(searchLower) ||
          a.content?.toLowerCase().includes(searchLower)
        ).slice(0, 3);

        // Search tags
        const allTags = await base44.entities.NomineeTag.filter({ status: 'approved' }, '-upvotes');
        const uniqueTags = new Map();
        allTags.forEach(tag => {
          if (tag.tag_name.toLowerCase().includes(searchLower) && !uniqueTags.has(tag.tag_name)) {
            uniqueTags.set(tag.tag_name, tag);
          }
        });
        const matchingTags = Array.from(uniqueTags.values()).slice(0, 8);

        setResults({
          nominees: matchingNominees,
          events: matchingEvents,
          articles: matchingArticles,
          tags: matchingTags,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = () => {
    setQuery('');
    onClose();
  };

  const handleTagClick = (tagName) => {
    // Navigate to CourtOfHonor with tag filter in URL
    window.location.href = createPageUrl(`CourtOfHonor?tag=${encodeURIComponent(tagName)}`);
    handleResultClick();
  };

  const categoryColors = {
    skill: '#4a90b8',
    industry: '#c9a87c',
    achievement: '#d4a574',
    attribute: '#1e3a5a',
    technology: '#5da5a2',
    geography: '#6b7280',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="p-4 border-b" style={{ borderColor: `${brandColors.navyDeep}20` }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: brandColors.navyDeep }} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nominees, events, articles..."
              className="pl-10 text-base border-0 focus-visible:ring-0 shadow-none"
              style={{ color: brandColors.navyDeep }}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : query && (results.nominees.length === 0 && results.events.length === 0 && results.articles.length === 0 && results.tags.length === 0) ? (
            <div className="p-8 text-center text-gray-500">No results found</div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Tags */}
              {results.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <Sparkles className="w-4 h-4" />
                    Tags & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag.tag_name)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: `${categoryColors[tag.category] || '#666'}20`,
                          color: categoryColors[tag.category] || '#666',
                          border: `2px solid ${categoryColors[tag.category] || '#666'}`,
                        }}
                      >
                        {tag.tag_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Nominees */}
              {results.nominees.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <Users className="w-4 h-4" />
                    Nominees
                  </h3>
                  <div className="space-y-2">
                    {results.nominees.map((nominee) => (
                      <Link
                          key={nominee.id}
                          to={createPageUrl(`CourtOfHonor?nominee=${nominee.id}`)}
                          onClick={handleResultClick}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-center gap-3">
                          {nominee.avatar_url ? (
                            <img src={nominee.avatar_url} alt={nominee.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${brandColors.goldPrestige}20` }}>
                              <Award className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium" style={{ color: brandColors.navyDeep }}>{nominee.name}</div>
                            {nominee.title && <div className="text-sm text-gray-600">{nominee.title}</div>}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <Calendar className="w-4 h-4" />
                    Events
                  </h3>
                  <div className="space-y-2">
                    {results.events.map((event) => (
                      <Link
                        key={event.id}
                        to={createPageUrl(`EventPage?id=${event.id}`)}
                        onClick={handleResultClick}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium" style={{ color: brandColors.navyDeep }}>{event.title}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.event_date).toLocaleDateString()}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles */}
              {results.articles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <FileText className="w-4 h-4" />
                    Help Articles
                  </h3>
                  <div className="space-y-2">
                    {results.articles.map((article) => (
                      <Link
                        key={article.id}
                        to={createPageUrl(`Article?id=${article.id}`)}
                        onClick={handleResultClick}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium" style={{ color: brandColors.navyDeep }}>{article.title}</div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {!query && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                    <Sparkles className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 rounded-lg text-center relative opacity-60 cursor-not-allowed">
                      <div className="absolute inset-0 bg-gray-900/10 rounded-lg backdrop-blur-[2px] flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <Award className="w-6 h-6 mx-auto mb-1" style={{ color: brandColors.goldPrestige }} />
                      <div className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>Court of Honor</div>
                      <Badge className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5" style={{ backgroundColor: brandColors.goldPrestige, color: 'white' }}>
                        Soon
                      </Badge>
                    </div>
                    <Link to={createPageUrl('Articles')} onClick={handleResultClick} className="p-3 rounded-lg hover:bg-gray-50 text-center">
                      <FileText className="w-6 h-6 mx-auto mb-1" style={{ color: brandColors.goldPrestige }} />
                      <div className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>Journal</div>
                    </Link>
                    <Link to={createPageUrl('HelpCenter')} onClick={handleResultClick} className="p-3 rounded-lg hover:bg-gray-50 text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-1" style={{ color: brandColors.goldPrestige }} />
                      <div className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>Knowledge Base</div>
                    </Link>
                    <Link to={createPageUrl('Calendar')} onClick={handleResultClick} className="p-3 rounded-lg hover:bg-gray-50 text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-1" style={{ color: brandColors.goldPrestige }} />
                      <div className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>Events</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}