// The designed empty state a section of the record falls back to. Never a blank
// space: it says what is missing and how to put it there.
export default function DossierEmpty({ children }) {
  return (
    <p className="font-body text-sm italic text-editorial-navy/50">{children}</p>
  );
}