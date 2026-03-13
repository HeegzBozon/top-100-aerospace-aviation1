import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, ArrowUp, UserCircle, Calendar } from 'lucide-react';
import { TipEntry } from '@/entities/TipEntry';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

export default function TipViewModal({ tipId, onClose, currentUserEmail, onUpvote }) {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        setLoading(true);
        const fetchedTip = await TipEntry.get(tipId);
        // Increment view count optimistically
        await TipEntry.update(tipId, { views: (fetchedTip.views || 0) + 1 });
        setTip({ ...fetchedTip, views: (fetchedTip.views || 0) + 1 });
      } catch (error) {
        console.error("Failed to fetch tip:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTip();
  }, [tipId]);
  
  const hasUpvoted = tip?.upvoted_by?.includes(currentUserEmail);

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800 border-green-200',
    'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Advanced': 'bg-red-100 text-red-800 border-red-200'
  };

  const categoryColors = {
    'Technical': 'bg-blue-100 text-blue-800 border-blue-200',
    'Leadership': 'bg-purple-100 text-purple-800 border-purple-200',
    'Process': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Communication': 'bg-pink-100 text-pink-800 border-pink-200',
    'Innovation': 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start gap-4">
          {loading || !tip ? (
            <div className="w-full space-y-2 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={categoryColors[tip.category]}>{tip.category}</Badge>
                <Badge variant="outline" className={difficultyColors[tip.difficulty]}>{tip.difficulty}</Badge>
              </div>
              <h2 className="text-2xl font-bold leading-tight">{tip.title}</h2>
            </div>
          )}
          <button 
            onClick={onClose} 
            className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading || !tip ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
          ) : (
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{tip.content}</ReactMarkdown>
            </article>
          )}
        </div>

        {!loading && tip && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5"/>
                <span>{tip.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5"/>
                <span>Shared {formatDistanceToNow(new Date(tip.created_date), { addSuffix: true })}</span>
              </div>
            </div>
            <Button
              variant={hasUpvoted ? "secondary" : "default"}
              size="lg"
              onClick={() => onUpvote(tip.id)}
              className={`flex items-center gap-2 ${hasUpvoted ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}
            >
              <ArrowUp className="w-5 h-5" />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote'} ({tip.upvotes || 0})</span>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}