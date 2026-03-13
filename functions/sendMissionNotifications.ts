import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin/system access
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get notification type from request
        const { type = 'daily' } = await req.json();
        
        // Fetch active missions
        const allMissions = await base44.asServiceRole.entities.GameMission.list('-created_date');
        const missions = allMissions.filter(m => 
            m.mission_type === type && m.status === 'active'
        );

        if (missions.length === 0) {
            return Response.json({ 
                success: true, 
                message: `No active ${type} missions found`,
                notificationsSent: 0 
            });
        }

        // Fetch all users
        const users = await base44.asServiceRole.entities.User.list();
        
        let notificationCount = 0;
        const notifications = [];

        // Create notifications for each user
        for (const targetUser of users) {
            // Check if user has player profile
            const players = await base44.asServiceRole.entities.GamePlayer.filter({ 
                user_email: targetUser.email 
            });
            
            const player = players[0];
            
            // Count incomplete missions for this user
            let incompleteMissions = 0;
            for (const mission of missions) {
                const progress = getMissionProgress(mission, player);
                if (progress < 100) {
                    incompleteMissions++;
                }
            }

            if (incompleteMissions > 0) {
                const notification = {
                    user_email: targetUser.email,
                    title: type === 'daily' 
                        ? '☀️ Daily Missions Available' 
                        : '🏆 Weekly Challenges Await',
                    message: type === 'daily'
                        ? `You have ${incompleteMissions} daily mission${incompleteMissions > 1 ? 's' : ''} ready to complete. Earn Insight Points and boost your progress!`
                        : `${incompleteMissions} weekly challenge${incompleteMissions > 1 ? 's are' : ' is'} waiting. Complete them before the week ends!`,
                    type: 'mission',
                    read: false,
                    action_url: '/Home?tab=overview',
                    metadata: {
                        mission_type: type,
                        incomplete_count: incompleteMissions
                    }
                };
                
                notifications.push(notification);
                notificationCount++;
            }
        }

        // Bulk create notifications
        if (notifications.length > 0) {
            await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
        }

        return Response.json({
            success: true,
            message: `Sent ${notificationCount} ${type} mission notifications`,
            notificationsSent: notificationCount
        });

    } catch (error) {
        console.error('Error sending mission notifications:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});

function getMissionProgress(mission, player) {
    if (!player || !mission.objectives) return 0;
    const completed = mission.objectives.filter(obj => obj.completed).length;
    return (completed / mission.objectives.length) * 100;
}