import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { signatureData, planLabel } = await req.json();

    if (!signatureData) {
      return Response.json({ error: 'signatureData is required' }, { status: 400 });
    }

    // Save signature data to user profile
    await base44.auth.updateMe({
      signature_data: signatureData,
      signature_date: new Date().toISOString(),
      signature_plan: planLabel || '',
    });

    return Response.json({
      success: true,
      message: 'Signature saved to profile',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});