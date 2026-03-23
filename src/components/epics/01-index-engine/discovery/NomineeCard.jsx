import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, BarChartHorizontal } from 'lucide-react';

const NomineeCard = ({ nominee, onSelect }) => {
  return (
    <Card 
      onClick={() => onSelect(nominee)}
      className="bg-white/5 border border-white/10 hover:border-[var(--accent)] text-[var(--text)] transition-all cursor-pointer h-full flex flex-col shadow-lg backdrop-blur-sm"
    >
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            {/* Laurel wreath background */}
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
              alt="Laurel wreath"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Circular headshot in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
                alt={nominee.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-2">{nominee.name}</h3>
            <p className="text-sm text-[var(--muted)] line-clamp-1">{nominee.title}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)] flex-1 line-clamp-3 mb-4">
          {nominee.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {nominee.is_on_fire && (
              <Badge variant="destructive" className="bg-red-500/80 border-0 text-white">
                <Flame className="w-3 h-3 mr-1"/>
                On Fire
              </Badge>
            )}
             {nominee.category && <Badge variant="outline" className="border-[var(--glass)]">{nominee.category}</Badge>}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
            <BarChartHorizontal className="h-3 w-3" />
            <span>{(nominee.starpower_score * 100 || 0).toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NomineeCard;