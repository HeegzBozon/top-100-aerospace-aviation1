import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { directoryData = [] } = await req.json();
    const updates = [];
    const notFound = [];
    const errors = [];

    // Fetch subsystems to get domain IDs
    const subsystems = await base44.asServiceRole.entities.Subsystem.list('-created_date', 100);
    const domainMap = {};
    for (const subsystem of subsystems) {
      domainMap[subsystem.name] = subsystem.id;
    }

    // Process each directory entry
    for (const entry of directoryData) {
      try {
        const { Name, Domain, Rank, Title } = entry;
        
        if (!Name) continue;

        // Find nominee by name
        const nominees = await base44.asServiceRole.entities.Nominee.filter(
          { name: Name },
          '',
          10
        );

        if (nominees.length === 0) {
          notFound.push({ name: Name, domain: Domain });
          continue;
        }

        const nominee = nominees[0];
        const domainId = domainMap[Domain];

        // Update nominee with domain
        const updateData = {
          professional_role: Title || nominee.professional_role
        };

        // Add domain_ids if not present
        if (domainId && !nominee.domain_ids?.includes(domainId)) {
          updateData.domain_ids = [
            ...(nominee.domain_ids || []),
            domainId
          ];
        }

        const updated = await base44.asServiceRole.entities.Nominee.update(
          nominee.id,
          updateData
        );

        updates.push({
          name: Name,
          domain: Domain,
          rank: Rank,
          nominee_id: nominee.id
        });
      } catch (err) {
        errors.push({ name: entry.Name, error: err.message });
      }
    }

    base44.analytics.track({
      eventName: 'nominee_domains_updated',
      properties: { updated: updates.length, not_found: notFound.length, errors: errors.length }
    });

    return Response.json({
      updated: updates.length,
      not_found: notFound.length,
      errors: errors.length,
      updates,
      notFound,
      errors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});