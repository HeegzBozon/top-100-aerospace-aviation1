// One section of the record: a copper rule across its head, a small-caps label,
// then whatever the section holds. The sections rise in sequence as the page is
// read, so the dossier assembles itself rather than appearing whole.
export default function DossierSection({ label, delay = 0, children }) {
  return (
    <section className="pd-sec pd-rise" style={{ animationDelay: `${delay}s` }}>
      <h2 className="pd-label mb-6">{label}</h2>
      {children}
    </section>
  );
}