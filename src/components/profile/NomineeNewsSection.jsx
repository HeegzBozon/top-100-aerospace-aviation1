import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2 } from 'lucide-react';

export default function NomineeNewsSection({ nomineeId }) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const data = await base44.entities.HonoreeMention.filter(
          { nominee_id: nomineeId },
          '-published_at',
          50
        );
        setMentions(data || []);
      } catch (err) {
        console.error('Error fetching news mentions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentions();
  }, [nomineeId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>In the News</CardTitle>
      </CardHeader>
      <CardContent>
        {mentions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No news mentions yet</p>
        ) : (
          <div className="space-y-4">
            {mentions.map((mention) => (
              <a
                key={mention.id}
                href={mention.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border rounded-lg p-4 hover:bg-slate-50 transition"
              >
                <div className="flex gap-4">
                  {mention.image_url && (
                    <img
                      src={mention.image_url}
                      alt={mention.article_title}
                      className="w-24 h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900 line-clamp-2">
                        {mention.article_title}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      {mention.news_site}
                      {mention.published_at && (
                        <>
                          {' • '}
                          {new Date(mention.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </>
                      )}
                    </p>
                    {mention.article_summary && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {mention.article_summary}
                      </p>
                    )}
                    {mention.confidence && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Confidence: {mention.confidence}
                      </Badge>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}