import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Dumbbell, Sparkles, Scissors, Apple, Baby, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const CATEGORIES = [
  { icon: Dumbbell, label: 'Fitness' },
  { icon: Sparkles, label: 'Med Spas' },
  { icon: Scissors, label: 'Hair & Beauty' },
  { icon: Apple, label: 'Meal Prep' },
  { icon: Baby, label: 'Childcare' },
  { icon: Heart, label: 'Wellness' },
];

const CITIES = ['Mountain View', 'Los Angeles', 'Houston', 'Seattle', 'Washington D.C.', 'Cape Canaveral', 'Denver', 'San Diego', 'Huntsville', 'Tucson'];

export default function LocalLegendsModule() {
  return (
    <section className="py-10 md:py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}
        >
          <div className="p-6 md:p-10 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: brand.gold }} />

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
                <MapPin className="w-3 h-3" />
                New Initiative
              </div>

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Local Legends
                  </h3>
                  <p className="text-white/50 text-sm max-w-lg leading-relaxed">
                    The aerospace community's guide to the cities where the industry lives. Vetted businesses. Fellow-curated picks. Everything you need to feel at home fast.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to="/local-legends">
                    <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5 border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                      For Businesses <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Link to="/local-legends-pro">
                    <Button size="sm" className="rounded-full text-xs gap-1.5 text-white font-semibold" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}>
                      For Professionals <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                {CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors"
                  >
                    <cat.icon className="w-4 h-4" style={{ color: brand.gold }} />
                    <span className="text-[10px] text-white/60 font-medium">{cat.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* City pills */}
              <div className="flex flex-wrap gap-2">
                {CITIES.map(city => (
                  <span
                    key={city}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold text-white/40 bg-white/5 border border-white/8"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}