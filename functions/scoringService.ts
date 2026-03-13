import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

// Anti-Gaming Configuration - Sprint 3 Enhanced
const ANTI_GAMING_CONFIG = {
    // Voting Pattern Detection
    VOTING_PATTERNS: {
        MAX_RAPID_VOTES: 10, // Max votes in rapid succession
        RAPID_WINDOW_MINUTES: 5, // Time window for rapid detection
        MIN_CONSIDERATION_SECONDS: 3, // Min time between vote actions
        PATTERN_PENALTY: 0.8, // 20% score reduction for suspicious patterns
    },
    
    // Collusion Detection
    COLLUSION: {
        MAX_MUTUAL_EXCHANGES: 3, // Max mutual vote exchanges
        SUSPICIOUS_THRESHOLD: 0.75, // Correlation threshold
        NETWORK_ANALYSIS_DEPTH: 3, // Degrees of separation to analyze
        COLLUSION_PENALTY: 0.5, // 50% penalty for detected collusion
    },
    
    // Sybil Attack Prevention
    SYBIL_DETECTION: {
        MIN_ACCOUNT_AGE_HOURS: 24, // Min account age for full voting weight
        IP_CLUSTERING_THRESHOLD: 5, // Max accounts per IP cluster
        DEVICE_FINGERPRINT_LIMIT: 3, // Max accounts per device
        NEW_ACCOUNT_WEIGHT: 0.3, // Reduced weight for new accounts
    },
    
    // Rate Limiting
    RATE_LIMITS: {
        VOTES_PER_HOUR: 25,
        VOTES_PER_DAY: 100,
        RITUALS_PER_DAY: 1,
        QUEST_ATTEMPTS_PER_DAY: 10
    },
    
    // Behavioral Analysis
    BEHAVIOR: {
        MIN_DIVERSITY_SCORE: 0.4, // Min voting diversity required
        MAX_BIAS_THRESHOLD: 0.85, // Max bias toward single candidates
        AUTHENTICITY_WEIGHT: 0.9, // Weight for authentic behavior
        BOT_DETECTION_THRESHOLD: 0.7 // Threshold for bot-like behavior
    }
};

// Score Validation & Anti-Gaming Engine
class AntiGamingEngine {
    constructor() {
        this.suspiciousActivities = new Map();
        this.userBehaviorProfiles = new Map();
    }

    // Analyze voting patterns for gaming detection
    async analyzeVotingPattern(userId, recentVotes) {
        const now = new Date();
        const rapidWindow = new Date(now.getTime() - (ANTI_GAMING_CONFIG.VOTING_PATTERNS.RAPID_WINDOW_MINUTES * 60 * 1000));
        
        // Check for rapid voting
        const rapidVotes = recentVotes.filter(vote => 
            new Date(vote.occurred_at) > rapidWindow
        );
        
        if (rapidVotes.length > ANTI_GAMING_CONFIG.VOTING_PATTERNS.MAX_RAPID_VOTES) {
            this.flagSuspiciousActivity(userId, 'RAPID_VOTING', {
                count: rapidVotes.length,
                window: ANTI_GAMING_CONFIG.VOTING_PATTERNS.RAPID_WINDOW_MINUTES
            });
            return ANTI_GAMING_CONFIG.VOTING_PATTERNS.PATTERN_PENALTY;
        }

        // Check vote timing patterns
        const timings = recentVotes.map((vote, i, arr) => {
            if (i === 0) return null;
            return new Date(vote.occurred_at) - new Date(arr[i-1].occurred_at);
        }).filter(Boolean);

        const avgTimeBetweenVotes = timings.reduce((a, b) => a + b, 0) / timings.length;
        
        if (avgTimeBetweenVotes < (ANTI_GAMING_CONFIG.VOTING_PATTERNS.MIN_CONSIDERATION_SECONDS * 1000)) {
            this.flagSuspiciousActivity(userId, 'INSUFFICIENT_CONSIDERATION', {
                avgTime: avgTimeBetweenVotes / 1000
            });
            return ANTI_GAMING_CONFIG.VOTING_PATTERNS.PATTERN_PENALTY;
        }

        return 1.0; // No penalty
    }

    // Detect collusion networks
    async detectCollusion(userId, userVotes, allVotes) {
        const userVoteTargets = new Set(userVotes.map(v => v.selected_id));
        const mutualExchanges = new Map();
        
        // Analyze vote reciprocity
        allVotes.forEach(vote => {
            if (vote.user_id === userId) return;
            
            const otherUserTargets = allVotes
                .filter(v => v.user_id === vote.user_id)
                .map(v => v.selected_id);
            
            const intersection = otherUserTargets.filter(target => 
                userVoteTargets.has(target)
            );
            
            if (intersection.length > 0) {
                mutualExchanges.set(vote.user_id, intersection.length);
            }
        });

        // Check for suspicious mutual voting
        const suspiciousExchanges = Array.from(mutualExchanges.entries())
            .filter(([_, count]) => count > ANTI_GAMING_CONFIG.COLLUSION.MAX_MUTUAL_EXCHANGES);

        if (suspiciousExchanges.length > 0) {
            this.flagSuspiciousActivity(userId, 'POTENTIAL_COLLUSION', {
                exchanges: suspiciousExchanges
            });
            return ANTI_GAMING_CONFIG.COLLUSION.COLLUSION_PENALTY;
        }

        return 1.0; // No penalty
    }

    // Analyze behavioral authenticity
    analyzeBehavioralAuthenticity(userId, activities) {
        const profile = this.getUserBehaviorProfile(userId, activities);
        
        // Check voting diversity
        const diversityScore = this.calculateDiversityScore(activities);
        if (diversityScore < ANTI_GAMING_CONFIG.BEHAVIOR.MIN_DIVERSITY_SCORE) {
            this.flagSuspiciousActivity(userId, 'LOW_DIVERSITY', {
                score: diversityScore
            });
            return ANTI_GAMING_CONFIG.BEHAVIOR.AUTHENTICITY_WEIGHT;
        }

        // Check for bot-like patterns
        const botScore = this.calculateBotLikelihood(profile);
        if (botScore > ANTI_GAMING_CONFIG.BEHAVIOR.BOT_DETECTION_THRESHOLD) {
            this.flagSuspiciousActivity(userId, 'BOT_LIKE_BEHAVIOR', {
                score: botScore
            });
            return ANTI_GAMING_CONFIG.BEHAVIOR.AUTHENTICITY_WEIGHT;
        }

        return 1.0; // No penalty
    }

    // Calculate voting diversity score
    calculateDiversityScore(activities) {
        const voteTargets = activities
            .filter(a => a.reason_code === 'VOTE')
            .map(a => a.source_event_id);
        
        if (voteTargets.length === 0) return 1.0;
        
        const uniqueTargets = new Set(voteTargets);
        return uniqueTargets.size / voteTargets.length;
    }

    // Calculate bot likelihood score
    calculateBotLikelihood(profile) {
        let botScore = 0;
        
        // Check for perfectly regular timing
        if (profile.timingVariance < 0.1) botScore += 0.3;
        
        // Check for unusual activity patterns
        if (profile.offHoursActivity > 0.8) botScore += 0.2;
        
        // Check for lack of breaks
        if (profile.continuousActivityHours > 12) botScore += 0.3;
        
        // Check for perfect success rates
        if (profile.questSuccessRate > 0.95) botScore += 0.2;
        
        return Math.min(botScore, 1.0);
    }

    // Get or create user behavior profile
    getUserBehaviorProfile(userId, activities) {
        if (!this.userBehaviorProfiles.has(userId)) {
            this.userBehaviorProfiles.set(userId, this.buildBehaviorProfile(activities));
        }
        return this.userBehaviorProfiles.get(userId);
    }

    // Build comprehensive behavior profile
    buildBehaviorProfile(activities) {
        const timestamps = activities.map(a => new Date(a.granted_at));
        const timeDiffs = timestamps.slice(1).map((t, i) => t - timestamps[i]);
        
        return {
            totalActivities: activities.length,
            timingVariance: this.calculateVariance(timeDiffs),
            offHoursActivity: this.calculateOffHoursRatio(timestamps),
            continuousActivityHours: this.calculateMaxContinuousHours(timestamps),
            questSuccessRate: this.calculateQuestSuccessRate(activities),
            activityTypes: this.getActivityTypeDistribution(activities)
        };
    }

    // Utility functions
    calculateVariance(numbers) {
        if (numbers.length === 0) return 1.0;
        const mean = numbers.reduce((a, b) => a + b) / numbers.length;
        const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
        return Math.sqrt(variance) / mean; // Coefficient of variation
    }

    calculateOffHoursRatio(timestamps) {
        const offHoursCount = timestamps.filter(t => {
            const hour = t.getHours();
            return hour < 6 || hour > 22; // Define off-hours as before 6 AM or after 10 PM
        }).length;
        return offHoursCount / timestamps.length;
    }

    calculateMaxContinuousHours(timestamps) {
        if (timestamps.length < 2) return 0;
        
        timestamps.sort((a, b) => a - b);
        let maxContinuous = 0;
        let currentContinuous = 0;
        
        for (let i = 1; i < timestamps.length; i++) {
            const hoursDiff = (timestamps[i] - timestamps[i-1]) / (1000 * 60 * 60);
            if (hoursDiff <= 1) { // Within 1 hour = continuous
                currentContinuous += hoursDiff;
            } else {
                maxContinuous = Math.max(maxContinuous, currentContinuous);
                currentContinuous = 0;
            }
        }
        
        return Math.max(maxContinuous, currentContinuous);
    }

    calculateQuestSuccessRate(activities) {
        const questActivities = activities.filter(a => 
            a.reason_code === 'SIDEQUEST' || a.reason_code === 'QUEST_COMPLETE'
        );
        
        if (questActivities.length === 0) return 0.5; // Neutral for no quest data
        
        // Assuming positive rewards indicate success
        const successCount = questActivities.filter(a => 
            (a.stardust || 0) > 0 || (a.clout || 0) > 0
        ).length;
        
        return successCount / questActivities.length;
    }

    getActivityTypeDistribution(activities) {
        const distribution = {};
        activities.forEach(activity => {
            const type = activity.reason_code;
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    // Flag suspicious activity for review
    flagSuspiciousActivity(userId, type, details) {
        if (!this.suspiciousActivities.has(userId)) {
            this.suspiciousActivities.set(userId, []);
        }
        
        this.suspiciousActivities.get(userId).push({
            type,
            details,
            timestamp: new Date().toISOString(),
            severity: this.calculateSeverity(type)
        });

        console.warn(`Suspicious activity detected for user ${userId}:`, { type, details });
    }

    calculateSeverity(type) {
        const severityMap = {
            'RAPID_VOTING': 'medium',
            'INSUFFICIENT_CONSIDERATION': 'low',
            'POTENTIAL_COLLUSION': 'high',
            'LOW_DIVERSITY': 'medium',
            'BOT_LIKE_BEHAVIOR': 'high'
        };
        return severityMap[type] || 'low';
    }

    // Get final authenticity multiplier
    getAuthenticityMultiplier(userId) {
        const flags = this.suspiciousActivities.get(userId) || [];
        
        if (flags.length === 0) return 1.0;
        
        // Apply cumulative penalties
        let multiplier = 1.0;
        flags.forEach(flag => {
            switch (flag.severity) {
                case 'low':
                    multiplier *= 0.95;
                    break;
                case 'medium':
                    multiplier *= 0.85;
                    break;
                case 'high':
                    multiplier *= 0.7;
                    break;
            }
        });
        
        return Math.max(multiplier, 0.3); // Minimum 30% score retention
    }
}

const antiGamingEngine = new AntiGamingEngine();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);

        const { action, user_id, ...params } = await req.json();
        
        if (!action || !user_id) {
            return new Response(JSON.stringify({ 
                error: 'action and user_id are required' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let result = {};

        switch (action) {
            case 'validate_score':
                result = await validateUserScore(user_id, params);
                break;
            case 'analyze_gaming':
                result = await analyzeGamingPatterns(user_id, params);
                break;
            case 'seasonal_reset':
                result = await performSeasonalReset(params);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({
            success: true,
            action,
            ...result
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Scoring service error:', error);
        return new Response(JSON.stringify({ 
            error: `Scoring service failed: ${error.message}` 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Validate user score with anti-gaming checks
async function validateUserScore(userId, params) {
    // Get user's recent activities
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const [recentVotes, recentRewards, allVotes] = await Promise.all([
        base44.entities.Vote.filter({
            user_id: userId,
            occurred_at: { $gte: weekAgo.toISOString() }
        }),
        base44.entities.RewardGrant.filter({
            user_id: userId,
            granted_at: { $gte: weekAgo.toISOString() }
        }),
        base44.entities.Vote.filter({
            occurred_at: { $gte: weekAgo.toISOString() }
        })
    ]);

    // Run anti-gaming analysis
    const votingPenalty = await antiGamingEngine.analyzeVotingPattern(userId, recentVotes);
    const collusionPenalty = await antiGamingEngine.detectCollusion(userId, recentVotes, allVotes);
    const behaviorPenalty = antiGamingEngine.analyzeBehavioralAuthenticity(userId, recentRewards);
    
    // Calculate final authenticity multiplier
    const baseAuthenticityMultiplier = votingPenalty * collusionPenalty * behaviorPenalty;
    const finalAuthenticityMultiplier = antiGamingEngine.getAuthenticityMultiplier(userId);
    
    const overallMultiplier = Math.min(baseAuthenticityMultiplier, finalAuthenticityMultiplier);

    return {
        authenticity_multiplier: overallMultiplier,
        penalties: {
            voting_pattern: votingPenalty,
            collusion: collusionPenalty,
            behavior: behaviorPenalty
        },
        suspicious_activities: antiGamingEngine.suspiciousActivities.get(userId) || [],
        validation_timestamp: new Date().toISOString()
    };
}

// Analyze gaming patterns across the platform
async function analyzeGamingPatterns(userId, params) {
    const { lookback_days = 30 } = params;
    
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - lookback_days);
    
    // Get platform-wide data for analysis
    const [allVotes, allRewards, allUsers] = await Promise.all([
        base44.entities.Vote.filter({
            occurred_at: { $gte: lookbackDate.toISOString() }
        }),
        base44.entities.RewardGrant.filter({
            granted_at: { $gte: lookbackDate.toISOString() }
        }),
        base44.entities.User.list()
    ]);

    // Analyze voting distribution
    const voteDistribution = {};
    allVotes.forEach(vote => {
        voteDistribution[vote.selected_id] = (voteDistribution[vote.selected_id] || 0) + 1;
    });

    // Detect unusual patterns
    const voteCounts = Object.values(voteDistribution);
    const avgVotes = voteCounts.reduce((a, b) => a + b, 0) / voteCounts.length;
    const outliers = Object.entries(voteDistribution)
        .filter(([_, count]) => count > avgVotes * 3)
        .map(([nomineeId, count]) => ({ nominee_id: nomineeId, vote_count: count }));

    // Account age analysis
    const newAccounts = allUsers.filter(user => {
        const accountAge = (new Date() - new Date(user.created_date)) / (1000 * 60 * 60);
        return accountAge < ANTI_GAMING_CONFIG.SYBIL_DETECTION.MIN_ACCOUNT_AGE_HOURS;
    });

    return {
        platform_health: {
            total_votes: allVotes.length,
            total_rewards: allRewards.length,
            active_users: new Set(allVotes.map(v => v.user_id)).size,
            new_accounts: newAccounts.length
        },
        anomalies: {
            vote_outliers: outliers,
            suspicious_users: Array.from(antiGamingEngine.suspiciousActivities.keys()).length,
            new_account_activity: newAccounts.filter(user => 
                allVotes.some(vote => vote.user_id === user.id)
            ).length
        },
        analysis_timestamp: new Date().toISOString()
    };
}

// Perform seasonal reset with data preservation
async function performSeasonalReset(params) {
    const { preserve_top_n = 100, reset_type = 'soft' } = params;
    
    console.log(`Initiating ${reset_type} seasonal reset...`);
    
    if (reset_type === 'hard') {
        // Hard reset: Clear all voting data, preserve user accounts
        const [votes, rankedVotes, spotlights, endorsements] = await Promise.all([
            base44.entities.Vote.list(),
            base44.entities.RankedVote.list(),
            base44.entities.SpotlightVote.list(),
            base44.entities.Endorsement.list()
        ]);

        // Archive current data (create Archive entities if needed)
        const archiveData = {
            season_end: new Date().toISOString(),
            total_votes: votes.length,
            total_ranked_votes: rankedVotes.length,
            total_spotlights: spotlights.length,
            total_endorsements: endorsements.length
        };

        // Reset nominee scores to defaults
        const nominees = await base44.entities.Nominee.list();
        for (const nominee of nominees) {
            await base44.entities.Nominee.update(nominee.id, {
                elo_rating: 1200,
                borda_score: 0,
                direct_vote_count: 0,
                starpower_score: 0,
                endorsement_score: 0,
                total_votes: 0,
                total_wins: 0,
                total_losses: 0,
                win_percentage: 0
            });
        }

        return {
            reset_type: 'hard',
            archived_data: archiveData,
            nominees_reset: nominees.length,
            message: 'Hard seasonal reset completed successfully'
        };
    } else {
        // Soft reset: Apply decay factor, preserve top performers
        const nominees = await base44.entities.Nominee.list();
        const topNominees = nominees
            .sort((a, b) => (b.starpower_score || 0) - (a.starpower_score || 0))
            .slice(0, preserve_top_n);

        const DECAY_FACTOR = 0.7; // 30% decay

        for (const nominee of nominees) {
            const isTopPerformer = topNominees.includes(nominee);
            const decayMultiplier = isTopPerformer ? 0.9 : DECAY_FACTOR; // Less decay for top performers

            await base44.entities.Nominee.update(nominee.id, {
                elo_rating: Math.max(1000, (nominee.elo_rating || 1200) * decayMultiplier),
                borda_score: (nominee.borda_score || 0) * decayMultiplier,
                starpower_score: (nominee.starpower_score || 0) * decayMultiplier,
                endorsement_score: (nominee.endorsement_score || 0) * decayMultiplier
            });
        }

        return {
            reset_type: 'soft',
            decay_factor: DECAY_FACTOR,
            top_performers_preserved: preserve_top_n,
            nominees_affected: nominees.length,
            message: 'Soft seasonal reset completed successfully'
        };
    }
}