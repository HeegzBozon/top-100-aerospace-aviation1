import { FileText, ArrowUpRight, FolderOpen } from 'lucide-react';

const DOCUMENTS = [
  { field: 'resume_url', label: 'Résumé' },
  { field: 'cover_letter_url', label: 'Cover letter' },
  { field: 'portfolio_url', label: 'Portfolio' },
  { field: 'linkedin_pdf_url', label: 'LinkedIn profile' },
];

// What the Fellow has placed on file, held as a plain ledger of documents an
// enquirer can open — no upload affordance sits on a public record, and nothing
// here is generated for them.
export default function DocumentsModule({ user }) {
  const documents = DOCUMENTS.map((doc) => ({ ...doc, url: user?.[doc.field] })).filter((doc) => !!doc.url);
  const profileUrl = user?.linkedin_profile_url || '';

  if (!documents.length && !profileUrl) {
    return (
      <div className="border border-dashed border-editorial-copper/40 px-6 py-10 text-center">
        <FolderOpen className="mx-auto h-6 w-6 text-editorial-copper/60" strokeWidth={1.6} />
        <p className="mt-4 font-heading text-[19px] text-editorial-navy">No materials on file.</p>
        <p className="mx-auto mt-2 max-w-sm font-body text-[12px] leading-relaxed text-editorial-navy/55">
          Documents are placed by the Fellow themselves. An enquirer can always write through the inquiry desk instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-editorial-copper/20 border-y border-editorial-copper/20">
        {documents.map((doc) => (
          <li key={doc.field}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-editorial-sand/60"
            >
              <FileText className="h-4 w-4 shrink-0 text-editorial-copper" strokeWidth={1.7} />
              <span className="flex-1 font-heading text-[17px] text-editorial-navy">{doc.label}</span>
              <span className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45 transition-colors group-hover:text-editorial-copper">
                Open
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-editorial-navy/35 transition-colors group-hover:text-editorial-copper" />
            </a>
          </li>
        ))}
        {profileUrl && (
          <li>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-editorial-sand/60"
            >
              <FileText className="h-4 w-4 shrink-0 text-editorial-copper" strokeWidth={1.7} />
              <span className="flex-1 font-heading text-[17px] text-editorial-navy">LinkedIn</span>
              <span className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45 transition-colors group-hover:text-editorial-copper">
                Open
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-editorial-navy/35 transition-colors group-hover:text-editorial-copper" />
            </a>
          </li>
        )}
      </ul>
      <p className="mt-4 font-body text-[11px] leading-relaxed text-editorial-navy/50">
        Materials are held on file by the Fellow and reused across every enquiry. They are never scored.
      </p>
    </div>
  );
}