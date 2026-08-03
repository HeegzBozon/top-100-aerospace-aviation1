// Shared batch-processing logic used by processScoreBatch and scheduledScoreUpdate.
// Per platform rules: logic needed by more than one function lives in base44/shared/.

export async function runProcessBatch(serviceRole, seasonId, batchIndex) {
  const BATCH_SIZE = 50;
  const offset = batchIndex * BATCH_SIZE;

  console.log(`[BATCH ${batchIndex}] Processing... Offset: ${offset}, Limit: ${BATCH_SIZE}`);

  const nominees = await serviceRole.entities.Nominee.filter(
    { season_id: seasonId },
    '-created_date',
    BATCH_SIZE,
    offset
  );

  if (!nominees || nominees.length === 0) {
    console.log(`[BATCH ${batchIndex}] No nominees found. End of processing for this chain.`);
    return { processed: 0 };
  }

  let processedCount = 0;
  for (const nominee of nominees) {
    try {
      const elo = nominee.elo_rating || 1200;
      await serviceRole.entities.Nominee.update(nominee.id, { aura_score: elo });
      processedCount++;
    } catch (error) {
      console.error(`[BATCH ${batchIndex}] Error updating ${nominee.name}:`, error.message);
    }
  }

  console.log(`[BATCH ${batchIndex}] Successfully processed ${processedCount} of ${nominees.length} nominees.`);
  return { processed: nominees.length };
}