import { Link } from 'react-router-dom';

// Alumni references below are cross-referenced against the TOP 100 archive:
// each name is tied to work that honoree's own record describes.
function Honoree({ id, children }) {
  return (
    <Link
      to={`/profiles/${id}`}
      className="font-semibold underline decoration-editorial-gold decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </Link>
  );
}

const milestones = [
  {
    title: 'Artemis II flew.',
    body: (
      <>
        <p>April 1 through 10. Koch became the first woman beyond low Earth orbit. Glover became the first Black astronaut to make the trip. Hansen became the first non-American. Three firsts in one capsule.</p>
        <p className="mt-4">Names from our own archive sit inside that program. <Honoree id="696ae403ffe497faddbc7105">Holly Pascal</Honoree> works at NASA Headquarters on Space Communications and Navigation, the layer that carries mission-critical voice, telemetry, video and navigation data. Nothing a crew ten days from Earth says or sees reaches the ground without it. <Honoree id="6a6b69c0f957e8c00dd4ca48">Julio (JC) Perez-Khweis</Honoree> does systems engineering on the Artemis space suit at Johnson Space Center, the hardware that has to work when the program stops circling and starts walking. <Honoree id="696ae3d0a47e0312f3dde204">Jacquelyn Noel</Honoree> is a systems engineer in the Human Landing System program management office, working across the lander contracts that take Artemis the rest of the way down.</p>
      </>
    ),
  },
  {
    title: 'The X-59 went supersonic.',
    body: (
      <p>On June 5, NASA research pilot Jim Less took Lockheed Martin’s quiet supersonic demonstrator through Mach 1.1 at 43,400 feet on an 81-minute flight. His description of the moment: the gauges told him he was supersonic, and he didn’t feel a thing. One week later the aircraft hit its Mach 1.4 design point. If overland supersonic flight returns to commercial service, this is the flight that started it.</p>
    ),
  },
  {
    title: 'Starship caught a booster again.',
    body: (
      <p>July 24. Full-duration ascent, twenty Starlink satellites deployed, Super Heavy returned to the tower arms for the second time in the program’s history.</p>
    ),
  },
  {
    title: 'China launched and recovered on a maiden flight.',
    body: (
      <p>July 10, Wenchang. The Long March 10B put its first stage back on the ground the first time it ever flew.</p>
    ),
  },
  {
    title: 'Falcon 9 hit one hundred launches by August 22.',
    body: (
      <p>One hundred flights in 234 days. A decade ago that was an entire planet’s annual output.</p>
    ),
  },
  {
    title: 'And the industry counted its dead honestly.',
    body: (
      <p>Early this year the NTSB published its final report on the Potomac midair collision that killed 67 people. The finding was not pilot error. It was a helicopter route placed too close to a runway approach path, and a regulator that knew and did not act. That report is now driving changes to route design, separation procedures and collision avoidance across the National Airspace System. Somebody wrote that report. Several somebodies spent a year of their lives on it.</p>
    ),
  },
];

export default function NineMonthsMilestones() {
  return (
    <section aria-labelledby="nine-months-milestones" className="mt-14 sm:mt-20">
      <h2 id="nine-months-milestones" className="font-heading text-3xl font-normal leading-tight sm:text-4xl">What the industry did between January and September</h2>
      <div className="mt-8 divide-y divide-editorial-copper">
        {milestones.map(({ title, body }) => (
          <section key={title} className="py-7 sm:py-9">
            <h3 className="mb-3 font-heading text-2xl font-semibold leading-snug">{title}</h3>
            {body}
          </section>
        ))}
      </div>
    </section>
  );
}