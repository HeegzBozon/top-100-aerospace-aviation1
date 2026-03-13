import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action } = payload;

    // ============================================
    // ACTION: REQUEST EXCHANGE (lock credits in escrow)
    // ============================================
    if (action === 'request_exchange') {
      const { service_unit_id, scheduled_date, notes } = payload;

      // Get service unit
      const units = await base44.asServiceRole.entities.ServiceUnit.filter({ id: service_unit_id });
      const unit = units?.[0];
      if (!unit) {
        return Response.json({ error: 'Service unit not found' }, { status: 404 });
      }

      if (!unit.is_active) {
        return Response.json({ error: 'Service unit is not active' }, { status: 400 });
      }

      // Check requester has enough balance
      const requesterBalance = user.xc_balance || 0;
      if (requesterBalance < unit.xc_cost) {
        return Response.json({ 
          error: 'Insufficient Exchange Credits', 
          required: unit.xc_cost, 
          available: requesterBalance 
        }, { status: 400 });
      }

      // Cannot request own service
      if (unit.provider_email === user.email) {
        return Response.json({ error: 'Cannot request your own service' }, { status: 400 });
      }

      // Lock credits in escrow
      const newBalance = requesterBalance - unit.xc_cost;
      const newEscrowed = (user.xc_escrowed || 0) + unit.xc_cost;

      await base44.auth.updateMe({
        xc_balance: newBalance,
        xc_escrowed: newEscrowed
      });

      // Create escrow transaction
      const escrowTx = await base44.asServiceRole.entities.CreditTransaction.create({
        user_email: user.email,
        transaction_type: 'escrow_lock',
        amount: -unit.xc_cost,
        balance_after: newBalance,
        reference_type: 'service_exchange',
        counterparty_email: unit.provider_email,
        notes: `Escrow for: ${unit.title}`
      });

      // Create exchange record
      const exchange = await base44.asServiceRole.entities.ServiceExchange.create({
        service_unit_id: unit.id,
        provider_email: unit.provider_email,
        requester_email: user.email,
        xc_amount: unit.xc_cost,
        status: 'escrow',
        scheduled_date: scheduled_date,
        requester_notes: notes,
        escrow_transaction_id: escrowTx.id
      });

      return Response.json({ 
        success: true, 
        exchange_id: exchange.id,
        message: `${unit.xc_cost} XC locked in escrow`
      });
    }

    // ============================================
    // ACTION: COMPLETE EXCHANGE (release escrow to provider)
    // ============================================
    if (action === 'complete_exchange') {
      const { exchange_id, rating, review } = payload;

      const exchanges = await base44.asServiceRole.entities.ServiceExchange.filter({ id: exchange_id });
      const exchange = exchanges?.[0];
      if (!exchange) {
        return Response.json({ error: 'Exchange not found' }, { status: 404 });
      }

      // Only requester can complete
      if (exchange.requester_email !== user.email) {
        return Response.json({ error: 'Only requester can complete exchange' }, { status: 403 });
      }

      if (exchange.status !== 'escrow' && exchange.status !== 'in_progress') {
        return Response.json({ error: 'Exchange cannot be completed in current status' }, { status: 400 });
      }

      // Release escrow: deduct from requester's escrowed, add to provider's balance
      const requesterEscrowed = (user.xc_escrowed || 0) - exchange.xc_amount;
      const requesterLifetimeSpent = (user.xc_lifetime_spent || 0) + exchange.xc_amount;

      await base44.auth.updateMe({
        xc_escrowed: Math.max(0, requesterEscrowed),
        xc_lifetime_spent: requesterLifetimeSpent
      });

      // Get provider and update their balance
      const providers = await base44.asServiceRole.entities.User.filter({ email: exchange.provider_email });
      const provider = providers?.[0];
      if (provider) {
        const providerNewBalance = (provider.xc_balance || 0) + exchange.xc_amount;
        const providerLifetimeEarned = (provider.xc_lifetime_earned || 0) + exchange.xc_amount;
        const providerEarnedThisMonth = (provider.xc_earned_this_month || 0) + exchange.xc_amount;

        await base44.asServiceRole.entities.User.update(provider.id, {
          xc_balance: providerNewBalance,
          xc_lifetime_earned: providerLifetimeEarned,
          xc_earned_this_month: providerEarnedThisMonth
        });

        // Create earn transaction for provider
        await base44.asServiceRole.entities.CreditTransaction.create({
          user_email: provider.email,
          transaction_type: 'earn',
          amount: exchange.xc_amount,
          balance_after: providerNewBalance,
          reference_type: 'service_delivery',
          reference_id: exchange.id,
          counterparty_email: user.email,
          notes: `Service delivered`
        });
      }

      // Create spend transaction for requester
      await base44.asServiceRole.entities.CreditTransaction.create({
        user_email: user.email,
        transaction_type: 'spend',
        amount: -exchange.xc_amount,
        balance_after: user.xc_balance || 0,
        reference_type: 'service_exchange',
        reference_id: exchange.id,
        counterparty_email: exchange.provider_email,
        notes: `Exchange completed`
      });

      // Update exchange status
      await base44.asServiceRole.entities.ServiceExchange.update(exchange.id, {
        status: 'completed',
        completed_date: new Date().toISOString(),
        requester_rating: rating,
        requester_review: review
      });

      // Update service unit stats
      const units = await base44.asServiceRole.entities.ServiceUnit.filter({ id: exchange.service_unit_id });
      const unit = units?.[0];
      if (unit) {
        await base44.asServiceRole.entities.ServiceUnit.update(unit.id, {
          total_redemptions: (unit.total_redemptions || 0) + 1,
          current_month_redemptions: (unit.current_month_redemptions || 0) + 1
        });
      }

      return Response.json({ success: true, message: 'Exchange completed, credits transferred to provider' });
    }

    // ============================================
    // ACTION: CANCEL EXCHANGE (refund escrow)
    // ============================================
    if (action === 'cancel_exchange') {
      const { exchange_id, reason } = payload;

      const exchanges = await base44.asServiceRole.entities.ServiceExchange.filter({ id: exchange_id });
      const exchange = exchanges?.[0];
      if (!exchange) {
        return Response.json({ error: 'Exchange not found' }, { status: 404 });
      }

      // Only requester or provider can cancel
      if (exchange.requester_email !== user.email && exchange.provider_email !== user.email) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (exchange.status !== 'escrow' && exchange.status !== 'pending') {
        return Response.json({ error: 'Exchange cannot be cancelled in current status' }, { status: 400 });
      }

      // Refund escrow to requester
      const requesters = await base44.asServiceRole.entities.User.filter({ email: exchange.requester_email });
      const requester = requesters?.[0];
      if (requester) {
        const newBalance = (requester.xc_balance || 0) + exchange.xc_amount;
        const newEscrowed = Math.max(0, (requester.xc_escrowed || 0) - exchange.xc_amount);

        await base44.asServiceRole.entities.User.update(requester.id, {
          xc_balance: newBalance,
          xc_escrowed: newEscrowed
        });

        // Create refund transaction
        await base44.asServiceRole.entities.CreditTransaction.create({
          user_email: requester.email,
          transaction_type: 'escrow_refund',
          amount: exchange.xc_amount,
          balance_after: newBalance,
          reference_type: 'service_exchange',
          reference_id: exchange.id,
          notes: `Cancelled: ${reason || 'No reason provided'}`
        });
      }

      // Update exchange status
      await base44.asServiceRole.entities.ServiceExchange.update(exchange.id, {
        status: 'cancelled',
        dispute_reason: reason
      });

      return Response.json({ success: true, message: 'Exchange cancelled, credits refunded' });
    }

    // ============================================
    // ACTION: GET BALANCE
    // ============================================
    if (action === 'get_balance') {
      return Response.json({
        balance: user.xc_balance || 0,
        escrowed: user.xc_escrowed || 0,
        lifetime_earned: user.xc_lifetime_earned || 0,
        lifetime_spent: user.xc_lifetime_spent || 0,
        monthly_cap: user.xc_monthly_cap || 500,
        earned_this_month: user.xc_earned_this_month || 0,
        provider_verified: user.xc_provider_verified || false,
        reliability_score: user.xc_reliability_score || 100
      });
    }

    // ============================================
    // ACTION: GRANT CREDITS (admin only)
    // ============================================
    if (action === 'grant_credits') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      const { target_email, amount, reason } = payload;

      const targets = await base44.asServiceRole.entities.User.filter({ email: target_email });
      const target = targets?.[0];
      if (!target) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      const newBalance = (target.xc_balance || 0) + amount;

      await base44.asServiceRole.entities.User.update(target.id, {
        xc_balance: newBalance,
        xc_lifetime_earned: (target.xc_lifetime_earned || 0) + amount
      });

      await base44.asServiceRole.entities.CreditTransaction.create({
        user_email: target_email,
        transaction_type: 'grant',
        amount: amount,
        balance_after: newBalance,
        reference_type: 'manual',
        notes: reason || 'Admin grant'
      });

      return Response.json({ success: true, new_balance: newBalance });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Capital Exchange Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});