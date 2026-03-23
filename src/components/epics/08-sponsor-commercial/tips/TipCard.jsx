import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TipViewModal } from '@/components/epics/08-sponsor-commercial/tips';
import { ArrowUp, BookOpen, Eye } from 'lucide-react';

export default function TipCard({ tip, currentUserEmail, onUpvote }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hasUpvoted = tip.upvoted_by?.includes(currentUserEmail);

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <Card className="bg-[var(--card)] border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={categoryColors[tip.category] || 'bg-gray-100'}>{tip.category}</Badge>
              <Badge variant="outline" className={difficultyColors[tip.difficulty]}>{tip.difficulty}</Badge>
            </div>
            <CardTitle className="text-lg text-[var(--text)] line-clamp-2">{tip.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-[var(--muted)] line-clamp-3 text-sm">{tip.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center mt-auto border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
               <Button
                variant={hasUpvoted ? "secondary" : "ghost"}
                size="sm"
                onClick={(e) => { e.stopPropagation(); onUpvote(); }}
                className={`flex items-center gap-1.5 ${hasUpvoted ? 'text-[var(--accent)]' : ''}`}
               >
                 <ArrowUp className="w-4 h-4" />
                 <span>{tip.upvotes || 0}</span>
               </Button>
               <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{tip.views || 0}</span>
               </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Read More
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {isModalOpen && (
        <TipViewModal 
          tipId={tip.id} 
          onClose={() => setIsModalOpen(false)}
          currentUserEmail={currentUserEmail}
          onUpvote={onUpvote}
        />
      )}
    </>
  );
}