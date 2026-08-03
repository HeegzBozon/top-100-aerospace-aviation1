// Shared stardust-awarding logic used by awardStardust and finishHuddleSession.
// Per platform rules: logic needed by more than one function lives in base44/shared/.

const REWARD_MAP = {
  vote: 10,
  tip_share: 50,
  nomination_submitted: 100,
  huddle_completed: 25,
  huddle_objective: 15,
};

export async function grantStardust(serviceRole, opts) {
  const { user_id, user_email, action_type, multiplier = 1 } = opts || {};
  if (!user_id && !user_email) {
    return { points_awarded: 0, message: 'user_id or user_email required.' };
  }

  const base = REWARD_MAP[action_type];
  if (!base) {
    return { points_awarded: 0, message: 'No reward configured for this action.' };
  }
  const points = Math.round(base * multiplier);

  let userId = user_id;
  let currentStardust = 0;
  if (!userId) {
    const users = await serviceRole.entities.User.filter({ email: user_email });
    if (!users || users.length === 0) {
      return { points_awarded: 0, message: 'User not found.' };
    }
    userId = users[0].id;
    currentStardust = users[0].stardust_points || 0;
  } else {
    try {
      const u = await serviceRole.entities.User.get(userId);
      currentStardust = u?.stardust_points || 0;
    } catch {
      currentStardust = 0;
    }
  }

  await Promise.all([
    serviceRole.entities.RewardGrant.create({
      user_id: userId,
      reason_code: (action_type || 'ACTION').toUpperCase(),
      stardust: points,
      granted_at: new Date().toISOString(),
    }),
    serviceRole.entities.User.update(userId, {
      stardust_points: (currentStardust || 0) + points,
      last_stardust_activity: new Date().toISOString(),
    }),
  ]);

  return { points_awarded: points, new_total: (currentStardust || 0) + points };
}