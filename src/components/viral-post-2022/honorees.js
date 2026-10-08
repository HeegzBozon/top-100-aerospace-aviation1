// Precise dataset from the original LinkedIn Pulse feature.
const IMG_BASE = 'https://media.base44.com/images/public/68996845be6727838fdb822e';

export const LINKEDIN_PULSE_URL = 'https://www.linkedin.com/pulse/top-10-aerospace-aviation-professionals-follow-linkedin-matt-higa/';

export const HONOREES = [
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

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '_');

export const getBySlug = (slug) => HONOREES.find((h) => slugify(h.name) === slug);