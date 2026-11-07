import { qrSrc } from '@/lib/publicCard';

// The code, printed at the foot of every credential.
//
// All three flavours carry the same one: the link the badge is carrying right now, drawn
// on white so a camera reads it cold, with the line that says what a scan hands over.
export default function CredentialCode({ code, size = 72, rule, background, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 ${className}`}
      style={{ background, boxShadow: `inset 0 0 0 1px ${rule}` }}
    >
      <img
        src={qrSrc(code.link, size * 4, 1)}
        alt="Scan to open this credential"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      <div className="min-w-0">
        <p className="font-body text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-navy">
          {code.title}
        </p>
        <p className="mt-1 font-body text-[9.5px] leading-snug text-editorial-navy/60">{code.note}</p>
      </div>
    </div>
  );
}