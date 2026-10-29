import DossierSection from './DossierSection';
import DossierEmpty from './DossierEmpty';

// Resume: what the Fellow has done and where they studied it. Dates sit in a plate
// at the head of each entry, the way a printed CV sets them.
const years = (start, end) => {
  const from = start ? String(start).slice(0, 4) : '';
  const to = end ? String(end).slice(0, 4) : 'present';
  if (!from && !end) return '—';
  return `${from || '—'}–${to}`;
};

const Entry = ({ plate, title, line, note }) => (
  <div className="mb-9 grid grid-cols-[92px_1fr] gap-6 lg:grid-cols-[140px_1fr] lg:gap-[30px]">
    <div className="pd-plate flex items-center justify-center px-2 text-center font-body text-[11px] uppercase tracking-[0.12em] text-editorial-navy/70">
      {plate}
    </div>
    <div>
      <h4 className="font-heading text-xl leading-tight text-editorial-navy lg:text-2xl">{title}</h4>
      {line && (
        <p className="mt-1 font-body text-[13px] uppercase tracking-[0.12em] text-editorial-navy/60">
          {line}
        </p>
      )}
      {note && (
        <p className="mt-3 font-body text-[14px] leading-relaxed text-editorial-navy/75">{note}</p>
      )}
    </div>
  </div>
);

export default function ProfileResume({ nominee, bare = false }) {
  const career = Array.isArray(nominee?.career_history) ? nominee.career_history : [];
  const education = Array.isArray(nominee?.education) ? nominee.education : [];

  const body = (
    <>
      <h3 className="pd-label mb-5">Experience</h3>
      {career.length === 0 && <DossierEmpty>No work history yet.</DossierEmpty>}
      {career.map((entry, index) => (
        <Entry
          key={`${entry.company_name || 'role'}-${index}`}
          plate={years(entry.start_date, entry.end_date)}
          title={entry.role_title || 'Role'}
          line={entry.company_name}
          note={entry.description}
        />
      ))}

      <h3 className="pd-label mb-5 mt-12">Education</h3>
      {education.length === 0 && <DossierEmpty>No education yet.</DossierEmpty>}
      {education.map((entry, index) => (
        <Entry
          key={`${entry.institution_name || 'school'}-${index}`}
          plate={entry.graduation_date ? String(entry.graduation_date).slice(0, 4) : '—'}
          title={entry.institution_name || 'Institution'}
          line={[entry.degree, entry.field_of_study].filter(Boolean).join(' · ')}
        />
      ))}
    </>
  );

  // Inside the Dossier the resume reads as one part of a longer column, so it is
  // rendered bare; on its own it keeps its own ruled heading.
  return bare ? body : <DossierSection label="Resume" delay={0.55}>{body}</DossierSection>;
}