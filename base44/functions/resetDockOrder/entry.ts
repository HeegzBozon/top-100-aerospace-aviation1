import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const RECOMMENDED_DOCK_ITEMS = [
    { label: 'Passport', pageName: 'Passport', icon: 'User', order: 0, isEnabled: true },
    { label: 'Vote', pageName: 'VotingHub', icon: 'Vote', order: 1, isEnabled: false },
    { label: 'Court of Honor', pageName: 'CourtOfHonor', icon: 'Trophy', order: 2, isEnabled: true },
    { label: 'Festival', pageName: 'Festival', icon: 'PartyPopper', order: 3, isEnabled: true },
    { label: 'Quests', pageName: 'Quests', icon: 'Award', order: 4, isEnabled: false },
    { label: 'Submit', pageName: 'Submit', icon: 'Plus', order: 5, isEnabled: false },
];

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Get all IDs of existing dock items
        const existingItems = await base44.asServiceRole.entities.DockItem.list();
        const existingIds = existingItems.map(item => item.id);

        // 2. Delete all existing dock items if any exist
        if (existingIds.length > 0) {
           for (const id of existingIds) {
             await base44.asServiceRole.entities.DockItem.delete(id);
           }
        }
        
        // 3. Insert the new recommended set
        await base44.asServiceRole.entities.DockItem.bulkCreate(RECOMMENDED_DOCK_ITEMS);

        return new Response(JSON.stringify({ success: true, message: 'Dock has been reset to the recommended order.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Failed to reset dock order:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});