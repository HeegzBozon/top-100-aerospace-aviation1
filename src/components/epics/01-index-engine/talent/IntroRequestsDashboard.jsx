import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, Mail, Clock, CheckCircle, XCircle, 
  Briefcase, Sparkles, ExternalLink, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import IntroResponseModal from './IntroResponseModal';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusConfig = {
  pending: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
  viewed: { label: 'Viewed', color: 'bg-slate-100 text-slate-600', icon: Mail },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function IntroRequestsDashboard({ userEmail }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['intro-requests', userEmail],
    queryFn: () => base44.entities.IntroRequest.filter({ recipient_email: userEmail }, '-created_date', 100),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.IntroRequest.update(id, { 
      status, 
      responded_date: status === 'responded' || status === 'declined' ? new Date().toISOString() : null 
    }),
    onSuccess: () => queryClient.invalidateQueries(['intro-requests', userEmail])
  });

  const filteredRequests = requests.filter(r => 
    filter === 'all' || r.status === filter
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleMarkViewed = (request) => {
    if (request.status === 'pending') {
      updateMutation.mutate({ id: request.id, status: 'viewed' });
    }
  };

  const handleRespond = (request) => {
    setRespondingTo(request);
  };

  const handleDecline = (request) => {
    updateMutation.mutate({ id: request.id, status: 'declined' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Loading requests...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold" style={{ color: brandColors.navyDeep }}>
            Introduction Requests
          </h2>
          {pendingCount > 0 && (
            <Badge className="bg-blue-500 text-white">{pendingCount} new</Badge>
          )}
        </div>
        <div className="flex gap-1">
          {['all', 'pending', 'responded', 'declined'].map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'ghost'}
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-slate-800' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No intro requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(request => {
            const config = statusConfig[request.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <Card 
                key={request.id} 
                className={request.status === 'pending' ? 'border-blue-200 bg-blue-50/30' : ''}
                onClick={() => handleMarkViewed(request)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" style={{ color: brandColors.navyDeep }}>
                          {request.requester_name || request.requester_email}
                        </span>
                        <Badge className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        {request.target_type === 'job' ? (
                          <Briefcase className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>{request.target_title}</span>
                        <span className="text-slate-300">•</span>
                        <span>{format(new Date(request.created_date), 'MMM d, h:mm a')}</span>
                      </div>

                      {request.message && (
                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mt-2">
                          <MessageSquare className="w-3.5 h-3.5 inline mr-2 text-slate-400" />
                          "{request.message}"
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-2">
                        {request.requester_email}
                      </p>
                    </div>

                    {/* Actions */}
                    {(request.status === 'pending' || request.status === 'viewed') && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleRespond(request); }}
                          style={{ background: brandColors.goldPrestige, color: 'white' }}
                        >
                          <Mail className="w-3 h-3 mr-1" /> Respond
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDecline(request); }}
                          className="text-slate-500"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      <IntroResponseModal
        isOpen={!!respondingTo}
        onClose={() => setRespondingTo(null)}
        request={respondingTo}
        onSuccess={() => queryClient.invalidateQueries(['intro-requests', userEmail])}
      />
    </div>
  );
}