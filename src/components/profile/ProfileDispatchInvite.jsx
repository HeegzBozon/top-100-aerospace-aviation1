import DispatchInvite from '@/components/newsletter/DispatchInvite';

// The Dispatch, met at the foot of a public record.
//
// It is the same band, the same copy and the same field the reader meets on the signup
// page and on both viral volumes — this only names where it was met, so the funnel desk
// can count the record apart from the rest. One invitation, once, below everything the
// record says: never inside it, never between its modules.
export default function ProfileDispatchInvite() {
  return (
    <section
      aria-label="The Dispatch"
      className="bg-editorial-cream px-4 pb-12 pt-10 sm:px-7 md:bg-[#0B1826] md:pb-16 md:pt-12"
    >
      <div className="mx-auto max-w-2xl">
        <DispatchInvite entryPoint="profile" tone="cream" />
      </div>
    </section>
  );
}