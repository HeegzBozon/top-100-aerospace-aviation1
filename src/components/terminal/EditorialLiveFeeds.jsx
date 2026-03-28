import { Rocket } from 'lucide-react';
import { LaunchPartyWidget } from '@/components/capabilities/global-intelligence/LaunchPartyWidget';
import ComprehensiveNewsStreams from '@/components/capabilities/global-intelligence/ComprehensiveNewsStreams';

export default function EditorialLiveFeeds() {
  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      <LaunchPartyWidget />
      <ComprehensiveNewsStreams />
    </div>
  );
}