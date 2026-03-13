import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    if (!(await base44.auth.isAuthenticated())) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'User not found' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { action, context = null, increment = 1 } = await req.json();

        // Find all user quests that are accepted/in_progress and have requirements matching this action
        const userQuests = await base44.asServiceRole.entities.UserQuest.filter({
            user_email: user.email,
            status: { $in: ['accepted', 'in_progress'] }
        });

        const updatedQuests = [];

        for (const userQuest of userQuests) {
            // Get the full quest details to check requirements
            const quest = await base44.asServiceRole.entities.Quest.get(userQuest.quest_id);
            if (!quest || !quest.is_active) continue;

            let questUpdated = false;
            const newProgress = [...(userQuest.progress || [])];

            // Check each requirement to see if it matches the action
            quest.requirements.forEach((requirement, index) => {
                if (requirement.action === action) {
                    // Apply context filtering if specified
                    if (requirement.context && context) {
                        if (requirement.context !== context) return;
                    }

                    // Find or create progress entry for this requirement
                    let progressEntry = newProgress.find(p => p.requirement_index === index);
                    if (!progressEntry) {
                        progressEntry = {
                            requirement_index: index,
                            current_count: 0,
                            completed: false
                        };
                        newProgress.push(progressEntry);
                    }

                    // Update progress if not already completed
                    if (!progressEntry.completed) {
                        progressEntry.current_count = Math.min(
                            progressEntry.current_count + increment,
                            requirement.target
                        );
                        
                        // Mark as completed if target reached
                        if (progressEntry.current_count >= requirement.target) {
                            progressEntry.completed = true;
                        }
                        
                        questUpdated = true;
                    }
                }
            });

            if (questUpdated) {
                // Check if all requirements are completed
                const allCompleted = quest.requirements.every((req, index) => {
                    const progressEntry = newProgress.find(p => p.requirement_index === index);
                    return progressEntry?.completed || false;
                });

                // Update quest status
                const newStatus = allCompleted ? 'completed' : 'in_progress';
                const updateData = {
                    progress: newProgress,
                    status: newStatus,
                    last_progress_update: new Date().toISOString()
                };

                if (allCompleted && !userQuest.completed_date) {
                    updateData.completed_date = new Date().toISOString();
                }

                await base44.asServiceRole.entities.UserQuest.update(userQuest.id, updateData);
                updatedQuests.push({
                    quest_id: userQuest.quest_id,
                    quest_title: quest.title,
                    status: newStatus,
                    progress: newProgress
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            action,
            context,
            increment,
            updated_quests: updatedQuests
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error progressing quest:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});