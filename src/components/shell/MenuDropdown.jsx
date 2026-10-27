// The menu, dropped from the bar. On a desk there is no wheel, so the pointer is
// the hand: the groups the machine can reach, the surface you are standing on marked
// Now, and a click-catcher behind the panel that puts it away — the same walk the
// console's cartridge menu gives the ring on the glass.
export default function MenuDropdown({ open, groups, locationKey, onGo, onClose }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[38]" onClick={onClose} aria-hidden="true" />

      <div className="mb-drop z-[39]" role="menu" aria-label="Menu">
        {groups.map((group) => (
          <div key={group.key} className="px-1.5 py-1.5">
            <p
              className="px-2 pb-1 text-[7.5px] font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--mb-ink-soft)" }}
            >
              {group.label}
            </p>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = !!item.to && item.to === locationKey;

              return (
                <button
                  key={`${group.key}-${item.label}`}
                  type="button"
                  role="menuitem"
                  onClick={() => onGo(item)}
                  className="mb-drop-item flex w-full items-center gap-2 rounded-[7px] px-2 py-[7px] text-left"
                >
                  {Icon ? (
                    <Icon
                      className="h-[13px] w-[13px] shrink-0"
                      style={{ color: isActive ? "var(--mb-lamp)" : "var(--mb-ink-soft)" }}
                    />
                  ) : null}

                  <span
                    className="flex-1 truncate text-[12px] font-semibold leading-none"
                    style={{ color: isActive ? "var(--mb-ink-strong)" : "var(--mb-ink)" }}
                  >
                    {item.label}
                  </span>

                  {isActive ? (
                    <span
                      className="shrink-0 text-[7px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: "var(--mb-lamp)" }}
                    >
                      Now
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}