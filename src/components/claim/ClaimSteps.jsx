import { Search, Mail, ShieldCheck } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Find your profile', body: 'Search the record by your name.' },
  { icon: Mail, title: 'Instant match', body: 'If your sign-in email or LinkedIn matches the record, the claim is approved at once.' },
  { icon: ShieldCheck, title: 'Otherwise, review', body: 'Our team confirms it is you, usually within a few days.' },
];

// How claiming works, in three plain lines.
export default function ClaimSteps() {
  return (
    <ol className="grid gap-2">
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex gap-3 border border-editorial-copper/30 bg-white p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-editorial-navy font-heading text-xs text-editorial-cream">{i + 1}</span>
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-editorial-navy"><s.icon className="h-3.5 w-3.5 text-editorial-copper" />{s.title}</span>
            <span className="block text-xs text-editorial-navy/70">{s.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}