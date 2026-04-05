import React from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Rocket, Users, ChevronRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function STARSummit() {
  return (
    <div className="min-h-screen bg-[#0a1526] text-white selection:bg-[#d45b7a] selection:text-white font-sans overflow-hidden">
      {/* Background Gradients inspired by the poster */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#c95a43] to-[#8f2a58] blur-[150px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e3a5a] blur-[120px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Link to="/">
          <Button variant="outline" className="mb-8 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mission Control
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Poster Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(201,90,67,0.2)] border border-slate-800 aspect-[4/5] max-w-md mx-auto lg:max-w-none">
              <img 
                src="https://media.base44.com/images/public/68996845be6727838fdb822e/2e8c48b03_1775238693884.jpg" 
                alt="STAR Summit Poster" 
                className="w-full h-full object-cover"
              />
              {/* Overlay styling to blend with the vibe */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1526] via-transparent to-transparent opacity-60" />
            </div>
            
            {/* Floating Info Badge */}
            <div className="absolute -bottom-6 -right-6 lg:bottom-10 lg:-right-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c95a43] to-[#8f2a58] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Location</div>
                  <div className="text-white font-medium">Biosphere 2</div>
                  <div className="text-sm text-slate-300">Oracle, Arizona</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#c9a87c]" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Dates</div>
                  <div className="text-white font-medium">April 25-29</div>
                  <div className="text-sm text-slate-300">5-Day Immersive</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[#c95a43]/30 bg-[#c95a43]/10 text-[#c95a43] text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#c95a43] animate-pulse" />
                Registration Closing Soon
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4">
                Stellar Training for <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#c95a43] to-[#d4a574]">Astronaut Readiness</span>
              </h1>
              <p className="text-xl text-slate-300 font-medium">
                The STAR program is designed for individuals focused on developing the professional and interpersonal skills that drive performance in high-stakes environments.
              </p>
            </div>

            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p>
                It emphasizes communication, decision-making, teamwork, and self-awareness—the core competencies that shape how individuals operate under pressure and contribute to a team.
              </p>
              <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl">
                <p>
                  These skills are practiced using <strong className="text-white">analog mission environments</strong>, where participants apply them through realistic scenarios, team-based operations, and structured challenges that reveal how behavior and performance translate into real-world settings.
                </p>
              </div>
              <p>
                This community represents some of the most experienced and forward-thinking professionals in aerospace. If you or someone in your network is moving toward mission participation, conducting research in human factors or operational readiness, or supporting the next generation of mission-capable individuals, we think the STAR Summit is worth your attention.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c95a43] blur-[80px] opacity-20 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">Deadline</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">April 12 at 10:00 PM EST</h3>
                  <p className="text-slate-400 text-sm">Secure your spot for the immersive training.</p>
                </div>
                
                <div className="w-full sm:w-auto">
                  <a href="https://lnkd.in/gsgqrUgZ" target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button size="lg" className="w-full h-14 bg-gradient-to-r from-[#c95a43] to-[#8f2a58] hover:from-[#b34d38] hover:to-[#7a224a] text-white font-bold px-8 rounded-full shadow-[0_0_20px_rgba(201,90,67,0.3)] hover:shadow-[0_0_30px_rgba(201,90,67,0.5)] transition-all">
                      <Rocket className="w-5 h-5 mr-2" />
                      Register Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Hosted by IPLABS.SPACE</span>
              </div>
              <a href="mailto:emily@iplabs.space" className="flex items-center gap-2 hover:text-[#c95a43] transition-colors">
                <Mail className="w-4 h-4" />
                <span>Contact Emily Apollonio</span>
              </a>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}