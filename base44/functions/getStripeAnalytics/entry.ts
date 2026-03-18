import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@^14.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { timeRange = '30d' } = payload;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Calculate date range
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'all': 365 };
    const days = daysMap[timeRange] || 30;
    const startDate = Math.floor((now.getTime() - days * 24 * 60 * 60 * 1000) / 1000);

    // Fetch data in parallel
    const [
      balanceTransactions,
      charges,
      payouts,
      balance
    ] = await Promise.all([
      stripe.balanceTransactions.list({
        created: { gte: startDate },
        limit: 100,
        expand: ['data.source']
      }),
      stripe.charges.list({
        created: { gte: startDate },
        limit: 100
      }),
      stripe.payouts.list({
        created: { gte: startDate },
        limit: 50
      }),
      stripe.balance.retrieve()
    ]);

    // Process balance transactions
    const transactions = balanceTransactions.data.map(tx => ({
      id: tx.id,
      amount: tx.amount / 100, // Convert from cents
      fee: tx.fee / 100,
      net: tx.net / 100,
      currency: tx.currency,
      type: tx.type,
      status: tx.status,
      created: new Date(tx.created * 1000).toISOString(),
      description: tx.description,
      source_type: tx.source?.object || null
    }));

    // Process charges
    const chargesList = charges.data.map(ch => ({
      id: ch.id,
      amount: ch.amount / 100,
      currency: ch.currency,
      status: ch.status,
      paid: ch.paid,
      refunded: ch.refunded,
      customer_email: ch.billing_details?.email || ch.receipt_email,
      customer_name: ch.billing_details?.name,
      description: ch.description,
      product_description: ch.calculated_statement_descriptor || ch.statement_descriptor || ch.description,
      metadata: ch.metadata || {},
      created: new Date(ch.created * 1000).toISOString(),
      payment_method_type: ch.payment_method_details?.type,
      receipt_url: ch.receipt_url
    }));

    // Process payouts
    const payoutsList = payouts.data.map(p => ({
      id: p.id,
      amount: p.amount / 100,
      currency: p.currency,
      status: p.status,
      arrival_date: new Date(p.arrival_date * 1000).toISOString(),
      created: new Date(p.created * 1000).toISOString(),
      method: p.method
    }));

    // Calculate summary metrics
    const successfulCharges = chargesList.filter(c => c.paid && !c.refunded);
    const totalRevenue = successfulCharges.reduce((sum, c) => sum + c.amount, 0);
    const totalTransactions = successfulCharges.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalFees = transactions.filter(t => t.type === 'charge').reduce((sum, t) => sum + t.fee, 0);
    const netRevenue = totalRevenue - totalFees;

    // Pending and completed payouts
    const pendingPayouts = payoutsList.filter(p => p.status === 'pending' || p.status === 'in_transit')
      .reduce((sum, p) => sum + p.amount, 0);
    const completedPayouts = payoutsList.filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    // Current balance
    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
    const pendingBalance = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;

    // Revenue by day
    const revenueByDay = {};
    successfulCharges.forEach(ch => {
      const date = new Date(ch.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDay[date] = (revenueByDay[date] || 0) + ch.amount;
    });

    // Revenue by payment method
    const revenueByMethod = {};
    successfulCharges.forEach(ch => {
      const method = ch.payment_method_type || 'card';
      revenueByMethod[method] = (revenueByMethod[method] || 0) + ch.amount;
    });

    return Response.json({
      success: true,
      summary: {
        totalRevenue,
        netRevenue,
        totalFees,
        totalTransactions,
        avgOrderValue,
        pendingPayouts,
        completedPayouts,
        availableBalance,
        pendingBalance
      },
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })),
      revenueByMethod: Object.entries(revenueByMethod).map(([name, value]) => ({ name, value })),
      recentCharges: chargesList.slice(0, 15),
      recentPayouts: payoutsList.slice(0, 10),
      transactions: transactions.slice(0, 20)
    });

  } catch (error) {
    console.error('Stripe Analytics Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});