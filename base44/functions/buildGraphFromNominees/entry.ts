import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all active/winner/finalist nominees
    const nominees = await base44.asServiceRole.entities.Nominee.filter({
      status: { $in: ['active', 'winner', 'finalist'] }
    });

    // Build nodes and edges
    const nodes = [];
    const edges = [];
    const companyNodes = new Map();
    const countryNodes = new Map();
    const industryNodes = new Map();
    const tagNodes = new Map();

    // Create nominee nodes
    for (const nominee of nominees) {
      const nodeId = `nominee_${nominee.id}`;
      
      nodes.push({
        id: nodeId,
        title: nominee.name,
        slug: nominee.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        node_type: 'nominee',
        source_entity_id: nominee.id,
        tags: [],
        collection: nominee.industry || 'General',
        in_degree: 0,
        out_degree: 0,
        is_orphan: true,
        is_ghost: false,
        metadata: {
          avatar_url: nominee.avatar_url || nominee.photo_url,
          title: nominee.title || nominee.professional_role,
          company: nominee.company,
          country: nominee.country,
          industry: nominee.industry,
          aura_score: nominee.aura_score,
        }
      });

      // Create/link company node
      if (nominee.company) {
        const companyKey = nominee.company.toLowerCase().trim();
        if (!companyNodes.has(companyKey)) {
          const companyNodeId = `company_${companyKey.replace(/[^a-z0-9]+/g, '_')}`;
          companyNodes.set(companyKey, {
            id: companyNodeId,
            title: nominee.company,
            slug: companyKey.replace(/[^a-z0-9]+/g, '-'),
            node_type: 'company',
            tags: [],
            collection: 'Companies',
            in_degree: 0,
            out_degree: 0,
            is_orphan: false,
            metadata: {}
          });
        }
        const companyNode = companyNodes.get(companyKey);
        edges.push({
          source: nodeId,
          target: companyNode.id,
          link_type: 'company',
          weight: 1
        });
      }

      // Create/link country node
      if (nominee.country) {
        const countryKey = nominee.country.toLowerCase().trim();
        if (!countryNodes.has(countryKey)) {
          const countryNodeId = `country_${countryKey.replace(/[^a-z0-9]+/g, '_')}`;
          countryNodes.set(countryKey, {
            id: countryNodeId,
            title: nominee.country,
            slug: countryKey.replace(/[^a-z0-9]+/g, '-'),
            node_type: 'country',
            tags: [],
            collection: 'Geography',
            in_degree: 0,
            out_degree: 0,
            is_orphan: false,
            metadata: {}
          });
        }
        const countryNode = countryNodes.get(countryKey);
        edges.push({
          source: nodeId,
          target: countryNode.id,
          link_type: 'country',
          weight: 1
        });
      }

      // Create/link industry node
      if (nominee.industry) {
        const industryKey = nominee.industry.toLowerCase().trim();
        if (!industryNodes.has(industryKey)) {
          const industryNodeId = `industry_${industryKey.replace(/[^a-z0-9]+/g, '_')}`;
          industryNodes.set(industryKey, {
            id: industryNodeId,
            title: nominee.industry,
            slug: industryKey.replace(/[^a-z0-9]+/g, '-'),
            node_type: 'industry',
            tags: [],
            collection: 'Industries',
            in_degree: 0,
            out_degree: 0,
            is_orphan: false,
            metadata: {}
          });
        }
        const industryNode = industryNodes.get(industryKey);
        edges.push({
          source: nodeId,
          target: industryNode.id,
          link_type: 'industry',
          weight: 1
        });
      }
    }

    // Fetch NomineeTags and create tag nodes + edges
    const nomineeTags = await base44.asServiceRole.entities.NomineeTag.filter({ status: 'approved' });
    
    for (const tag of nomineeTags) {
      const tagKey = tag.tag_name?.toLowerCase().trim();
      if (!tagKey) continue;
      
      if (!tagNodes.has(tagKey)) {
        const tagNodeId = `tag_${tagKey.replace(/[^a-z0-9]+/g, '_')}`;
        tagNodes.set(tagKey, {
          id: tagNodeId,
          title: tag.tag_name,
          slug: tagKey.replace(/[^a-z0-9]+/g, '-'),
          node_type: 'tag',
          tags: [tag.category],
          collection: tag.category || 'Tags',
          in_degree: 0,
          out_degree: 0,
          is_orphan: false,
          metadata: { category: tag.category, upvotes: tag.upvotes }
        });
      }
      
      const tagNode = tagNodes.get(tagKey);
      const nomineeNodeId = `nominee_${tag.nominee_id}`;
      
      // Only add edge if nominee node exists
      if (nodes.some(n => n.id === nomineeNodeId)) {
        edges.push({
          source: nomineeNodeId,
          target: tagNode.id,
          link_type: 'tag',
          weight: (tag.upvotes || 0) + 1
        });
      }
    }

    // Add auxiliary nodes to main nodes array
    nodes.push(...companyNodes.values());
    nodes.push(...countryNodes.values());
    nodes.push(...industryNodes.values());
    nodes.push(...tagNodes.values());

    // Calculate degrees
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source) {
        source.out_degree = (source.out_degree || 0) + 1;
        source.is_orphan = false;
      }
      if (target) {
        target.in_degree = (target.in_degree || 0) + 1;
        target.is_orphan = false;
      }
    });

    return Response.json({
      success: true,
      nodes,
      edges,
      stats: {
        total_nodes: nodes.length,
        nominee_nodes: nominees.length,
        company_nodes: companyNodes.size,
        country_nodes: countryNodes.size,
        industry_nodes: industryNodes.size,
        tag_nodes: tagNodes.size,
        total_edges: edges.length
      }
    });

  } catch (error) {
    console.error('Build graph error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});