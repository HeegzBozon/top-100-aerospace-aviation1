import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Automated mapping: SignalCard → Contribution entities
 * Admin-only function
 * 
 * Intelligently converts high-confidence signals into granular contributions,
 * linking them to existing or newly created nominees.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { batch_size = 50, confidence_min = 'A', force_unmapped_only = true } = body;

    // Fetch high-confidence unmapped signals
    const query = force_unmapped_only 
      ? { confidence: { $in: ['A', 'B'] }, related_signal_ids: null }
      : { confidence: { $in: ['A', 'B'] } };

    const signals = await base44.asServiceRole.entities.SignalCard.filter(
      query,
      '-signal_date',
      batch_size
    );

    if (!signals || signals.length === 0) {
      return Response.json({
        status: 'success',
        message: 'No unmapped signals found',
        processed: 0,
        created: 0
      });
    }

    // Fetch active nominees for matching
    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-name',
      1000
    );

    const results = [];
    let createdCount = 0;
    let linkedCount = 0;

    for (const signal of signals) {
      try {
        // Attempt to match signal to nominee
        const matchedNominee = findBestNomineeMatch(signal, nominees);

        if (!matchedNominee) {
          results.push({
            signal_id: signal.id,
            status: 'skipped',
            reason: 'no_nominee_match'
          });
          continue;
        }

        // Convert signal to contribution
        const contribution = {
          nominee_id: matchedNominee.id,
          type: mapSignalTypeToContributionType(signal.signal_type),
          title: signal.headline,
          description: signal.ai_summary || signal.headline,
          date: signal.signal_date,
          external_links: signal.evidence_links,
          impact_metrics: signal.impact_metrics || {},
          tags: signal.tags || [],
          verified_by_nominee: false,
          source: `signal_card_${signal.id}`,
          related_signal_card_ids: [signal.id]
        };

        // Create contribution
        const newContribution = await base44.asServiceRole.entities.Contribution.create(
          contribution
        );

        // Update signal with reference to new contribution
        await base44.asServiceRole.entities.SignalCard.update(
          signal.id,
          { related_signal_ids: [newContribution.id] }
        );

        // Track event
        await base44.analytics.track({
          eventName: 'signal_mapped_to_contribution',
          properties: {
            signal_id: signal.id,
            signal_type: signal.signal_type,
            contribution_id: newContribution.id,
            nominee_id: matchedNominee.id,
            mapped_by_email: user.email,
            confidence: signal.confidence
          }
        });

        createdCount++;
        results.push({
          signal_id: signal.id,
          contribution_id: newContribution.id,
          nominee_id: matchedNominee.id,
          status: 'created'
        });
      } catch (err) {
        results.push({
          signal_id: signal.id,
          status: 'error',
          error: err.message
        });
      }
    }

    return Response.json({
      status: 'success',
      processed: signals.length,
      created: createdCount,
      results,
      summary: `Processed ${signals.length} signals, created ${createdCount} contributions`
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * Match signal to best nominee using multiple heuristics
 */
function findBestNomineeMatch(signal, nominees) {
  let bestMatch = null;
  let bestScore = 0;

  for (const nominee of nominees) {
    let score = 0;

    // Author name exact match
    if (signal.author_name && nominee.name) {
      if (signal.author_name.toLowerCase() === nominee.name.toLowerCase()) {
        score += 100;
      } else if (signal.author_name.toLowerCase().includes(nominee.name.split(' ')[0].toLowerCase())) {
        score += 50;
      }
    }

    // Organization match
    if (signal.organization && nominee.organization) {
      if (signal.organization.toLowerCase() === nominee.organization.toLowerCase()) {
        score += 75;
      } else if (signal.organization.toLowerCase().includes(nominee.organization.toLowerCase())) {
        score += 40;
      }
    }

    // Email domain match
    if (signal.author_name && nominee.email_domain) {
      const authorEmailDomain = extractEmailDomain(signal.author_name);
      if (authorEmailDomain === nominee.email_domain) {
        score += 60;
      }
    }

    // Discipline/industry alignment
    if (signal.tags && nominee.discipline) {
      const disciplineMatch = signal.tags.some(tag =>
        tag.toLowerCase().includes(nominee.discipline.toLowerCase())
      );
      if (disciplineMatch) {
        score += 25;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = nominee;
    }
  }

  return bestScore >= 50 ? bestMatch : null;
}

/**
 * Map signal type to contribution type
 */
function mapSignalTypeToContributionType(signalType) {
  const typeMap = {
    'publication': 'publication',
    'patent': 'patent',
    'citation': 'research',
    'media_mention': 'project'
  };
  return typeMap[signalType] || 'research';
}

/**
 * Extract email domain from author name (heuristic)
 */
function extractEmailDomain(authorName) {
  if (!authorName) return null;
  const parts = authorName.toLowerCase().split(' ');
  if (parts.length > 0) {
    return parts[parts.length - 1].replace(/[^a-z0-9]/g, '');
  }
  return null;
}