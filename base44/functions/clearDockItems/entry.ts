import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        // Authenticate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response('Admin access required', { status: 403 });
        }

        // Get all dock items
        const allItems = await base44.entities.DockItem.filter({});
        
        // Delete all existing items
        for (const item of allItems) {
            await base44.entities.DockItem.delete(item.id);
        }

        // Create clean set of dock items
        const cleanDockItems = [
            {
                label: "Home",
                pageName: "Home", 
                icon: "Home",
                order: 0,
                isEnabled: true
            },
            {
                label: "Daily Ritual",
                pageName: "HabitWizard",
                icon: "Zap", 
                order: 1,
                isEnabled: true
            },
            {
                label: "Vote",
                pageName: "BallotBox",
                icon: "Vote",
                order: 2, 
                isEnabled: true
            },
            {
                label: "Standings", 
                pageName: "Standings",
                icon: "Trophy",
                order: 3,
                isEnabled: true
            },
            {
                label: "Tips",
                pageName: "Tips", 
                icon: "BookOpen",
                order: 4,
                isEnabled: true
            },
            {
                label: "Quests",
                pageName: "Quests",
                icon: "Target", 
                order: 5,
                isEnabled: true
            }
        ];

        for (const item of cleanDockItems) {
            await base44.entities.DockItem.create(item);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Dock cleaned successfully. Removed ${allItems.length} duplicates, created ${cleanDockItems.length} clean items.`,
            items: cleanDockItems
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});