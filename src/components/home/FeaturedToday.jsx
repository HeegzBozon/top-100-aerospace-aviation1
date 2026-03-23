import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function FeaturedToday() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await base44.entities.KBArticle.list('-created_date', 4);
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <BookOpen className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} /> Featured Today
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: BRAND_COLORS.skyBlue }}>
            <div className="h-32 flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.cream }}>
              <BookOpen className="w-12 h-12" style={{ color: BRAND_COLORS.skyBlue }} />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2">{article.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{article.content}</p>
              <p className="text-xs text-slate-500 mt-3">By {article.author_email || 'Admin'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}