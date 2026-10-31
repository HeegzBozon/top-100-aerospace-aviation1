// Shown once the referral has been answered; the invitation to join comes only now.
export default function ReferralAnswered({ view }) {
  const yes = view.answered === 'yes';
  return (
    <>
      <h1 className="mt-5 font-heading text-2xl leading-tight">{yes ? 'Thank you.' : 'Understood.'}</h1>
      <p className="mt-3 font-body text-sm">
        {yes ? `${view.referrer_name} will make the introduction to ${view.other}.` : `${view.referrer_name} has been let know. No introduction will be made.`}
      </p>
      <div className="mt-6 border-t border-editorial-copper/40 pt-4">
        <p className="font-body text-sm">TOP 100 Aerospace & Aviation is a verified reputation graph for the people building aerospace.</p>
        <a href="/" className="mt-3 inline-block rounded border border-editorial-copper px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-editorial-navy">Explore the platform</a>
      </div>
    </>
  );
}