import { Radar } from 'lucide-react';

export default function RadarDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Radar className="w-10 h-10 text-slate-400 mb-3" />
      <p className="text-sm font-medium text-slate-600">Radar Dashboard</p>
      <p className="text-xs text-slate-400 mt-1">Coming soon</p>
    </div>
  );
}