import { Download, LayoutGrid, Loader2, PenLine, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// The account keys, set at the foot of the record: the way back to the OS, the
// presentation settings for the public deck, the studio that writes the record,
// and the copy of everything the platform holds.
export default function ProfileAccountRow({ onOpenStudio, onOpenPresentation, onExport, exporting }) {
  return (
    <div className="mx-6 flex flex-wrap items-center justify-end gap-3 border-t-2 border-editorial-copper pt-9 pb-24 lg:mx-40 lg:gap-9 lg:pb-[120px]">
      <Link to="/board" className="pd-acct-link">
        <LayoutGrid className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <button type="button" onClick={onOpenPresentation} className="pd-acct-link">
        <Settings2 className="h-3.5 w-3.5" /> Presentation
      </button>
      <button type="button" onClick={onOpenStudio} className="pd-acct-link">
        <PenLine className="h-3.5 w-3.5" /> Update record
      </button>
      <button type="button" onClick={onExport} disabled={exporting} className="pd-acct-link">
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {exporting ? 'Exporting' : 'Download my data'}
      </button>
    </div>
  );
}