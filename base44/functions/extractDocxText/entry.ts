import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: "Extract all the text content from this docx file. Output it as a single continuous string in the exact format and wording.",
            file_urls: ["https://media.base44.com/files/public/68996845be6727838fdb822e/954676b44_TOP100_Perception_Engine_Narrative_Pack_v4.docx"],
            model: "automatic",
            response_json_schema: {
                type: "object",
                properties: {
                    content: { type: "string" }
                }
            }
        });

        return Response.json(res);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});