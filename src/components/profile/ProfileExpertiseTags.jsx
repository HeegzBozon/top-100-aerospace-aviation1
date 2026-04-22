const brandColors = { navyDeep: '#1e3a5a', goldPrestige: '#c9a87c' };

export default function ProfileExpertiseTags({ skills, expertise_tags }) {
  const tags = [
    ...(Array.isArray(skills) ? skills : []),
    ...(Array.isArray(expertise_tags) ? expertise_tags : []),
  ];

  // Dedupe
  const unique = [...new Set(tags.map(t => t.trim()).filter(Boolean))];
  if (unique.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 material-shadow bg-white/70">
      <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: brandColors.goldPrestige }}>Expertise</h3>
      <div className="flex flex-wrap gap-2">
        {unique.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: `${brandColors.navyDeep}08`, color: brandColors.navyDeep }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}