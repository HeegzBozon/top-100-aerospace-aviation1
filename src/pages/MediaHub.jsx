import Newsstand from '@/pages/Newsstand';

// The Media Hub: the campus's press room — the latest editions, dispatches and release notes.
export default function MediaHub() {
  return (
    <div className="min-h-screen bg-editorial-cream">
      <div className="mx-auto max-w-2xl px-2.5 pt-3 md:px-8 md:pt-6">
        <p className="pd-label">Media Hub</p>
        <h1 className="mt-0.5 font-heading text-[22px] leading-tight text-editorial-navy md:text-3xl">The latest from campus</h1>
        <div className="pd-rule mb-2 mt-2 w-12" />
      </div>
      <Newsstand />
    </div>
  );
}