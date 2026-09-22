import { Link } from 'react-router-dom';

// Cross-referenced against the TOP 100 archive. Each entry ties an honoree's
// own recorded work to a program named above in this article.
const alumni = [
  {
    id: '696ae3d0a47e0312f3dde204',
    name: 'Jacquelyn Noel',
    role: 'Systems Engineer, NASA Human Landing System · Stellar Solutions',
    link: 'Artemis',
    note: 'Systems engineering for the Human Landing System program management office, working across the SpaceX and Blue Origin lander contracts that carry Artemis from lunar flyby to lunar surface.',
  },
  {
    id: '6a6b69c0f957e8c00dd4ca48',
    name: 'Julio (JC) Perez-Khweis',
    role: 'Systems Engineer, NASA Johnson Space Center',
    link: 'Artemis',
    note: 'Systems engineering on the Artemis space suit, introducing new technology into the hardware that will keep crews alive when the program moves from orbit to the surface.',
  },
  {
    id: '696ae403ffe497faddbc7105',
    name: 'Holly Pascal',
    role: 'NASA Headquarters, Space Communications and Navigation',
    link: 'Artemis',
    note: 'Part of the SCaN program that carries mission-critical voice, telemetry, video and navigation data. Nothing a crew ten days from Earth says or sees reaches the ground without this layer.',
  },
  {
    id: '696ae40dd10deb4252b0dc18',
    name: 'Alice Pellegrino',
    role: 'Project and Programme Manager, Redwire Space',
    link: 'Lunar supply chain',
    note: 'Programme coordination at a supplier whose hardware and in-space manufacturing work sits inside the multi-year lunar architecture the Artemis flights depend on.',
  },
  {
    id: '696ae3b2cfcc719ec21a0f9f',
    name: 'Melodie Yashar',
    role: 'Space architect, human-machine interaction researcher',
    link: 'Lunar surface',
    note: 'Construction technologies for off-world habitats. A flight around the Moon only matters if there is somewhere to go when the program lands.',
  },
  {
    id: '696ae412e3d3a43cde7a4f61',
    name: 'Michaela Musilova, PhD',
    role: 'Analog mission commander, astrobiologist',
    link: 'Lunar surface',
    note: 'More than thirty simulated Moon and Mars missions led at analog research stations, testing how crews actually live and work before anyone does it for real.',
  },
];

export default function NineMonthsAlumni() {
  return (
    <section aria-labelledby="nine-months-alumni" className="mt-14 border-t border-editorial-copper pt-10 sm:mt-20">
      <p className="font-body text-xs font-semibold uppercase tracking-[0.2em]">From the archive</p>
      <h2 id="nine-months-alumni" className="mt-4 font-heading text-3xl font-normal leading-tight sm:text-4xl">Names already in the record</h2>
      <p className="mt-6">We cross referenced the programs above against our own archive. These honorees, measured in earlier volumes, hold direct or adjacent involvement in the work those headlines describe.</p>
      <ul className="mt-8 space-y-7">
        {alumni.map(({ id, name, role, link, note }) => (
          <li key={id} className="border-l-2 border-editorial-gold pl-5 sm:pl-6">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-editorial-copper">{link}</p>
            <h3 className="mt-2 font-heading text-2xl font-semibold leading-snug">
              <Link to={`/profiles/${id}`} className="underline decoration-editorial-gold decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{name}</Link>
            </h3>
            <p className="mt-1 font-body text-sm font-semibold">{role}</p>
            <p className="mt-3 text-base leading-relaxed">{note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-base">This is a partial list, not a complete one. Every volume we publish makes the next cross reference longer, which is exactly the point.</p>
    </section>
  );
}