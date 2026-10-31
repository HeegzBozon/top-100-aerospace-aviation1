// Step three: what happens next, then the optional invitation to join.
export default function ReferralAnswered({ view }) {
  const yes = view.answered === 'yes';
  const next = yes ? [
    `${view.referrer_name} has been told you said yes.`,
    `They'll introduce you to ${view.other}, using only what you chose to share.`,
    `Watch your inbox for the introduction. Reply there to start the conversation.`,
  ] : [];
  return (
    <>
      <p className="pd-label">Next steps</p>
      <h2 className="mt-3 font-heading text-2xl leading-tight">{yes ? 'Thank you.' : 'Understood.'}</h2>
      {yes ? (
        <ol className="mt-4 space-y-3">
          {next.map((t, i) => (
            <li key={i} className="flex gap-3 font-body text-sm leading-snug">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-editorial-copper font-heading text-xs text-editorial-label">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 font-body text-sm">{view.referrer_name} has been let know. No introduction will be made, and nothing about you is shared.</p>
      )}
      <div className="mt-7 rounded-lg bg-editorial-navy p-5 text-editorial-cream">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-gold">An invitation, if you'd like it</p>
        <p className="mt-2 font-heading text-lg leading-snug">TOP 100 Aerospace & Aviation is a verified reputation graph for the people building aerospace.</p>
        <p className="mt-2 font-body text-xs text-editorial-cream/70">Joining is optional. Your introduction goes ahead either way.</p>
        <a href="/" className="mt-4 inline-block rounded bg-editorial-copper px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-editorial-cream">
          Join the community
        </a>
      </div>
    </>
  );
}