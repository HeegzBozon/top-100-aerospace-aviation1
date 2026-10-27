import { C } from './crmConfig';

// One labelled line of a contact, as printed on the form the draft is checked against.
export default function ContactField({ field, value, onChange, error }) {
  const { key, label, placeholder, type = 'text', wide, required } = field;

  return (
    <label className={wide ? 'block sm:col-span-2' : 'block'}>
      <span
        className="block text-[8px] font-bold uppercase tracking-[0.22em]"
        style={{ color: C.muted }}
      >
        {label}
        {required ? ' — required' : ''}
      </span>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(key, event.target.value)}
        className="mt-1 w-full rounded-lg px-3 py-2 text-[13px] outline-none"
        style={{
          border: `1px solid ${error ? C.copper : C.border}`,
          background: C.surface,
          color: C.navy,
        }}
      />
      {error ? (
        <span className="mt-1 block text-[10px]" style={{ color: C.copper }}>
          {error}
        </span>
      ) : null}
    </label>
  );
}