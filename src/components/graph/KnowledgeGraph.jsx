import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ZoomIn, ZoomOut, Maximize2, Layers, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  roseAccent: '#d4a574',
};

// Node type colors
const nodeTypeColors = {
  nominee: brandColors.goldPrestige,
  article: brandColors.skyBlue,
  event: brandColors.roseAccent,
  company: '#6366f1',
  tag: '#10b981',
  concept: '#8b5cf6',
  country: '#f59e0b',
  industry: '#ec4899',
};

// Force simulation constants
const SIMULATION_CONFIG = {
  centerForce: 0.02,
  repelForce: 800,
  linkForce: 0.3,
  linkDistance: 80,
  friction: 0.9,
  maxVelocity: 10,
};

function forceSimulation(nodes, edges, width, height, iterations = 50) {
  // Initialize positions if not set
  nodes.forEach((node, i) => {
    if (node.x === undefined) {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      node.x = width / 2 + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
      node.y = height / 2 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
    }
    node.vx = node.vx || 0;
    node.vy = node.vy || 0;
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = SIMULATION_CONFIG.repelForce / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - SIMULATION_CONFIG.linkDistance) * SIMULATION_CONFIG.linkForce * (edge.weight || 1);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });

    // Center gravity
    nodes.forEach(node => {
      node.vx += (width / 2 - node.x) * SIMULATION_CONFIG.centerForce;
      node.vy += (height / 2 - node.y) * SIMULATION_CONFIG.centerForce;
    });

    // Apply velocity with friction and bounds
    nodes.forEach(node => {
      if (node.pinned) return;
      node.vx *= SIMULATION_CONFIG.friction;
      node.vy *= SIMULATION_CONFIG.friction;
      node.vx = Math.max(-SIMULATION_CONFIG.maxVelocity, Math.min(SIMULATION_CONFIG.maxVelocity, node.vx));
      node.vy = Math.max(-SIMULATION_CONFIG.maxVelocity, Math.min(SIMULATION_CONFIG.maxVelocity, node.vy));
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.max(50, Math.min(width - 50, node.x));
      node.y = Math.max(50, Math.min(height - 50, node.y));
    });
  }

  return nodes;
}

// Graph Node Component - using native SVG transform for stability
const GraphNode = React.memo(({ node, x, y, size, isSelected, isHovered, isNeighbor, onSelect, onHover, onDrag }) => {
  const color = nodeTypeColors[node.node_type] || brandColors.navyDeep;
  const hasPhoto = node.metadata?.avatar_url || node.metadata?.photo_url;
  const opacity = isSelected || isHovered || isNeighbor ? 1 : 0.7;
  const displaySize = isSelected ? size * 1.2 : isHovered ? size * 1.1 : size;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onDrag(node.id, 'start', e);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: 'pointer', opacity }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => { e.stopPropagation(); onSelect(node); }}
      onMouseDown={handleMouseDown}
    >
      {/* Glow effect for selected/hovered */}
      {(isSelected || isHovered) && (
        <circle cx={0} cy={0} r={displaySize + 6} fill={color} opacity={0.3} />
      )}
      
      {/* Neighbor highlight ring */}
      {isNeighbor && !isSelected && !isHovered && (
        <circle cx={0} cy={0} r={displaySize + 4} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      )}
      
      {/* Main node */}
      <circle
        cx={0}
        cy={0}
        r={displaySize}
        fill={hasPhoto ? '#fff' : color}
        stroke={color}
        strokeWidth={isSelected ? 3 : 1.5}
      />
      
      {/* Photo clip */}
      {hasPhoto ? (
        <>
          <defs>
            <clipPath id={`clip-${node.id}`}>
              <circle cx={0} cy={0} r={displaySize - 2} />
            </clipPath>
          </defs>
          <image
            href={node.metadata.avatar_url || node.metadata.photo_url}
            x={-displaySize + 2}
            y={-displaySize + 2}
            width={(displaySize - 2) * 2}
            height={(displaySize - 2) * 2}
            clipPath={`url(#clip-${node.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={displaySize * 0.7}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {node.title?.charAt(0) || '?'}
        </text>
      )}
      
      {/* Node type indicator */}
      <circle
        cx={displaySize * 0.7}
        cy={-displaySize * 0.7}
        r={4}
        fill={color}
        stroke="#fff"
        strokeWidth={1}
      />
    </g>
  );
});

// Edge Component
const GraphEdge = ({ x1, y1, x2, y2, weight, isHighlighted, color }) => {
  const strokeWidth = Math.min(1 + (weight || 1) * 0.5, 4);
  const opacity = isHighlighted ? 0.8 : 0.2;
  
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color || brandColors.skyBlue}
      strokeWidth={isHighlighted ? strokeWidth + 1 : strokeWidth}
      opacity={opacity}
      strokeLinecap="round"
    />
  );
};

// Node Detail Panel
const NodeDetailPanel = ({ node, edges, allNodes, onClose, onSelectNode }) => {
  if (!node) return null;

  const nodeMap = new Map(allNodes.map(n => [n.id, n]));
  const outgoing = edges.filter(e => e.source === node.id).map(e => ({ ...e, node: nodeMap.get(e.target) })).filter(e => e.node);
  const incoming = edges.filter(e => e.target === node.id).map(e => ({ ...e, node: nodeMap.get(e.source) })).filter(e => e.node);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute top-0 right-0 w-80 h-full bg-white border-l shadow-xl overflow-y-auto z-20"
      style={{ borderColor: brandColors.goldPrestige }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {(node.metadata?.avatar_url || node.metadata?.photo_url) ? (
              <img
                src={node.metadata.avatar_url || node.metadata.photo_url}
                alt={node.title}
                className="w-12 h-12 rounded-full object-cover border-2"
                style={{ borderColor: nodeTypeColors[node.node_type] }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: nodeTypeColors[node.node_type] }}
              >
                {node.title?.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold" style={{ color: brandColors.navyDeep }}>{node.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${nodeTypeColors[node.node_type]}20`, color: nodeTypeColors[node.node_type] }}>
                {node.node_type}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {node.metadata?.title && (
          <p className="text-sm mb-2" style={{ color: brandColors.skyBlue }}>{node.metadata.title}</p>
        )}
        {node.metadata?.company && (
          <p className="text-sm text-gray-600 mb-2">at {node.metadata.company}</p>
        )}
        {node.metadata?.country && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
            <MapPin className="w-3 h-3" /> {node.metadata.country}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 rounded-lg text-center" style={{ background: `${brandColors.navyDeep}10` }}>
            <div className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>{node.in_degree || 0}</div>
            <div className="text-xs text-gray-500">Inbound</div>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: `${brandColors.goldPrestige}20` }}>
            <div className="text-lg font-bold" style={{ color: brandColors.goldPrestige }}>{node.out_degree || 0}</div>
            <div className="text-xs text-gray-500">Outbound</div>
          </div>
        </div>

        {outgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Outgoing Links ({outgoing.length})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {outgoing.map(({ node: n, link_type }) => (
                <button
                  key={n.id}
                  onClick={() => onSelectNode(n)}
                  className="w-full text-left text-sm p-2 rounded hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: nodeTypeColors[n.node_type] }} />
                  <span className="truncate flex-1">{n.title}</span>
                  <span className="text-xs text-gray-400">{link_type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {incoming.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Backlinks ({incoming.length})</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {incoming.map(({ node: n, link_type }) => (
                <button
                  key={n.id}
                  onClick={() => onSelectNode(n)}
                  className="w-full text-left text-sm p-2 rounded hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: nodeTypeColors[n.node_type] }} />
                  <span className="truncate flex-1">{n.title}</span>
                  <span className="text-xs text-gray-400">{link_type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {node.tags?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {node.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function KnowledgeGraph({ nodes, edges, onSelectNominee, viewMode = 'global', centerNodeId = null, isAdmin = false }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const nodePositionsRef = useRef(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [localDepth, setLocalDepth] = useState(2);
  const [showOrphans, setShowOrphans] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(500, rect.height) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter nodes
  const filteredData = useMemo(() => {
    let filteredNodes = nodes.filter(n => {
      const matchesSearch = !searchTerm || n.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || n.node_type === filterType;
      const matchesOrphan = showOrphans || !n.is_orphan;
      return matchesSearch && matchesType && matchesOrphan;
    });

    // Local graph mode: BFS from center node
    if (viewMode === 'local' && centerNodeId) {
      const nodeSet = new Set([centerNodeId]);
      const queue = [{ id: centerNodeId, depth: 0 }];
      
      while (queue.length > 0) {
        const { id, depth } = queue.shift();
        if (depth >= localDepth) continue;
        
        edges.forEach(e => {
          if (e.source === id && !nodeSet.has(e.target)) {
            nodeSet.add(e.target);
            queue.push({ id: e.target, depth: depth + 1 });
          }
          if (e.target === id && !nodeSet.has(e.source)) {
            nodeSet.add(e.source);
            queue.push({ id: e.source, depth: depth + 1 });
          }
        });
      }
      
      filteredNodes = filteredNodes.filter(n => nodeSet.has(n.id));
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [nodes, edges, searchTerm, filterType, showOrphans, viewMode, centerNodeId, localDepth]);

  // Run force simulation - stable reference to prevent re-runs on hover
  const positionedNodes = useMemo(() => {
    const nodesCopy = filteredData.nodes.map(n => ({ ...n }));
    return forceSimulation(nodesCopy, filteredData.edges, dimensions.width, dimensions.height, 100);
  }, [filteredData.nodes.length, filteredData.edges.length, dimensions.width, dimensions.height]);

  // Get neighbors of hovered/selected node
  const neighbors = useMemo(() => {
    const id = hoveredId || selectedNode?.id;
    if (!id) return new Set();
    const neighborIds = new Set();
    filteredData.edges.forEach(e => {
      if (e.source === id) neighborIds.add(e.target);
      if (e.target === id) neighborIds.add(e.source);
    });
    return neighborIds;
  }, [hoveredId, selectedNode, filteredData.edges]);

  // Node size based on degree
  const getNodeSize = useCallback((node) => {
    const degree = (node.in_degree || 0) + (node.out_degree || 0);
    return Math.min(12 + degree * 2, 30);
  }, []);

  // Handle node selection
  const handleSelectNode = (node) => {
    setSelectedNode(node);
    if (onSelectNominee && node.node_type === 'nominee') {
      onSelectNominee(node);
    }
  };

  // Drag handlers
  const handleDrag = (nodeId, action, e) => {
    if (action === 'start') {
      setDragging(nodeId);
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      const node = positionedNodes.find(n => n.id === dragging);
      if (node) {
        node.x = x;
        node.y = y;
        node.pinned = true;
      }
    } else if (isPanning) {
      setPan({
        x: pan.x + (e.clientX - panStart.x),
        y: pan.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
  };

  const nodeMap = useMemo(() => new Map(positionedNodes.map(n => [n.id, n])), [positionedNodes]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm bg-white"
            style={{ borderColor: `${brandColors.navyDeep}30` }}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm bg-white"
          style={{ borderColor: `${brandColors.navyDeep}30` }}
        >
          <option value="all">All Types</option>
          <option value="nominee">Nominees</option>
          <option value="company">Companies</option>
          <option value="tag">Tags</option>
          <option value="country">Countries</option>
          <option value="industry">Industries</option>
        </select>

        {isAdmin && (
          <Button
            variant={showOrphans ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOrphans(!showOrphans)}
            className="gap-1"
          >
            <Layers className="w-4 h-4" />
            Orphans
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z * 1.2))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z / 1.2))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 text-xs" style={{ color: brandColors.navyDeep }}>
        <span className="font-semibold">{filteredData.nodes.length} nodes</span>
        <span>{filteredData.edges.length} edges</span>
        {selectedNode && <span>Selected: {selectedNode.title}</span>}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur p-3 rounded-lg border text-xs" style={{ borderColor: `${brandColors.navyDeep}20` }}>
        <div className="font-semibold mb-2" style={{ color: brandColors.navyDeep }}>Node Types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(nodeTypeColors).slice(0, 6).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ background: `radial-gradient(ellipse at center, ${brandColors.navyDeep}08 0%, ${brandColors.cream} 70%)` }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {filteredData.edges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;
            
            const isHighlighted = hoveredId === edge.source || hoveredId === edge.target ||
              selectedNode?.id === edge.source || selectedNode?.id === edge.target;
            
            return (
              <GraphEdge
                key={`${edge.source}-${edge.target}-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                weight={edge.weight}
                isHighlighted={isHighlighted}
                color={nodeTypeColors[source.node_type]}
              />
            );
          })}

          {/* Nodes */}
          {positionedNodes.map(node => (
            <GraphNode
              key={node.id}
              node={node}
              x={node.x}
              y={node.y}
              size={getNodeSize(node)}
              isSelected={selectedNode?.id === node.id}
              isHovered={hoveredId === node.id}
              isNeighbor={neighbors.has(node.id)}
              onSelect={handleSelectNode}
              onHover={setHoveredId}
              onDrag={handleDrag}
            />
          ))}
        </g>
      </svg>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            edges={filteredData.edges}
            allNodes={positionedNodes}
            onClose={() => setSelectedNode(null)}
            onSelectNode={handleSelectNode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}