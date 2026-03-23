
import { useState, useEffect } from 'react';
import { ImportJob } from '@/entities/ImportJob';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast";
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  X,
  Loader2,
  Zap 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; 

export default function ImportJobMonitor() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [processingJobId, setProcessingJobId] = useState(null);
  
  // New state for bulk operations
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
    
    let interval;
    if (autoRefresh) {
      // Only 1 retry on auto-refresh to be less aggressive
      interval = setInterval(() => loadJobs(1), 5000); 
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadJobs = async (retries = 3) => {
    setLoading(true);
    try {
      // Remove the limit to get ALL jobs
      const allJobs = await ImportJob.list('-created_date');
      setJobs(allJobs);
      setLoading(false); // Successfully loaded, turn off loading
    } catch (error) {
      console.error('Error loading import jobs:', error);
      if (retries > 0 && error.message.includes('Network Error')) {
        console.log(`Retrying job list load... (${retries} attempts left)`);
        setTimeout(() => loadJobs(retries - 1), 1500); // Wait and retry
        return; // Important: stop execution here to avoid setting loading to false prematurely if a retry is scheduled
      } else {
        // If not a network error or no retries left, turn off loading
        setLoading(false); 
      }
    } finally {
       // This finally block condition ensures loading is turned off
       // if all retries are exhausted (retries === 0) OR if loading was already set to false (e.g., by successful fetch in try block).
       // If a retry is pending, `retries` will be > 0 and `loading` will be `true`, so this condition will be false.
       if (retries === 0 || !loading) {
          setLoading(false);
       }
    }
  };

  const handleCancelJob = async (jobId) => {
    if (!confirm('Are you sure you want to cancel this import job? This action cannot be undone.')) {
      return;
    }

    setProcessingJobId(jobId);
    try {
      await ImportJob.update(jobId, {
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error_message: 'Cancelled by user'
      });
      
      await loadJobs();
      toast({
        title: "Job Cancelled",
        description: "The import job has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast({
        variant: "destructive",
        title: "Cancel Failed",
        description: `Failed to cancel job: ${error.message}`,
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this import job record? This will remove it from the history but will not undo any imported data.')) {
      return;
    }

    setProcessingJobId(jobId);
    try {
      await ImportJob.delete(jobId);
      await loadJobs();
      toast({
        title: "Job Deleted",
        description: "The import job record has been deleted from history.",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: `Failed to delete job: ${error.message}`,
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleClearStuckJobs = async () => {
    const stuckJobs = jobs.filter(job => 
      job.status === 'running' && job.progress_percentage === 0
    );

    if (stuckJobs.length === 0) {
      toast({
        title: "No Stuck Jobs",
        description: "No stuck jobs found to clear.",
      });
      return;
    }

    if (!confirm(`This will cancel ${stuckJobs.length} stuck job(s) that appear to be frozen at 0% progress. Continue?`)) {
      return;
    }

    setProcessingJobId('bulk');
    try {
      await Promise.all(stuckJobs.map(job => 
        ImportJob.update(job.id, {
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          error_message: 'Automatically cancelled - appeared stuck at 0% progress'
        })
      ));
      
      await loadJobs();
      toast({
        title: "Stuck Jobs Cleared",
        description: `Successfully cancelled ${stuckJobs.length} stuck job(s).`,
      });
    } catch (error) {
      console.error('Error clearing stuck jobs:', error);
      toast({
        variant: "destructive",
        title: "Clear Failed",
        description: `Failed to clear stuck jobs: ${error.message}`,
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  // New bulk operation functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectSingle = (jobId, checked) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleBulkCancel = async () => {
    const cancelableJobs = jobs.filter(job => 
      selectedJobs.includes(job.id) && 
      (job.status === 'running' || job.status === 'pending')
    );

    if (cancelableJobs.length === 0) {
      toast({
        variant: "destructive",
        title: "No Cancelable Jobs",
        description: "Please select jobs that are running or pending.",
      });
      return;
    }

    if (!confirm(`Are you sure you want to cancel ${cancelableJobs.length} selected job(s)? This action cannot be undone.`)) {
      return;
    }

    setBulkOperationLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const job of cancelableJobs) {
        try {
          await ImportJob.update(job.id, {
            status: 'cancelled',
            completed_at: new Date().toISOString(),
            error_message: 'Bulk cancelled by user'
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to cancel job ${job.id}:`, error);
          errorCount++;
        }
      }

      await loadJobs();
      setSelectedJobs([]);
      
      toast({
        title: "Bulk Cancel Complete",
        description: `${successCount} jobs cancelled successfully. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });

    } catch (error) {
      console.error('Error in bulk cancel:', error);
      toast({
        variant: "destructive",
        title: "Bulk Cancel Failed",
        description: "An unexpected error occurred during the process.",
      });
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const deletableJobs = jobs.filter(job => 
      selectedJobs.includes(job.id) && 
      (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')
    );

    if (deletableJobs.length === 0) {
      toast({
        variant: "destructive",
        title: "No Deletable Jobs",
        description: "Please select jobs that are completed, failed, or cancelled.",
      });
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${deletableJobs.length} selected job record(s)? This will remove them from history but will not undo any imported data.`)) {
      return;
    }

    setBulkOperationLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const job of deletableJobs) {
        try {
          await ImportJob.delete(job.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete job ${job.id}:`, error);
          errorCount++;
        }
      }

      await loadJobs();
      setSelectedJobs([]);
      
      toast({
        title: "Bulk Delete Complete",
        description: `${successCount} job records deleted successfully. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
      });

    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        variant: "destructive",
        title: "Bulk Delete Failed",
        description: "An unexpected error occurred during the process.",
      });
    } finally {
      setBulkOperationLoading(false);
    }
  };

  // Updated complete clear queue function with better job counting
  const handleClearCompleteQueue = async () => {
    // Refresh the job list first to get the most current count
    try {
      const freshJobs = await ImportJob.list('-created_date');
      setJobs(freshJobs);
      
      if (freshJobs.length === 0) {
        toast({
          title: "Queue Already Empty",
          description: "No jobs found in the queue.",
        });
        return;
      }

      const runningOrPendingJobs = freshJobs.filter(job => job.status === 'running' || job.status === 'pending');
      const completedFailedCancelledJobs = freshJobs.filter(job => job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled');

      let confirmMessage = `🚨 NUCLEAR OPTION: This will completely clear the entire import queue (${freshJobs.length} jobs total).\n\n`;
      
      if (runningOrPendingJobs.length > 0) {
        confirmMessage += `• ${runningOrPendingJobs.length} running/pending jobs will be CANCELLED\n`;
      }
      if (completedFailedCancelledJobs.length > 0) {
        confirmMessage += `• ${completedFailedCancelledJobs.length} completed/failed/cancelled jobs will be DELETED from history\n`;
      }
      
      confirmMessage += `\nThis action cannot be undone. Are you absolutely sure?`;

      if (!confirm(confirmMessage)) {
        return;
      }

      // Double confirmation for safety
      const doubleConfirm = prompt(`Type "CLEAR QUEUE" to confirm complete queue clearance:`);
      if (doubleConfirm !== 'CLEAR QUEUE') {
        toast({
          title: "Operation Cancelled",
          description: "Queue clearance was cancelled for safety.",
        });
        return;
      }

      setBulkOperationLoading(true);
      let cancelledCount = 0;
      let deletedCount = 0;
      let errorCount = 0;

      try {
        // First, cancel all running/pending jobs
        for (const job of runningOrPendingJobs) {
          try {
            await ImportJob.update(job.id, {
              status: 'cancelled',
              completed_at: new Date().toISOString(),
              error_message: 'Cancelled during complete queue clear'
            });
            cancelledCount++;
          } catch (error) {
            console.error(`Failed to cancel job ${job.id}:`, error);
            errorCount++;
          }
        }

        // Then delete all completed/failed/cancelled jobs (including the ones we just cancelled).
        // We refetch the list to ensure we have the most up-to-date status, especially for newly cancelled jobs.
        const jobsAfterCancellation = await ImportJob.list('-created_date'); // Get ALL jobs again
        for (const job of jobsAfterCancellation) {
          if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
            try {
              await ImportJob.delete(job.id);
              deletedCount++;
            } catch (error) {
              console.error(`Failed to delete job ${job.id}:`, error);
              errorCount++;
            }
          }
        }

        await loadJobs();
        setSelectedJobs([]);
        
        toast({
          title: "Queue Completely Cleared! 🧹",
          description: `${cancelledCount} jobs cancelled, ${deletedCount} records deleted. ${errorCount > 0 ? `${errorCount} errors occurred.` : 'All operations successful!'}`,
        });

      } catch (error) {
        console.error('Error in complete queue clear:', error);
        toast({
          variant: "destructive",
          title: "Queue Clear Failed",
          description: "An unexpected error occurred during the process.",
        });
      } finally {
        setBulkOperationLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing job list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh job list before clearing.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isStuckJob = (job) => {
    return job.status === 'running' && job.progress_percentage === 0 && job.failed_records > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const stuckJobsCount = jobs.filter(isStuckJob).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text)]">Import Job Monitor</h2>
        <div className="flex items-center gap-3">
          {/* Add the Clear Queue button alongside existing buttons */}
          {jobs.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearCompleteQueue}
              disabled={bulkOperationLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkOperationLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Clear Queue ({jobs.length})
            </Button>
          )}
          {stuckJobsCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearStuckJobs}
              disabled={processingJobId === 'bulk'}
            >
              {processingJobId === 'bulk' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              Clear {stuckJobsCount} Stuck Job{stuckJobsCount > 1 ? 's' : ''}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadJobs()}> {/* Changed to call loadJobs without args for manual refresh */}
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedJobs.length > 0 && (
        <div className="bg-blue-50 dark:bg-black/20 backdrop-blur-sm border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleBulkCancel}
              disabled={bulkOperationLoading}
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {bulkOperationLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Bulk Cancel
            </Button>
            <Button 
              onClick={handleBulkDelete}
              disabled={bulkOperationLoading}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {bulkOperationLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Bulk Delete
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted)]">
            No import jobs found.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedJobs.length > 0 && selectedJobs.length === jobs.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all jobs"
                />
                <span className="text-sm font-medium text-[var(--text)]">
                  Select all jobs ({jobs.length})
                </span>
              </div>
            </div>

            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-6 ${
                  isStuckJob(job) ? 'border-red-200 bg-red-50/50' : 'border-[var(--border)]'
                } ${
                  selectedJobs.includes(job.id) ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => handleSelectSingle(job.id, checked)}
                      aria-label={`Select job ${job.name}`}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-semibold text-[var(--text)]">{job.name}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        {isStuckJob(job) && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Stuck
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)] space-y-1">
                        <div>Created: {new Date(job.created_date).toLocaleString()}</div>
                        {job.started_at && (
                          <div>Started: {new Date(job.started_at).toLocaleString()}</div>
                        )}
                        {job.completed_at && (
                          <div>Completed: {new Date(job.completed_at).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(job.status === 'running' || job.status === 'pending') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelJob(job.id)}
                        disabled={processingJobId === job.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {processingJobId === job.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Cancel
                      </Button>
                    )}
                    
                    {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={processingJobId === job.id}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        {processingJobId === job.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">Progress</span>
                    <span className="font-medium text-[var(--text)]">
                      {job.progress_percentage}%
                    </span>
                  </div>
                  <Progress value={job.progress_percentage} />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-[var(--text)]">{job.total_records}</div>
                      <div className="text-[var(--muted)]">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{job.processed_records}</div>
                      <div className="text-[var(--muted)]">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{job.failed_records}</div>
                      <div className="text-[var(--muted)]">Failed</div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {job.error_message && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-1">Error Details:</div>
                    <div className="text-sm text-red-700">{job.error_message}</div>
                  </div>
                )}

                {/* Lt. Perry's Insights */}
                {job.lt_perry_insights && job.lt_perry_insights.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">Lt. Perry's Insights:</div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {job.lt_perry_insights.map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
