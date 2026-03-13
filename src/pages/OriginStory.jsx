import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  skyBlue: '#4a90b8',
};

export default function OriginStory() {
  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
        background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)`
      }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <span className="text-sm uppercase tracking-widest text-white font-semibold">Legacy</span>
            </div>

            <h1 className="text-white mb-8" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}>
              The Origin of<br />the TOP 100
            </h1>

            <p className="text-white/90 text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              lineHeight: 1.6
            }}>
              An Eagle Project. A Phoenix Project. A Legacy Project.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Link to={createPageUrl('Landing')}>
                <button className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-2xl" style={{
                  background: brandColors.goldPrestige,
                  color: 'white',
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  Join the Movement
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Promise Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-5xl md:text-6xl mb-12" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 300,
              color: brandColors.navyDeep,
              lineHeight: 1.3
            }}>
              The TOP 100 did not begin as a brand.<br />
              <span style={{ color: brandColors.goldPrestige, fontWeight: 700 }}>It began as a promise.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Father Section */}
      <section className="py-20 px-4" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"
                alt="Aviation Heritage"
                className="rounded-2xl shadow-2xl"
                style={{ aspectRatio: '4/5', objectFit: 'cover' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Plane className="w-12 h-12 mb-6" style={{ color: brandColors.goldPrestige }} />
              <h2 className="text-4xl mb-6" style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                color: brandColors.navyDeep
              }}>
                The Quiet Backbone
              </h2>
              <div className="space-y-4 text-lg" style={{
                fontFamily: "'Montserrat', sans-serif",
                color: `${brandColors.navyDeep}CC`,
                lineHeight: 1.8
              }}>
                <p>
                  Before there were lists, platforms, or global reach, there was a father—
                  an airline mechanic at United Airlines with more than 35 years of seniority.
                </p>
                <p>
                  He served in the Air Force and the Air National Guard.
                </p>
                <p>
                  He kept aircraft safe that most people never think twice about. He worked nights, weekends, holidays—the quiet backbone of aviation.
                </p>
                <p className="font-semibold" style={{ color: brandColors.navyDeep }}>
                  And because of him, his son grew up differently.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Airline Brat Section */}
      <section className="py-32 px-4" style={{
        background: `linear-gradient(135deg, ${brandColors.navyDeep}10 0%, ${brandColors.skyBlue}10 100%)`
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-3xl md:text-4xl mb-8" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              color: `${brandColors.navyDeep}CC`,
              lineHeight: 1.6
            }}>
              Not a military brat.
            </p>
            <p className="text-5xl md:text-7xl mb-12" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: brandColors.navyDeep
            }}>
              An airline brat.
            </p>
            <p className="text-xl max-w-2xl mx-auto" style={{
              fontFamily: "'Montserrat', sans-serif",
              color: `${brandColors.navyDeep}99`,
              lineHeight: 1.8
            }}>
              Raised in airports, hotels, and airplanes. Life measured in departures and arrivals. 
              Comfortable in motion. At home in transit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Evolution Journey */}
      <section className="py-20 px-4" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl mb-20 text-center" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: brandColors.navyDeep
            }}
          >
            From Recognition to Resurrection
          </motion.h2>

          <div className="space-y-16">
            {[
              { title: 'Top 10 Pacific Alumni', desc: 'An experiment in honoring overlooked leaders doing meaningful work.' },
              { title: 'Top 62 Women in Aerospace & Aviation', desc: 'A deliberate, values-driven act revealing a deeper truth: the most impactful contributors are often invisible by default.' },
              { title: 'TOP 100 Aerospace & Aviation', desc: 'Not as a marketing exercise, but as a corrective force. A Phoenix rising.' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-8"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{
                  background: brandColors.goldPrestige,
                  color: 'white'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: brandColors.navyDeep
                  }}>
                    {step.title}
                  </h3>
                  <p className="text-lg" style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: `${brandColors.navyDeep}CC`
                  }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eagle Section */}
      <section className="py-32 px-4" style={{
        background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)`
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="text-9xl mb-6">🦅</div>
              <h2 className="text-4xl text-white" style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700
              }}>
                Why the Eagle
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 text-white/90 text-lg" style={{
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <p>Eagles don't chase noise. They see farther. They wait longer. They move decisively.</p>
              <p>The TOP 100 was never about volume. It was about <strong>altitude</strong>.</p>
              <p>About perspective. About honoring those who carry weight—technically, ethically, and culturally—often without applause.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recognition Grid */}
      <section className="py-20 px-4" style={{ background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl mb-16 text-center" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: brandColors.navyDeep
            }}
          >
            It Exists to Recognize
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔧', title: 'Builders', desc: 'Those who create the future' },
              { icon: '⚙️', title: 'Operators', desc: 'Those who keep systems running' },
              { icon: '🔬', title: 'Engineers', desc: 'Those who solve complex problems' },
              { icon: '🎯', title: 'Leaders', desc: 'Those who guide with vision' },
              { icon: '💡', title: 'Innovators', desc: 'Those who push boundaries' },
              { icon: '🛡️', title: 'Stewards', desc: 'Those who ensure safety & progress' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-8 rounded-2xl text-center" style={{
                  background: `${brandColors.goldPrestige}10`,
                  border: `2px solid ${brandColors.goldPrestige}30`
                }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: brandColors.navyDeep
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: `${brandColors.navyDeep}99`
                }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-32 px-4" style={{ background: brandColors.cream }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl mb-12" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: brandColors.navyDeep
            }}>
              A Living Legacy
            </h2>
            <div className="space-y-8 text-xl" style={{
              fontFamily: "'Montserrat', sans-serif",
              color: `${brandColors.navyDeep}CC`,
              lineHeight: 1.8
            }}>
              <p>At its core, the TOP 100 is still anchored to the original mission:</p>
              <p className="text-2xl" style={{ color: brandColors.navyDeep }}>
                To honor work that lasts.<br />
                To make invisible excellence visible.
              </p>
              <p>And, ultimately, to retire a father who spent his life keeping others in the air.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4" style={{
        background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.goldPrestige} 100%)`
      }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-4xl md:text-5xl mb-8" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.4
            }}>
              What began as a personal promise<br />became a public platform.
            </p>
            <p className="text-3xl md:text-4xl mb-16" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700
            }}>
              This is not an endpoint.<br />
              It's a launchpad.
            </p>
            <Link to={createPageUrl('Landing')}>
              <button className="px-12 py-5 rounded-full text-xl font-semibold transition-all hover:scale-105 shadow-2xl" style={{
                background: 'white',
                color: brandColors.navyDeep,
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Join the Legacy
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}