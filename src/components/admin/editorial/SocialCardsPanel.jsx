import { Share2, Images, ExternalLink } from 'lucide-react';

const TOOLS = [
  {
    href: '/og-card-generator',
    title: 'OG Card Generator',
    label: 'Social cards',
    description: 'Preview a single honoree card, then compose and store the 1200×630 social card for every honoree.',
    icon: Share2,
  },
  {
    href: '/women-collage-generator',
    title: 'Collage Generator',
    label: 'Series collage',
    description: 'Compose and download the duotone series collage from the published Top 100 Women snapshot.',
    icon: Images,
  },
];

export default function SocialCardsPanel() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-copper font-bold">Editorial · Social</p>
        <h2 className="font-heading text-3xl text-editorial-navy mt-1">Social Cards</h2>
        <p className="text-sm text-editorial-navy/60 mt-1">
          The deterministic card tools that build share artifacts for the series. Neither tool feeds measurement.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map(({ href, title, label, description, icon: Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[#1e3a5a]/5 to-[#c9a87c]/10 hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5a] to-[#4a90b8] flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)]">{title}</h3>
                <p className="text-xs text-[var(--muted)]">{label}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--muted)] ml-auto" />
            </div>
            <p className="text-sm text-[var(--muted)]">{description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}