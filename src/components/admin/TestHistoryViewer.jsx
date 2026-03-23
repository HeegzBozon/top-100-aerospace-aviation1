import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    blocked: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
  };
  const statusIcons = {
    passed: <CheckCircle className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    blocked: <AlertTriangle className="w-3 h-3" />,
    in_progress: <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusIcons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

export default function TestHistoryViewer({ sessions, cases, users, onViewSession }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [testerFilter, setTesterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const combinedSessions = useMemo(() => {
    return sessions.map(session => {
      const testCase = cases.find(c => c.id === session.test_case_id);
      const tester = users.find(u => u.email === session.tester_email);
      return {
        ...session,
        test_case_title: testCase?.title || 'Unknown Test Case',
        test_steps: testCase?.test_steps || [],
        tester_name: tester?.full_name || session.tester_email
      };
    }).sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  }, [sessions, cases, users]);

  const filteredSessions = useMemo(() => {
    return combinedSessions.filter(session => {
      const statusMatch = statusFilter === 'all' || session.status === statusFilter;
      const testerMatch = testerFilter === 'all' || session.tester_email === testerFilter;
      const searchMatch = searchTerm === '' || session.test_case_title.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && testerMatch && searchMatch;
    });
  }, [combinedSessions, statusFilter, testerFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-gray-900">Test Session History</h2>
        <p className="text-gray-600">Review all completed and in-progress test sessions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 border rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select value={testerFilter} onValueChange={setTesterFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by tester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Testers</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.email}>{user.full_name || user.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{session.test_case_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{session.tester_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={session.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(session.start_time), 'PPp')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => onViewSession(session)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No test sessions match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}