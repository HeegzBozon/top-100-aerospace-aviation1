import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Inbox } from 'lucide-react';

const TRACKS = { women: 'TOP 100 Women', men: 'TOP 100 Men', angels: 'TOP 100 Angels' };

// Admin-only: every nomination linked to this nominee, read from NominationIntake.
export default function NominationHistoryPanel({ nomineeId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.NominationIntake.filter({ nominee_id: nomineeId }, '-created_date')
      .then(setItems).catch((e) => setError(e.message));
  }, [nomineeId]);

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Nomination History {items && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#C9A87C]/40 text-[#1E3A5A]">{items.length}</span>}
      </h3>
      {error ? <p className="text-sm text-red-600">{error}</p>
        : !items ? <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#C9A87C]" /></div>
        : items.length === 0 ? (
          <div className="rounded-lg bg-[#FAF8F5] border border-dashed border-[#C9A87C]/40 py-6 text-center text-sm text-gray-500">
            <Inbox className="w-6 h-6 mx-auto mb-2 text-[#C9A87C]" /> No linked nominations. This record was imported or rolled over.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                  <span className="font-semibold text-[#1E3A5A]">{TRACKS[i.nomination_type] || i.nomination_type}</span>
                  <span>by {i.nominator_name || i.nominator_email} ({i.nominator_email})</span>
                  <span>{new Date(i.created_date).toLocaleDateString()}</span>
                  {i.source === 'legacy_nomination' && <span className="text-[#B87333]">migrated</span>}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{i.reason || 'No reason provided.'}</p>
              </div>
            ))}
          </div>
        )}
    </section>
  );
}