import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from '@/entities/User';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, XCircle, Clock, MessageSquare, 
  Star, ArrowRight, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusStyles = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
  escrow: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ArrowRight },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle },
  disputed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
  refunded: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle },
};

function ExchangeCard({ exchange, isProvider, serviceUnit, onComplete, onCancel }) {
  const style = statusStyles[exchange.status] || statusStyles.pending;
  const StatusIcon = style.icon;

  const canComplete = !isProvider && (exchange.status === 'escrow' || exchange.status === 'in_progress');
  const canCancel = exchange.status === 'escrow' || exchange.status === 'pending';

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold" style={{ color: brandColors.navyDeep }}>
              {serviceUnit?.title || 'Service Unit'}
            </h4>
            <p className="text-sm text-slate-500">
              {isProvider ? `From: ${exchange.requester_email}` : `To: ${exchange.provider_email}`}
            </p>
          </div>
          <Badge className={`${style.bg} ${style.text} capitalize`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {exchange.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <span className="font-bold" style={{ color: brandColors.goldPrestige }}>
            {exchange.xc_amount} XC
          </span>
          {exchange.scheduled_date && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {format(new Date(exchange.scheduled_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        {exchange.requester_notes && (
          <div className="p-2 rounded bg-slate-50 text-sm mb-3">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            {exchange.requester_notes}
          </div>
        )}

        {exchange.requester_rating && (
          <div className="flex items-center gap-1 text-sm mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <span>{exchange.requester_rating}/5</span>
            {exchange.requester_review && (
              <span className="text-slate-500 ml-2">"{exchange.requester_review}"</span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {canComplete && (
            <Button 
              size="sm" 
              onClick={() => onComplete(exchange)}
              style={{ background: brandColors.navyDeep }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
          {canCancel && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCancel(exchange)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExchangeManager() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: exchanges, isLoading } = useQuery({
    queryKey: ['my-exchanges', currentUser?.email],
    queryFn: async () => {
      const asRequester = await base44.entities.ServiceExchange.filter(
        { requester_email: currentUser.email },
        '-created_date'
      );
      const asProvider = await base44.entities.ServiceExchange.filter(
        { provider_email: currentUser.email },
        '-created_date'
      );
      return { asRequester, asProvider };
    },
    enabled: !!currentUser?.email,
    initialData: { asRequester: [], asProvider: [] }
  });

  const { data: serviceUnits } = useQuery({
    queryKey: ['all-service-units'],
    queryFn: () => base44.entities.ServiceUnit.list(),
    initialData: []
  });

  const completeMutation = useMutation({
    mutationFn: async (exchange) => {
      const res = await base44.functions.invoke('capitalExchange', {
        action: 'complete_exchange',
        exchange_id: exchange.id,
        rating: 5
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Exchange completed! Credits transferred.');
      queryClient.invalidateQueries({ queryKey: ['my-exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['xc-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => toast.error(error.message)
  });

  const cancelMutation = useMutation({
    mutationFn: async (exchange) => {
      const res = await base44.functions.invoke('capitalExchange', {
        action: 'cancel_exchange',
        exchange_id: exchange.id,
        reason: 'User cancelled'
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Exchange cancelled. Credits refunded.');
      queryClient.invalidateQueries({ queryKey: ['my-exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['xc-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => toast.error(error.message)
  });

  const getServiceUnit = (id) => serviceUnits.find(u => u.id === id);

  const activeRequests = exchanges.asRequester.filter(e => 
    ['pending', 'escrow', 'in_progress'].includes(e.status)
  );
  const activeProviding = exchanges.asProvider.filter(e => 
    ['pending', 'escrow', 'in_progress'].includes(e.status)
  );
  const completedExchanges = [
    ...exchanges.asRequester.filter(e => e.status === 'completed'),
    ...exchanges.asProvider.filter(e => e.status === 'completed')
  ].sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date));

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-slate-100 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Active - As Requester */}
      {activeRequests.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            Services You Requested ({activeRequests.length})
          </h3>
          {activeRequests.map(ex => (
            <ExchangeCard
              key={ex.id}
              exchange={ex}
              isProvider={false}
              serviceUnit={getServiceUnit(ex.service_unit_id)}
              onComplete={completeMutation.mutate}
              onCancel={cancelMutation.mutate}
            />
          ))}
        </div>
      )}

      {/* Active - As Provider */}
      {activeProviding.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
            Services to Deliver ({activeProviding.length})
          </h3>
          {activeProviding.map(ex => (
            <ExchangeCard
              key={ex.id}
              exchange={ex}
              isProvider={true}
              serviceUnit={getServiceUnit(ex.service_unit_id)}
              onComplete={completeMutation.mutate}
              onCancel={cancelMutation.mutate}
            />
          ))}
        </div>
      )}

      {/* Completed History */}
      {completedExchanges.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedExchanges.slice(0, 5).map(ex => (
                <div 
                  key={ex.id} 
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {getServiceUnit(ex.service_unit_id)?.title || 'Service'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(ex.completed_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: brandColors.goldPrestige }}>
                    {ex.xc_amount} XC
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeRequests.length === 0 && activeProviding.length === 0 && completedExchanges.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No exchanges yet</p>
        </div>
      )}
    </div>
  );
}