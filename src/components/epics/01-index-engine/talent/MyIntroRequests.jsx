import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, Clock, CheckCircle, XCircle, Eye, 
  Briefcase, Sparkles, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-700', icon: Eye },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MyIntroRequests({ userEmail }) {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-intro-requests', userEmail],
    queryFn: () => base44.entities.IntroRequest.filter({ requester_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
    initialData: []
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Loading your requests...
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No intro requests yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Browse jobs or services and request introductions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(request => {
        const config = statusConfig[request.status] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <Card key={request.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {request.target_type === 'job' ? (
                      <Briefcase className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium" style={{ color: brandColors.navyDeep }}>
                      {request.target_title}
                    </span>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Sent {format(new Date(request.created_date), 'MMM d, yyyy · h:mm a')}
                  </p>

                  {request.message && (
                    <div className="bg-slate-50 rounded-lg p-2 text-sm text-slate-600 mt-2">
                      <MessageSquare className="w-3 h-3 inline mr-1 text-slate-400" />
                      "{request.message}"
                    </div>
                  )}

                  {request.responded_date && (
                    <p className="text-xs text-green-600 mt-2">
                      Responded {format(new Date(request.responded_date), 'MMM d')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}