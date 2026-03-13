import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Clock, Play, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ScheduledJobsManager() {
  const [isTestingSchedule, setIsTestingSchedule] = useState(false);
  const { toast } = useToast();

  const handleTestScheduledRun = async () => {
    setIsTestingSchedule(true);
    try {
      // This would call the scheduled function manually for testing
      const response = await fetch('/api/functions/scheduledScoreUpdate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Scheduled Job Test Complete",
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scheduled Job Test Failed",
        description: error.message,
      });
    } finally {
      setIsTestingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scheduled Score Recalculation</h3>
        <p className="text-gray-600 text-sm mb-4">
          Automatically recalculate all nominee scores daily to keep the leaderboard fresh.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900">Daily Score Update</h4>
              <p className="text-sm text-gray-500">Runs every day at 2:00 AM UTC</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleTestScheduledRun}
            disabled={isTestingSchedule}
            variant="outline"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isTestingSchedule ? 'Testing...' : 'Test Run Now'}
          </Button>
          
          <div className="text-xs text-gray-500">
            Last run: Today at 2:00 AM UTC (simulated)
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Cron Job Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              To enable automatic daily recalculation, configure a cron job in your hosting platform to call:
            </p>
            <code className="block bg-blue-100 text-blue-900 text-xs p-2 rounded mt-2 font-mono">
              POST /api/functions/scheduledScoreUpdate
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Recommended schedule: <code>0 2 * * *</code> (daily at 2:00 AM UTC)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Performance Considerations</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Score recalculation processes nominees in small batches to avoid timeouts</li>
              <li>• Each batch includes a 2-second delay to respect rate limits</li>
              <li>• Large seasons (1000+ nominees) may take 10-15 minutes to complete</li>
              <li>• Failed batches are logged but don't stop the overall process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}