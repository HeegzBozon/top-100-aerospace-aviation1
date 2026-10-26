import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

// Admin-only export strip on the published edition. Each button is named for the
// surface whose data it writes out: the "Notify Me" waitlist, the claim requests
// on the roster, and the nomination submissions the roster was built from.
// Provenance for the record only — never read by discovery, ranking or scoring.
const EXPORTS = [
  {
    key: 'waitlist',
    label: '"Notify Me" waitlist',
    hint: 'Every Orbital Index signup, with the surface it came from.',
    filename: 'notify_me_waitlist',
    invoke: () => base44.functions.invoke('exportPublicationLedger', { dataset: 'waitlist' }),
  },
  {
    key: 'claims',
    label: 'Is this you? Claim & verify your profile',
    hint: 'Claim requests behind the roster, and how each one was resolved.',
    filename: 'top100_women_profile_claims',
    invoke: ({ nomineeIds, claimsAll }) => base44.functions.invoke('exportPublicationLedger', claimsAll
      ? { dataset: 'claims' }
      : { dataset: 'claims', nominee_ids: nomineeIds }),
  },
  {
    key: 'submissions',
    label: 'The nomination submissions behind the roster',
    hint: 'One row per submission, exactly as the nominator filed it.',
    filename: 'top100_women_nomination_submissions',
    invoke: () => base44.functions.invoke('exportNominationSubmissions', { nomination_type: 'women' }),
  },
];

function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PublicationExportPanel({ nominees = [], user }) {
  const [busy, setBusy] = useState(null);
  const [claimsAll, setClaimsAll] = useState(false);
  const { toast } = useToast();

  // Waitlist and claim rows carry personal contact details — admins only.
  if (user?.role !== 'admin') return null;

  const handleExport = async (entry) => {
    setBusy(entry.key);
    try {
      const data = (await entry.invoke({ nomineeIds: nominees.map((n) => n.id), claimsAll })).data;
      if (!data?.csv) {
        toast({ variant: 'destructive', title: 'Nothing to export yet', description: data?.error || entry.label });
        return;
      }
      downloadCsv(data.csv, entry.filename);
      // Anonymous nominators are counted out loud so the identity rule is seen
      // at the moment the file leaves the platform.
      const anonymousNote = data.anonymous ? ` · ${data.anonymous} anonymous nominator${data.anonymous === 1 ? '' : 's'}` : '';
      toast({ title: 'Export ready', description: `${data.count} row${data.count === 1 ? '' : 's'}${anonymousNote} · ${entry.label}` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Export failed', description: error?.response?.data?.error || error.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 md:px-12">
      <div
        className="rounded-xl border p-5 md:p-6"
        style={{ background: brandColors.cream, borderColor: `${brandColors.goldPrestige}66` }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brandColors.navyDeep }}>
            Publication exports
          </h3>
          <span className="text-[11px]" style={{ color: `${brandColors.ink}99` }}>
            Admin only · {nominees.length} honorees in this edition
          </span>
        </div>
        <p className="mt-2 text-sm" style={{ color: `${brandColors.ink}cc` }}>
          One CSV per surface. Waitlist and claim rows hold personal contact details, so they stay inside the admin view. Nominator rows carry
          their own consent flag — rows marked ANONYMOUS must not leave the platform.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {EXPORTS.map((entry) => (
            <Button
              key={entry.key}
              variant="outline"
              onClick={() => handleExport(entry)}
              disabled={busy !== null}
              className="h-auto flex-col items-start gap-1 whitespace-normal rounded-lg px-4 py-3 text-left"
              style={{ borderColor: `${brandColors.goldPrestige}80`, background: 'white', color: brandColors.navyDeep }}
            >
              <span className="flex w-full items-center gap-2 text-sm font-semibold">
                {busy === entry.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {entry.label}
              </span>
              <span className="text-[11px] font-normal leading-snug" style={{ color: `${brandColors.ink}99` }}>
                {entry.hint}
              </span>
            </Button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: `${brandColors.goldPrestige}40` }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: brandColors.navyDeep }}>
            Claim ledger scope
          </span>
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: `${brandColors.goldPrestige}80` }}>
            <button
              type="button"
              onClick={() => setClaimsAll(false)}
              disabled={busy !== null}
              className="px-3 py-1.5 text-xs font-medium"
              style={{ background: claimsAll ? 'white' : brandColors.navyDeep, color: claimsAll ? brandColors.navyDeep : 'white' }}
            >
              This edition&apos;s roster ({nominees.length})
            </button>
            <button
              type="button"
              onClick={() => setClaimsAll(true)}
              disabled={busy !== null}
              className="px-3 py-1.5 text-xs font-medium"
              style={{ background: claimsAll ? brandColors.navyDeep : 'white', color: claimsAll ? 'white' : brandColors.navyDeep }}
            >
              All historic claims
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}