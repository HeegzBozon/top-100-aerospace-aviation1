import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Quote as QuoteIcon } from 'lucide-react';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SAND = '#f0e9df';

// Precise dataset from the original LinkedIn Pulse feature.
const IMG_BASE = 'https://media.base44.com/images/public/68996845be6727838fdb822e';

const HONOREES = [
  {
    rank: 1,
    name: 'Adva Amir',
    endorsements: '73,440',
    image: `${IMG_BASE}/88a087d2c_1st.jpg`,
    metric: 'Reached over 3 million people — top 1% of LinkedIn posts at the time.',
    quote: 'It’s amazing how one little post reached over 3 million and inspired so many women and men to follow their dream. LinkedIn says it was in their top 1% of posts at the time.'
  },
  {
    rank: 2,
    name: 'Erika Armstrong',
    endorsements: '29,095',
    image: `${IMG_BASE}/666c8d051_2nd.jpg`,
    metric: '1,734,193 impressions · 29,100 reactions · 24.6M+ impressions in the last 365 days.',
    quote: 'One warbird photo is worth a million stories. This one post had 1,734,193 impressions, 29,100 reactions. I had 24,676,618 impressions in the last 365 days, but any post that gets someone to respond is a success!'
  },
  {
    rank: 3,
    name: 'Jill Meyers, FRAeS',
    endorsements: '8,551',
    image: `${IMG_BASE}/386714ce7_3rd.jpg`,
    metric: '384,867 views.',
    quote: 'My most successful post was about a young woman I’ve been mentoring for several years named Serena Hart. I helped her get into the Navy and into a flight training spot, and after two years of intense training, she soloed in a jet for the first time around five months ago. The number of views as of today is 384,867.'
  },
  {
    rank: 4,
    name: 'Arnold Morales ⚙️',
    endorsements: '7,701',
    image: `${IMG_BASE}/1a94597de_4th.jpg`,
    metric: 'Aerospace Core Advocate.',
    quote: 'Aerospace is the coolest industry. I advocate constantly to help engineers connect, share ideas, and elevate the community.'
  },
  {
    rank: 5,
    name: 'Thi Hien Nguyen',
    endorsements: '6,157',
    image: `${IMG_BASE}/5e7570760_5th.jpg`,
    metric: 'Global Synergy Champion.',
    quote: 'How do we work together as a whole? Despite our differences, we can work together as a whole through greater purpose and conscious evolution.'
  },
  {
    rank: 6,
    name: 'Danilo Miranda',
    endorsements: '5,940',
    image: `${IMG_BASE}/842535b79_6th.jpg`,
    metric: 'Over 500,000 views on LinkedIn.',
    quote: 'It achieved half-a-million people on LinkedIn, 6,000 likes, and several comments based on my personal story — from a humble boy that dreamed to be someone in the future. I went on a prestigious TV show in Brazil at Christmas time and received a PC as a prize. That PC helped me study math and science and finally be accepted into the most prestigious engineering school in Brazil.'
  },
  {
    rank: 7,
    name: 'Amy Marino Spowart',
    endorsements: '4,878',
    image: `${IMG_BASE}/dc8a8f399_7th.jpg`,
    metric: 'Women in Aviation Advisory Board advocacy.',
    quote: 'This post is my most successful because it highlights why the work of the Women in Aviation Advisory Board is so important. It’s very unlikely this headline would be shared if a male had been named CEO. We have to be brave and highlight these moments, otherwise people won’t understand that there is an issue. It’s about awareness.'
  },
  {
    rank: 8,
    name: 'Alex MacPhail',
    endorsements: '4,204',
    image: `${IMG_BASE}/0de795a00_8th.jpg`,
    metric: 'SAA airline pilot brand ambassador.',
    quote: 'This came at the end of a number of years of being a brand ambassador for South African Airways. I was sharing the good news and insights into life as an airline pilot. When I lost my job, it resonated with my supporters.'
  },
  {
    rank: 9,
    name: 'Rania Toukebri',
    endorsements: '2,940',
    image: `${IMG_BASE}/e3d338453_9th.jpg`,
    metric: 'Space astronaut candidate.',
    quote: 'My first introduction to analog missions and my preparation to start my astronaut career!'
  },
  {
    rank: 10,
    name: 'Dr. Sarah Qureshi (T.I.)',
    endorsements: '2,499',
    image: `${IMG_BASE}/9fad1e7da_10th.jpg`,
    metric: 'Distinguished Aerospace Alumni Award 2020, Cranfield University.',
    quote: 'This post announced my distinguished aerospace alumni award and categorized me as a trailblazer for women in STEM and an inspiration for women leaders in Aerospace around the globe.'
  }
];

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const Monogram = ({ name }) => {
  const initials = name
    .replace(/[^a-zAZ\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 shrink-0"
      style={{ borderColor: GOLD, background: CREAM, color: NAVY, width: 64, height: 64 }}
    >
      <span className="font-serif text-xl tracking-wide">{initials || '✦'}</span>
    </div>
  );
};

const HonoreeCard = ({ h }) => (
  <article
    className="relative bg-white border rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
    style={{ borderColor: 'rgba(30,58,90,0.14)' }}
  >
    {/* Rank ribbon */}
    <div
      className="absolute top-0 left-0 z-20 px-4 py-2 rounded-br-2xl"
      style={{ background: NAVY, color: CREAM }}
    >
      <span className="font-serif text-sm font-semibold tracking-widest uppercase">
        {ordinal(h.rank)}
      </span>
    </div>

    {/* Framed post screenshot — the original LinkedIn artifact */}
    <div
      className="flex items-center justify-center p-4 md:p-6 border-b"
      style={{ background: NAVY, borderColor: 'rgba(30,58,90,0.14)' }}
    >
      <img
        src={h.image}
        alt={`${h.name} — original LinkedIn post`}
        loading="lazy"
        className="w-full max-w-[260px] rounded-lg shadow-lg object-contain"
        style={{ maxHeight: 320 }}
      />
    </div>

    <div className="p-7 md:p-9 flex flex-col flex-1">
      <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-5" style={{ color: NAVY }}>
        {h.name}
      </h3>

      {/* Endorsement metric */}
      <div className="mb-5 pb-5 border-b" style={{ borderColor: 'rgba(30,58,90,0.12)' }}>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl md:text-4xl font-bold" style={{ color: COPPER }}>
            {h.endorsements}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(30,58,90,0.6)' }}>
            Endorsements
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(30,58,90,0.75)' }}>
          {h.metric}
        </p>
      </div>

      {/* Pull quote */}
      <div className="flex gap-3 flex-1">
        <QuoteIcon className="shrink-0 mt-1" style={{ color: GOLD, width: 18, height: 18 }} />
        <p className="font-serif italic leading-relaxed text-[15px] md:text-base" style={{ color: 'rgba(30,58,90,0.85)' }}>
          {h.quote}
        </p>
      </div>
    </div>
  </article>
);

export default function ViralPost2022() {
  return (
    <div className="min-h-screen" style={{ background: CREAM, color: NAVY }}>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY} 55%, transparent 100%)` }} />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 pt-14 pb-20 text-center">
          <Link to="/" className="inline-flex items-center mb-10">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: 'rgba(201,168,124,0.5)', color: GOLD, background: 'rgba(201,168,124,0.08)' }}>
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              TOP 100 Aerospace &amp; Aviation
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            <TrendingUp className="w-4 h-4" />
            Most-Reach Post · 2022
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] mb-6" style={{ color: CREAM }}>
            The Top 10 Aerospace &amp; Aviation<br className="hidden md:block" /> Professionals to Follow on LinkedIn
          </h1>

          <p className="font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(250,248,245,0.85)' }}>
            A 2022 feature that reached over three million people — the single most-viewed post in the early life of our community. These are the ten voices that carried it.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm" style={{ color: 'rgba(250,248,245,0.7)' }}>
            <span className="font-semibold" style={{ color: GOLD }}>By Matt Higa</span>
            <span>·</span>
            <span>Originally published on LinkedIn</span>
          </div>
        </div>
      </header>

      {/* ORIGIN NOTE */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 -mt-8 relative z-10">
        <div className="bg-white border rounded-2xl p-7 md:p-10 shadow-sm" style={{ borderColor: 'rgba(30,58,90,0.14)' }}>
          <p className="font-serif text-lg leading-relaxed" style={{ color: 'rgba(30,58,90,0.85)' }}>
            One post. Over three million reached. In 2022 we asked the ten most-engaged aerospace and aviation professionals on LinkedIn a single question: <em className="not-italic font-semibold" style={{ color: NAVY }}>which of your posts performed best, and why?</em> Their answers became the most-shared feature in the early history of TOP 100. We republish it here — verbatim, in their own words — as a record of reach.
          </p>
        </div>
      </section>

      {/* THE TEN */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: COPPER }}>The Ranking</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3" style={{ color: NAVY }}>The Ten, by Reach</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {HONOREES.map((h) => (
            <HonoreeCard key={h.rank} h={h} />
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="border-t" style={{ borderColor: 'rgba(30,58,90,0.12)', background: SAND }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-5" style={{ color: NAVY }}>
            From a Post to a Platform
          </h2>
          <p className="font-serif text-lg leading-relaxed mb-8" style={{ color: 'rgba(30,58,90,0.8)' }}>
            That 2022 post proved there was an audience for serious, human aerospace storytelling. Today, TOP 100 Aerospace &amp; Aviation is a verified reputation graph — measuring contribution, verification, and reach across a global directory of Fellows. The post is history. The measurement continues.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className="rounded-full px-8 h-12 font-semibold" style={{ background: NAVY, color: CREAM }}>
                Explore the Directory
              </Button>
            </Link>
            <a
              href="https://www.linkedin.com/pulse/top-10-aerospace-aviation-professionals-follow-linkedin-matt-higa/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full px-8 h-12 font-semibold border-2" style={{ borderColor: NAVY, color: NAVY }}>
                View Original on LinkedIn
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}