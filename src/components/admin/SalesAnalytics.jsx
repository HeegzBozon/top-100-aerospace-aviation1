import { useState, useEffect } from 'react';
import { getStripeAnalytics } from '@/functions/getStripeAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  ArrowUpRight,
  Wallet,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const COLORS = ['#1e3a5a', '#4a90b8', '#c9a87c', '#2ED573', '#FF6B6B'];

export default function SalesAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [stripeData, setStripeData] = useState(null);

  useEffect(() => {
    loadStripeData();
  }, [timeRange]);

  const loadStripeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getStripeAnalytics({ timeRange });
      if (data.success) {
        setStripeData(data);
      } else {
        setError(data.error || 'Failed to load Stripe data');
      }
    } catch (err) {
      console.error('Failed to load Stripe analytics:', err);
      setError(err.message || 'Failed to connect to Stripe');
    } finally {
      setLoading(false);
    }
  };

  const summary = stripeData?.summary || {};
  const revenueChartData = stripeData?.revenueByDay || [];
  const typeChartData = stripeData?.revenueByMethod || [];
  const recentCharges = stripeData?.recentCharges || [];
  const recentPayouts = stripeData?.recentPayouts || [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted)]">Fetching Stripe data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="font-semibold text-[var(--text)] mb-2">Failed to Load Stripe Data</h3>
          <p className="text-sm text-[var(--muted)] mb-4">{error}</p>
          <Button onClick={loadStripeData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Stripe Analytics</h2>
            <p className="text-sm text-[var(--muted)]">Live data from your Stripe account</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadStripeData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  ${(summary.totalRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{summary.totalTransactions || 0} charges</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Net Revenue</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  ${(summary.netRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>${(summary.totalFees || 0).toFixed(2)} in fees</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Avg Order Value</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  ${(summary.avgOrderValue || 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                  <ShoppingCart className="w-3 h-3" />
                  <span>Per transaction</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Available Balance</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  ${(summary.availableBalance || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                  <Wallet className="w-3 h-3" />
                  <span>${(summary.pendingBalance || 0).toLocaleString()} pending</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-700">Payouts</p>
                <p className="text-3xl font-bold text-cyan-900 mt-1">
                  ${(summary.completedPayouts || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-cyan-600">
                  <CreditCard className="w-3 h-3" />
                  <span>${(summary.pendingPayouts || 0).toLocaleString()} in transit</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[var(--text)]">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={brandColors.navyDeep} 
                    strokeWidth={2}
                    dot={{ fill: brandColors.navyDeep, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[var(--muted)]">
                No revenue data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[var(--text)]">Revenue by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[var(--muted)]">
                No type data available
              </div>
            )}
            <div className="mt-4 space-y-2">
              {typeChartData.slice(0, 4).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ background: COLORS[index % COLORS.length] }} 
                    />
                    <span className="text-[var(--muted)] capitalize">{item.name}</span>
                  </div>
                  <span className="font-medium text-[var(--text)]">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Recent Stripe Charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCharges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Customer</th>
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Product / Description</th>
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Method</th>
                    <th className="text-right py-3 px-2 font-medium text-[var(--muted)]">Amount</th>
                    <th className="text-center py-3 px-2 font-medium text-[var(--muted)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCharges.map((ch) => (
                    <tr key={ch.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20">
                      <td className="py-3 px-2 text-[var(--text)]">
                        {new Date(ch.created).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-[var(--text)]">{ch.customer_name || ch.customer_email || 'N/A'}</div>
                        {ch.customer_name && ch.customer_email && (
                          <div className="text-xs text-[var(--muted)]">{ch.customer_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-[var(--text)] max-w-[200px] truncate">
                          {ch.description || ch.product_description || 'N/A'}
                        </div>
                        {ch.metadata?.service_id && (
                          <div className="text-xs text-[var(--muted)]">Service ID: {ch.metadata.service_id}</div>
                        )}
                        {ch.metadata?.booking_id && (
                          <div className="text-xs text-[var(--muted)]">Booking: {ch.metadata.booking_id}</div>
                        )}
                        {ch.receipt_url && (
                          <a href={ch.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View Receipt
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)] capitalize">
                        {ch.payment_method_type || 'card'}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-[var(--text)]">
                        ${(ch.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={ch.paid ? 'bg-green-100 text-green-700' : ch.refunded ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {ch.refunded ? 'Refunded' : ch.paid ? 'Paid' : ch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--muted)]">
              No charges found for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      {recentPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Recent Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Created</th>
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Arrival</th>
                    <th className="text-left py-3 px-2 font-medium text-[var(--muted)]">Method</th>
                    <th className="text-right py-3 px-2 font-medium text-[var(--muted)]">Amount</th>
                    <th className="text-center py-3 px-2 font-medium text-[var(--muted)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayouts.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20">
                      <td className="py-3 px-2 text-[var(--text)]">
                        {new Date(p.created).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-[var(--text)]">
                        {new Date(p.arrival_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-[var(--muted)] capitalize">
                        {p.method || 'standard'}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-[var(--text)]">
                        ${(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={
                          p.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          p.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}