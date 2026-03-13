import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

export default function LandingNewsSection() {
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['landing-journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-published_date', 6),
  });

  const { data: kbArticles = [] } = useQuery({
    queryKey: ['landing-kb-articles'],
    queryFn: () => base44.entities.KBArticle.filter({ status: 'published' }, '-publish_date', 6),
  });

  // Combine and sort by date
  const allArticles = [
    ...journalEntries.map(a => ({
      ...a,
      contentSource: 'editorial',
      sortDate: a.published_date || a.created_date,
    })),
    ...kbArticles.map(a => ({
      ...a,
      contentSource: 'wiki',
      sortDate: a.publish_date || a.created_date,
      excerpt: a.content?.substring(0, 150)?.replace(/<[^>]*>/g, ''),
    })),
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate)).slice(0, 6);

  if (allArticles.length === 0) return null;

  const featuredArticle = allArticles[0];
  const sideArticles = allArticles.slice(1, 4);

  return (
    <section className="px-3 md:px-4 py-8">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
              Latest News
            </h2>
          </div>
          <Link 
            to={createPageUrl('Articles')} 
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: brandColors.skyBlue, fontFamily: "'Montserrat', sans-serif" }}
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          <Link 
            to={featuredArticle.contentSource === 'wiki' 
              ? createPageUrl(`HelpCenter?article=${featuredArticle.slug || featuredArticle.id}`)
              : createPageUrl(`Article?id=${featuredArticle.id}`)}
            className="lg:col-span-2 group"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
              {featuredArticle.featured_image_url && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img 
                    src={featuredArticle.featured_image_url} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className="text-[10px]"
                    style={{ borderColor: brandColors.goldPrestige, color: brandColors.goldPrestige }}
                  >
                    {featuredArticle.contentSource === 'wiki' ? 'WIKI' : 'EDITORIAL'}
                  </Badge>
                  {featuredArticle.category && (
                    <span className="text-xs uppercase tracking-widest" style={{ color: brandColors.goldPrestige, fontWeight: 600 }}>
                      {featuredArticle.category}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:opacity-80 transition-opacity" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
                  {featuredArticle.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2 flex-1" style={{ color: `${brandColors.navyDeep}99`, fontFamily: "'Montserrat', sans-serif" }}>
                  {featuredArticle.excerpt || featuredArticle.content?.substring(0, 150)}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: `${brandColors.navyDeep}80` }}>
                  {featuredArticle.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{featuredArticle.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(featuredArticle.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Side Articles */}
          <div className="flex flex-col gap-4">
            {sideArticles.map((article) => (
              <Link 
                key={article.id}
                to={article.contentSource === 'wiki' 
                  ? createPageUrl(`HelpCenter?article=${article.slug || article.id}`)
                  : createPageUrl(`Article?id=${article.id}`)}
                className="group"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex gap-4" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
                  {article.featured_image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:opacity-80 transition-opacity" style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}>
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs" style={{ color: `${brandColors.navyDeep}70` }}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}