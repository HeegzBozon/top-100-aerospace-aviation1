import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Trash2,
  Mail,
  Calendar,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Crown,
  Loader2,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import HonoreeUserCrossRef from '@/components/admin/HonoreeUserCrossRef';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

// Season 4+ IAM Role Configuration
const IAM_ROLES = [
  { id: 'admin', label: 'Admin', description: 'Full application admin access', icon: Crown, color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'editor', label: 'Editor', description: 'Can edit content and nominees', icon: ShieldCheck, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'collaborator', label: 'Collaborator', description: 'Can view and comment', icon: Shield, color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'member', label: 'Member', description: 'Standard community member', icon: Users, color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { id: 'nominee', label: 'Nominee', description: 'Nominated individual', icon: Users, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'honoree', label: 'Honoree', description: 'Top 100 honoree', icon: Crown, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'sponsor', label: 'Sponsor', description: 'Sponsor organization rep', icon: Shield, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'company', label: 'Company', description: 'Company account', icon: Users, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'deactivated', label: 'Deactivated', description: 'Account deactivated', icon: ShieldAlert, color: 'bg-slate-100 text-slate-500 border-slate-200' },
];

// Get role config - supports multiple roles via app_roles array
// For display: Base44 role='admin' without app_roles = "Super Admin"
const getRoleConfig = (role) => {
  return IAM_ROLES.find(r => r.id === role) || IAM_ROLES.find(r => r.id === 'member');
};

const getUserRoles = (user) => {
  // If Base44 built-in admin without app_roles, they're Super Admin
  if (user.role === 'admin' && (!user.app_roles || user.app_roles.length === 0)) {
    return [{ id: 'super_admin', label: 'Super Admin', description: 'Full system access (Base44)', icon: Crown, color: 'bg-rose-100 text-rose-800 border-rose-200' }];
  }
  const roles = user.app_roles || ['member'];
  return roles.map(r => getRoleConfig(r));
};

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [exportingUserId, setExportingUserId] = useState(null);
  const [bulkExporting, setBulkExporting] = useState(false);
  const pageSize = 20;

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => User.list('-created_date', 1000),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      // Use backend function for role updates to bypass RLS
      if (data.roles && data.roles.length > 0) {
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) throw new Error('User not found');
        
        console.log('Invoking updateUserRole:', { email: userToUpdate.email, roles: data.roles });
        
        const response = await base44.functions.invoke('adminSetUserRoles', {
          email: userToUpdate.email,
          app_roles: data.roles,
        });
        
        console.log('updateUserRole response:', response);
        
        // Response from invoke is { data: { success, ... } }
        const result = response.data;
        if (result?.error) throw new Error(result.error);
        if (!result?.success) throw new Error('Update failed - no success response');
        
        return result;
      }
      return { success: true };
    },
    onSuccess: (result) => {
      console.log('Mutation success:', result);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User roles updated successfully');
      setEditModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error(`Update failed: ${error.message}`);
    },
  });

  // Delete user mutation (soft delete by deactivating)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      // Mark user as inactive (soft delete approach)
      const response = await base44.functions.invoke('updateUserRole', {
        email: user.email,
        role: 'deactivated',
      });
      const result = response.data;
      if (result.error) throw new Error(result.error);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated successfully');
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const userRoles = user.app_roles || [];
      const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Stats - Season 4+ IAM (now using app_roles array)
  const stats = useMemo(() => ({
    total: users.length,
    superAdmins: users.filter(u => u.role === 'admin' && (!u.app_roles || u.app_roles.length === 0)).length,
    admins: users.filter(u => u.app_roles?.includes('admin')).length,
    editors: users.filter(u => u.app_roles?.includes('editor')).length,
    collaborators: users.filter(u => u.app_roles?.includes('collaborator')).length,
    members: users.filter(u => u.app_roles?.includes('member') || (!u.app_roles?.length && u.role !== 'admin')).length,
    nominees: users.filter(u => u.app_roles?.includes('nominee')).length,
    honorees: users.filter(u => u.app_roles?.includes('honoree')).length,
    sponsors: users.filter(u => u.app_roles?.includes('sponsor')).length,
    companies: users.filter(u => u.app_roles?.includes('company')).length,
    deactivated: users.filter(u => u.app_roles?.includes('deactivated')).length,
  }), [users]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    // Use app_roles array for Season 4+ IAM, default to ['member']
    setEditFormData({
      roles: user.app_roles || ['member'],
    });
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    if (!editFormData.roles || editFormData.roles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }
    updateUserMutation.mutate({
      userId: selectedUser.id,
      data: { roles: editFormData.roles },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  const handleQuickRoleChange = (user, newRoles) => {
    updateUserMutation.mutate({
      userId: user.id,
      data: { roles: Array.isArray(newRoles) ? newRoles : [newRoles] },
    });
  };

  const toggleRole = (roleId) => {
    const currentRoles = editFormData.roles || [];
    if (currentRoles.includes(roleId)) {
      // Remove role (but keep at least one)
      if (currentRoles.length > 1) {
        setEditFormData({ ...editFormData, roles: currentRoles.filter(r => r !== roleId) });
      }
    } else {
      // Add role
      setEditFormData({ ...editFormData, roles: [...currentRoles, roleId] });
    }
  };

  const handleBulkExport = async (format = 'csv') => {
    setBulkExporting(true);
    try {
      if (format === 'csv') {
        const headers = ['ID', 'Email', 'Full Name', 'Base Role', 'App Roles', 'Handle', 'Location', 'Industry Role', 'Joined', 'Aura Score', 'Stardust Points', 'Hype Level', 'Service Provider'];
        const rows = filteredUsers.map(user => [
          user.id,
          user.email,
          user.full_name || '',
          user.role || '',
          (user.app_roles || []).join(';'),
          user.handle || '',
          user.location || '',
          user.industry_role || '',
          user.created_date ? new Date(user.created_date).toISOString().split('T')[0] : '',
          user.aura_score || '',
          user.stardust_points || '',
          user.hype_level || '',
          user.is_service_provider ? 'Yes' : 'No',
        ]);

        const csvContent = [
          headers.map(h => `"${h}"`).join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`Exported ${filteredUsers.length} users to CSV`);
      } else {
        const exportData = {
          export_date: new Date().toISOString(),
          export_version: '1.0',
          total_users: filteredUsers.length,
          users: filteredUsers.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            app_roles: user.app_roles || [],
            handle: user.handle,
            location: user.location,
            industry_role: user.industry_role,
            created_date: user.created_date,
            aura_score: user.aura_score,
            stardust_points: user.stardust_points,
            hype_level: user.hype_level,
            is_service_provider: user.is_service_provider,
          })),
        };

        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`Exported ${filteredUsers.length} users to JSON`);
      }
    } catch (error) {
      console.error('Bulk export failed:', error);
      toast.error('Failed to export users');
    } finally {
      setBulkExporting(false);
    }
  };

  const handleExportUserData = async (user) => {
    setExportingUserId(user.id);
    try {
      // Build export data for the selected user
      const userData = {
        export_date: new Date().toISOString(),
        export_version: '1.0',
        exported_by: 'admin',
        profile: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          app_role: user.app_role,
          handle: user.handle,
          avatar_url: user.avatar_url,
          headline: user.headline,
          bio: user.bio,
          location: user.location,
          industry_role: user.industry_role,
          expertise_tags: user.expertise_tags,
          created_date: user.created_date,
          updated_date: user.updated_date,
        },
        social_links: {
          linkedin_url: user.linkedin_url,
          twitter_url: user.twitter_url,
          instagram_url: user.instagram_url,
          tiktok_url: user.tiktok_url,
          youtube_url: user.youtube_url,
          website_url: user.website_url,
        },
        social_stats: user.social_stats || {},
        scores: {
          aura_score: user.aura_score,
          starpower_score: user.starpower_score,
          stardust_points: user.stardust_points,
          clout: user.clout,
          hype_score: user.hype_score,
          hype_level: user.hype_level,
        },
        engagement: {
          shares_count: user.shares_count,
          referrals_count: user.referrals_count,
          nominations_made: user.nominations_made,
          votes_influenced: user.votes_influenced,
          weekly_engagement_streak: user.weekly_engagement_streak,
          hype_missions_completed: user.hype_missions_completed,
          achievements_unlocked: user.achievements_unlocked,
        },
        exchange_credits: {
          xc_balance: user.xc_balance,
          xc_escrowed: user.xc_escrowed,
          xc_lifetime_earned: user.xc_lifetime_earned,
          xc_lifetime_spent: user.xc_lifetime_spent,
        },
        settings: {
          theme_mode: user.theme_mode,
          onboarding_completed: user.onboarding_completed,
          is_service_provider: user.is_service_provider,
        },
      };

      const jsonData = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_backup_${user.email?.replace('@', '_at_') || user.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`Exported data for ${user.full_name || user.email}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export user data');
    } finally {
      setExportingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <UserCog className="w-7 h-7" style={{ color: brandColors.goldPrestige }} />
            User Management
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">Manage users and IAM privileges</p>
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button 
                 variant="outline" 
                 disabled={bulkExporting || filteredUsers.length === 0}
               >
                 {bulkExporting ? (
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 ) : (
                   <Download className="w-4 h-4 mr-2" />
                 )}
                 Export All
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => handleBulkExport('csv')}>
                 CSV
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleBulkExport('json')}>
                 JSON
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
           <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
             <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
         </div>
      </div>

      {/* Stats Cards - Season 4+ IAM */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gray-100">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--text)]">{stats.total}</p>
                <p className="text-xs text-[var(--muted)]">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100">
                <Crown className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-rose-600">{stats.superAdmins}</p>
                <p className="text-xs text-[var(--muted)]">Super Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100">
                <Crown className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{stats.admins}</p>
                <p className="text-xs text-[var(--muted)]">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{stats.editors}</p>
                <p className="text-xs text-[var(--muted)]">Editors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{stats.honorees}</p>
                <p className="text-xs text-[var(--muted)]">Honorees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gray-100">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-600">{stats.members}</p>
                <p className="text-xs text-[var(--muted)]">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP 100 Cross-Reference */}
      <HonoreeUserCrossRef users={users} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--muted)]" />
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {IAM_ROLES.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <div className="text-sm font-normal text-[var(--muted)]">
              Page {currentPage} of {totalPages || 1}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted)]">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted)]">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted)]">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted)]">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[var(--muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const userRoleConfigs = getUserRoles(user);
                  return (
                    <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--card)]/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-white font-medium text-sm">
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text)]">{user.full_name || 'Unknown'}</p>
                            <p className="text-xs text-[var(--muted)]">ID: {user.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--muted)]" />
                          <span className="text-sm text-[var(--text)]">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {userRoleConfigs.map((rc, idx) => {
                            const RIcon = rc.icon;
                            return (
                              <Badge key={idx} className={`${rc.color} border text-xs`}>
                                <RIcon className="w-3 h-3 mr-1" />
                                {rc.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Calendar className="w-4 h-4" />
                          {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleExportUserData(user)}
                              disabled={exportingUserId === user.id}
                            >
                              {exportingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted)]">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-3">{currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-white font-bold text-2xl">
                  {selectedUser.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.full_name || 'Unknown'}</h3>
                  <p className="text-[var(--muted)]">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {getUserRoles(selectedUser).map((rc, idx) => (
                      <Badge key={idx} className={`${rc.color} border`}>
                        {rc.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Joined</p>
                  <p className="text-sm font-medium">
                    {selectedUser.created_date ? format(new Date(selectedUser.created_date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">User ID</p>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Last Updated</p>
                  <p className="text-sm font-medium">
                    {selectedUser.updated_date ? format(new Date(selectedUser.updated_date), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
            <Button onClick={() => { setViewModalOpen(false); handleEditUser(selectedUser); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change IAM privileges for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assign Roles (select multiple)</label>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {IAM_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = editFormData.roles?.includes(role.id);
                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.color.split(' ')[0]}`}>
                          <Icon className={`w-4 h-4 ${role.color.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text)]">{role.label}</p>
                          <p className="text-xs text-[var(--muted)]">{role.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">
                Selected: {editFormData.roles?.join(', ') || 'None'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Deactivate User
            </DialogTitle>
            <DialogDescription>
              This will deactivate the user account for <strong>{selectedUser?.email}</strong>. 
              The user will no longer be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}