import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';
import { format, startOfMonth, endOfMonth, subMonths } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, year } = await req.json();
    
    // Default to last month
    const targetDate = month && year 
      ? new Date(year, month - 1, 1)
      : subMonths(new Date(), 1);
    
    const periodStart = startOfMonth(targetDate);
    const periodEnd = endOfMonth(targetDate);

    // Fetch bookings for this provider
    const bookings = await base44.entities.Booking.filter({
      provider_user_email: user.email,
      status: 'completed',
    });

    // Filter by date range
    const periodBookings = bookings.filter(b => {
      const bookingDate = new Date(b.start_time);
      return bookingDate >= periodStart && bookingDate <= periodEnd;
    });

    // Fetch related payments
    const payments = await base44.entities.Payment.filter({
      provider_email: user.email,
      status: 'succeeded',
    });

    const periodPayments = payments.filter(p => {
      const paymentDate = new Date(p.created_date);
      return paymentDate >= periodStart && paymentDate <= periodEnd;
    });

    // Fetch services for titles
    const services = await base44.entities.Service.filter({
      provider_user_email: user.email,
    });

    const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));

    // Calculate totals
    const totalEarnings = periodPayments.reduce((sum, p) => sum + (p.amount_cents / 100), 0);
    const platformFee = totalEarnings * 0.1; // 10% platform fee
    const netEarnings = totalEarnings - platformFee;

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 90);
    doc.text('Payout Report', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${format(periodStart, 'MMMM yyyy')}`, 20, 35);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 42);

    // Provider Info
    doc.setFontSize(10);
    doc.text(`Provider: ${user.full_name || user.email}`, 20, 55);
    doc.text(`Email: ${user.email}`, 20, 62);

    // Summary Box
    doc.setDrawColor(30, 58, 90);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 72, 170, 35, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(30, 58, 90);
    doc.text('Summary', 25, 82);

    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Total Sessions: ${periodBookings.length}`, 25, 92);
    doc.text(`Gross Earnings: $${totalEarnings.toFixed(2)}`, 25, 99);
    doc.text(`Platform Fee (10%): -$${platformFee.toFixed(2)}`, 100, 92);
    doc.text(`Net Earnings: $${netEarnings.toFixed(2)}`, 100, 99);

    // Transactions Table
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 90);
    doc.text('Transaction Details', 20, 120);

    // Table headers
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Date', 20, 130);
    doc.text('Service', 50, 130);
    doc.text('Client', 120, 130);
    doc.text('Amount', 165, 130);

    doc.setDrawColor(200);
    doc.line(20, 133, 190, 133);

    // Table rows
    let y = 140;
    doc.setTextColor(60);

    for (const booking of periodBookings.slice(0, 20)) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const service = serviceMap[booking.service_id];
      const payment = periodPayments.find(p => p.booking_id === booking.id);

      doc.text(format(new Date(booking.start_time), 'MMM d'), 20, y);
      doc.text((service?.title || 'Service').substring(0, 30), 50, y);
      doc.text(booking.client_user_email.substring(0, 20), 120, y);
      doc.text(`$${((payment?.amount_cents || 0) / 100).toFixed(2)}`, 165, y);

      y += 8;
    }

    if (periodBookings.length > 20) {
      doc.text(`... and ${periodBookings.length - 20} more transactions`, 20, y + 5);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This report is for informational purposes only.', 20, 285);

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=payout-report-${format(periodStart, 'yyyy-MM')}.pdf`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});