import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Levenshtein distance for fuzzy name matching
function levenshteinDistance(a, b) {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  const aLen = aLower.length;
  const bLen = bLower.length;
  const matrix = Array(aLen + 1).fill(null).map(() => Array(bLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matrix[i][0] = i;
  for (let j = 0; j <= bLen; j++) matrix[0][j] = j;

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[aLen][bLen];
}

// Find best match with threshold
function findBestMatch(dirName, nominees, threshold = 3) {
  let bestMatch = null;
  let bestDistance = threshold;

  for (const nominee of nominees) {
    const distance = levenshteinDistance(dirName, nominee.name || '');
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = { nominee, distance: bestDistance };
    }
  }
  return bestMatch;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { directoryData } = await req.json();
    if (!directoryData || !Array.isArray(directoryData)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Get all standing rows for top 100 (published list)
    let allSeasons = await base44.entities.Season.list('-created_date', 50);
    const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
    const activeSeason = allSeasons.find(s => s.status === 'completed');
    const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;

    if (!selectedSeasonId) {
      return Response.json({ error: 'No active season found' }, { status: 400 });
    }

    // Fetch standings to get the actual Top 100
    const standingsResponse = await base44.asServiceRole.functions.invoke('getStandingsData', {
      season: selectedSeasonId,
      sort: 'aura',
      dir: 'desc',
      page: 1,
      limit: 1000
    });

    const standingsRows = standingsResponse?.data?.standings?.rows || [];
    const top100Ids = new Set(standingsRows.slice(0, 100).map(r => r.nomineeId));

    // Get full nominee details for top 100 only
    const allNominees = await base44.entities.Nominee.list('-created_date', 10000);
    const top100Nominees = allNominees.filter(n => top100Ids.has(n.id));

    // Cache subsystems upfront
    const subsystems = await base44.entities.Subsystem.list('-created_date', 100);
    const subsystemsMap = {};
    subsystems.forEach(s => {
      subsystemsMap[s.name] = s.id;
    });

    let matched = 0;
    let fuzzyMatched = 0;
    const matchedRecords = [];
    const stillNotFound = [];
    const updateBatch = [];

    // Match directory against top 100 and collect updates
    for (const dirEntry of directoryData) {
      // Exact match first
      let nominee = top100Nominees.find(
        n => n.name?.toLowerCase().trim() === dirEntry.Name.toLowerCase().trim()
      );

      let method = 'exact';

      // Fuzzy match if no exact
      if (!nominee) {
        const bestMatch = findBestMatch(dirEntry.Name, top100Nominees, 3);
        if (bestMatch) {
          nominee = bestMatch.nominee;
          method = 'fuzzy';
          fuzzyMatched++;
        }
      }

      if (nominee) {
        const subsystemId = subsystemsMap[dirEntry.Domain];
        if (subsystemId) {
          const currentDomainIds = nominee.domain_ids || [];
          if (!currentDomainIds.includes(subsystemId)) {
            currentDomainIds.push(subsystemId);
          }

          updateBatch.push({
            id: nominee.id,
            data: {
              domain_ids: currentDomainIds,
              professional_role: dirEntry.Title || nominee.professional_role
            },
            name: dirEntry.Name,
            domain: dirEntry.Domain,
            method
          });

          matched++;
        }
      } else {
        stillNotFound.push({ name: dirEntry.Name, domain: dirEntry.Domain });
      }
    }

    // Execute batch updates
    for (const update of updateBatch) {
      await base44.entities.Nominee.update(update.id, update.data);
      matchedRecords.push({
        name: update.name,
        domain: update.domain,
        nominee_id: update.id,
        method: update.method
      });
    }

    return Response.json({
      matched,
      fuzzyMatched,
      stillNotFound: stillNotFound.length,
      matchedRecords,
      notFoundList: stillNotFound.slice(0, 20) // Return first 20 for review
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});