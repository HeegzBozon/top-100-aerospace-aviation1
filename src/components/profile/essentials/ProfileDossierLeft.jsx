import DossierSection from './DossierSection';

// The record itself, read down the left column: what the Fellow does, where they
// have done it, and where they studied it. Dates sit in a plate at the head of
// each entry, the way a printed dossier sets them.
const years = (start, end) => {
  const from = start ? String(start).slice(0, 4) : '';
  const to = end ? String(end).slice(0, 4) : 'present';
  if (!from && !end) return '—';
  return `${from || '—'}–${to}`;
};

const Empty = ({ children }) => (
  <p className="font-body text-sm italic text-editorial-navy/50">{children}</p>
);

export default function ProfileDossierLeft({ nominee }) {
  const bio = nominee?.bio_extended || nominee?.bio || nominee?.description || '';
  const career = Array.isArray(nominee?.career_history) ? nominee.career_history : [];
  const education = Array.isArray(nominee?.education) ? nominee.education : [];

  return (
    <div>
      <DossierSection label="Biography" delay={0.4}>
        {bio ? (
          <p className="font-body text-[15px] leading-[1.85] text-editorial-navy/85">{bio}</p>
        ) : (
          <Empty>No biography on record yet. Update your record to add one.</Empty>
        )}
      </DossierSection>

      <DossierSection label="Career History" delay={0.55}>
        {career.length === 0 && <Empty>No career history on record yet.</Empty>}
        {career.map((entry, index) => (
          <div
            key={`${entry.company_name || 'role'}-${index}`}
            className="mb-9 grid grid-cols-[92px_1fr] gap-6 lg:grid-cols-[140px_1fr] lg:gap-[30px]"
          >
            <div className="pd-plate flex items-center justify-center px-2 text-center font-body text-[11px] uppercase tracking-[0.12em] text-editorial-navy/70">
              {years(entry.start_date, entry.end_date)}
            </div>
            <div>
              <h3 className="font-heading text-xl leading-tight text-editorial-navy lg:text-2xl">
                {entry.role_title || 'Role'}
              </h3>
              {entry.company_name && (
                <p className="mt-1 font-body text-[13px] uppercase tracking-[0.12em] text-editorial-navy/60">
                  {entry.company_name}
                </p>
              )}
              {entry.description && (
                <p className="mt-3 font-body text-[14px] leading-relaxed text-editorial-navy/75">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </DossierSection>

      <DossierSection label="Education" delay={0.7}>
        {education.length === 0 && <Empty>No education on record yet.</Empty>}
        {education.map((entry, index) => (
          <div
            key={`${entry.institution_name || 'school'}-${index}`}
            className="mb-9 grid grid-cols-[92px_1fr] gap-6 lg:grid-cols-[140px_1fr] lg:gap-[30px]"
          >
            <div className="pd-plate flex items-center justify-center px-2 text-center font-body text-[11px] uppercase tracking-[0.12em] text-editorial-navy/70">
              {entry.graduation_date ? String(entry.graduation_date).slice(0, 4) : '—'}
            </div>
            <div>
              <h3 className="font-heading text-xl leading-tight text-editorial-navy lg:text-2xl">
                {entry.institution_name || 'Institution'}
              </h3>
              <p className="mt-1 font-body text-[13px] uppercase tracking-[0.12em] text-editorial-navy/60">
                {[entry.degree, entry.field_of_study].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </DossierSection>
    </div>
  );
}