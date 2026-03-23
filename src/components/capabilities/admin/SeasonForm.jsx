import { useState, useEffect } from 'react';
import { Season } from '@/entities/Season';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, X, Info, Timer, Vote, 
  RefreshCw, Scale, Sparkles, Users, CheckCircle, Brain
} from 'lucide-react';

const DatePicker = ({ label, value, onChange }) => (
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span className="text-gray-400">Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  </div>
);

const VotingModeSwitch = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center space-x-3">
      <Switch id={label} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={label} className="font-semibold text-gray-800 cursor-pointer">{label}</Label>
    </div>
    <p className="text-xs text-gray-500 hidden sm:block max-w-[200px]">{description}</p>
  </div>
);

const WeightSlider = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
        {label}
      </Label>
      <span className="text-sm font-bold text-indigo-600">{value}%</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      max={100}
      step={5}
      className="w-full"
    />
  </div>
);

export default function SeasonForm({ season, onClose, onSuccess, previousSeasons = [] }) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    description: '',
    start_date: null,
    end_date: null,
    nomination_start: null,
    nomination_end: null,
    voting_start: null,
    voting_end: null,
    review_start: null,
    review_end: null,
    voting_modes: {
      pairwise: true,
      ranked_choice: false,
      direct: false,
      spotlight: true,
      endorsements: true,
    },
    rollover_config: {
      enabled: true,
      source_season_id: '',
      eligibility_window_years: 3,
      require_revalidation: true,
      revalidation_method: 'self_confirm',
      min_endorsers_required: 1,
      fresh_nominee_boost: 1.1,
      impact_window_months: 24,
      rollover_completed: false,
    },
    scoring_config: {
      perception_weight: 30,
      objective_weight: 30,
      sme_weight: 20,
      narrative_weight: 10,
      normalization_weight: 10,
      use_holistic_v3: true,
    },
  });

  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name || '',
        theme: season.theme || '',
        description: season.description || '',
        start_date: season.start_date ? new Date(season.start_date) : null,
        end_date: season.end_date ? new Date(season.end_date) : null,
        nomination_start: season.nomination_start ? new Date(season.nomination_start) : null,
        nomination_end: season.nomination_end ? new Date(season.nomination_end) : null,
        voting_start: season.voting_start ? new Date(season.voting_start) : null,
        voting_end: season.voting_end ? new Date(season.voting_end) : null,
        review_start: season.review_start ? new Date(season.review_start) : null,
        review_end: season.review_end ? new Date(season.review_end) : null,
        voting_modes: season.voting_modes || formData.voting_modes,
        rollover_config: { ...formData.rollover_config, ...season.rollover_config },
        scoring_config: { ...formData.scoring_config, ...season.scoring_config },
      });
    }
  }, [season]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSwitchChange = (mode) => {
    setFormData(prev => ({
      ...prev,
      voting_modes: { ...prev.voting_modes, [mode]: !prev.voting_modes[mode] },
    }));
  };

  const handleRolloverChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      rollover_config: { ...prev.rollover_config, [field]: value },
    }));
  };

  const handleScoringChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scoring_config: { ...prev.scoring_config, [field]: value },
    }));
  };

  const scoringTotal = Object.entries(formData.scoring_config)
    .filter(([k]) => k.endsWith('_weight'))
    .reduce((sum, [, v]) => sum + v, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        nomination_start: formData.nomination_start?.toISOString(),
        nomination_end: formData.nomination_end?.toISOString(),
        voting_start: formData.voting_start?.toISOString(),
        voting_end: formData.voting_end?.toISOString(),
        review_start: formData.review_start?.toISOString(),
        review_end: formData.review_end?.toISOString(),
      };

      if (season?.id) {
        await Season.update(season.id, dataToSubmit);
      } else {
        await Season.create(dataToSubmit);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save season:', error);
      alert('Error saving season. Check console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">
            {season?.id ? 'Edit Season' : 'Create New Season'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start border-b rounded-none px-6 bg-transparent">
            <TabsTrigger value="general" className="gap-2">
              <Info className="w-4 h-4" /> General
            </TabsTrigger>
            <TabsTrigger value="dates" className="gap-2">
              <Timer className="w-4 h-4" /> Dates
            </TabsTrigger>
            <TabsTrigger value="voting" className="gap-2">
              <Vote className="w-4 h-4" /> Voting
            </TabsTrigger>
            <TabsTrigger value="rollover" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Rollover
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2">
              <Scale className="w-4 h-4" /> Scoring
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* General Tab */}
              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Season Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Season 4 - 2026" required />
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Input id="theme" name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g., 'Future of Flight'" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the season's goals or focus." rows={4} />
                </div>
              </TabsContent>

              {/* Dates Tab */}
              <TabsContent value="dates" className="mt-0 space-y-6">
                <div className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
                  <p className="text-sm text-gray-600 font-medium">Season Timeline</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker label="Season Start" value={formData.start_date} onChange={(d) => handleDateChange('start_date', d)} />
                    <DatePicker label="Season End" value={formData.end_date} onChange={(d) => handleDateChange('end_date', d)} />
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50/50 space-y-4">
                  <p className="text-sm text-yellow-800 font-medium">Nomination Phase</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker label="Nominations Open" value={formData.nomination_start} onChange={(d) => handleDateChange('nomination_start', d)} />
                    <DatePicker label="Nominations Close" value={formData.nomination_end} onChange={(d) => handleDateChange('nomination_end', d)} />
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-green-50/50 space-y-4">
                  <p className="text-sm text-green-800 font-medium">Voting Phase</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker label="Voting Opens" value={formData.voting_start} onChange={(d) => handleDateChange('voting_start', d)} />
                    <DatePicker label="Voting Closes" value={formData.voting_end} onChange={(d) => handleDateChange('voting_end', d)} />
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50/50 space-y-4">
                  <p className="text-sm text-purple-800 font-medium">Review Phase (Optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker label="Review Starts" value={formData.review_start} onChange={(d) => handleDateChange('review_start', d)} />
                    <DatePicker label="Review Ends" value={formData.review_end} onChange={(d) => handleDateChange('review_end', d)} />
                  </div>
                </div>
              </TabsContent>

              {/* Voting Tab */}
              <TabsContent value="voting" className="mt-0 space-y-3">
                <VotingModeSwitch label="Pairwise Voting" description="Head-to-head nominee comparisons" checked={formData.voting_modes.pairwise} onCheckedChange={() => handleSwitchChange('pairwise')} />
                <VotingModeSwitch label="Ranked Choice" description="Users rank their top nominees" checked={formData.voting_modes.ranked_choice} onCheckedChange={() => handleSwitchChange('ranked_choice')} />
                <VotingModeSwitch label="Direct Voting" description="Single vote per user" checked={formData.voting_modes.direct} onCheckedChange={() => handleSwitchChange('direct')} />
                <VotingModeSwitch label="Spotlight Voting" description="Rising Star, Rock Star, etc." checked={formData.voting_modes.spotlight} onCheckedChange={() => handleSwitchChange('spotlight')} />
                <VotingModeSwitch label="Endorsements" description="Community endorsements" checked={formData.voting_modes.endorsements} onCheckedChange={() => handleSwitchChange('endorsements')} />
              </TabsContent>

              {/* Rollover Tab */}
              <TabsContent value="rollover" className="mt-0 space-y-6">
                <div className="p-4 border rounded-lg bg-blue-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">Enable Nominee Rollover</p>
                      <p className="text-sm text-gray-500">Eligible nominees from previous seasons can carry forward</p>
                    </div>
                    <Switch 
                      checked={formData.rollover_config.enabled} 
                      onCheckedChange={(v) => handleRolloverChange('enabled', v)} 
                    />
                  </div>
                </div>

                {formData.rollover_config.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Source Season</Label>
                        <Select 
                          value={formData.rollover_config.source_season_id} 
                          onValueChange={(v) => handleRolloverChange('source_season_id', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select previous season" />
                          </SelectTrigger>
                          <SelectContent>
                            {previousSeasons.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Eligibility Window (Years)</Label>
                        <Input 
                          type="number" 
                          min={1} max={5} 
                          value={formData.rollover_config.eligibility_window_years} 
                          onChange={(e) => handleRolloverChange('eligibility_window_years', parseInt(e.target.value))} 
                        />
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">Require Revalidation</p>
                          <p className="text-sm text-gray-500">Nominees must confirm continued eligibility</p>
                        </div>
                        <Switch 
                          checked={formData.rollover_config.require_revalidation} 
                          onCheckedChange={(v) => handleRolloverChange('require_revalidation', v)} 
                        />
                      </div>

                      {formData.rollover_config.require_revalidation && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <Label>Revalidation Method</Label>
                            <Select 
                              value={formData.rollover_config.revalidation_method} 
                              onValueChange={(v) => handleRolloverChange('revalidation_method', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="self_confirm">
                                  <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Self Confirmation
                                  </span>
                                </SelectItem>
                                <SelectItem value="community_confirm">
                                  <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Community Endorsement
                                  </span>
                                </SelectItem>
                                <SelectItem value="system_check">
                                  <span className="flex items-center gap-2">
                                    <Brain className="w-4 h-4" /> System Verification
                                  </span>
                                </SelectItem>
                                <SelectItem value="admin_review">
                                  <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Admin Review
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {formData.rollover_config.revalidation_method === 'community_confirm' && (
                            <div>
                              <Label>Min. Endorsers Required</Label>
                              <Input 
                                type="number" 
                                min={1} max={10} 
                                value={formData.rollover_config.min_endorsers_required} 
                                onChange={(e) => handleRolloverChange('min_endorsers_required', parseInt(e.target.value))} 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fresh Nominee Boost (Multiplier)</Label>
                        <Input 
                          type="number" 
                          step={0.05}
                          min={1} max={2} 
                          value={formData.rollover_config.fresh_nominee_boost} 
                          onChange={(e) => handleRolloverChange('fresh_nominee_boost', parseFloat(e.target.value))} 
                        />
                        <p className="text-xs text-gray-500 mt-1">1.0 = no boost, 1.1 = 10% boost for new nominees</p>
                      </div>
                      <div>
                        <Label>Impact Window (Months)</Label>
                        <Input 
                          type="number" 
                          min={6} max={48} 
                          value={formData.rollover_config.impact_window_months} 
                          onChange={(e) => handleRolloverChange('impact_window_months', parseInt(e.target.value))} 
                        />
                        <p className="text-xs text-gray-500 mt-1">Only consider achievements within this window</p>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Scoring Tab */}
              <TabsContent value="scoring" className="mt-0 space-y-6">
                <div className="p-4 border rounded-lg bg-indigo-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">Use Holistic Scoring V3.0</p>
                      <p className="text-sm text-gray-500">Multi-layer scoring framework</p>
                    </div>
                    <Switch 
                      checked={formData.scoring_config.use_holistic_v3} 
                      onCheckedChange={(v) => handleScoringChange('use_holistic_v3', v)} 
                    />
                  </div>
                </div>

                {formData.scoring_config.use_holistic_v3 && (
                  <div className="p-4 border rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">Layer Weights</p>
                      <span className={`text-sm font-bold ${scoringTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        Total: {scoringTotal}% {scoringTotal === 100 ? '✓' : '(must be 100%)'}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <WeightSlider label="Perception Layer" value={formData.scoring_config.perception_weight} onChange={(v) => handleScoringChange('perception_weight', v)} icon={Users} />
                      <WeightSlider label="Objective Layer" value={formData.scoring_config.objective_weight} onChange={(v) => handleScoringChange('objective_weight', v)} icon={CheckCircle} />
                      <WeightSlider label="SME Layer" value={formData.scoring_config.sme_weight} onChange={(v) => handleScoringChange('sme_weight', v)} icon={Brain} />
                      <WeightSlider label="Narrative Layer" value={formData.scoring_config.narrative_weight} onChange={(v) => handleScoringChange('narrative_weight', v)} icon={Sparkles} />
                      <WeightSlider label="Normalization Layer" value={formData.scoring_config.normalization_weight} onChange={(v) => handleScoringChange('normalization_weight', v)} icon={Scale} />
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {season?.id ? 'Update Season' : 'Create Season'}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}