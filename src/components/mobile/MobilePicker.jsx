import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

// A choice made with a thumb.
//
// The desk answers a filter with a dropdown hanging off the control; a phone answers it
// with a sheet rising from the foot of the glass, where the rows are full width and the
// hand already is. Same value, same options, same onChange — only the way it is reached
// changes, so the surface keeps one piece of state whichever machine it is on.
export default function MobilePicker({ label, value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  const choose = (next) => {
    onChange?.(next);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-left text-sm text-[var(--foreground)] ${className}`}
      >
        <span className="truncate">{current?.label ?? label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </button>

      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerContent className="border-[var(--border)] bg-[var(--card)]">
          <DrawerHeader className="pb-1 text-left">
            <DrawerTitle className="font-heading text-lg text-editorial-navy">{label}</DrawerTitle>
          </DrawerHeader>
          <div
            role="listbox"
            aria-label={label}
            className="max-h-[58vh] overflow-y-auto px-2 pb-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-[13.5px] ${
                    active ? 'text-editorial-navy' : 'text-[var(--muted)]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-editorial-copper" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}