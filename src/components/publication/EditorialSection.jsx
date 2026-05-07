import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function EditorialSection({ id, children, spine, className = '' }) {
  return (
    <section id={id} className={`relative overflow-x-hidden ${className}`}>
      {spine && (
        <div
          className="absolute left-4 top-8 hidden text-[10px] uppercase tracking-[0.5em] md:left-12 lg:block"
          aria-hidden="true"
          style={{
            color: `${brandColors.ink}20`,
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
          }}
        >
          {spine}
        </div>
      )}
      {children}
    </section>
  );
}