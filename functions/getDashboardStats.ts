import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('📊 Starting dashboard stats calculation...');
        
        // Get current date info
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Initialize response data with defaults
        let statsData = {
            votesToday: 0,
            votesYesterday: 0,
            votesLast7Days: 0,
            dailyAverage: 0,
            dailyTrend: 0,
            dauToday: 0,
            dauYesterday: 0,
            dauTrend: 0,
            usersToday: 0,
            usersYesterday: 0,
            userTrend: 0,
            totalUsers: 0,
            dailyVotes: [],
            dailyNewUsers: [],
            hourlyVotingPattern: []
        };
        
        // Get basic counts with error handling
        try {
            console.log('📊 Fetching basic user stats...');
            // Paginate through all users to get accurate total count
            let allUsers = [];
            let userBatch = 0;
            let hasMoreUsers = true;
            const userBatchSize = 5000;
            
            while (hasMoreUsers) {
                const batch = await base44.asServiceRole.entities.User.list('-created_date', userBatchSize, userBatch * userBatchSize);
                allUsers = [...allUsers, ...batch];
                hasMoreUsers = batch.length === userBatchSize;
                userBatch++;
            }
            
            statsData.totalUsers = allUsers.length;
            
            // Count users created today and yesterday
            statsData.usersToday = allUsers.filter(user => {
                const createdDate = new Date(user.created_date);
                return createdDate >= today;
            }).length;
            
            statsData.usersYesterday = allUsers.filter(user => {
                const createdDate = new Date(user.created_date);
                return createdDate >= yesterday && createdDate < today;
            }).length;
            
            // Calculate user trend
            if (statsData.usersYesterday > 0) {
                statsData.userTrend = ((statsData.usersToday - statsData.usersYesterday) / statsData.usersYesterday) * 100;
            }
            
            console.log(`📊 User stats: ${statsData.totalUsers} total, ${statsData.usersToday} today, ${statsData.usersYesterday} yesterday`);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            // Continue with defaults
        }
        
        // Get basic vote counts
        try {
            console.log('📊 Fetching vote stats...');
            // Paginate through all votes to avoid caps
            let recentVotes = [];
            let voteBatch = 0;
            let hasMoreVotes = true;
            const voteBatchSize = 5000;
            
            while (hasMoreVotes) {
                const batch = await base44.asServiceRole.entities.PairwiseVote.list('-created_date', voteBatchSize, voteBatch * voteBatchSize);
                recentVotes = [...recentVotes, ...batch];
                hasMoreVotes = batch.length === voteBatchSize;
                voteBatch++;
            }
            
            statsData.votesToday = recentVotes.filter(vote => {
                const voteDate = new Date(vote.created_date);
                return voteDate >= today;
            }).length;
            
            statsData.votesYesterday = recentVotes.filter(vote => {
                const voteDate = new Date(vote.created_date);
                return voteDate >= yesterday && voteDate < today;
            }).length;
            
            // Calculate vote trend
            if (statsData.votesYesterday > 0) {
                statsData.dailyTrend = ((statsData.votesToday - statsData.votesYesterday) / statsData.votesYesterday) * 100;
            }
            
            // Get last 7 days of votes
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            statsData.votesLast7Days = recentVotes.filter(vote => {
                const voteDate = new Date(vote.created_date);
                return voteDate >= sevenDaysAgo;
            }).length;
            
            statsData.dailyAverage = Math.round(statsData.votesLast7Days / 7);
            
            // Get unique voters for DAU
            const todayVoters = new Set();
            const yesterdayVoters = new Set();
            
            recentVotes.forEach(vote => {
                const voteDate = new Date(vote.created_date);
                if (voteDate >= today) {
                    todayVoters.add(vote.voter_email);
                } else if (voteDate >= yesterday && voteDate < today) {
                    yesterdayVoters.add(vote.voter_email);
                }
            });
            
            statsData.dauToday = todayVoters.size;
            statsData.dauYesterday = yesterdayVoters.size;
            
            if (statsData.dauYesterday > 0) {
                statsData.dauTrend = ((statsData.dauToday - statsData.dauYesterday) / statsData.dauYesterday) * 100;
            }
            
            console.log(`📊 Vote stats: ${statsData.votesToday} today, ${statsData.votesYesterday} yesterday, ${statsData.dauToday} DAU`);
        } catch (error) {
            console.error('Error fetching vote stats:', error);
            // Continue with defaults
        }
        
        // Generate actual daily data for charts (last 7 days)
        try {
            console.log('📊 Generating chart data...');
            
            // Fetch all votes and users from last 7 days
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            // Paginate through all votes for charts
            let allVotes = [];
            let chartVoteBatch = 0;
            let hasMoreChartVotes = true;
            
            while (hasMoreChartVotes) {
                const batch = await base44.asServiceRole.entities.PairwiseVote.list('-created_date', 5000, chartVoteBatch * 5000);
                allVotes = [...allVotes, ...batch];
                hasMoreChartVotes = batch.length === 5000;
                chartVoteBatch++;
            }
            
            // Paginate through all users for charts
            let allUsers = [];
            let chartUserBatch = 0;
            let hasMoreChartUsers = true;
            
            while (hasMoreChartUsers) {
                const batch = await base44.asServiceRole.entities.User.list('-created_date', 5000, chartUserBatch * 5000);
                allUsers = [...allUsers, ...batch];
                hasMoreChartUsers = batch.length === 5000;
                chartUserBatch++;
            }
            
            // Build daily aggregations
            const dailyData = {};
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = date.toISOString().split('T')[0];
                dailyData[dateKey] = { votes: 0, users: 0 };
            }
            
            // Count votes per day
            allVotes.forEach(vote => {
                const voteDate = new Date(vote.created_date);
                if (voteDate >= sevenDaysAgo) {
                    const dateKey = voteDate.toISOString().split('T')[0];
                    if (dailyData[dateKey]) {
                        dailyData[dateKey].votes++;
                    }
                }
            });
            
            // Count new users per day
            allUsers.forEach(user => {
                const userDate = new Date(user.created_date);
                if (userDate >= sevenDaysAgo) {
                    const dateKey = userDate.toISOString().split('T')[0];
                    if (dailyData[dateKey]) {
                        dailyData[dateKey].users++;
                    }
                }
            });
            
            // Convert to arrays for charts
            statsData.dailyVotes = Object.entries(dailyData).map(([date, data]) => ({
                date,
                votes: data.votes
            }));
            
            statsData.dailyNewUsers = Object.entries(dailyData).map(([date, data]) => ({
                date,
                users: data.users
            }));
            
            // Generate hourly voting pattern (last 7 days)
            const hourlyData = {};
            for (let hour = 0; hour < 24; hour++) {
                hourlyData[hour] = 0;
            }
            
            allVotes.forEach(vote => {
                const voteDate = new Date(vote.created_date);
                if (voteDate >= sevenDaysAgo) {
                    const hour = voteDate.getHours();
                    hourlyData[hour]++;
                }
            });
            
            statsData.hourlyVotingPattern = Object.entries(hourlyData).map(([hour, votes]) => ({
                label: `${hour.toString().padStart(2, '0')}:00`,
                votes
            }));
            
        } catch (error) {
            console.error('Error generating chart data:', error);
            // Continue with empty arrays
        }
        
        console.log('📊 Dashboard stats calculated successfully');
        
        return new Response(JSON.stringify({
            success: true,
            data: statsData
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to calculate dashboard statistics',
            data: {
                votesToday: 0,
                votesYesterday: 0,
                votesLast7Days: 0,
                dailyAverage: 0,
                dailyTrend: 0,
                dauToday: 0,
                dauYesterday: 0,
                dauTrend: 0,
                usersToday: 0,
                usersYesterday: 0,
                userTrend: 0,
                totalUsers: 0,
                dailyVotes: [],
                dailyNewUsers: [],
                hourlyVotingPattern: []
            }
        }), {
            status: 200, // Return 200 even on error to prevent network errors
            headers: { 'Content-Type': 'application/json' }
        });
    }
});