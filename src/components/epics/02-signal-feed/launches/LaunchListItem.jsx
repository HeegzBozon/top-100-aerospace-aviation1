import { Rocket, MapPin, Radio } from 'lucide-react';
import LaunchDateTime from './LaunchDateTime';

export default function LaunchListItem({ launch, onClick }) {
  const providerName = launch.launch_service_provider?.name || null;
  const locationName = launch.pad?.location?.name || launch.pad?.name || '';
  const imageUrl = launch.image?.image_url || null;
  const statusName = launch.status?.name || 'TBD';
  const isGo = launch.status?.abbrev === 'Go';
  const hasStream = launch.vidURLs?.length > 0;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer min-h-[64px]"
      aria-label={`View details for ${launch.name}`}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-80" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-6 h-6 text-slate-400" />
          </div>
        )}
        {hasStream && (
          <span className="absolute bottom-0.5 left-0.5 bg-red-600/90 rounded-sm p-0.5">
            <Radio className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {providerName && (
          <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide truncate">{providerName}</p>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">{launch.name}</h3>
        <LaunchDateTime isoString={launch.net} showIcon={true} />
        {locationName && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <span
        className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
          isGo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {statusName}
      </span>
    </article>
  );
}