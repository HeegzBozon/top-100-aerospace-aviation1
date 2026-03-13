import React, { useState } from 'react';
import { Competition } from '@/entities/Competition';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';

export default function CompetitionForm({ competition, leagues, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: competition?.name || '',
    league_id: competition?.league_id || '',
    description: competition?.description || '',
    competition_type: competition?.competition_type || 'top_100',
    category: competition?.category || '',
    start_date: competition?.start_date ? new Date(competition.start_date) : null,
    nomination_deadline: competition?.nomination_deadline ? new Date(competition.nomination_deadline) : null,
    voting_start: competition?.voting_start ? new Date(competition.voting_start) : null,
    voting_end: competition?.voting_end ? new Date(competition.voting_end) : null,
    results_date: competition?.results_date ? new Date(competition.results_date) : null,
    status: competition?.status || 'planning',
    max_nominees: competition?.max_nominees || 100,
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    User.me().then(setCurrentUser).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.league_id || !formData.description.trim()) {
      alert('Name, league, and description are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date?.toISOString().split('T')[0],
        nomination_deadline: formData.nomination_deadline?.toISOString().split('T')[0],
        voting_start: formData.voting_start?.toISOString().split('T')[0],
        voting_end: formData.voting_end?.toISOString().split('T')[0],
        results_date: formData.results_date?.toISOString().split('T')[0],
        created_by: currentUser?.email || 'unknown@example.com',
        max_nominees: Number(formData.max_nominees),
      };

      if (competition) {
        await Competition.update(competition.id, payload);
      } else {
        await Competition.create(payload);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving competition:', error);
      alert('Error saving competition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DatePicker = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {competition ? 'Edit Competition' : 'Create New Competition'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Top 100 Women in Aviation 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                League *
              </label>
              <Select 
                value={formData.league_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, league_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map(league => (
                    <SelectItem key={league.id} value={league.id}>{league.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the competition"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Type
              </label>
              <Select 
                value={formData.competition_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, competition_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_100">Top 100</SelectItem>
                  <SelectItem value="top_50">Top 50</SelectItem>
                  <SelectItem value="top_25">Top 25</SelectItem>
                  <SelectItem value="rising_stars">Rising Stars</SelectItem>
                  <SelectItem value="lifetime_achievement">Lifetime Achievement</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Leadership, Innovation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Nominees
              </label>
              <Input
                type="number"
                value={formData.max_nominees}
                onChange={(e) => setFormData(prev => ({ ...prev, max_nominees: e.target.value }))}
                placeholder="100"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
              placeholder="Select start date"
            />
            <DatePicker
              label="Nomination Deadline"
              value={formData.nomination_deadline}
              onChange={(date) => setFormData(prev => ({ ...prev, nomination_deadline: date }))}
              placeholder="Select nomination deadline"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Voting Start"
              value={formData.voting_start}
              onChange={(date) => setFormData(prev => ({ ...prev, voting_start: date }))}
              placeholder="Select voting start date"
            />
            <DatePicker
              label="Voting End"
              value={formData.voting_end}
              onChange={(date) => setFormData(prev => ({ ...prev, voting_end: date }))}
              placeholder="Select voting end date"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Results Date"
              value={formData.results_date}
              onChange={(date) => setFormData(prev => ({ ...prev, results_date: date }))}
              placeholder="Select results announcement date"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="nominations_open">Nominations Open</SelectItem>
                  <SelectItem value="nominations_closed">Nominations Closed</SelectItem>
                  <SelectItem value="voting_open">Voting Open</SelectItem>
                  <SelectItem value="voting_closed">Voting Closed</SelectItem>
                  <SelectItem value="results_published">Results Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              competition ? 'Update Competition' : 'Create Competition'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}