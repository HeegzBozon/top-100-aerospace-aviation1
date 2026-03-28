/**
 * Straight Line Three Tens Certainty Scoring
 * 
 * Converts LinkedInContact data into realistic Three Tens certainty levels (0-10 scale).
 * Key principle: New/engaged contacts should NOT auto-max certainties.
 */

export function calculateThreeTensCertainty(contact) {
  if (!contact) return { product: 0, personal: 0, entity: 0 };

  // PERSONAL CERTAINTY (Trust in YOU, the individual)
  // Based on: response status, engagement level, mutual connections
  let personal = 0;
  
  if (contact.response_status === 'done') {
    // They've committed - high personal trust
    personal = 9;
  } else if (contact.response_status === 'sent') {
    // They're actively engaged with you
    personal = 7;
  } else if (contact.response_status === 'draft' || contact.response_status === 'pending') {
    // New contact or light engagement
    personal = 4;
    // Boost slightly if they have mutual connections (social proof helps trust)
    if (contact.mutual_connections_count && contact.mutual_connections_count > 0) {
      personal = Math.min(5, personal + 1);
    }
  }

  // ENTITY CERTAINTY (Trust in YOUR ORGANIZATION)
  // Based on: tier classification, followers/social proof
  // New contacts don't know your company yet - always start low
  let entity = 0;

  if (contact.response_status === 'done') {
    // They've already committed to the company
    entity = 8;
  } else if (contact.followers && contact.followers > 50000) {
    // High-profile contact suggests your org has credibility
    entity = 5;
  } else if (contact.tier_classification === 'S-Tier' || contact.tier_classification === 'A-Tier') {
    // Strategic contact might research your company more thoroughly
    entity = 4;
  } else {
    // Default: new contact, company unproven
    entity = 2;
  }

  // PRODUCT CERTAINTY (Do they understand your solution solves their problem?)
  // Based on: tier classification (proxy for their needs/relevance), engagement level
  let product = 0;

  if (contact.response_status === 'done') {
    // They're committed - fully convinced
    product = 9;
  } else if (contact.response_status === 'sent') {
    // You've explained the value, they're interested
    product = 6;
  } else if (contact.tier_classification === 'S-Tier' || contact.tier_classification === 'A-Tier') {
    // High-value tier suggests good product-solution fit
    // But they haven't engaged deeply yet
    product = 4;
  } else if (contact.tier_classification === 'B-Tier') {
    // Medium tier
    product = 3;
  } else {
    // C-Tier or unknown
    product = 2;
  }

  return {
    personal: Math.min(10, Math.max(0, personal)),
    entity: Math.min(10, Math.max(0, entity)),
    product: Math.min(10, Math.max(0, product)),
  };
}

/**
 * Determine Action Threshold (how much certainty they need before acting)
 * Based on their tier and response status
 */
export function calculateActionThreshold(contact) {
  if (!contact) return 8;

  // S and A tier contacts typically need less total certainty before committing
  // They're used to making quick decisions
  if (contact.tier_classification === 'S-Tier') {
    return 7; // High-value contacts move at 7+
  }
  if (contact.tier_classification === 'A-Tier') {
    return 7.5;
  }
  // B and C tier need higher certainty
  return 8.5;
}

/**
 * Estimate Pain Threshold (how much discomfort they're feeling)
 * Indicates urgency and receptiveness to moving forward
 */
export function calculatePainThreshold(contact) {
  if (!contact) return 'unknown';

  // Done = they solved it
  if (contact.response_status === 'done') {
    return 'resolved';
  }
  // Sent = waiting for them
  if (contact.response_status === 'sent') {
    return 'moderate';
  }
  // Draft/Pending = they're actively looking
  if (contact.response_status === 'draft' || contact.response_status === 'pending') {
    return 'high';
  }
  return 'unknown';
}

/**
 * Identify the LOWEST Ten (bottleneck to commitment)
 */
export function identifyLowestTen(certainties) {
  const { personal, entity, product } = certainties;
  const lowestValue = Math.min(personal, entity, product);

  if (lowestValue === product) {
    return { lowest: 'product', score: product, action: 'Clarify how your solution solves their specific problem' };
  } else if (lowestValue === personal) {
    return { lowest: 'personal', score: personal, action: 'Build rapport and credibility with this contact' };
  } else {
    return { lowest: 'entity', score: entity, action: 'Share social proof and organizational credibility' };
  }
}

/**
 * Hypothesize the contact's primary problem based on their profile
 */
export function hypothesizeProblem(contact) {
  if (!contact) return { problem: 'Unknown', confidence: 0, signals: [] };

  const signals = [];
  let problem = 'Unknown';

  // Check pain level
  if (contact.response_status === 'draft' || contact.response_status === 'pending') {
    signals.push('actively engaged');
  }
  if (contact.response_status === 'sent') {
    signals.push('considering a solution');
  }

  // Check tier and role signals
  if (contact.headline) {
    const role = contact.headline.toLowerCase();
    if (role.includes('founder') || role.includes('ceo') || role.includes('executive')) {
      problem = 'Scaling operations or strategic growth';
      signals.push('leadership role');
    } else if (role.includes('engineer') || role.includes('developer') || role.includes('architect')) {
      problem = 'Technical implementation or infrastructure challenges';
      signals.push('technical role');
    } else if (role.includes('sales') || role.includes('business dev')) {
      problem = 'Revenue growth or pipeline development';
      signals.push('sales/biz dev role');
    } else if (role.includes('operations') || role.includes('product')) {
      problem = 'Process optimization or product direction';
      signals.push('ops/product role');
    }
  }

  // Check tier for problem scale
  if (contact.tier_classification === 'S-Tier' || contact.tier_classification === 'A-Tier') {
    signals.push('high-value target');
  }

  // If actively seeking, they likely have urgency
  if (contact.response_status === 'pending' || contact.response_status === 'draft') {
    signals.push('urgent need');
  }

  const confidence = Math.min(100, signals.length * 25);

  return { problem, confidence, signals };
}

/**
 * Propose initial solution range based on contact profile
 */
export function proposeSolutionRange(contact) {
  if (!contact) return [];

  const solutions = [];

  // Base solutions on their role/industry
  if (contact.headline) {
    const role = contact.headline.toLowerCase();
    if (role.includes('founder') || role.includes('ceo') || role.includes('executive')) {
      solutions.push(
        { type: 'Strategic Advisory', desc: 'Executive coaching or strategic planning guidance' },
        { type: 'Network Expansion', desc: 'Introductions to key stakeholders or investors' },
        { type: 'Growth Infrastructure', desc: 'Systems or processes to scale operations' }
      );
    } else if (role.includes('engineer') || role.includes('developer') || role.includes('architect')) {
      solutions.push(
        { type: 'Technical Solutions', desc: 'Tools, frameworks, or technical implementation' },
        { type: 'Team Building', desc: 'Recruitment or team expansion services' },
        { type: 'Mentorship', desc: 'Technical mentorship from domain experts' }
      );
    } else if (role.includes('sales') || role.includes('business dev')) {
      solutions.push(
        { type: 'Sales Acceleration', desc: 'Sales training, process optimization, or tooling' },
        { type: 'Lead Generation', desc: 'Pipeline building or market expansion strategies' },
        { type: 'Partnership Development', desc: 'Strategic partnerships or channel strategy' }
      );
    } else if (role.includes('operations') || role.includes('product')) {
      solutions.push(
        { type: 'Process Optimization', desc: 'Efficiency improvements or workflow automation' },
        { type: 'Product Strategy', desc: 'Product direction, roadmapping, or customer insights' },
        { type: 'Team Enablement', desc: 'Training or tools to improve team capabilities' }
      );
    }
  }

  // Add tier-specific solutions
  if (contact.tier_classification === 'S-Tier') {
    solutions.push({
      type: 'Custom Enterprise Solution',
      desc: 'Bespoke solution tailored to their unique scale and complexity'
    });
  }

  // Default if no match
  if (solutions.length === 0) {
    solutions.push(
      { type: 'Discovery Consultation', desc: 'Initial deep-dive to understand their situation' },
      { type: 'Industry-Specific Solution', desc: 'Solution tailored to their sector' },
      { type: 'Custom Engagement', desc: 'Flexible arrangement based on their needs' }
    );
  }

  return solutions;
}