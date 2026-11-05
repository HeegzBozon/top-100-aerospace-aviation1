// The desk's own keys. A tab that has not opened yet is still printed — struck as
// "soon" in rose gold — because a desk with an empty chair reads as a house with more
// to come, not as a house with nothing in it.
//
// On a phone the keys lie in one strip that the thumb slides along, rather than folding
// onto a second line: the desk keeps its head to itself, and every key stands at the
// height a thumb can find without looking.
export default function DeskTabs({ tabs, value, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className="flex w-max min-w-full items-center gap-0.5 rounded-md p-0.5"
        style={{ border: '1px solid rgba(201,168,124,0.26)', background: 'rgba(6,12,20,0.5)' }}
      >
        {tabs.map((tab) => {
          const active = value === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              aria-current={active ? 'page' : undefined}
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors sm:min-h-0"
              style={
                active
                  ? { background: '#8f5c2c', color: '#fdf8f0' }
                  : { color: tab.soon ? 'rgba(201,168,124,0.8)' : '#7d94aa' }
              }
            >
              {tab.label}
              {tab.soon && (
                <span
                  className="text-[8px] tracking-[0.14em]"
                  style={{ color: active ? 'rgba(253,248,240,0.72)' : 'rgba(201,168,124,0.65)' }}
                >
                  soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}