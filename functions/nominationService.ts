import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export async function createNomination(payload) {
    // This function is intended to be called via SDK: base44.functions.invoke('nominationService', { action: 'create', payload: ... })
    // But here we are writing the raw handler logic to be used in the Deno.serve wrapper below
    return { status: 'mock' }; 
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Expecting { action: 'create', data: { nominee_email, category_id, justification } }
        const { action, data } = body;

        if (action === 'create') {
            // 1. Validate Payload
            if (!data.nominee_email || !data.category_id || !data.justification) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            // 2. Check if Category exists and is active
            const category = await base44.entities.Category.get(data.category_id);
            if (!category || !category.is_active) {
                return Response.json({ error: 'Invalid or inactive category' }, { status: 400 });
            }

            // 3. Check for duplicates (User cannot nominate same person in same category twice)
            // Assuming we can filter nominations. 
            // Note: In a real scenario, we'd check for existing nomination in current cycle.
            const existing = await base44.entities.Nomination.filter({
                nominator_email: user.email,
                nominee_email: data.nominee_email,
                category_id: data.category_id
            });
            
            if (existing.length > 0) {
                return Response.json({ error: 'You have already nominated this person for this category' }, { status: 409 });
            }

            // 4. Create Nomination
            const newNomination = await base44.entities.Nomination.create({
                nominator_email: user.email,
                nominee_email: data.nominee_email,
                category_id: data.category_id,
                justification: data.justification,
                cycle_year: new Date().getFullYear(),
                status: 'pending'
            });

            // 5. Track nomination submission
            await base44.analytics.track({
                eventName: 'nomination_submitted',
                properties: {
                    nomination_id: newNomination.id,
                    nominee_email: data.nominee_email,
                    nominator_email: user.email,
                    category_id: data.category_id,
                    status: newNomination.status,
                    cycle_year: new Date().getFullYear()
                }
            });

            return Response.json({ success: true, nomination: newNomination });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});