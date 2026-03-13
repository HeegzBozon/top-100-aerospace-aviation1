import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { buildGraphFromNominees } from '@/functions/buildGraphFromNominees';
import { KnowledgeGraph } from '@/components/epics/01-index-engine/discovery';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

export default function OrbitalIndex({ nominees, onSelectNominee, isAdmin = false }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build graph data from nominees client-side (fallback if backend unavailable)
  const clientGraphData = useMemo(() => {
    if (!nominees || nominees.length === 0) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    const companyNodes = new Map();
    const countryNodes = new Map();
    const industryNodes = new Map();

    // Create nominee nodes
    nominees.forEach(nominee => {
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
        metadata: {
          avatar_url: nominee.avatar_url || nominee.photo_url,
          title: nominee.title || nominee.professional_role,
          company: nominee.company,
          country: nominee.country,
          industry: nominee.industry,
          aura_score: nominee.aura_score,
        }
      });

      // Company edges
      if (nominee.company) {
        const companyKey = nominee.company.toLowerCase().trim();
        if (!companyNodes.has(companyKey)) {
          const companyNodeId = `company_${companyKey.replace(/[^a-z0-9]+/g, '_')}`;
          companyNodes.set(companyKey, {
            id: companyNodeId,
            title: nominee.company,
            node_type: 'company',
            tags: [],
            collection: 'Companies',
            in_degree: 0,
            out_degree: 0,
            metadata: {}
          });
        }
        edges.push({
          source: nodeId,
          target: companyNodes.get(companyKey).id,
          link_type: 'company',
          weight: 1
        });
      }

      // Country edges
      if (nominee.country) {
        const countryKey = nominee.country.toLowerCase().trim();
        if (!countryNodes.has(countryKey)) {
          const countryNodeId = `country_${countryKey.replace(/[^a-z0-9]+/g, '_')}`;
          countryNodes.set(countryKey, {
            id: countryNodeId,
            title: nominee.country,
            node_type: 'country',
            tags: [],
            collection: 'Geography',
            in_degree: 0,
            out_degree: 0,
            metadata: {}
          });
        }
        edges.push({
          source: nodeId,
          target: countryNodes.get(countryKey).id,
          link_type: 'country',
          weight: 1
        });
      }

      // Industry edges
      if (nominee.industry) {
        const industryKey = nominee.industry.toLowerCase().trim();
        if (!industryNodes.has(industryKey)) {
          const industryNodeId = `industry_${industryKey.replace(/[^a-z0-9]+/g, '_')}`;
          industryNodes.set(industryKey, {
            id: industryNodeId,
            title: nominee.industry,
            node_type: 'industry',
            tags: [],
            collection: 'Industries',
            in_degree: 0,
            out_degree: 0,
            metadata: {}
          });
        }
        edges.push({
          source: nodeId,
          target: industryNodes.get(industryKey).id,
          link_type: 'industry',
          weight: 1
        });
      }
    });

    // Add auxiliary nodes
    nodes.push(...companyNodes.values());
    nodes.push(...countryNodes.values());
    nodes.push(...industryNodes.values());

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

    return { nodes, edges };
  }, [nominees]);

  useEffect(() => {
    // Use client-side graph data for now (faster, no admin required)
    setGraphData(clientGraphData);
    setLoading(false);
  }, [clientGraphData]);

  const handleSelectNominee = (node) => {
    if (node.node_type === 'nominee' && onSelectNominee) {
      // Find original nominee data
      const nominee = nominees.find(n => n.id === node.source_entity_id);
      if (nominee) {
        onSelectNominee(nominee);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]" style={{ background: brandColors.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center" style={{ background: brandColors.cream }}>
        <div>
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-500">Falling back to basic view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '70vh', minHeight: 600 }}>
      <KnowledgeGraph
        nodes={graphData.nodes}
        edges={graphData.edges}
        onSelectNominee={handleSelectNominee}
        viewMode="global"
        isAdmin={isAdmin}
      />
    </div>
  );
}