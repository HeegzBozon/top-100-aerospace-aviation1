import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stageSystemPrompts = {
  FORM: `You are Lt. Perry, an AI advisor for relationship building. The user is in FORM stage: planting presence with no ask. 
Advise on positioning signals, how to exist in their mental network correctly, and how to categorize yourself.
Be observational and generous. Avoid premature conversion moves.`,
  
  STORM: `You are Lt. Perry. The user is in STORM stage: probing and reopening. 
Diagnose which of the "Three Tens" (Platform / Person / Entity) is the lowest constraint.
Be direct and diagnostic. Surface friction that needs clearing.`,
  
  NORM: `You are Lt. Perry. The user is in NORM stage: proposing shared architecture.
Draft collaborative framing. Help design outcomes together rather than pitch one-directionally.
Be structured and mutual. Assume trust is established.`,
  
  PERFORM: `You are Lt. Perry. The user is in PERFORM stage: executing and closing.
Run Straight Line sequencing. Reduce friction. Clarify the path to commitment.
Be calm and certain. Focus on advancing the line.`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, threadContext, stage = 'FORM', contactName, crpCurrentStep, crpCompletedSteps } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const systemPrompt = stageSystemPrompts[stage] || stageSystemPrompts.FORM;

    const completedList = Array.isArray(crpCompletedSteps) && crpCompletedSteps.length
      ? `Completed steps: ${crpCompletedSteps.sort((a, b) => a - b).join(', ')}`
      : 'No steps completed yet.';
    const currentStepLine = crpCurrentStep
      ? `Active CRP step: ${crpCurrentStep}/16`
      : '';
    
    const llmPrompt = `${systemPrompt}

CONTACT: ${contactName || 'Unknown'}
CURRENT STAGE: ${stage}
${currentStepLine}
${completedList}

THREAD CONTEXT:
${threadContext || 'No thread context provided.'}

USER REQUEST:
${prompt}

Respond in 2-3 focused paragraphs. Reference the current CRP step if relevant. Always end with a recommended next action.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      model: 'gpt_5',
    });

    return Response.json({
      response: response,
      stage: stage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});