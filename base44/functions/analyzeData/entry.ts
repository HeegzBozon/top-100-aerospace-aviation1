import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        
        base44.auth.setToken(authHeader.split(' ')[1]);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { data: fileData, isCsv } = await req.json();

        const nomineeSchema = {
            type: "object",
            properties: {
                name: { type: "string" },
                nominee_email: { type: "string" },
                description: { type: "string" },
                title: { type: "string" },
                company: { type: "string" },
                country: { type: "string" },
                industry: { type: "string" },
                linkedin_profile_url: { type: "string" }
            }
        };
        const userSchema = { 
            type: "object", 
            properties: { 
                full_name: { type: "string" }, 
                email: { type: "string" }, 
                handle: { type: "string" } 
            } 
        };
        const pairwiseVoteSchema = {
            type: "object",
            properties: {
                voter_email: { type: "string" },
                winner_nominee_id: { type: "string" },
                loser_nominee_id: { type: "string" },
                season_id: { type: "string" }
            }
        };
        
        const dataSample = isCsv 
            ? fileData.slice(0, 5).join('\n')
            : JSON.stringify(fileData.slice(0, 3), null, 2);

        const prompt = `
You are Lt. Perry, an expert data migration AI for the Continuum platform.
Your task is to analyze a data sample from a user's file and map its fields to the Continuum database schemas.

Here are the target schemas:
1. Nominee: ${JSON.stringify(nomineeSchema.properties)}
2. User: ${JSON.stringify(userSchema.properties)}
3. PairwiseVote: ${JSON.stringify(pairwiseVoteSchema.properties)}

Here is the data sample from the user's file (${isCsv ? 'CSV' : 'JSON'} format):
---
${dataSample}
---

Based on the data sample, identify the primary entity type this file represents. Then, map the source fields (from the file) to the target fields in the corresponding Continuum schema. Be intelligent about mapping variations (e.g., 'Full Name' or 'participant_name' should map to 'name' in the User entity, or 'name' in the Nominee entity depending on context). For votes, map columns like 'voter' or 'user_email' to 'voter_email'.

Your response MUST be a valid JSON object with the following structure:
{
  "detectedEntityType": "Nominee" | "User" | "PairwiseVote" | "Mixed" | "Unknown",
  "fieldMapping": {
    "source_field_1": { "targetEntity": "Nominee", "targetField": "name" },
    "source_field_2": { "targetEntity": "Nominee", "targetField": "nominee_email" },
    "...etc"
  },
  "confidenceScore": <a number between 0 and 1>,
  "insights": ["A brief summary of your findings."]
}
`;
        
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    detectedEntityType: { type: "string" },
                    fieldMapping: { type: "object", additionalProperties: true },
                    confidenceScore: { type: "number" },
                    insights: { type: "array", items: { type: "string" } }
                },
                required: ["detectedEntityType", "fieldMapping", "confidenceScore"]
            }
        });

        return new Response(JSON.stringify({ success: true, analysis: llmResponse }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error in analyzeData function:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            status: 500
        });
    }
});