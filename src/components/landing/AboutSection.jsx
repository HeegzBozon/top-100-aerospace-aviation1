import { motion } from 'framer-motion';
import { Globe, Users, Calendar } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const stats = [
  { icon: Calendar, value: '2021', label: 'Established' },
  { icon: Globe, value: '30+', label: 'Countries' },
  { icon: Users, value: '11,000+', label: 'Professionals' },
];

export default function AboutSection() {
  return (
    <section className="py-24 text-white" style={{ background: brandColors.navyDeep }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl sm:text-4xl mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
          >
            Recognizing Excellence. Elevating the Industry.
          </h2>
          <p 
            className="text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.7)' }}
          >
            Since 2021, the TOP 100 has grown into a globally recognized initiative with honorees 
            across 30+ countries and a following of more than 11,000 aerospace professionals.
            We are committed to spotlighting talent, amplifying influence, and giving the industry 
            a platform to celebrate its brightest minds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <stat.icon className="w-10 h-10 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
              <div 
                className="text-4xl text-white mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
              >
                {stat.value}
              </div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.6)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}