import { B } from '@/components/fellow-home/fellowHomeConfig';
import DocumentPill from '@/components/fellow-home/DocumentPill';
import LinkedInPill from '@/components/fellow-home/LinkedInPill';

// Documents slide — the CommonApp for aerospace professionals. Resume,
// cover letter, portfolio, and LinkedIn connection. All optional, all
// uploadable, all persistent across sessions. Bring what you have.
export default function DocumentsSlide({ user, accent, onUserUpdate }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div className="text-center px-6 max-w-xl w-full py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: B.muted }}>
          Documents
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Bring your materials
        </h2>
        <p className="text-sm mb-10 leading-relaxed max-w-md mx-auto" style={{ color: B.muted }}>
          Upload once — we keep everything on file so you never re-upload it again. Bring what you have, skip what you don't.
        </p>

        <div className="flex flex-col items-center gap-3">
          <DocumentPill field="resume_url" label="Resume" user={user} accent={accent} onUserUpdate={onUserUpdate} />
          <DocumentPill field="cover_letter_url" label="Cover Letter" user={user} accent={accent} onUserUpdate={onUserUpdate} />
          <DocumentPill field="portfolio_url" label="Portfolio" user={user} accent={accent} onUserUpdate={onUserUpdate} accept=".pdf,.png,.jpg,.jpeg" />
          <LinkedInPill user={user} accent={accent} onUserUpdate={onUserUpdate} />
        </div>
      </div>
    </section>
  );
}