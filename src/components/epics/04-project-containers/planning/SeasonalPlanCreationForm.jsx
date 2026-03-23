import { useState } from 'react';
import { SeasonalPlan } from '@/entities/SeasonalPlan';
import { Sprint } from '@/entities/Sprint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';

export default function SeasonalPlanCreationForm({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [sprintCount, setSprintCount] = useState(6);
  const [sprintLength, setSprintLength] = useState(14); // in days
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startDate) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      // 1. Create Sprints
      let currentSprintStart = startDate;
      const createdSprintIds = [];

      for (let i = 0; i < sprintCount; i++) {
        const sprintStartDate = currentSprintStart;
        const sprintEndDate = addDays(sprintStartDate, sprintLength - 1);
        
        const sprint = await Sprint.create({
          name: `${name} - Sprint ${i + 1}`,
          start_date: format(sprintStartDate, 'yyyy-MM-dd'),
          end_date: format(sprintEndDate, 'yyyy-MM-dd'),
          capacity_points: 40, // Default capacity
          status: 'planning',
        });
        createdSprintIds.push(sprint.id);
        
        currentSprintStart = addDays(sprintEndDate, 1);
      }

      // 2. Create Seasonal Plan
      const planEndDate = addDays(startDate, (sprintCount * sprintLength) - 1);
      await SeasonalPlan.create({
        name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(planEndDate, 'yyyy-MM-dd'),
        status: 'planning',
        sprint_ids: createdSprintIds,
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to create Seasonal Plan and sprints:", error);
      alert("An error occurred. Please check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create Seasonal Plan</h2>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} className="rounded-full"><X className="w-6 h-6" /></Button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Plan Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Q3 2024 Plan" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Number of Sprints</label>
              <Input type="number" value={sprintCount} onChange={e => setSprintCount(Number(e.target.value))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Sprint Length (days)</label>
              <Input type="number" value={sprintLength} onChange={e => setSprintLength(Number(e.target.value))} required />
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md border text-sm text-gray-600">
            This will automatically generate {sprintCount} sprints, each {sprintLength} days long, and link them to this Seasonal Plan.
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Plan
          </Button>
        </div>
      </form>
    </div>
  );
}