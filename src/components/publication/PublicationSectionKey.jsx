import { publicationBrand as brandColors } from './publicationConfig';

// One key of the publication's contents. A key, not a card: its place in the index and
// the section's name, inside a moulded rectangle that lifts under the finger. data-hh-key
// is what lets the console's ring land on the key the wheel has walked to, and the key
// under the cursor is lit — so the index reads as a menu the wheel is driving.
export default function PublicationSectionKey({ item, selected, onOpen }) {
  return (
    <button
      type="button"
      data-hh-key={item.key}
      onClick={onOpen}
      aria-current={selected ? 'true' : undefined}
      className="relative flex min-h-[66px] flex-col justify-between overflow-hidden rounded-[11px] border p-2.5 text-left transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.985] focus-visible:outline-none"
      style={{
        background: selected ? 'white' : 'rgba(255,255,255,0.62)',
        borderColor: selected ? 'rgb(201 168 124 / 0.85)' : `${brandColors.ink}18`,
        boxShadow: selected
          ? `inset 0 0 0 1px rgb(201 168 124 / 0.42), 0 8px 20px rgba(30,58,90,0.16)`
          : '0 1px 2px rgba(30,58,90,0.05)',
        transform: selected ? 'translateY(-1px)' : undefined,
      }}
    >
      <span
        className="font-heading text-[10px] leading-none"
        style={{ color: selected ? brandColors.goldPrestige : `${brandColors.ink}40` }}
      >
        {item.index}
      </span>
      <span className="font-heading text-[13.5px] font-semibold leading-tight" style={{ color: brandColors.navyDeep }}>
        {item.name}
      </span>
    </button>
  );
}