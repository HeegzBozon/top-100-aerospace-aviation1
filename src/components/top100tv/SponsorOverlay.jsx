/**
 * SponsorOverlay - L-Bar sponsor attribution overlay
 * Positioned absolutely over video container without affecting playback
 */
export default function SponsorOverlay({ sponsorship, position = 'bottom-left' }) {
  if (!sponsorship?.is_sponsored || !sponsorship?.overlay_asset_url) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
  };

  return (
    <div
      className={`absolute ${positionClasses[position] || positionClasses['bottom-left']} z-20 pointer-events-none`}
      aria-label={`Presented by ${sponsorship.sponsor_name}`}
    >
      {sponsorship.sponsor_logo_url ? (
        <img
          src={sponsorship.overlay_asset_url}
          alt={`${sponsorship.sponsor_name} sponsor`}
          className="h-12 object-contain drop-shadow-lg"
        />
      ) : (
        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20">
          <p className="text-xs font-semibold text-white/80">
            Presented by {sponsorship.sponsor_name}
          </p>
        </div>
      )}
    </div>
  );
}