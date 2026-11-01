import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loadStars } from './starAtlas';
import AtlasStarGrid from './AtlasStarGrid';

export default function AtlasTrail({ constellation, passport, onOpen, onClose }) {
  const [stars, setStars] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { loadStars(constellation.nominee_ids).then(setStars).catch(() => setError(true)); }, [constellation.id]);
  if (error) return <p className="text-sm text-editorial-cream/70">The sky is clouded over. Try again in a moment.</p>;
  if (!stars) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-editorial-gold" /></div>;
  return (
    <div className="space-y-3">
      {constellation.story && <p className="text-sm italic text-editorial-cream/85">“{constellation.story}”</p>}
      <AtlasStarGrid stars={stars} passport={passport} onOpen={onOpen} onClose={onClose} />
    </div>
  );
}