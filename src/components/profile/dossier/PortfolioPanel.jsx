import DocumentPill from '@/components/fellow-home/DocumentPill';
import LinkedInPill from '@/components/fellow-home/LinkedInPill';

// Portfolio: the documents a Fellow brings. Held on the account, uploaded once and
// reused across applications and editions, so the section is its own editor — every
// pill adds, replaces or removes its own file in place.
export default function PortfolioPanel({ user, accent, onUserUpdate }) {
  return (
    <div className="space-y-5">
      <p className="max-w-xl font-body text-[13px] leading-relaxed text-editorial-navy/70">
        Bring what you have and skip what you don&rsquo;t. Everything here is kept on file
        once, and reused wherever the platform needs it.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <DocumentPill
          field="resume_url"
          label="Resume"
          user={user}
          accent={accent}
          onUserUpdate={onUserUpdate}
        />
        <DocumentPill
          field="cover_letter_url"
          label="Cover letter"
          user={user}
          accent={accent}
          onUserUpdate={onUserUpdate}
        />
        <DocumentPill
          field="portfolio_url"
          label="Portfolio"
          user={user}
          accent={accent}
          onUserUpdate={onUserUpdate}
          accept=".pdf,.png,.jpg,.jpeg"
        />
        <LinkedInPill user={user} accent={accent} onUserUpdate={onUserUpdate} />
      </div>
    </div>
  );
}