import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Globe } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

// Mobile Card for Index
const MobileIndexCard = ({ nominee, index, onClick }) => {
  const rank = nominee.finalRank || index + 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      onClick={() => onClick(nominee)}
      className="flex items-center gap-3 p-3 rounded-xl bg-white active:scale-[0.98] transition-transform"
      style={{ border: `1px solid ${brandColors.ink}08`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Rank Badge */}
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-medium"
        style={{ background: `${brandColors.goldPrestige}15`, color: brandColors.goldPrestige }}
      >
        {rank}
      </div>
      
      {/* Photo */}
      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
        {nominee.avatar_url || nominee.photo_url ? (
          <img
            src={nominee.avatar_url || nominee.photo_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-sm font-medium"
            style={{ background: brandColors.goldLight, color: brandColors.navyDeep }}
          >
            {nominee.name?.charAt(0)}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 
          className="text-sm font-medium truncate"
          style={{ color: brandColors.ink }}
        >
          {nominee.name}
        </h4>
        <p 
          className="text-[11px] truncate mt-0.5"
          style={{ color: `${brandColors.ink}50` }}
        >
          {nominee.title || nominee.professional_role || nominee.country || '—'}
        </p>
      </div>
      
      {/* Chevron */}
      <ChevronDown 
        className="w-4 h-4 -rotate-90 flex-shrink-0" 
        style={{ color: `${brandColors.ink}30` }} 
      />
    </motion.div>
  );
};

// Minimal Index Row (Desktop)
const IndexRow = ({ nominee, index, onClick }) => {
  const rank = nominee.finalRank || index + 1;
  
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      onClick={() => onClick(nominee)}
      className="group cursor-pointer border-b transition-colors duration-200 hover:bg-black/[0.02]"
      style={{ borderColor: `${brandColors.ink}10` }}
    >
      {/* Rank */}
      <td className="py-4 pr-4 w-16">
        <span 
          className="text-sm tabular-nums font-light"
          style={{ color: brandColors.skyBlue }}
        >
          {String(rank).padStart(3, '0')}
        </span>
      </td>
      
      {/* Photo + Name */}
      <td className="py-4 pr-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            {nominee.avatar_url || nominee.photo_url ? (
              <img
                src={nominee.avatar_url || nominee.photo_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-sm"
                style={{ background: brandColors.goldLight, color: brandColors.navyDeep }}
              >
                {nominee.name?.charAt(0)}
              </div>
            )}
          </div>
          <span 
            className="text-base group-hover:underline underline-offset-4"
            style={{ 
              fontFamily: 'Georgia, serif',
              color: brandColors.ink 
            }}
          >
            {nominee.name}
          </span>
        </div>
      </td>
      
      {/* Title */}
      <td className="py-4 pr-6 hidden md:table-cell">
        <span 
          className="text-sm font-light truncate max-w-[200px] block"
          style={{ color: `${brandColors.ink}60` }}
        >
          {nominee.title || nominee.professional_role || '—'}
        </span>
      </td>
      
      {/* Country */}
      <td className="py-4 pr-6 hidden lg:table-cell">
        <span 
          className="text-sm font-light"
          style={{ color: `${brandColors.ink}50` }}
        >
          {nominee.country || '—'}
        </span>
      </td>
      
    </motion.tr>
  );
};

export default function EditorialLedger({ nominees, onSelectNominee }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique countries
  const countries = useMemo(() => {
    const countrySet = new Set(nominees.map(n => n.country).filter(Boolean));
    return ['all', ...Array.from(countrySet).sort()];
  }, [nominees]);

  // Filter nominees
  const filteredNominees = useMemo(() => {
    return nominees.filter(n => {
      const matchesSearch = !searchTerm || 
        n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || n.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [nominees, searchTerm, selectedCountry]);

  return (
    <section 
      id="honorees" 
      className="py-12 md:py-40 px-4 md:px-12 lg:px-24"
      style={{ background: 'white' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-16"
        >
          <p 
            className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
            style={{ color: brandColors.skyBlue }}
          >
            The Ledger — Index
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <h2 
              className="text-2xl md:text-5xl font-light tracking-tight"
              style={{ 
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: brandColors.ink 
              }}
            >
              The Complete Index
            </h2>
            
            {/* Search & Filter - Mobile optimized */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-1 md:flex-initial">
                <Search 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: `${brandColors.ink}40` }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-48 pl-9 pr-3 py-2.5 text-sm rounded-lg md:rounded-none md:border-b bg-gray-50 md:bg-transparent focus:outline-none transition-colors"
                  style={{ 
                    borderColor: `${brandColors.ink}20`,
                    color: brandColors.ink
                  }}
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 md:gap-2 text-sm py-2.5 px-3 rounded-lg md:rounded-none md:border transition-colors"
                  style={{ 
                    borderColor: `${brandColors.ink}20`,
                    color: brandColors.ink,
                    background: 'rgb(249 250 251)'
                  }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{selectedCountry === 'all' ? 'All' : selectedCountry}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border shadow-lg z-20 max-h-64 overflow-y-auto rounded-lg md:rounded-none"
                      style={{ borderColor: `${brandColors.ink}10` }}
                    >
                      {countries.map(country => (
                        <button
                          key={country}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowFilters(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                          style={{ 
                            color: brandColors.ink,
                            background: selectedCountry === country ? `${brandColors.goldPrestige}10` : 'transparent'
                          }}
                        >
                          {country === 'all' ? 'All Regions' : country}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 md:mb-8 pb-3 md:pb-4 border-b" style={{ borderColor: `${brandColors.ink}10` }}>
          <p className="text-[11px] md:text-xs" style={{ color: `${brandColors.ink}40` }}>
            {filteredNominees.length} of {nominees.length} indexed
          </p>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-2">
          {filteredNominees.map((nominee, index) => (
            <MobileIndexCard
              key={nominee.id}
              nominee={nominee}
              index={index}
              onClick={onSelectNominee}
            />
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: `${brandColors.ink}20` }}>
                <th className="pb-3 text-left text-[10px] tracking-[0.2em] uppercase font-normal" style={{ color: `${brandColors.ink}40` }}>
                  Rank
                </th>
                <th className="pb-3 text-left text-[10px] tracking-[0.2em] uppercase font-normal" style={{ color: `${brandColors.ink}40` }}>
                  Name
                </th>
                <th className="pb-3 text-left text-[10px] tracking-[0.2em] uppercase font-normal hidden md:table-cell" style={{ color: `${brandColors.ink}40` }}>
                  Title
                </th>
                <th className="pb-3 text-left text-[10px] tracking-[0.2em] uppercase font-normal hidden lg:table-cell" style={{ color: `${brandColors.ink}40` }}>
                  Region
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNominees.map((nominee, index) => (
                <IndexRow
                  key={nominee.id}
                  nominee={nominee}
                  index={index}
                  onClick={onSelectNominee}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredNominees.length === 0 && (
          <div className="py-12 md:py-16 text-center">
            <p className="text-sm" style={{ color: `${brandColors.ink}40` }}>
              No results match your criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}