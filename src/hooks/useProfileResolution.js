import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useProfileResolution(targetId, targetEmail) {
    return useQuery({
        queryKey: ['unified-profile', targetId, targetEmail],
        queryFn: async () => {
            let resolvedUserId = null;
            let resolvedUserEmail = targetEmail;

            const result = {
                user: null,
                nominee: null,
                provider: null,
                employer: null,
                startup: null,
                investor: null,
            };

            // 1. Resolve base User identity (either by ID if the target ID is a User ID, or email)
            // However, targetId could represent a Nominee ID, Startup ID, etc.
            // Let's first carefully determine the actual email associated with whoever we are looking up.

            // Try finding by targetId across possible entities if email isn't provided directly
            if (!resolvedUserEmail && targetId) {
                // 1. Check User
                try {
                    const userCheck = await base44.entities.User.filter({ id: targetId });
                    if (userCheck.length > 0) {
                        resolvedUserEmail = userCheck[0].email;
                        result.user = userCheck[0];
                    }
                } catch (e) {
                    console.warn("Failed resolving User ID:", e);
                }

                // 2. Check Nominee
                if (!resolvedUserEmail) {
                    try {
                        const nomineeCheck = await base44.entities.Nominee.filter({ id: targetId });
                        if (nomineeCheck.length > 0) {
                            resolvedUserEmail = nomineeCheck[0].nominee_email;
                            result.nominee = nomineeCheck[0];
                        }
                    } catch (e) {
                        console.warn("Failed resolving Nominee ID:", e);
                    }
                }

                // 3. Check Startup
                if (!resolvedUserEmail) {
                    try {
                        const startupCheck = await base44.entities.StartupProfile.filter({ id: targetId });
                        if (startupCheck.length > 0) {
                            resolvedUserEmail = startupCheck[0].founder_email;
                            result.startup = startupCheck[0];
                        }
                    } catch (e) {
                        console.warn("Failed resolving Startup ID:", e);
                    }
                }
            }

            if (resolvedUserEmail) {
                const [
                    users,
                    nominees,
                    providers,
                    employers,
                    startups,
                    investors
                ] = await Promise.all([
                    !result.user ? base44.entities.User.filter({ email: resolvedUserEmail }).catch(() => []) : Promise.resolve([result.user]),
                    !result.nominee ? base44.entities.Nominee.filter({ nominee_email: resolvedUserEmail }).catch(() => []) : Promise.resolve([result.nominee]),
                    base44.entities.Profile.filter({ user_email: resolvedUserEmail }).catch(() => []),
                    base44.entities.Employer.filter({ owner_email: resolvedUserEmail }).catch(() => []),
                    !result.startup ? base44.entities.StartupProfile.filter({ founder_email: resolvedUserEmail }).catch(() => []) : Promise.resolve([result.startup]),
                    base44.entities.InvestorProfile.filter({ user_email: resolvedUserEmail }).catch(() => []),
                ]);

                result.user = users[0] || result.user;
                result.nominee = nominees[0] || result.nominee;
                result.provider = providers[0] || null;
                result.employer = employers[0] || null;
                result.startup = startups[0] || result.startup;
                result.investor = investors[0] || null;
            }

            return result;
        },
        enabled: !!(targetId || targetEmail)
    });
}