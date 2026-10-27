// The rack on the machine's chin: which pack the desk is dressed from, and the
// colours in it. The Console pack holds a single swatch, because its colour is not
// chosen here — it is whatever the handheld is wearing, and picking it hands the
// machine back to the device.
export default function ImacColourRack({ pack, packs, options, finishKey, onChoosePack, onChoose }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1" role="group" aria-label="Colour pack">
        {packs.map((option) => {
          const on = option.key === pack.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChoosePack(option.key)}
              data-on={on}
              aria-pressed={on}
              title={option.note}
              className="imac-packkey"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <span
        className="h-4 w-px flex-none"
        style={{ background: "var(--imac-ink-soft)", opacity: 0.35 }}
        aria-hidden="true"
      />

      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChoose(option.key)}
          data-on={option.key === finishKey}
          aria-label={option.label}
          title={option.note}
          className="imac-colour"
          style={{
            background: `linear-gradient(150deg, ${option.swatch[0]} 0%, ${option.swatch[1]} 100%)`,
          }}
        />
      ))}
    </div>
  );
}