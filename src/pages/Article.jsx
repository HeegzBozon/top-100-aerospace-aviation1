import { useState, useEffect } from 'react';
import { KBArticle } from '@/entities/KBArticle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Calendar, 
  Tag,
  Loader2,
  Share2,
  Edit,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import ArticleEditor from '@/components/wiki/ArticleEditor';
import ArticleHistory from '@/components/wiki/ArticleHistory';
import DiscussionPanel from '@/components/wiki/DiscussionPanel';

export default function ArticlePage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
          setError('Article ID not provided');
          return;
        }

        // Load the article
        const articles = await KBArticle.list();
        const foundArticle = articles.find(a => a.id === articleId);
        
        if (!foundArticle) {
          setError('Article not found');
          return;
        }

        // Increment view count
        await KBArticle.update(articleId, { 
          views: (foundArticle.views || 0) + 1 
        });

        setArticle({ ...foundArticle, views: (foundArticle.views || 0) + 1 });
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, []);

  const handleHelpfulVote = async (isHelpful) => {
    if (!article) return;
    
    try {
      const updateData = isHelpful 
        ? { helpful_yes: (article.helpful_yes || 0) + 1 }
        : { helpful_no: (article.helpful_no || 0) + 1 };
      
      await KBArticle.update(article.id, updateData);
      setArticle(prev => ({ ...prev, ...updateData }));
    } catch (error) {
      console.error('Error recording helpful vote:', error);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Article URL has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Article Not Found</h1>
          <p className="text-[var(--muted)] mb-6">{error || 'The requested article could not be found.'}</p>
          <Link to={createPageUrl('HelpCenter')}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <Link to={createPageUrl('HelpCenter')} className="inline-flex items-center text-[var(--accent)] hover:text-[var(--text)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help Center
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge className={
              article.type === 'release_note' ? 'bg-green-100 text-green-800' :
              article.type === 'faq' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }>
              {article.type === 'release_note' ? 'Release Note' :
               article.type === 'faq' ? 'FAQ' : 'Article'}
            </Badge>
            <Badge variant="outline">{article.category}</Badge>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text)] mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            {article.author_name && (
              <span>By {article.author_name}</span>
            )}
            {article.publish_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(article.publish_date), 'PPP')}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views || 0} views
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Was this helpful? */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Was this article helpful?</h3>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => handleHelpfulVote(true)}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Yes ({article.helpful_yes || 0})
            </Button>
            <Button
              variant="outline"
              onClick={() => handleHelpfulVote(false)}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              No ({article.helpful_no || 0})
            </Button>
          </div>
        </div>

        {/* Discussion */}
        <DiscussionPanel articleId={article.id} />
      </div>

      {/* Modals */}
      {showEditor && (
        <ArticleEditor
          article={article}
          onClose={() => setShowEditor(false)}
          onSuccess={() => setShowEditor(false)}
        />
      )}
      {showHistory && (
        <ArticleHistory
          articleId={article.id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}