import { motion } from 'framer-motion';
import { Globe, Users, Award, Sparkles, Target, Eye, Handshake, Quote } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const stats = [
  { value: '1,000+', label: 'Nominees' },
  { value: '30+', label: 'Countries' },
  { value: '6', label: 'Global Categories' },
];

const categories = [
  'Women', 'Men', 'Rising Stars', 'Executives', 'Innovators', 'Global Leaders'
];

const offerings = [
  { icon: Award, title: 'Global Recognition', description: 'Annual lists, digital badges, and official certification' },
  { icon: Users, title: 'Transparent Nomination & Voting', description: 'Community-led, impact-weighted, real-time rankings' },
  { icon: Eye, title: 'Media & Visibility', description: 'Honoree profiles, press kits, and social spotlighting' },
  { icon: Handshake, title: 'Partnership Opportunities', description: 'Align with the future of aerospace leadership' },
];

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <section 
        className="relative py-8 md:py-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-3 md:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="text-2xl sm:text-3xl md:text-5xl text-white mb-4 md:mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Recognizing Visionaries.
              <span 
                className="block text-transparent bg-clip-text mt-1 md:mt-2"
                style={{ backgroundImage: `linear-gradient(90deg, ${brandColors.goldPrestige}, #e8d4b8)` }}
              >
                Celebrating Impact. Elevating the Future.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-xl text-white/70 max-w-3xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              The <strong className="text-white">TOP 100 in Aerospace & Aviation</strong> is the premier global recognition platform 
              spotlighting the most influential leaders, innovators, and rising stars shaping the future of flight.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-4 md:py-12 px-3 md:px-4 bg-white border-b" style={{ borderColor: '#e2e8f0' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-1 md:gap-8 text-center">
          {stats.map((stat) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div 
                className="text-xl sm:text-2xl md:text-4xl font-bold mb-1"
                style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-6 md:py-20 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Target className="w-5 h-5 md:w-6 md:h-6" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="text-xs md:text-sm uppercase tracking-widest"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                Our Mission
              </span>
            </div>
            <p 
              className="text-lg sm:text-xl md:text-3xl leading-relaxed"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              To elevate brilliant minds and bold leadership in aerospace and aviation—while building a connected, 
              visible, and future-forward community of top talent worldwide.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-16">
            {categories.map((category, index) => (
              <motion.span
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium"
                style={{ 
                  background: `${brandColors.navyDeep}10`,
                  color: brandColors.navyDeep,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                {category}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-6 md:py-20 px-3 md:px-4" style={{ background: brandColors.navyDeep }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 md:mb-6" style={{ color: brandColors.goldPrestige }} />
            <h2 
              className="text-xl md:text-3xl text-white mb-4 md:mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Why It Matters
            </h2>
            <p className="text-sm md:text-xl text-white/70 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Aerospace is entering a new era—from hypersonics and next-gen propulsion to space tourism and autonomous flight. 
              The TOP 100 exists to ensure the <em className="text-white">people powering these breakthroughs</em> get the visibility, 
              celebration, and support they deserve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-6 md:py-20 px-3 md:px-4">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-lg md:text-3xl text-center mb-4 md:mb-12"
            style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
          >
            What We Offer
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
            {offerings.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 shadow-sm md:shadow-lg border"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div 
                  className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4"
                  style={{ background: `${brandColors.goldPrestige}20` }}
                >
                  <item.icon className="w-4 h-4 md:w-6 md:h-6" style={{ color: brandColors.goldPrestige }} />
                </div>
                <h3 
                  className="text-sm md:text-xl font-bold mb-0.5 md:mb-2"
                  style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[11px] md:text-base text-gray-600 line-clamp-3 md:line-clamp-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-6 md:py-20 px-3 md:px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <Globe className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4" style={{ color: brandColors.skyBlue }} />
            <h2 
              className="text-xl md:text-3xl mb-4 md:mb-6"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Our Story
            </h2>
            <p className="text-sm md:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Founded in 2021, the TOP 100 was built to bridge a critical gap in recognition and representation. 
              What began as a curated list has evolved into a global platform—uniting excellence across commercial aviation, 
              defense, space, and advanced air mobility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Quote */}
      <section 
        className="py-6 md:py-20 px-3 md:px-4"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 100%)` }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Quote className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 md:mb-8 opacity-30" style={{ color: brandColors.goldPrestige }} />
            <blockquote 
              className="text-lg sm:text-xl md:text-3xl text-white leading-relaxed mb-4 md:mb-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
            >
              "When I started the TOP 100, it wasn't about building a list. It was about building a <span style={{ color: brandColors.goldPrestige }}>movement</span>."
            </blockquote>
            <p className="text-sm md:text-base text-white/70 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              I built this platform to celebrate brilliance. To shine a spotlight on diverse, global talent. 
              To create something that feels as elite as a Forbes feature, but with the soul of a community that actually uplifts people.
            </p>
            <div className="mt-6 md:mt-8">
              <p 
                className="text-sm md:text-lg font-semibold"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                This isn't just a recognition platform.
              </p>
              <p className="text-white text-base md:text-xl mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                It's an engine for influence.
              </p>
            </div>
            <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-white/10">
              <p className="text-white/50 text-xs md:text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Founder, TOP 100 in Aerospace & Aviation
              </p>
              <p className="text-white/40 text-xs md:text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Founder, Pineapple EMPIRE
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}