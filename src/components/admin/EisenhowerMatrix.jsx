import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Target, Archive } from 'lucide-react';

const QuadrantCard = ({ quadrant, items, title, icon: Icon, color, description }) => {
  const totalWsjf = items.reduce((sum, item) => sum + (item.wsjf_score || 0), 0);
  const topItems = items
    .sort((a, b) => (b.wsjf_score || 0) - (a.wsjf_score || 0))
    .slice(0, 3);

  return (
    <div className={`bg-white rounded-lg border-2 ${color} p-4 h-80 flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" />
        <div>
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      
      <div className="flex gap-4 mb-3 text-xs">
        <div className="bg-gray-50 px-2 py-1 rounded">
          <div className="font-bold text-lg">{items.length}</div>
          <div className="text-gray-600">Items</div>
        </div>
        <div className="bg-gray-50 px-2 py-1 rounded">
          <div className="font-bold text-lg">{totalWsjf.toFixed(1)}</div>
          <div className="text-gray-600">Total WSJF</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {topItems.map((item) => (
          <div key={item.id} className="bg-gray-50 p-2 rounded text-xs">
            <div className="font-medium truncate">{item.subject}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-600">{item.type}</span>
              <Badge variant="outline" className="text-xs">
                {item.wsjf_score?.toFixed(1) || 'N/A'}
              </Badge>
            </div>
          </div>
        ))}
        {items.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{items.length - 3} more items
          </div>
        )}
      </div>
    </div>
  );
};

export default function EisenhowerMatrix({ feedback }) {
  const quadrants = {
    Q1_Urgent_Important: {
      title: 'Q1: Do First',
      description: 'Urgent & Important',
      icon: AlertTriangle,
      color: 'border-red-300 bg-red-50/50',
      items: feedback.filter(f => f.quadrant === 'Q1_Urgent_Important')
    },
    Q2_Important_Not_Urgent: {
      title: 'Q2: Schedule',
      description: 'Important, Not Urgent',
      icon: Target,
      color: 'border-blue-300 bg-blue-50/50',
      items: feedback.filter(f => f.quadrant === 'Q2_Important_Not_Urgent')
    },
    Q3_Urgent_Not_Important: {
      title: 'Q3: Delegate',
      description: 'Urgent, Not Important',
      icon: Clock,
      color: 'border-yellow-300 bg-yellow-50/50',
      items: feedback.filter(f => f.quadrant === 'Q3_Urgent_Not_Important')
    },
    Q4_Neither: {
      title: 'Q4: Eliminate',
      description: 'Neither Urgent nor Important',
      icon: Archive,
      color: 'border-gray-300 bg-gray-50/50',
      items: feedback.filter(f => f.quadrant === 'Q4_Neither')
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Eisenhower Matrix</h2>
        <p className="text-gray-600">Prioritization based on Urgency vs Importance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuadrantCard
          quadrant="Q1_Urgent_Important"
          {...quadrants.Q1_Urgent_Important}
        />
        <QuadrantCard
          quadrant="Q2_Important_Not_Urgent"
          {...quadrants.Q2_Important_Not_Urgent}
        />
        <QuadrantCard
          quadrant="Q3_Urgent_Not_Important"
          {...quadrants.Q3_Urgent_Not_Important}
        />
        <QuadrantCard
          quadrant="Q4_Neither"
          {...quadrants.Q4_Neither}
        />
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-bold text-lg mb-2">Matrix Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {quadrants.Q1_Urgent_Important.items.length}
            </div>
            <div className="text-gray-600">Crisis Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {quadrants.Q2_Important_Not_Urgent.items.length}
            </div>
            <div className="text-gray-600">Strategic Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {quadrants.Q3_Urgent_Not_Important.items.length}
            </div>
            <div className="text-gray-600">Interruptions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {quadrants.Q4_Neither.items.length}
            </div>
            <div className="text-gray-600">Distractions</div>
          </div>
        </div>
      </div>
    </div>
  );
}