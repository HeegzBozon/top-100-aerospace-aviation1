import { ShieldCheck } from 'lucide-react';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';

export default function SelectionIntegrityLine() {
  return (
    <div
      className="mx-auto mb-12 flex max-w-3xl items-start gap-3 rounded-2xl border p-5"
      style={{ borderColor: `${GOLD}40`, background: `${GOLD}08` }}
    >
      <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: GOLD }} />
      <p
        className="text-sm leading-6"
        style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
      >
        <strong>Membership provides access to tools and community. It confers no
        advantage in any TOP 100 selection process.</strong> Nominating is free
        forever — charging for it, or advantaging paid nominations, would poison
        the input.
      </p>
    </div>
  );
}