import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Loader2, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function NomineeAssignmentManager() {
  const [searchUser, setSearchUser] = useState('');
  const [searchNominee, setSearchNominee] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [nomineeResults, setNomineeResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUserResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await base44.entities.User.list();
      const filtered = users.filter(u => 
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setUserResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const searchNominees = async (query) => {
    if (!query || query.length < 2) {
      setNomineeResults([]);
      return;
    }

    try {
      setLoading(true);
      const nominees = await base44.entities.Nominee.list();
      const filtered = nominees.filter(n => 
        n.name?.toLowerCase().includes(query.toLowerCase()) ||
        n.nominee_email?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setNomineeResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedNominee) {
      toast.error('Select both user and nominee');
      return;
    }

    try {
      setAssigning(true);
      await base44.entities.Nominee.update(selectedNominee.id, {
        claimed_by_user_email: selectedUser.email,
        claim_status: 'approved'
      });

      toast.success(`Assigned ${selectedNominee.name} to ${selectedUser.email}`);
      setSelectedUser(null);
      setSelectedNominee(null);
      setSearchUser('');
      setSearchNominee('');
    } catch (error) {
      console.error('Assignment failed:', error);
      toast.error('Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColors.cream }}>
          <UserPlus className="w-6 h-6" style={{ color: brandColors.navyDeep }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            Assign Nominee Profiles
          </h2>
          <p className="text-sm opacity-60">Link nominee profiles to user accounts</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
            <h3 className="font-bold text-lg">Select User</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 opacity-40" />
              <Input
                placeholder="Search by email or name..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {userResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {userResults.map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setUserResults([]);
                      setSearchUser('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm opacity-60">{user.email}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{selectedUser.full_name || 'No name'}</div>
                    <div className="text-sm opacity-80">{selectedUser.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Clear
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Card>

        {/* Nominee Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            <h3 className="font-bold text-lg">Select Nominee</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 opacity-40" />
              <Input
                placeholder="Search by name or email..."
                value={searchNominee}
                onChange={(e) => {
                  setSearchNominee(e.target.value);
                  searchNominees(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {nomineeResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {nomineeResults.map(nominee => (
                  <div
                    key={nominee.id}
                    onClick={() => {
                      setSelectedNominee(nominee);
                      setNomineeResults([]);
                      setSearchNominee('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{nominee.name}</div>
                    <div className="text-sm opacity-60">{nominee.nominee_email || 'No email'}</div>
                    {nominee.claimed_by_user_email && (
                      <Badge variant="outline" className="mt-1">
                        Already claimed by {nominee.claimed_by_user_email}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedNominee && (
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{selectedNominee.name}</div>
                    <div className="text-sm opacity-80">{selectedNominee.nominee_email || 'No email'}</div>
                    {selectedNominee.claimed_by_user_email && (
                      <Badge variant="outline" className="mt-2">
                        Currently: {selectedNominee.claimed_by_user_email}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNominee(null)}
                  >
                    Clear
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Card>
      </div>

      {/* Assignment Action */}
      {selectedUser && selectedNominee && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-amber-50 border-2">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="font-bold mb-1">{selectedUser.email}</div>
              <Badge className="bg-blue-600 text-white">User</Badge>
            </div>
            <LinkIcon className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <div className="text-center">
              <div className="font-bold mb-1">{selectedNominee.name}</div>
              <Badge className="bg-amber-600 text-white">Nominee</Badge>
            </div>
          </div>

          {selectedNominee.claimed_by_user_email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div className="text-sm">
                  <strong>Warning:</strong> This nominee is already claimed by{' '}
                  <strong>{selectedNominee.claimed_by_user_email}</strong>. This action will reassign it.
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleAssign}
            disabled={assigning}
            className="w-full"
            style={{ backgroundColor: brandColors.navyDeep }}
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Assign Profile
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}