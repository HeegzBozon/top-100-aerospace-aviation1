import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function NomineeImage({ nominee, className = '', fallbackClassName = '', loading = 'lazy', priority = false }) {
  const src = nominee?.avatar_url || nominee?.photo_url;
  const name = nominee?.name || 'Nominee';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading={priority ? 'eager' : loading}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${fallbackClassName || className}`}
      style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` }}
      aria-label={name}
      role="img"
    >
      <span className="font-light" style={{ fontFamily: 'Georgia, serif', color: brandColors.goldLight }}>
        {name.charAt(0)}
      </span>
    </div>
  );
}