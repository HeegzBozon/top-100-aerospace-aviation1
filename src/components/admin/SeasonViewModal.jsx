
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Trash2, Ban, PowerOff, Loader2, BarChart2, Users, FileText, Check, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import { getSeasonAnalytics } from '@/functions/getSeasonAnalytics';
import { calculateSeasonResults } from '@/functions/calculateSeasonResults';
import { Nominee } from '@/entities/Nominee';

export default function SeasonViewModal({ season, onClose, onDelete, onCancel, onDeactivate }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!season) return;
      setLoading(true);
      try {
        const { data: analyticsData, error: analyticsError } = await getSeasonAnalytics({ season_id: season.id });
        if (analyticsError || !analyticsData.success) {
          throw new Error(analyticsError?.message || analyticsData?.error || 'Failed to fetch analytics');
        }
        setAnalytics(analyticsData.data);
        
        // Fetch nominees to check for existing results
        const seasonNominees = await Nominee.filter({ season_id: season.id });
        const scoredNominees = seasonNominees.filter(n => (n.borda_score || 0) > 0);
        if (scoredNominees.length > 0) {
          setResults(scoredNominees.sort((a, b) => (b.borda_score || 0) - (a.borda_score || 0)));
        }

      } catch (err) {
        console.error("Failed to load season data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [season]);

  const handleCalculateResults = async () => {
    if (!confirm("Are you sure you want to calculate the final results for this season? This will overwrite any existing scores.")) {
      return;
    }
    setCalculating(true);
    try {
      const { data, error } = await calculateSeasonResults({ season_id: season.id });
      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Failed to calculate results');
      }
      
      // Re-fetch nominees to display updated scores
      const updatedNominees = await Nominee.filter({ season_id: season.id });
      setResults(updatedNominees.sort((a, b) => (b.borda_score || 0) - (a.borda_score || 0)));

    } catch (err) {
      console.error("Result calculation failed:", err);
    } finally {
      setCalculating(false);
    }
  };


  if (!season) return null;

  const statusInfo = {
    planning: { color: 'bg-gray-100 text-gray-800', text: 'Planning' },
    nominations_open: { color: 'bg-yellow-100 text-yellow-800', text: 'Nominations Open' },
    voting_open: { color: 'bg-green-100 text-green-800', text: 'Voting Open' },
    completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
    archived: { color: 'bg-indigo-100 text-indigo-800', text: 'Archived' },
  }[season.status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{season.name}</h2>
            <p className="text-sm text-gray-500">{season.theme}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center bg-gray-50 p-4 rounded-lg border">
            {/* Overall Dates */}
            <div className="col-span-2 md:col-span-1">
                <p className="text-sm font-medium text-gray-700">Overall Dates:</p>
                <p className="text-sm text-gray-900">{format(new Date(season.start_date), 'PP')} - {format(new Date(season.end_date), 'PP')}</p>
            </div>
            {/* Nomination Dates */}
            <div className="col-span-2 md:col-span-1">
                <p className="text-sm font-medium text-gray-700">Nominations:</p>
                <p className="text-sm text-gray-900">{format(new Date(season.nomination_start), 'PP')} - {format(new Date(season.nomination_end), 'PP')}</p>
            </div>
            {/* Voting Dates */}
            <div className="col-span-2 md:col-span-1">
                <p className="text-sm font-medium text-gray-700">Voting:</p>
                <p className="text-sm text-gray-900">{format(new Date(season.voting_start), 'PP')} - {format(new Date(season.voting_end), 'PP')}</p>
            </div>
            {/* Status Badge */}
            <div className="col-span-4 md:col-span-1 flex justify-center">
              <Badge className={`${statusInfo.color} px-3 py-1.5 text-sm`}>{statusInfo.text}</Badge>
            </div>
          </div>
          
          {/* Analytics Section */}
          <div className="border rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Season Analytics
            </h3>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <FileText className="w-6 h-6 mx-auto text-gray-500 mb-2" />
                      <p className="text-2xl font-bold text-gray-800">{analytics.nomineeStats.total}</p>
                      <p className="text-sm text-gray-600">Total Nominees</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <Loader2 className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                      <p className="text-2xl font-bold text-yellow-800">{analytics.nomineeStats.pending}</p>
                      <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Check className="w-6 h-6 mx-auto text-green-500 mb-2" />
                      <p className="text-2xl font-bold text-green-800">{analytics.nomineeStats.approved}</p>
                      <p className="text-sm text-green-600">Approved</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                      <XCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                      <p className="text-2xl font-bold text-red-800">{analytics.nomineeStats.rejected}</p>
                      <p className="text-sm text-red-600">Rejected</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <BarChart2 className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold text-blue-800">{analytics.votingStats.totalVotes.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">Total Votes</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                      <Users className="w-6 h-6 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-indigo-800">{analytics.votingStats.uniqueVoters.toLocaleString()}</p>
                      <p className="text-sm text-indigo-600">Unique Voters</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Could not load analytics.
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {(results || season.status === 'completed') && (
            <div className="border rounded-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Season Results
                </h3>
                {season.status === 'completed' && (
                  <Button onClick={handleCalculateResults} disabled={calculating} size="sm">
                    {calculating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Calculate Results
                  </Button>
                )}
              </div>
              <div className="p-4">
                {calculating ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="ml-3 text-gray-600">Tallying votes...</span>
                  </div>
                ) : results && results.length > 0 ? (
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {results.slice(0, 100).map((nominee, index) => (
                      <li key={nominee.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-600 w-6 text-center">{index + 1}.</span>
                          <img src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`} alt={nominee.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-medium text-gray-800">{nominee.name}</span>
                        </div>
                        <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-sm">
                          {nominee.borda_score || 0} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-8">No results calculated yet. Click the button to calculate.</p>
                )}
              </div>
            </div>
          )}

          {/* Management Actions */}
          <div className="border rounded-lg">
            <div className="p-4 flex flex-wrap gap-3 justify-end">
              {onDeactivate && season.status === 'active' && (
                <Button variant="outline" onClick={onDeactivate} className="border-orange-500 text-orange-600 hover:bg-orange-50">
                  <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                </Button>
              )}
              {onCancel && season.status !== 'completed' && (
                <Button variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Ban className="mr-2 h-4 w-4" /> Cancel Season
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
