import ToggleSwitch from "./ToggleSwitch";

// A bank of switches. The bank holds no opinion about what a switch does — it lays
// out the plates, throws the handles that are up, and reports every throw upward.
export default function SwitchBank({ items = [], onThrow }) {
  return (
    <div className="flex min-w-0 flex-wrap items-end gap-1.5">
      {items.map((item) => (
        <ToggleSwitch
          key={item.key}
          label={item.label}
          on={!!item.on}
          onToggle={() => onThrow?.(item.key)}
        />
      ))}
    </div>
  );
}