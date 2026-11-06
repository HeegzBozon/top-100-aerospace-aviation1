// The invitation, as it was printed.
//
// One plate, two places: the hero of the ballot's landing page — where a promoted link
// sets a visitor who has no account yet — and the opening panel of Pre-Flight, where an
// Analyst is handed the same card before they begin. The artwork carries its own
// typography, so nothing is laid over it: it is held in one copper bevel, set on the
// cream, and the only thing the house adds is the shadow it casts.
const INVITATION =
  'https://base44.app/api/apps/68996845be6727838fdb822e/files/mp/public/68996845be6727838fdb822e/2ac211591_TOP100AerospaceInvitation.png';

const ALT =
  'An invitation to join the Selection Committee: TOP 100 in Aerospace & Aviation, voting is now live.';

export default function InvitationPlate({ variant = 'panel', className = '' }) {
  const hero = variant === 'hero';

  return (
    <figure className={className}>
      <div
        className={hero ? 'overflow-hidden rounded-[4px]' : 'overflow-hidden rounded-[3px]'}
        style={{
          padding: hero ? 4 : 3,
          background:
            'linear-gradient(158deg, rgb(var(--editorial-gold-rgb)) 0%, rgb(var(--editorial-copper-rgb)) 46%, rgb(var(--editorial-gold-rgb) / 0.62) 100%)',
          boxShadow: hero
            ? '0 34px 64px -30px rgb(var(--editorial-navy-rgb) / 0.58)'
            : '0 22px 44px -22px rgb(var(--editorial-navy-rgb) / 0.5)',
        }}
      >
        <img
          src={INVITATION}
          alt={ALT}
          className="block w-full"
          loading={hero ? 'eager' : 'lazy'}
          decoding="async"
          style={{ borderRadius: hero ? 2 : 1 }}
        />
      </div>
    </figure>
  );
}