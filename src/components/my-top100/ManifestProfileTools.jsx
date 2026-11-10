import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RECORD_SURFACES, recordUrl } from '@/components/record/recordMenu';

// The workbench, kept in the margin of the Manifest.
//
// The record is what the Manifest is drawn from, so the keys that edit it stand beside the
// list rather than behind another door: each row opens one surface of the Fellow's own
// record at its checklist — what is in place, what is still missing, and the one way to add
// it. The surfaces are the canonical six the record itself is read as, so a key can never
// name a part of the record that does not exist. Nothing is fetched: the margin stays quiet
// while the list is being worked.
export default function ManifestProfileTools({ className = '' }) {
  return (
    <div className={className}>
      <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        Profile editing tools
      </p>
      <div className="mt-2 h-[2px] w-10 bg-editorial-copper" aria-hidden="true" />

      <ul className="mt-1 border-b border-editorial-navy/10">
        {RECORD_SURFACES.map((surface) => {
          const Icon = surface.icon;
          return (
            <li key={surface.key} className="border-t border-editorial-navy/10 first:border-t-0">
              <Link
                to={recordUrl(surface.key)}
                className="group flex items-start gap-2.5 py-2 transition-colors hover:bg-editorial-copper/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
              >
                <span className="mt-[2px] w-4 shrink-0 font-heading text-[10px] text-editorial-navy/30 tabular-nums">
                  {surface.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      className="h-3 w-3 shrink-0 text-editorial-copper"
                      aria-hidden="true"
                    />
                    <span className="truncate font-body text-[11px] font-semibold text-editorial-navy">
                      {surface.label}
                    </span>
                    <ArrowRight
                      className="ml-auto h-3 w-3 shrink-0 text-editorial-navy/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-editorial-copper"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 block truncate font-body text-[8.5px] uppercase tracking-[0.12em] text-editorial-navy/40">
                    {surface.hint}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        to={recordUrl('view')}
        className="mt-2.5 inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-navy/55 transition-colors hover:text-editorial-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
      >
        Open my record <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}