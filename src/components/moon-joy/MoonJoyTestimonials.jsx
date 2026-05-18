import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';

const testimonials = [
  { name: 'Agnieszka Elwertowska', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/dd92e790c_AgnieszkaElwertowska.mp4' },
  { name: 'Aidyl Gonzalez-Serricchio', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/47f37d18b_AidylGonzalez-Serricchio.mov' },
  { name: 'Czarina Salido', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/830314cfc_CzarinaSalido.mp4' },
  { name: 'Gitika Gorthi', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/921ec5840_GitikaGorthi.mp4' },
  { name: 'Nandita Bhatt', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/649aa4953_NanditaBhatt.mov' },
  { name: 'Paulie Rose', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/56062fdaa_PaulieRoseVideoMessage.mov' },
  { name: 'Shawna Pandya', video: 'https://media.base44.com/videos/public/68996845be6727838fdb822e/3cccfc58b_shawnapandya.mp4' },
];

export default function MoonJoyTestimonials() {
  return (
    <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-[#c9a87c]" />
          <span className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold">Community Voices</span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-4">
          Why Moon Joy Matters
        </h2>
        <p className="text-white/60 text-base max-w-2xl mx-auto">
          Hear from Fellows and community members about what this room means to them.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map(({ name, video }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-[#c9a87c]/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <video
              src={video}
              className="w-full aspect-[3/4] object-cover"
              controls
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#07111f]/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-sm">{name}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[#c9a87c] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-3 h-3" />
                <span>Watch testimonial</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}