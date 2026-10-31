import { BADGE_TEMPLATES } from './badgeTemplates';

// The plate drawer.
//
// Every badge ever handed out was picked from a drawer of stocks, not mixed at the desk:
// so the drawer is printed on the surface, five finishes wide, and the choice is a press
// rather than a colour picker. The code key is the same idea — a printed feature the
// Fellow turns on or off, not a setting buried in a form.
export default function BadgeTemplateDeck({ value, onChange, showQr, onToggleQr }) {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-1.5">
        <p className="font-body text-[8px] font-bold uppercase tracking-[0.26em] text-editorial-gold/75">Plate</p>
        <button
          type="button"
          onClick={onToggleQr}
          aria-pressed={showQr}
          className="font-body text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-cream/60 transition-colors hover:text-editorial-cream"
        >
          Code {showQr ? 'on' : 'off'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {BADGE_TEMPLATES.map((template) => {
          const active = template.key === value;
          return (
            <button
              key={template.key}
              type="button"
              onClick={() => onChange(template.key)}
              aria-pressed={active}
              className="shrink-0 text-left"
            >
              <span
                className="block h-7 w-12 rounded-[5px]"
                style={{
                  background: template.stock,
                  boxShadow: active
                    ? '0 0 0 2px #C9A87C, inset 0 1px 0 rgba(255,255,255,0.2)'
                    : `inset 0 0 0 1px ${template.edge}`,
                }}
              />
              <span
                className="mt-1 block font-body text-[7px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: active ? '#FAF8F5' : 'rgba(250,248,245,0.42)' }}
              >
                {template.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}