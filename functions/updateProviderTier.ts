import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only scheduled task
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all providers
    const providers = await base44.asServiceRole.entities.User.filter({ is_service_provider: true });
    let updated = 0;

    for (const provider of providers) {
      // Get provider stats
      const bookings = await base44.asServiceRole.entities.Booking.filter({ 
        provider_user_email: provider.email 
      });
      const reviews = await base44.asServiceRole.entities.Review.filter({ 
        provider_email: provider.email 
      });
      const payments = await base44.asServiceRole.entities.Payment.list();
      
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalBookings = completedBookings.length;
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      // Calculate earnings from bookings
      const bookingIds = bookings.map(b => b.id);
      const providerPayments = payments.filter(p => 
        bookingIds.includes(p.booking_id) && p.status === 'succeeded'
      );
      const totalEarnings = providerPayments.reduce((sum, p) => 
        sum + (p.provider_amount_cents || p.amount_cents || 0) / 100, 0
      );

      // Determine tier
      let tier = 'bronze';
      const badges = [];

      if (totalBookings >= 50 && avgRating >= 4.8 && totalEarnings >= 5000) {
        tier = 'platinum';
      } else if (totalBookings >= 25 && avgRating >= 4.5) {
        tier = 'gold';
      } else if (totalBookings >= 10 && avgRating >= 4.0) {
        tier = 'silver';
      }

      // Determine badges
      if (avgRating >= 4.8 && totalReviews >= 5) badges.push('top_rated');
      if (provider.is_service_provider) badges.push('verified');

      // Update or create tier record
      const existingTiers = await base44.asServiceRole.entities.ProviderTier.filter({ 
        provider_email: provider.email 
      });

      const tierData = {
        provider_email: provider.email,
        tier,
        total_bookings: totalBookings,
        total_reviews: totalReviews,
        avg_rating: Math.round(avgRating * 10) / 10,
        total_earnings: Math.round(totalEarnings * 100) / 100,
        tier_updated_date: new Date().toISOString(),
        badges
      };

      if (existingTiers.length > 0) {
        await base44.asServiceRole.entities.ProviderTier.update(existingTiers[0].id, tierData);
      } else {
        await base44.asServiceRole.entities.ProviderTier.create(tierData);
      }

      updated++;
    }

    return Response.json({ success: true, providers_updated: updated });
  } catch (error) {
    console.error('Provider tier update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});