import { Loader2 } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';
import { RackEmpty } from '@/components/newsstand/NewsstandRack';
import WireRow from '@/components/newsstand/WireRow';

const SOURCE_NAMES = { linkedin: 'LinkedIn' };

// The rack the house page is set on. A network that is unreachable, or one whose account has
// not been connected, is named quietly under the rack rather than taking the papers that did
// come through off the stand.
export default function WireRack({ rack, items, wire, cursorKey, registerRef, onFocus, onOpen }) {
  if (wire.loading && !items.length) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  const missing = (wire.sources || []).filter((source) => !source.ok);

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.key} ref={(node) => registerRef?.(item, node)}>
          <WireRow
            item={item}
            index={index}
            focused={cursorKey === item.key}
            onFocus={() => onFocus?.(item.key)}
            onOpen={() => onOpen?.(item)}
          />
        </div>
      ))}

      {items.length ? null : (
        <p className="py-8 text-[11px]" style={{ color: C.muted }}>
          {wire.error || rack.empty}
        </p>
      )}

      {missing.length ? (
        <p className="mt-3 text-[9.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.42)' }}>
          {missing.map((source) => SOURCE_NAMES[source.key] || source.key).join(' and ')}{' '}
          {missing.length > 1 ? 'are' : 'is'} not on the wire yet.
        </p>
      ) : null}
    </div>
  );
}