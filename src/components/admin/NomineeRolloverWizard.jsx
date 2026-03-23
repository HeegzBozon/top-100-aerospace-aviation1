import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  X, RefreshCw, CheckCircle, XCircle, 
  Clock, Search, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight, Sparkles, Calendar
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

// sourceSeason = the season we're rolling FROM (the completed one)
// allSeasons = list of all seasons so user can pick the TARGET
export default function NomineeRolloverWizard({ sourceSeason, allSeasons = [], onClose, onComplete }) {
  const [step, setStep] = useState(0); // Step 0 = select target season
  const [targetSeasonId, setTargetSeasonId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNominees, setSelectedNominees] = useState(new Set());
  const [excludedNominees, setExcludedNominees] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const queryClient = useQueryClient();

  // Target season object
  const targetSeason = allSeasons.find(s => s.id === targetSeasonId);
  
  // Available target seasons (exclude source, show only planning/nominations_open)
  const availableTargets = allSeasons.filter(s => 
    s.id !== sourceSeason?.id && 
    ['planning', 'nominations_open', 'rollover'].includes(s.status)
  );

  // Fetch eligible nominees from source season
  const { data: sourceNominees = [], isLoading } = useQuery({
    queryKey: ['rollover-nominees', sourceSeason?.id],
    queryFn: async () => {
      const nominees = await base44.entities.Nominee.filter({ 
        season_id: sourceSeason.id,
        status: 'active'
      });
      return nominees;
    },
    enabled: !!sourceSeason?.id && step >= 1,
  });

  // Initialize all as selected
  useEffect(() => {
    if (sourceNominees.length > 0 && selectedNominees.size === 0) {
      setSelectedNominees(new Set(sourceNominees.map(n => n.id)));
    }
  }, [sourceNominees]);

  const filteredNominees = sourceNominees.filter(n =>
    n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleNominee = (id) => {
    const newSelected = new Set(selectedNominees);
    const newExcluded = new Set(excludedNominees);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
      newExcluded.add(id);
    } else {
      newSelected.add(id);
      newExcluded.delete(id);
    }
    
    setSelectedNominees(newSelected);
    setExcludedNominees(newExcluded);
  };

  const selectAll = () => {
    setSelectedNominees(new Set(filteredNominees.map(n => n.id)));
    setExcludedNominees(new Set());
  };

  const deselectAll = () => {
    setSelectedNominees(new Set());
    setExcludedNominees(new Set(filteredNominees.map(n => n.id)));
  };

  const executeRollover = async () => {
    if (!targetSeason) return;
    
    setProcessing(true);
    try {
      const nomineesToRollover = sourceNominees.filter(n => selectedNominees.has(n.id));
      let successCount = 0;
      let failCount = 0;

      for (const nominee of nomineesToRollover) {
        try {
          // Create new nominee record for new season
          const { id, created_date, updated_date, created_by, ...nomineeData } = nominee;
          
          await base44.entities.Nominee.create({
            ...nomineeData,
            season_id: targetSeason.id,
            status: 'active', // Set to active so they appear in the new season
            rollover_source_id: nominee.id,
            rollover_source_season_id: sourceSeason.id,
            // Reset voting scores
            elo_rating: 1200,
            borda_score: 0,
            direct_vote_count: 0,
            pairwise_appearance_count: 0,
            aura_score: 0,
            holistic_score: 0,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to rollover ${nominee.name}:`, err);
          failCount++;
        }
      }

      // Update target season rollover stats
      await base44.entities.Season.update(targetSeason.id, {
        rollover_config: {
          ...targetSeason.rollover_config,
          source_season_id: sourceSeason.id,
          rollover_completed: true,
          rollover_stats: {
            eligible_count: sourceNominees.length,
            revalidated_count: successCount,
            declined_count: excludedNominees.size,
            pending_count: 0,
          }
        }
      });

      setResults({ success: successCount, failed: failCount, excluded: excludedNominees.size });
      setStep(4); // Step 4 = complete
      queryClient.invalidateQueries(['seasons']);
      queryClient.invalidateQueries(['nominees']);
    } catch (error) {
      console.error('Rollover failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Nominee Rollover Wizard
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 0 
                ? `Rolling from: ${sourceSeason?.name || 'Unknown Season'}`
                : `${sourceSeason?.name} → ${targetSeason?.name || 'Select Target'}`
              }
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={step >= 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              1. Select Target
            </span>
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              2. Review Eligible
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              3. Confirm
            </span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              4. Complete
            </span>
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Select Target Season */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800">Select Target Season</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Choose which season to roll {sourceNominees.length || 'the'} nominees into.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rolling FROM (Source)
                </Label>
                <div className="p-3 bg-gray-100 rounded-lg border">
                  <p className="font-semibold text-gray-800">{sourceSeason?.name}</p>
                  <p className="text-sm text-gray-500">Status: {sourceSeason?.status}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rolling TO (Target Season) *
                </Label>
                <Select value={targetSeasonId} onValueChange={setTargetSeasonId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target season..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No eligible seasons (need planning/nominations_open)
                      </SelectItem>
                    ) : (
                      availableTargets.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <span>{s.name}</span>
                            <Badge variant="outline" className="text-xs">{s.status}</Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {targetSeasonId && targetSeason && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-800">Target Selected</p>
                  <p className="text-sm text-green-700 mt-1">
                    Nominees will be copied to: <strong>{targetSeason.name}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search nominees..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-2 border-b">
                <span>{filteredNominees.length} eligible nominees</span>
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> {selectedNominees.size} selected
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <XCircle className="w-4 h-4" /> {excludedNominees.size} excluded
                  </span>
                </span>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredNominees.map(nominee => (
                    <div 
                      key={nominee.id}
                      onClick={() => toggleNominee(nominee.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedNominees.has(nominee.id) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <Checkbox 
                        checked={selectedNominees.has(nominee.id)}
                        onCheckedChange={() => toggleNominee(nominee.id)}
                      />
                      <img 
                        src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
                        alt={nominee.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{nominee.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {nominee.title}{nominee.company ? `, ${nominee.company}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Aura: {nominee.aura_score?.toFixed(0) || 0}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Confirm Rollover</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This will create {selectedNominees.size} new nominee records in <strong>{targetSeason?.name}</strong>. 
                      Rolled-over nominees will have "active" status and be ready for voting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-800">{selectedNominees.size}</p>
                  <p className="text-sm text-green-600">Will Roll Over</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                  <p className="text-2xl font-bold text-red-800">{excludedNominees.size}</p>
                  <p className="text-sm text-red-600">Excluded</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-blue-800">{selectedNominees.size}</p>
                  <p className="text-sm text-blue-600">Need Revalidation</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Nominees will be copied to {targetSeason?.name}</li>
                  <li>All voting scores reset to baseline</li>
                  <li>Nominees will appear as "active" in the new season</li>
                  <li>Original records in source season remain unchanged</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && results && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Rollover Complete!</h3>
                <p className="text-gray-500 mt-1">
                  {results.success} nominees have been rolled over to {targetSeason?.name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-800">{results.success}</p>
                  <p className="text-xs text-green-600">Successful</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-800">{results.excluded}</p>
                  <p className="text-xs text-red-600">Excluded</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-800">{results.failed}</p>
                  <p className="text-xs text-gray-600">Failed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          {step === 0 && (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(1)} disabled={!targetSeasonId}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={selectedNominees.size === 0}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={executeRollover} disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Execute Rollover
                  </>
                )}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={() => { onComplete?.(); onClose(); }} className="ml-auto">
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}