import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, CreditCard, ArrowRight, 
  ExternalLink, Loader2, Clock, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function PayoutDashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: connectStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['stripe-connect-status', user?.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('getStripeConnectStatus', {});
      return res.data;
    },
    enabled: !!user?.email
  });

  const { data: bookings } = useQuery({
    queryKey: ['provider-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['provider-payments', bookings],
    queryFn: async () => {
      if (!bookings?.length) return [];
      const allPayments = await base44.entities.Payment.list();
      const bookingIds = bookings.map(b => b.id);
      return allPayments.filter(p => bookingIds.includes(p.booking_id));
    },
    enabled: !!bookings?.length,
    initialData: []
  });

  const { data: providerTier } = useQuery({
    queryKey: ['provider-tier', user?.email],
    queryFn: async () => {
      const tiers = await base44.entities.ProviderTier.filter({ provider_email: user.email });
      return tiers?.[0] || { tier: 'standard', royalty_rate: 0.20 };
    },
    enabled: !!user?.email
  });

  if (userLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  const succeededPayments = payments.filter(p => p.status === 'succeeded');
  const totalEarnings = succeededPayments.reduce((sum, p) => 
    sum + (p.provider_amount_cents || p.amount_cents || 0) / 100, 0
  );

  const pendingPayouts = succeededPayments.filter(p => !p.payout_completed);
  const pendingAmount = pendingPayouts.reduce((sum, p) => 
    sum + (p.provider_amount_cents || p.amount_cents || 0) / 100, 0
  );

  const isConnected = connectStatus?.has_account && connectStatus?.payouts_enabled;

  const [generatingReport, setGeneratingReport] = React.useState(false);

  const handleDownloadReport = async (month, year) => {
    setGeneratingReport(true);
    try {
      const { data } = await base44.functions.invoke('generatePayoutReport', { month, year });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout-report-${year || 'last'}-${month || 'month'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
            Payouts
          </h1>
          <p className="text-slate-500">Manage your earnings and payment settings</p>
        </div>
        <Link to={createPageUrl('MissionControl') + '?module=provider'}>
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Connect Status */}
      {!isConnected && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">
                  Set up payouts to receive earnings
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  Connect your bank account via Stripe to receive payments from your bookings.
                </p>
                <Link to={createPageUrl('PayoutSettings')}>
                  <Button style={{ background: brandColors.navyDeep }}>
                    Set Up Payouts <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <DollarSign className="w-10 h-10 mb-3" style={{ color: brandColors.goldPrestige }} />
            <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Clock className="w-10 h-10 mb-3 text-blue-500" />
            <p className="text-3xl font-bold">${pendingAmount.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Pending Payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <TrendingUp className="w-10 h-10 mb-3 text-green-500" />
            <p className="text-3xl font-bold">{succeededPayments.length}</p>
            <p className="text-sm text-slate-500">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      {isConnected && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Stripe Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Payouts are automatically transferred to your connected bank account.
                </p>
              </div>
              <a 
                href="https://dashboard.stripe.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  Stripe Dashboard <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Tier & Royalty */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Provider Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ 
                  background: providerTier?.tier === 'sponsor' ? '#c9a87c' :
                              providerTier?.tier === 'partner' ? '#4a90b8' :
                              providerTier?.tier === 'verified' ? '#22c55e' : '#64748b'
                }}
              >
                {((1 - (providerTier?.royalty_rate || 0.20)) * 100).toFixed(0)}%
              </div>
              <div>
                <p className="font-semibold capitalize" style={{ color: brandColors.navyDeep }}>
                  {providerTier?.tier || 'Standard'} Provider
                </p>
                <p className="text-sm text-slate-500">
                  You retain {((1 - (providerTier?.royalty_rate || 0.20)) * 100).toFixed(0)}% of each transaction
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Platform fee</p>
              <p className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                {((providerTier?.royalty_rate || 0.20) * 100).toFixed(0)}%
              </p>
              {providerTier?.royalty_cap && (
                <p className="text-xs text-slate-500">
                  Capped at ${(providerTier.royalty_cap / 100).toFixed(0)}/txn
                </p>
              )}
            </div>
          </div>
          {providerTier?.tier === 'standard' && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50 text-sm text-slate-600">
              <p className="font-medium mb-1">How to unlock lower rates:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Verified (15%)</strong> — Complete quality SLAs, participate in ecosystem</li>
                <li><strong>Partner (10%)</strong> — TOP 100 honoree or trusted operator</li>
                <li><strong>Sponsor (5%)</strong> — Platinum/Gold sponsor partnership</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
                Download Payout Report
              </h3>
              <p className="text-sm text-slate-500">Generate PDF report of your earnings</p>
            </div>
            <Button
              onClick={() => handleDownloadReport()}
              disabled={generatingReport}
              variant="outline"
              className="gap-2"
            >
              {generatingReport ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Last Month Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {succeededPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {succeededPayments.slice(0, 10).map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="font-medium">Booking Payment</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(payment.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${((payment.provider_amount_cents || payment.amount_cents || 0) / 100).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {payment.payout_completed ? 'Paid out' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}