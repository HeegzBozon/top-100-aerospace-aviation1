// The desk's own keys. A tab that has not opened yet is still printed — struck as
// "soon" in rose gold — because a desk with an empty chair reads as a house with more
// to come, not as a house with nothing in it.
export default function DeskTabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-0.5 rounded-md p-0.5"
        style={{ border: '1px solid rgba(201,168,124,0.26)', background: 'rgba(6,12,20,0.5)' }}
      >
        {tabs.map((tab) => {
          const active = value === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="inline-flex items-center gap-1.5 rounded px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors"
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