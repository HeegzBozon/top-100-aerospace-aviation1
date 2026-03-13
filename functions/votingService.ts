import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Expecting { action: 'cast', data: { nomination_id } }
        const { action, data } = body;

        if (action === 'cast') {
            if (!data.nomination_id) {
                return Response.json({ error: 'Missing nomination_id' }, { status: 400 });
            }

            // 1. Fraud/Throttle Check
            // Simple check: Has user voted for this nomination already?
            const existingVotes = await base44.entities.Vote.filter({
                voter_email: user.email,
                nomination_id: data.nomination_id
            });

            if (existingVotes.length > 0) {
                return Response.json({ error: 'You have already voted for this nomination' }, { status: 429 });
            }

            // 2. Retrieve Nomination to verify context (and maybe check cycle)
            const nomination = await base44.entities.Nomination.get(data.nomination_id);
            if (!nomination) {
                return Response.json({ error: 'Nomination not found' }, { status: 404 });
            }

            // 3. Calculate Weight (Placeholder logic)
            // In a real impl, this would check user.platform_role or other reputation metrics
            let weight = 1.0;
            if (user.platform_role === 'honoree') weight = 2.0;
            if (user.platform_role === 'admin') weight = 5.0;

            // 4. Create Vote
            const vote = await base44.entities.Vote.create({
                nomination_id: data.nomination_id,
                voter_email: user.email,
                weight: weight,
                cycle_year: new Date().getFullYear()
            });

            // 5. Push to Stream (Mocked)
            // In Modular Monolith, we might trigger the ranking calc immediately or via queue
            // await base44.functions.invoke('rankingService', { action: 'recalc', nomination_id: data.nomination_id });

            return Response.json({ success: true, vote_id: vote.id });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});