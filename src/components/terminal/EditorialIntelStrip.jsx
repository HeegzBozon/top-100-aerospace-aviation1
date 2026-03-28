import { ConflictAlertsSummary } from '@/components/capabilities/global-intelligence/ConflictAlertsSummary';
import { CyberThreatsSummary } from '@/components/capabilities/global-intelligence/CyberThreatsSummary';
import { GpsJammingSummary } from '@/components/capabilities/global-intelligence/GpsJammingSummary';
import { DisastersSummary } from '@/components/capabilities/global-intelligence/DisastersSummary';
import { MaritimeSummary } from '@/components/capabilities/global-intelligence/MaritimeSummary';
import { SupplyChainSummary } from '@/components/capabilities/global-intelligence/SupplyChainSummary';
import { Crosshair, AlertTriangle, Radio, CloudRain, Anchor, Truck } from 'lucide-react';

const PANELS = [
  { label: 'Conflicts',  icon: Crosshair,      Component: ConflictAlertsSummary },
  { label: 'Disasters',  icon: CloudRain,       Component: DisastersSummary },
  { label: 'Cyber',      icon: AlertTriangle,   Component: CyberThreatsSummary },
  { label: 'Maritime',   icon: Anchor,          Component: MaritimeSummary },
  { label: 'GPS Jam',    icon: Radio,           Component: GpsJammingSummary },
  { label: 'Supply',     icon: Truck,           Component: SupplyChainSummary },
];

export default function EditorialIntelStrip() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {PANELS.map(({ label, icon: Icon, Component }) => (
        <div
          key={label}
          className="rounded-xl overflow-hidden border"
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,90,0.04) 0%, rgba(201,168,124,0.06) 100%)',
            borderColor: 'rgba(30,58,90,0.08)',
          }}
        >
          <div className="px-2 py-1 flex items-center gap-1.5 border-b" style={{ borderColor: 'rgba(30,58,90,0.06)' }}>
            <Icon className="w-3 h-3" style={{ color: '#c9a87c' }} />
            <span className="text-[9px] font-mono tracking-wider uppercase" style={{ color: '#1e3a5a', opacity: 0.5 }}>
              {label}
            </span>
            <div className="flex-1" />
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="px-2 py-1.5 min-h-[48px]">
            <Component />
          </div>
        </div>
      ))}
    </div>
  );
}