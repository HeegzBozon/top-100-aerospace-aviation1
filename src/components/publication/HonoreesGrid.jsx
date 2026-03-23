import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Crown, Globe, Sparkles, ChevronDown } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const WREATH_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/90f4fd33a_Gemini_Generated_Image_s3pahzs3pahzs3pa.png';

// CourtOfHonor-style Card with full wreath background - ENHANCED
const HonoreeCard = ({ nominee, index, onClick }) => {
  const rank = nominee.finalRank || index + 1;
  
  const getRankStyle = () => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1e3a5a', glow: '#FFD700' };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #E8E8E8, #B8B8B8)', color: '#1e3a5a', glow: '#C0C0C0' };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #B87333)', color: 'white', glow: '#CD7F32' };
    if (rank <= 10) return { bg: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})`, color: '#1e3a5a', glow: brandColors.goldPrestige };
    return { bg: brandColors.navyDeep, color: 'white', glow: null };
  };

  const rankStyle = getRankStyle();
  const isTopTen = rank <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-30px' }}
      onClick={() => onClick(nominee)}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer"
      style={{
        boxShadow: isTopTen 
          ? `0 10px 40px -10px ${rankStyle.glow}50, 0 4px 20px -5px rgba(0,0,0,0.2)`
          : '0 4px 20px -5px rgba(0,0,0,0.15)'
      }}
      whileHover={{ 
        y: -12, 
        scale: 1.04,
        boxShadow: isTopTen 
          ? `0 25px 60px -15px ${rankStyle.glow}60, 0 10px 30px -10px rgba(0,0,0,0.3)`
          : '0 20px 50px -15px rgba(0,0,0,0.25)'
      }}
    >
      {/* Wreath Background */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={WREATH_URL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {/* Centered Headshot */}
        <div className="absolute inset-0 flex items-center justify-center p-[12%]">
          {nominee.avatar_url || nominee.photo_url ? (
            <div className="w-full aspect-square relative">
              {/* Glow ring for top 10 */}
              {isTopTen && (
                <motion.div
                  className="absolute inset-[-4px] rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${rankStyle.glow}40, transparent, ${rankStyle.glow}40)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <img
                src={nominee.avatar_url || nominee.photo_url}
                alt={nominee.name}
                className="w-full h-full rounded-full object-cover border-4 border-white/40 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:border-white/60"
                loading="lazy"
              />
            </div>
          ) : (
            <div 
              className="w-full aspect-square rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-4xl border-4 border-white/40 shadow-xl transition-all duration-500 group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            >
              {nominee.name ? nominee.name.slice(0, 2).toUpperCase() : 'NN'}
            </div>
          )}
        </div>
      </div>
      
      {/* Gradient Overlay - Enhanced */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Rank Badge - Enhanced */}
      <motion.div 
        className="absolute top-2 left-2 md:top-3 md:left-3 backdrop-blur-md font-bold text-xs md:text-sm px-2.5 md:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
        style={{ background: rankStyle.bg, color: rankStyle.color }}
        whileHover={{ scale: 1.1 }}
      >
        <Crown className="w-3 h-3 md:w-4 md:h-4" />
        <span>#{rank}</span>
      </motion.div>

      {/* Top 10 Badge */}
      {isTopTen && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <motion.div 
            className="px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
            style={{ 
              background: `${rankStyle.glow}30`,
              color: 'white',
              border: `1px solid ${rankStyle.glow}50`
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TOP 10
          </motion.div>
        </div>
      )}

      {/* Content Overlay - Enhanced */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 text-white">
        <h3 className="font-bold text-sm md:text-lg truncate group-hover:text-white transition-colors">{nominee.name}</h3>
        <p className="text-xs md:text-sm text-white/70 truncate mt-0.5 group-hover:text-white/90 transition-colors">
          {nominee.title || nominee.professional_role}
        </p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/20">
          <span className="text-xs font-medium flex items-center gap-1.5 text-white/80">
            <Globe className="w-3 h-3" />
            {nominee.country || 'Global'}
          </span>
          <motion.div 
            className="flex items-center gap-1.5 text-sm font-bold px-2 py-0.5 rounded-full"
            style={{ 
              background: `${brandColors.goldPrestige}20`,
              color: brandColors.goldPrestige 
            }}
            whileHover={{ scale: 1.1 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{Math.round(nominee.combinedScore || nominee.aura_score || 0)}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HonoreesGrid({ nominees, onSelectNominee }) {
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
    <div className="space-y-8">
      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: brandColors.skyBlue }} />
          <input
            type="text"
            placeholder="Search honorees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 text-sm focus:outline-none focus:ring-2 transition-all"
            style={{ 
              borderColor: `${brandColors.goldPrestige}50`, 
              background: 'white',
              color: brandColors.navyDeep,
            }}
          />
        </div>

        {/* Country Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all hover:shadow-md"
            style={{ 
              borderColor: `${brandColors.goldPrestige}50`, 
              background: 'white',
              color: brandColors.navyDeep,
            }}
          >
            <Filter className="w-4 h-4" />
            {selectedCountry === 'all' ? 'All Regions' : selectedCountry}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-20"
                style={{ borderColor: `${brandColors.goldPrestige}30` }}
              >
                <div className="max-h-64 overflow-y-auto">
                  {countries.map(country => (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowFilters(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      style={{ 
                        color: brandColors.navyDeep,
                        background: selectedCountry === country ? `${brandColors.goldPrestige}15` : 'transparent'
                      }}
                    >
                      {country === 'all' ? (
                        <>
                          <Globe className="w-3.5 h-3.5" style={{ color: brandColors.skyBlue }} />
                          All Regions
                        </>
                      ) : (
                        country
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="text-sm" style={{ color: brandColors.skyBlue }}>
          {filteredNominees.length} of {nominees.length} honorees
        </div>
      </motion.div>

      {/* Grid - CourtOfHonor Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNominees.map((nominee, index) => (
            <HonoreeCard
              key={nominee.id}
              nominee={nominee}
              index={index}
              onClick={onSelectNominee}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredNominees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
          <p style={{ color: brandColors.navyDeep }}>
            No honorees found matching your criteria.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCountry('all'); }}
            className="mt-4 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md"
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}