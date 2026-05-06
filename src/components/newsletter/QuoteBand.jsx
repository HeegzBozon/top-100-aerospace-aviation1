export default function QuoteBand({ children }) {
  return (
    <div className="my-8 border-y border-[#c9a87c]/25 py-7 text-center">
      <p className="text-2xl italic leading-relaxed text-[#c9a87c] md:text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {children}
      </p>
    </div>
  );
}