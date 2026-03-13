import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserX, Users, ArrowRight, AlertTriangle, Loader2, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function UserMergeManager() {
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [sourceUser, setSourceUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [sourceResults, setSourceResults] = useState([]);
  const [targetResults, setTargetResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  
  // Role Management
  const [roleEmail, setRoleEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  const handleRoleUpdate = async () => {
    if (!roleEmail || !selectedRole) {
      toast.error('Enter email and select role');
      return;
    }

    try {
      setUpdatingRole(true);
      const { data } = await base44.functions.invoke('updateUserRole', {
        email: roleEmail,
        role: selectedRole
      });

      if (data.success) {
        toast.success(data.message);
        setRoleEmail('');
        setSelectedRole('');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Role update failed:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const searchUsers = async (query, setResults) => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await base44.entities.User.list();
      const filtered = users.filter(u => 
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!sourceUser || !targetUser) {
      toast.error('Select both source and target users');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `Source user (${sourceUser.email}) will be DELETED.\n` +
      `All their data will be transferred to ${targetUser.email}.\n\n` +
      `Type "MERGE" to confirm this operation.`
    );

    if (!confirmed) return;

    const doubleCheck = window.prompt('Type MERGE to confirm:');
    if (doubleCheck !== 'MERGE') {
      toast.error('Merge cancelled');
      return;
    }

    try {
      setMerging(true);
      const { data } = await base44.functions.invoke('mergeUsers', {
        source_user_id: sourceUser.id,
        target_user_id: targetUser.id
      });

      if (data.success) {
        toast.success(data.message);
        setSourceUser(null);
        setTargetUser(null);
        setSearchSource('');
        setSearchTarget('');
        setSourceResults([]);
        setTargetResults([]);
      } else {
        throw new Error(data.error || 'Merge failed');
      }
    } catch (error) {
      console.error('Merge failed:', error);
      toast.error(error.message || 'Merge failed');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColors.cream }}>
          <Users className="w-6 h-6" style={{ color: brandColors.navyDeep }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            User Management
          </h2>
          <p className="text-sm opacity-60">Manage user roles and merge duplicate accounts</p>
        </div>
      </div>

      {/* Role Management Section */}
      <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">Update User Role</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="User email address"
            value={roleEmail}
            onChange={(e) => setRoleEmail(e.target.value)}
          />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRoleUpdate}
            disabled={updatingRole || !roleEmail || !selectedRole}
            style={{ backgroundColor: brandColors.navyDeep }}
          >
            {updatingRole ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Update Role
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Warning Banner */}
      <Card className="bg-red-50 border-red-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Destructive Operation</h3>
            <p className="text-sm text-red-700">
              The source user will be permanently deleted. All their data (votes, nominations, achievements) 
              will be transferred to the target user. This action cannot be undone.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source User (Will be deleted) */}
        <Card className="p-6 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <UserX className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-lg">Source User (Will be deleted)</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 opacity-40" />
              <Input
                placeholder="Search by email or name..."
                value={searchSource}
                onChange={(e) => {
                  setSearchSource(e.target.value);
                  searchUsers(e.target.value, setSourceResults);
                }}
                className="pl-10"
              />
            </div>

            {sourceResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {sourceResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSourceUser(user);
                      setSourceResults([]);
                      setSearchSource('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm opacity-60">{user.email}</div>
                  </div>
                ))}
              </div>
            )}

            {sourceUser && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{sourceUser.full_name || 'No name'}</div>
                    <div className="text-sm opacity-80">{sourceUser.email}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Votes: {sourceUser.total_votes_cast || 0}</Badge>
                      <Badge variant="outline">Stardust: {sourceUser.stardust_points || 0}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSourceUser(null)}
                  >
                    Clear
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Card>

        {/* Target User (Will receive data) */}
        <Card className="p-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg">Target User (Will receive data)</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 opacity-40" />
              <Input
                placeholder="Search by email or name..."
                value={searchTarget}
                onChange={(e) => {
                  setSearchTarget(e.target.value);
                  searchUsers(e.target.value, setTargetResults);
                }}
                className="pl-10"
              />
            </div>

            {targetResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {targetResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setTargetUser(user);
                      setTargetResults([]);
                      setSearchTarget('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm opacity-60">{user.email}</div>
                  </div>
                ))}
              </div>
            )}

            {targetUser && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{targetUser.full_name || 'No name'}</div>
                    <div className="text-sm opacity-80">{targetUser.email}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Votes: {targetUser.total_votes_cast || 0}</Badge>
                      <Badge variant="outline">Stardust: {targetUser.stardust_points || 0}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTargetUser(null)}
                  >
                    Clear
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Card>
      </div>

      {/* Merge Preview */}
      {sourceUser && targetUser && (
        <Card className="p-6 bg-gradient-to-r from-red-50 to-green-50 border-2">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-bold mb-1">{sourceUser.email}</div>
              <Badge className="bg-red-600 text-white">Will be deleted</Badge>
            </div>
            <ArrowRight className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <div className="text-center">
              <div className="font-bold mb-1">{targetUser.email}</div>
              <Badge className="bg-green-600 text-white">Will receive all data</Badge>
            </div>
          </div>

          <Button
            onClick={handleMerge}
            disabled={merging}
            className="w-full mt-6"
            style={{ backgroundColor: brandColors.navyDeep }}
          >
            {merging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Execute Merge
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}