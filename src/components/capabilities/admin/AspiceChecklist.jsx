import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function AspiceChecklist({ processAreas, onToggleStatus, onSetCritical }) {
  const sortedAreas = [...processAreas].sort((a, b) => a.process_area_id.localeCompare(b.process_area_id));
  
  const getStatus = (level) => {
    if (level === undefined || level === null) return { text: 'Not Set', color: 'bg-gray-400', icon: <HelpCircle className="w-4 h-4" /> };
    if (level >= 1) return { text: 'Pass', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> };
    return { text: 'Fail', color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> };
  };

  return (
    <div className="space-y-3">
        <div className="grid grid-cols-12 gap-4 items-center p-2 font-bold text-sm text-gray-600 border-b">
            <div className="col-span-2">Process ID</div>
            <div className="col-span-5">Process Name</div>
            <div className="col-span-2 text-center">Is Critical?</div>
            <div className="col-span-3 text-center">Compliance Status</div>
        </div>
      {sortedAreas.map(area => {
        const status = getStatus(area.capability_level);
        return (
          <div key={area.process_area_id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
            <div className="col-span-2 font-semibold text-gray-800">{area.process_area_id}</div>
            <div className="col-span-5 text-gray-700">{area.process_area_name}</div>
            <div className="col-span-2 flex justify-center">
                 <Switch
                    checked={area.is_critical}
                    onCheckedChange={(isChecked) => onSetCritical(area, isChecked)}
                    aria-label={`Mark ${area.process_area_name} as critical`}
                 />
            </div>
            <div className="col-span-3 flex justify-center items-center gap-2">
               <Switch
                  checked={area.capability_level >= 1}
                  onCheckedChange={(isChecked) => onToggleStatus(area, isChecked)}
                  aria-label={`Mark ${area.process_area_name} as passed`}
                />
                <Badge className={`w-20 justify-center text-white ${status.color}`}>
                  {status.icon}
                  <span className="ml-1.5">{status.text}</span>
                </Badge>
            </div>
          </div>
        )
      })}
    </div>
  );
}