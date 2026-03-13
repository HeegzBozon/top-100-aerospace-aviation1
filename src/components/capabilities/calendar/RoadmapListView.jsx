import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, Inbox, Clock, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const STATUS_CONFIG = {
  backlog: { 
    label: 'Backlog', 
    icon: Inbox, 
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
  },
  next_up: { 
    label: 'Next Up', 
    icon: Clock, 
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  in_progress: { 
    label: 'In Progress', 
    icon: PlayCircle, 
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  done: { 
    label: 'Done', 
    icon: CheckCircle2, 
    bg: 'bg-green-50',
    dot: 'bg-green-500',
  },
};

const STATUS_ORDER = ['done', 'in_progress', 'next_up', 'backlog'];

function ListItem({ item, onUpvote, hasUpvoted, isUpvoting }) {
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.backlog;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-white border-b border-slate-100 last:border-b-0"
    >
      {/* Status dot */}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-800 truncate">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} text-slate-600`}>
            {config.label}
          </span>
          {item.category && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded border"
              style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              {item.category}
            </span>
          )}
        </div>
      </div>
      
      {/* Upvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onUpvote(item)}
        disabled={isUpvoting}
        className={`gap-0.5 px-2 py-1 h-auto shrink-0 ${hasUpvoted ? 'text-amber-600' : 'text-slate-400'}`}
      >
        <ChevronUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
        <span className="text-xs font-medium">{item.upvotes || 0}</span>
      </Button>
    </motion.div>
  );
}

function StatusSection({ status, items, onUpvote, userEmail, isUpvoting, defaultExpanded = true }) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const sectionItems = items.filter(i => i.status === status).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  
  if (sectionItems.length === 0) return null;
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-3 rounded-lg ${config.bg} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">{config.label}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {sectionItems.length}
          </Badge>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <Card className="mt-1 overflow-hidden border-slate-200">
          {sectionItems.map(item => (
            <ListItem
              key={item.id}
              item={item}
              onUpvote={onUpvote}
              hasUpvoted={item.upvoted_by?.includes(userEmail)}
              isUpvoting={isUpvoting}
            />
          ))}
        </Card>
      )}
    </div>
  );
}

export default function RoadmapListView({ items, onUpvote, userEmail, isUpvoting }) {
  return (
    <div className="space-y-2">
      {STATUS_ORDER.map((status, idx) => (
        <StatusSection
          key={status}
          status={status}
          items={items}
          onUpvote={onUpvote}
          userEmail={userEmail}
          isUpvoting={isUpvoting}
          defaultExpanded={idx < 2} // Expand backlog and next_up by default
        />
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items yet</p>
        </div>
      )}
    </div>
  );
}