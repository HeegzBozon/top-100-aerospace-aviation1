import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Linkedin, Link as LinkIcon, Award, Brain, BarChartHorizontal, Flame } from 'lucide-react';

const NomineeProfileModal = ({ nominee, onClose }) => {
  if (!nominee) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg)] border-[var(--glass)] text-[var(--text)]">
        <CardHeader className="flex flex-row items-start justify-between border-b border-[var(--glass)] p-4">
          <div className="flex items-start gap-4">
            <img 
              src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
              alt={nominee.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--accent)]"
            />
            <div>
              <CardTitle className="text-2xl font-bold">{nominee.name}</CardTitle>
              <p className="text-[var(--muted)]">{nominee.title}</p>
              <p className="text-[var(--muted)] font-semibold">{nominee.company}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[var(--muted)] hover:bg-[var(--glass)]">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto space-y-6">
          {nominee.is_on_fire && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-red-400" />
              <div className="flex-1">
                <h4 className="font-bold text-red-300">On Fire!</h4>
                <p className="text-sm text-red-300/80">This nominee has high momentum right now.</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2 text-lg">About</h4>
            <p className="text-[var(--muted)] whitespace-pre-wrap">{nominee.description}</p>
          </div>
          
          {nominee.bio && (
            <div>
              <h4 className="font-semibold mb-2 text-lg">Bio</h4>
              <p className="text-[var(--muted)] whitespace-pre-wrap">{nominee.bio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {nominee.linkedin_profile_url && (
              <a href={nominee.linkedin_profile_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-[var(--glass)] hover:bg-[var(--glass)]">
                  <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                </Button>
              </a>
            )}
            {nominee.website_url && (
              <a href={nominee.website_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-[var(--glass)] hover:bg-[var(--glass)]">
                  <LinkIcon className="w-4 h-4 mr-2" /> Website
                </Button>
              </a>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Stats & Spotlights</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<BarChartHorizontal className="text-indigo-400"/>} label="Starpower" value={(nominee.starpower_score * 100 || 0).toFixed(1)} />
              <StatCard icon={<Brain className="text-blue-400"/>} label="ELO Rating" value={nominee.elo_rating || 1200} />
              <StatCard icon={<Award className="text-green-400"/>} label="Borda Score" value={nominee.borda_score || 0} />
              <StatCard icon={<Award className="text-yellow-400"/>} label="Endorsements" value={nominee.endorsement_score || 0} />
            </div>
            {(nominee.rising_star_count > 0 || nominee.rock_star_count > 0 || nominee.super_star_count > 0 || nominee.north_star_count > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {nominee.rising_star_count > 0 && <Badge variant="secondary">⭐ Rising Star: {nominee.rising_star_count}</Badge>}
                    {nominee.rock_star_count > 0 && <Badge variant="secondary">🎸 Rock Star: {nominee.rock_star_count}</Badge>}
                    {nominee.super_star_count > 0 && <Badge variant="secondary">💫 Super Star: {nominee.super_star_count}</Badge>}
                    {nominee.north_star_count > 0 && <Badge variant="secondary">🌟 North Star: {nominee.north_star_count}</Badge>}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-[var(--glass)] p-4 rounded-lg flex items-center gap-3">
    <div className="w-8 h-8 flex items-center justify-center text-xl">{icon}</div>
    <div>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  </div>
);

export default NomineeProfileModal;