import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AEROSYNC_ACTIONS, AEROSYNC_MENU } from './aeroSyncMenuConfig';

// The two the title screen asks for, read as one row above the keys. Each is a shortcut
// onto a key the grid already carries, so the wheel's cursor lights the pill it is
// standing on — press A and the capture opens without walking the menu. Copper fills the
// primary press, as it does on every other button the institution owns.
export default function AeroSyncActions({ cursorKey }) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 md:mt-3">
      {AEROSYNC_ACTIONS.map((action, position) => {
        const item = AEROSYNC_MENU.find((entry) => entry.key === action.key);
        if (!item) return null;
        const selected = cursorKey === item.key;
        const primary = position === 0;

        return (
          <Link
            key={action.key}
            to={item.to}
            aria-current={selected ? 'true' : undefined}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.18em] transition-[transform,box-shadow] duration-200 active:scale-95 md:text-[9.5px]"
            style={
              primary
                ? {
                    color: selected ? '#16293F' : 'rgb(240 220 196 / 0.95)',
                    background: selected ? 'rgba(184,115,51,0.95)' : 'rgba(184,115,51,0.18)',
                    boxShadow: selected
                      ? '0 0 0 1px rgba(184,115,51,0.8), 0 6px 16px rgba(3,6,13,0.4)'
                      : 'inset 0 0 0 1px rgba(184,115,51,0.55)',
                  }
                : {
                    color: selected ? '#16293F' : 'rgb(var(--editorial-cream-rgb) / 0.82)',
                    background: selected ? 'rgb(var(--editorial-gold-rgb) / 0.92)' : 'rgb(var(--editorial-cream-rgb) / 0.08)',
                    boxShadow: selected
                      ? '0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.7), 0 6px 16px rgba(3,6,13,0.4)'
                      : 'inset 0 0 0 1px rgb(var(--editorial-cream-rgb) / 0.22)',
                  }
            }
          >
            {action.label}
            {primary ? <ArrowRight className="h-[9px] w-[9px]" /> : null}
          </Link>
        );
      })}
    </div>
  );
}