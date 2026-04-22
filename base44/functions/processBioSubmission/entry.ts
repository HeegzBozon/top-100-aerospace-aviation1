import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'matthew@top100aero.space';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();
    
    const entityId = data?.id || event?.entity_id;
    if (!entityId) {
      return Response.json({ error: 'No submission ID' }, { status: 400 });
    }

    // Use the data directly from the automation payload if available
    const submission = data;
    if (!submission || (submission.status && submission.status !== 'submitted')) {
      return Response.json({ skipped: true, reason: 'Not in submitted status' });
    }
    const submissionId = entityId;

    // Mark as processing
    await base44.asServiceRole.entities.BioSubmission.update(submissionId, { status: 'processing' });

    const answers = submission.answers || {};
    const storyParts = Object.entries(answers)
      .filter(([_, v]) => v && v.trim().length > 0)
      .map(([key, value]) => {
        const labels = {
          concept: 'The Why',
          explore: 'The Journey',
          character: 'Your Role',
          function: 'The Impact',
          structure: "What's Next",
          style: 'Your Voice',
        };
        return `${labels[key] || key}: ${value}`;
      })
      .join('\n\n');

    const prompt = `You are a world-class biographer writing a compelling professional biography for ${submission.user_name || 'this person'}, a nominee for the TOP 100 Women in Aerospace & Aviation list.

Using the following interview answers, write a warm, powerful, and authentic 150-200 word biography in third person. 

Make it read like a feature in a prestigious publication — vivid, human, and inspiring. Avoid clichés and corporate jargon. Lead with what makes this person remarkable.

INTERVIEW RESPONSES:
${storyParts}

Write the biography now. No preamble, no quotes around it, just the bio text.`;

    // Generate bio via AI
    const generatedBio = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    // Update submission with generated bio
    await base44.asServiceRole.entities.BioSubmission.update(submissionId, {
      generated_bio: generatedBio,
      status: 'ready',
    });

    // Notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `📝 New Bio Submission — ${submission.user_name}`,
      body: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5a;padding:24px;border-radius:12px 12px 0 0">
          <h2 style="color:#c9a87c;margin:0;font-size:18px">New Bio Submission</h2>
          <p style="color:#ffffff99;margin:4px 0 0;font-size:13px">StoryBuilder submission received</p>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 8px"><strong>Name:</strong> ${submission.user_name}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${submission.user_email}</p>
          <p style="margin:0 0 16px"><strong>Status:</strong> AI bio generated — ready for review</p>
          <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:16px">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;font-weight:700">Generated Bio</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#334155">${generatedBio}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0">Review and approve in Admin → Bio Submissions</p>
        </div>
      </div>`,
    });

    return Response.json({ success: true, submissionId });
  } catch (error) {
    console.error('processBioSubmission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});