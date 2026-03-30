import { motion } from 'framer-motion';
import { Rocket, DollarSign, Users, Calendar, ArrowRight, Star, ExternalLink } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export default function Season4Launch() {
  return (
    <div className="min-h-screen bg-[#faf8f5] overflow-x-hidden">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0f1f35] via-[#1e3a5a] to-[#0a1628] overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a87c] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-[#4a90b8] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
          {/* Logo */}
          <motion.div {...fadeUp(0)} className="mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
              alt="TOP 100 Aerospace & Aviation"
              className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-[#c9a87c]/40"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </motion.div>

          <motion.div {...fadeUp(0.1)}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-[#c9a87c]/20 text-[#c9a87c] border border-[#c9a87c]/30 mb-6">
              🚀 Spoiler Alert
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.15)} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            TOP 100 Grand Opening.<br />
            <span className="text-[#c9a87c]">Season 4 is going live.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            Hello, hello, hello, Aerospace Nation! Whether you're a TOP 100 Fellow, a past nominee, a nominator, or someone who's been following along since the beginning — this one's for you.
          </motion.p>

          <motion.div {...fadeUp(0.25)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wefunder.com/top.100.aerospace.aviation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#c9a87c] to-[#d4a090] text-[#1e3a5a] font-bold text-base shadow-lg hover:shadow-xl hover:from-[#e8d4b8] transition-all"
            >
              <DollarSign className="w-5 h-5" />
              Invest on Wefunder
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="/Nominations"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#c9a87c]/40 text-[#c9a87c] font-bold text-base hover:bg-[#c9a87c]/10 transition-all"
            >
              <Star className="w-5 h-5" />
              Nominate Someone
            </a>
          </motion.div>
        </div>
      </div>

      {/* The Big News */}
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <motion.div {...fadeUp(0)} className="mb-4">
          <span className="text-xs font-black tracking-widest uppercase text-[#c9a87c]">The Big News</span>
        </motion.div>
        <motion.h2 {...fadeUp(0.05)} className="text-3xl sm:text-4xl font-bold text-[#1e3a5a] mb-6 leading-snug">
          We're opening a community round on Wefunder.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="text-gray-600 text-lg leading-relaxed mb-6">
          We're raising <strong className="text-[#1e3a5a]">$100,000</strong> — and half of it, <strong className="text-[#1e3a5a]">$50,000</strong>, goes directly to the Fellows. That's <strong className="text-[#1e3a5a]">$500 each</strong>. No strings. Keep it, direct it somewhere meaningful, or pool it with other Fellows and build something together. A scholarship, a grant, a shared fund — whatever you all decide.
        </motion.p>
        <motion.p {...fadeUp(0.15)} className="text-gray-600 text-lg leading-relaxed">
          The other $50,000 keeps the platform running and growing. A community that takes care of its own, year after year. Scholarships. Grants. Incubator, Accelerator, and Venture programs. Awards, certificates, live events, virtual and in-person.
        </motion.p>

        {/* Fund split visual */}
        <motion.div {...fadeUp(0.2)} className="mt-10 grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-[#1e3a5a] to-[#2d5075] p-6 text-white">
            <p className="text-[#c9a87c] text-xs font-black uppercase tracking-widest mb-2">For the Fellows</p>
            <p className="text-4xl font-bold mb-1">$50,000</p>
            <p className="text-white/60 text-sm">$500 per Fellow · No strings attached</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#c9a87c] to-[#d4a090] p-6 text-[#1e3a5a]">
            <p className="text-[#1e3a5a]/60 text-xs font-black uppercase tracking-widest mb-2">For the Platform</p>
            <p className="text-4xl font-bold mb-1">$50,000</p>
            <p className="text-[#1e3a5a]/70 text-sm">Scholarships · Grants · Events · Growth</p>
          </div>
        </motion.div>
      </div>

      {/* Wefunder CTA */}
      <div className="bg-[#1e3a5a]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <motion.p {...fadeUp(0)} className="text-[#c9a87c] text-xs font-black uppercase tracking-widest mb-4">Invest Now</motion.p>
          <motion.h2 {...fadeUp(0.05)} className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-snug">
            Our Wefunder round is opening now.<br />
            <span className="text-[#c9a87c]">Starts at $100. Real shares. Real equity.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="text-white/60 mb-10 max-w-xl mx-auto">
            This community made TOP 100 credible. Now you can own a piece of what it becomes.
          </motion.p>

          <motion.div {...fadeUp(0.15)} className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: DollarSign, title: 'Reserve your spot', desc: 'Starting at $100. Real shares, real equity, Reg CF. You reserve now and it converts to actual ownership when the round closes.' },
              { icon: Users, title: 'Make a strategic intro', desc: 'Know an investor, a corporate partner, or anyone who should know about this? Connect us.' },
              { icon: Rocket, title: 'Spread the word', desc: 'Share the campaign, post about it, tell your network. Every share matters.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-[#c9a87c]/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#c9a87c]" />
                </div>
                <p className="font-bold text-white mb-1">{title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.a
            {...fadeUp(0.2)}
            href="https://wefunder.com/top.100.aerospace.aviation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#c9a87c] to-[#d4a090] text-[#1e3a5a] font-bold text-base shadow-lg hover:shadow-xl hover:from-[#e8d4b8] transition-all"
          >
            Invest on Wefunder
            <ArrowRight className="w-5 h-5" />
          </motion.a>
          <p className="text-white/30 text-xs mt-4">wefunder.com/top.100.aerospace.aviation</p>
        </div>
      </div>

      {/* Nominations */}
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <motion.div {...fadeUp(0)}>
          <span className="text-xs font-black tracking-widest uppercase text-[#c9a87c]">Season 4</span>
        </motion.div>
        <motion.h2 {...fadeUp(0.05)} className="text-3xl sm:text-4xl font-bold text-[#1e3a5a] mt-2 mb-6 leading-snug">
          Nomination season is officially open — and this is the most important one yet.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="text-gray-600 text-lg leading-relaxed mb-8">
          Season 4 is the biggest thing we've built. The platform is live, the community round is open, and the Fellows we select this year step into something real — not just a list, but a funded, growing institution. Being named this year means more than it ever has. You know who deserves to be on it.
        </motion.p>
        <motion.a
          {...fadeUp(0.15)}
          href="/Nominations"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#c9a87c] to-[#d4a090] text-[#1e3a5a] font-bold text-base shadow-lg hover:shadow-xl hover:from-[#e8d4b8] transition-all"
        >
          <Star className="w-5 h-5" />
          Nominate Someone Now
          <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>

      {/* Meet Matthew */}
      <div className="bg-[#faf8f5] border-t border-[#c9a87c]/20">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-gray-500 text-lg mb-2">There's a seat at this table for anyone who wants one.</p>
            <p className="text-gray-400 text-sm mb-8">Whether that's as an investor, a partner, a sponsor, an advisor, or just someone who shows up and cheers us on. Let's talk about what that looks like for you.</p>
            <a
              href="https://calendar.app.google/qvsz291f2bTB3Pkr9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-[#1e3a5a] text-[#1e3a5a] font-bold hover:bg-[#1e3a5a] hover:text-white transition-all"
            >
              <Calendar className="w-5 h-5" />
              Grab a time with Matthew
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-16 pt-10 border-t border-[#c9a87c]/20">
            <p className="text-2xl font-bold text-[#1e3a5a] mb-1">Higher, Further, Faster!</p>
            <p className="text-xl italic text-gray-500">— Matthew</p>
            <p className="text-xs text-gray-400 mt-4">TOP 100 Aerospace & Aviation · 3910 Cheverly Dr E, Lakeland, FL 33813</p>
          </motion.div>
        </div>
      </div>

    </div>
  );
}