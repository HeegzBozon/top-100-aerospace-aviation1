import React, { useState, useEffect, useMemo } from 'react';
import { Nominee } from '@/entities/Nominee';
import { Season } from '@/entities/Season';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Search, Edit, Eye, ShieldCheck, ShieldOff, Trophy, Brain, Download, Medal, ContactRound } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import NomineeForm from './NomineeForm';
import NomineeViewModal from './NomineeViewModal';
import NomineeReviewWizard from './NomineeReviewWizard';

export default function NomineeManager({ seasons }) {
  const [nominees, setNominees] = useState([]);
  const [filteredNominees, setFilteredNominees] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showForm, setShowForm] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [viewingNominee, setViewingNominee] = useState(null);
  const [reviewingNominee, setReviewingNominee] = useState(null); // New state for review wizard
  const [processingId, setProcessingId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Prioritize active seasons, otherwise fall back to the most recent one
      const activeSeason = seasons.find(s => s.status === 'nominations_open' || s.status === 'voting_open');
      const defaultSeason = activeSeason || seasons[0];
      setSelectedSeasonId(defaultSeason.id);
    }
  }, [seasons, selectedSeasonId]);

  useEffect(() => {
    const fetchNominees = async () => {
      if (!selectedSeasonId) {
        setNominees([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const seasonNominees = await Nominee.filter({ season_id: selectedSeasonId }, '-created_date');
        setNominees(seasonNominees);
      } catch (error) {
        console.error("Failed to fetch nominees:", error);
        toast({
          variant: "destructive",
          title: "Error fetching nominees",
          description: "Could not load nominee data for the selected season.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNominees();
  }, [selectedSeasonId, toast]);
  
  useEffect(() => {
    let result = nominees;
    if (statusFilter !== 'all') {
      result = result.filter(n => n.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(n =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.nominee_email && n.nominee_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredNominees(result);
  }, [nominees, searchTerm, statusFilter]);

  const handleCreate = () => {
    setEditingNominee(null);
    setShowForm(true);
  };
  
  const handleEdit = (nominee) => {
    setEditingNominee(nominee);
    setShowForm(true);
  };

  const handleView = (nominee) => {
    setViewingNominee(nominee);
  };

  const handleReview = (nominee) => {
    setReviewingNominee(nominee);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingNominee(null);
    setReviewingNominee(null); // Close review wizard on success
    setLoading(true);
    try {
      const seasonNominees = await Nominee.filter({ season_id: selectedSeasonId }, '-created_date');
      setNominees(seasonNominees);
    } catch (error) {
      console.error("Failed to re-fetch nominees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (nominee, newStatus) => {
    setProcessingId(nominee.id);
    try {
      await Nominee.update(nominee.id, { status: newStatus });
      setNominees(currentNominees => currentNominees.map(n => n.id === nominee.id ? { ...n, status: newStatus } : n));
      toast({
        title: `Nominee ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        description: `${nominee.name} has been successfully ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Failed to update nominee status:`, error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update status for ${nominee.name}.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredNominees.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no nominees matching your current filters.",
      });
      return;
    }

    const headers = [
      'Name', 'Email', 'Status', 'Country', 'Industry', 'Professional Role',
      'Company', 'Title', 'LinkedIn URL', 'Instagram URL', 'Website URL',
      'Description', 'ELO Rating', 'Borda Score', 'Aura Score', 'Total Votes',
      'Created Date', 'Nominated By'
    ];

    const csvRows = [headers.join(',')];

    filteredNominees.forEach(nominee => {
      const row = [
        `"${(nominee.name || '').replace(/"/g, '""')}"`,
        `"${(nominee.nominee_email || '').replace(/"/g, '""')}"`,
        `"${(nominee.status || '').replace(/"/g, '""')}"`,
        `"${(nominee.country || '').replace(/"/g, '""')}"`,
        `"${(nominee.industry || '').replace(/"/g, '""')}"`,
        `"${(nominee.professional_role || '').replace(/"/g, '""')}"`,
        `"${(nominee.company || '').replace(/"/g, '""')}"`,
        `"${(nominee.title || '').replace(/"/g, '""')}"`,
        `"${(nominee.linkedin_profile_url || '').replace(/"/g, '""')}"`,
        `"${(nominee.instagram_url || '').replace(/"/g, '""')}"`,
        `"${(nominee.website_url || '').replace(/"/g, '""')}"`,
        `"${(nominee.description || '').replace(/"/g, '""')}"`,
        nominee.elo_rating || 0,
        nominee.borda_score || 0,
        nominee.aura_score || 0,
        nominee.total_votes || 0,
        `"${nominee.created_date || ''}"`,
        `"${(nominee.nominated_by || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nominees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Successfully exported ${filteredNominees.length} nominees to CSV.`,
    });
  };

  const handleExportCRM = () => {
    // TOP 100 CRM export: active/approved/winner/finalist, sorted by aura_score, top 100
    const crmNominees = nominees
      .filter(n => ['active', 'approved', 'winner', 'finalist'].includes(n.status))
      .map((n, originalIndex) => ({ ...n, _originalIndex: originalIndex }))
      .sort((a, b) => {
        const scoreDiff = (b.aura_score || 0) - (a.aura_score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.holistic_score || 0) - (a.holistic_score || 0);
      })
      .slice(0, 100);

    if (crmNominees.length === 0) {
      toast({ variant: 'destructive', title: 'No CRM data', description: 'No active/approved nominees found for this season.' });
      return;
    }

    const selectedSeason = seasons?.find(s => s.id === selectedSeasonId);
    const seasonName = selectedSeason?.name || 'Unknown Season';
    const exportDate = new Date().toISOString().split('T')[0];

    const headers = [
      'Rank', 'Name', 'Email', 'Secondary Emails',
      'LinkedIn URL', 'Instagram URL', 'TikTok URL', 'YouTube URL', 'Website URL',
      'Title', 'Company', 'Professional Role', 'Industry', 'Country',
      'Description', 'Bio', 'Six Word Story',
      'Aura Score', 'Starpower Score', 'ELO Rating', 'Borda Score',
      'Total Votes', 'Win %', 'Clout',
      'LinkedIn Followers', 'Instagram Followers', 'Total Followers',
      'Rising Star Votes', 'Rock Star Votes', 'Super Star Votes', 'North Star Votes',
      'Status', 'Verified Status', 'Claim Status', 'Claimed By',
      'Discipline', 'Skills', 'Affiliations',
      'Nomination Reason', 'Nominated By',
      'Season', 'Created Date'
    ];

    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;

    const csvRows = [
      `# TOP 100 Women in Aerospace CRM Export`,
      `# Season: ${seasonName}`,
      `# Export Date: ${exportDate}`,
      `# Total Records: ${crmNominees.length}`,
      '',
      headers.join(',')
    ];

    crmNominees.forEach((n, i) => {
      const secondaryEmails = Array.isArray(n.secondary_emails) ? n.secondary_emails.join('; ') : '';
      const skills = Array.isArray(n.skills) ? n.skills.join('; ') : '';
      const affiliations = Array.isArray(n.affiliations) ? n.affiliations.join('; ') : '';
      const row = [
        i + 1,
        esc(n.name),
        esc(n.nominee_email),
        esc(secondaryEmails),
        esc(n.linkedin_profile_url),
        esc(n.instagram_url),
        esc(n.tiktok_url),
        esc(n.youtube_url),
        esc(n.website_url),
        esc(n.title),
        esc(n.company),
        esc(n.professional_role),
        esc(n.industry),
        esc(n.country),
        esc(n.description),
        esc(n.bio),
        esc(n.six_word_story),
        n.aura_score || 0,
        n.starpower_score || 0,
        n.elo_rating || 0,
        n.borda_score || 0,
        n.total_votes || 0,
        n.win_percentage || 0,
        n.clout || 0,
        n.social_stats?.linkedin_followers || 0,
        n.social_stats?.instagram_followers || 0,
        n.social_stats?.total_followers || 0,
        n.rising_star_count || 0,
        n.rock_star_count || 0,
        n.super_star_count || 0,
        n.north_star_count || 0,
        esc(n.status),
        esc(n.verified_status),
        esc(n.claim_status),
        esc(n.claimed_by_user_email),
        esc(n.discipline),
        esc(skills),
        esc(affiliations),
        esc(n.nomination_reason),
        esc(n.nominated_by),
        esc(seasonName),
        esc(n.created_date)
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSeason = seasonName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `TOP100_Women_Aerospace_CRM_${safeSeason}_${exportDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'CRM Export Complete', description: `Exported ${crmNominees.length} honorees to CSV.` });
  };

  const handleExportRankings = () => {
    // Get only active/approved nominees for rankings
    const rankableNominees = nominees.filter(n => 
      n.status === 'active' || n.status === 'approved' || n.status === 'winner' || n.status === 'finalist'
    );
    
    if (rankableNominees.length === 0) {
      toast({
        variant: "destructive",
        title: "No rankings to export",
        description: "There are no active nominees with rankings for this season.",
      });
      return;
    }

    // Sort by aura_score descending (primary ranking metric)
    const rankedNominees = [...rankableNominees].sort((a, b) => 
      (b.aura_score || 0) - (a.aura_score || 0)
    );

    const selectedSeason = seasons?.find(s => s.id === selectedSeasonId);
    const seasonName = selectedSeason?.name || 'Unknown Season';
    const exportDate = new Date().toISOString().split('T')[0];

    const headers = [
      'Rank', 'Name', 'Status', 'Aura Score', 'Starpower Score', 'ELO Rating', 
      'Borda Score', 'Clout', 'Total Votes', 'Win %', 'Company', 'Title', 
      'Country', 'LinkedIn URL', 'Email'
    ];

    const csvRows = [
      `# TOP 100 Rankings Export`,
      `# Season: ${seasonName}`,
      `# Export Date: ${exportDate}`,
      `# Total Ranked: ${rankedNominees.length}`,
      '',
      headers.join(',')
    ];

    rankedNominees.forEach((nominee, index) => {
      const row = [
        index + 1,
        `"${(nominee.name || '').replace(/"/g, '""')}"`,
        `"${(nominee.status || '').replace(/"/g, '""')}"`,
        nominee.aura_score || 0,
        nominee.starpower_score || 0,
        nominee.elo_rating || 0,
        nominee.borda_score || 0,
        nominee.clout || 0,
        nominee.total_votes || 0,
        nominee.win_percentage || 0,
        `"${(nominee.company || '').replace(/"/g, '""')}"`,
        `"${(nominee.title || '').replace(/"/g, '""')}"`,
        `"${(nominee.country || '').replace(/"/g, '""')}"`,
        `"${(nominee.linkedin_profile_url || '').replace(/"/g, '""')}"`,
        `"${(nominee.nominee_email || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSeasonName = seasonName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `TOP100_Rankings_${safeSeasonName}_${exportDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Rankings Exported",
      description: `Exported ${rankedNominees.length} ranked nominees for ${seasonName}.`,
    });
  };

  const getStatusBadge = (status) => {
    let colorClass = '';
    switch (status) {
      case 'approved':
      case 'active':
        colorClass = 'bg-green-100 text-green-700';
        break;
      case 'pending':
        colorClass = 'bg-yellow-100 text-yellow-700';
        break;
      case 'rejected':
        colorClass = 'bg-red-100 text-red-700';
        break;
      case 'winner':
        colorClass = 'bg-amber-100 text-amber-700 border-amber-300 font-bold';
        break;
      case 'finalist':
        colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-700';
    }
    return (
      <Badge className={`capitalize ${colorClass}`}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nominee Manager</h2>
            <p className="text-sm text-gray-500">Approve, reject, and manage nominees for each season.</p>
          </div>
        </div>
        {seasons && seasons.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div>
              <Label htmlFor="season-select" className="sr-only">Select Season</Label>
              <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                <SelectTrigger id="season-select" className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select a season..." />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExportCRM} disabled={!selectedSeasonId || nominees.length === 0} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <ContactRound className="w-4 h-4 mr-2" />
              CRM Export (Top 100)
            </Button>
            <Button variant="outline" onClick={handleExportRankings} disabled={!selectedSeasonId || nominees.length === 0}>
              <Medal className="w-4 h-4 mr-2" />
              Export Rankings
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={!selectedSeasonId || filteredNominees.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleCreate} className="w-full sm:w-auto" disabled={!selectedSeasonId}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Nominee
            </Button>
          </div>
        )}
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search-nominees" className="text-sm font-medium text-gray-700">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="search-nominees"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="mt-1">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="finalist">Finalist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredNominees.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No Nominees Found</h3>
          <p className="text-gray-500 mt-1">
            There are no nominees matching your criteria for this season.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNominees.map(nominee => (
                <tr key={nominee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
                          alt={nominee.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate">{nominee.name}</div>
                        <div className="text-sm text-gray-500 truncate">{nominee.nominee_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(nominee.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2">
                      {nominee.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            onClick={() => handleStatusChange(nominee, 'approved')}
                            disabled={processingId === nominee.id}
                          >
                            {processingId === nominee.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            onClick={() => handleStatusChange(nominee, 'rejected')}
                            disabled={processingId === nominee.id}
                          >
                            {processingId === nominee.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShieldOff className="w-4 h-4 mr-2" />}
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleReview(nominee)}>
                        <Brain className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(nominee)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleView(nominee)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <NomineeForm
          nominee={editingNominee}
          seasonId={selectedSeasonId}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
      {viewingNominee && (
        <NomineeViewModal 
          nominee={viewingNominee} 
          onClose={() => setViewingNominee(null)} 
        />
      )}
      {reviewingNominee && (
        <NomineeReviewWizard
          nominee={reviewingNominee}
          onClose={() => setReviewingNominee(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}