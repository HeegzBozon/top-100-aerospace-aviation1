import { ExternalLink } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Tear-out inserts. The Fellow's professional links rendered as removable
// cards — LinkedIn, website, and additional links from the nominee record.
export default function DocumentsSpread({ nominee, accent }) {
  const links = [
    nominee?.linkedin_profile_url && { label: 'LinkedIn', url: nominee.linkedin_profile_url },
    nominee?.website_url && { label: 'Website', url: nominee.website_url },
    ...(nominee?.additional_links || []).map((url) => ({ label: 'Reference', url })),
  ].filter(Boolean);

  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>Documents</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Tear-outs</span>
      </div>

      <div className="h-px w-16 mb-6" style={{ background: accent }} />

      {links.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm italic" style={{ color: 'rgba(30,58,90,0.4)' }}>
            No documents linked yet.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 transition-all hover:shadow-md"
              style={{
                background: 'rgba(30,58,90,0.03)',
                border: '1px solid rgba(30,58,90,0.1)',
                borderLeft: `3px solid ${accent}`,
              }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: B.navy }}>{link.label}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(30,58,90,0.5)' }}>{link.url}</p>
              </div>
              <ExternalLink className="h-4 w-4 flex-shrink-0 ml-3" style={{ color: accent }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}