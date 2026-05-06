export default function ArticleSection({ id, kicker, title, icon: Icon, children, accent = false }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`rounded-[2rem] border p-7 shadow-2xl md:p-11 ${accent ? 'border-[#c9a87c]/30 bg-[#c9a87c]/10' : 'border-slate-800 bg-slate-900/55'}`}>
        <div className="mb-7 flex items-center gap-3">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9a87c]/25 bg-[#c9a87c]/10 text-[#c9a87c]">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            {kicker && <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c9a87c]">{kicker}</p>}
            <h2 className="text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
          </div>
        </div>
        <div className="space-y-5 text-base leading-8 text-slate-300 md:text-lg md:leading-9">
          {children}
        </div>
      </div>
    </section>
  );
}