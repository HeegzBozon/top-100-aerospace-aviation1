import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BookOpen, Briefcase, Cpu, Heart, Lightbulb, Zap } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const typeIcons = {
  patent: Lightbulb,
  publication: BookOpen,
  research: Zap,
  role: Briefcase,
  award: Award,
  project: Cpu,
  mission: Zap,
  technology: Cpu,
  leadership: Briefcase,
  mentorship: Heart
};

export default function NomineeContributionsSection({ nomineeId }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await base44.entities.Contribution.filter(
          { nominee_id: nomineeId },
          '-date',
          100
        );
        setContributions(data || []);
      } catch (err) {
        console.error('Error fetching contributions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
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

  const types = ['all', ...new Set(contributions.map(c => c.type))];
  const filtered = selectedType === 'all' 
    ? contributions 
    : contributions.filter(c => c.type === selectedType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributions & Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {contributions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No contributions recorded yet</p>
        ) : (
          <>
            <Tabs defaultValue="all" onValueChange={setSelectedType}>
              <TabsList className="grid w-full grid-cols-auto gap-1">
                {types.map(type => (
                  <TabsTrigger key={type} value={type} className="capitalize">
                    {type === 'all' ? 'All' : type}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {type === 'all' ? contributions.length : contributions.filter(c => c.type === type).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedType} className="space-y-4 mt-6">
                {filtered.map((contrib) => {
                  const Icon = typeIcons[contrib.type] || Zap;
                  return (
                    <div key={contrib.id} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <h4 className="font-semibold text-slate-900">{contrib.title}</h4>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{contrib.description}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <Badge variant="outline" className="capitalize">{contrib.type}</Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {contrib.date && (
                              <span className="text-xs text-slate-500">
                                {new Date(contrib.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              </span>
                            )}
                            {contrib.verified_by_nominee && (
                              <Badge variant="secondary" className="text-xs">Verified by nominee</Badge>
                            )}
                            {contrib.tags?.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>

                          {contrib.external_links?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {contrib.external_links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline truncate"
                                >
                                  Link →
                                </a>
                              ))}
                            </div>
                          )}

                          {contrib.impact_metrics && Object.values(contrib.impact_metrics).some(v => v > 0) && (
                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
                              {contrib.impact_metrics.citation_count > 0 && (
                                <span>{contrib.impact_metrics.citation_count} citations</span>
                              )}
                              {contrib.impact_metrics.h_index > 0 && (
                                <span>h-index: {contrib.impact_metrics.h_index}</span>
                              )}
                              {contrib.impact_metrics.team_size_led > 0 && (
                                <span>Led {contrib.impact_metrics.team_size_led} person team</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}