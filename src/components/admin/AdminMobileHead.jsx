import { ChevronDown, LayoutGrid, Search } from 'lucide-react';

// The portal's own head on a phone.
//
// The desk machine has a bar across its picture; the handheld does not, so the console
// prints one: the section it is standing in, the surface being read inside it, and the two
// keys a thumb reaches for — the index of the building, and the search. It holds its place
// across the top of the glass while the desk under it rolls, so an operator is never more
// than one press from anywhere, and never has to scroll back up to find out where they are.
export default function AdminMobileHead({ section, tab, onOpenSections, onOpenSearch }) {
  const Glyph = section?.icon || LayoutGrid;

  return (
    <div
      className="sticky top-0 z-30 md:hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(9,17,27,0.97) 0%, rgba(9,17,27,0.93) 100%)',
        boxShadow: 'inset 0 -1px 0 rgba(201,168,124,0.22)',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-stretch gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={onOpenSections}
          aria-haspopup="dialog"
          aria-label={`Open the sections — now in ${section?.label || 'Mission Control'}, ${tab?.label || ''}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left active:bg-white/5"
          style={{ minHeight: 40 }}
        >
          <span
            className="flex h-7 w-7 flex-none items-center justify-center rounded"
            style={{ background: 'rgba(201,168,124,0.13)', color: '#c9a87c' }}
          >
            <Glyph className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate text-[8px] font-bold uppercase leading-none tracking-[0.24em]"
              style={{ color: '#7d94aa' }}
            >
              {section?.label || 'Mission Control'}
            </span>
            <span
              className="mt-1 flex items-baseline gap-1 truncate text-[13px] font-semibold leading-none"
              style={{ color: '#f5efe4' }}
            >
              <span className="truncate">{tab?.label || 'Section'}</span>
              <ChevronDown className="h-3 w-3 flex-none" style={{ color: '#c9a87c' }} />
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSections}
          aria-label="All sections"
          className="flex w-10 flex-none items-center justify-center rounded-md active:bg-white/5"
          style={{ color: '#c9a87c' }}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search the console"
          className="flex w-10 flex-none items-center justify-center rounded-md active:bg-white/5"
          style={{ color: '#7d94aa' }}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}