import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find all dock items that reference "Arena" and update them to "CourtOfHonor"
        const dockItems = await base44.asServiceRole.entities.DockItem.list();
        const arenaItems = dockItems.filter(item => item.pageName === 'Arena');
        
        for (const item of arenaItems) {
            await base44.asServiceRole.entities.DockItem.update(item.id, {
                label: 'Court of Honor',
                pageName: 'CourtOfHonor'
            });
        }

        return Response.json({ 
            success: true, 
            message: `Updated ${arenaItems.length} dock item(s) from Arena to Court of Honor.`,
            updated: arenaItems.length
        });

    } catch (error) {
        console.error('Failed to fix Arena references:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});