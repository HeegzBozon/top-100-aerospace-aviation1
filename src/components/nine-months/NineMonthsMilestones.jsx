const milestones = [
  {
    title: 'Artemis II flew.',
    text: 'April 1 through 10. Koch became the first woman beyond low Earth orbit. Glover became the first Black astronaut to make the trip. Hansen became the first non-American. Three firsts in one capsule.',
  },
  {
    title: 'The X-59 went supersonic.',
    text: 'On June 5, NASA research pilot Jim Less took Lockheed Martin’s quiet supersonic demonstrator through Mach 1.1 at 43,400 feet on an 81-minute flight. His description of the moment: the gauges told him he was supersonic, and he didn’t feel a thing. One week later the aircraft hit its Mach 1.4 design point. If overland supersonic flight returns to commercial service, this is the flight that started it.',
  },
  {
    title: 'Starship caught a booster again.',
    text: 'July 24. Full-duration ascent, twenty Starlink satellites deployed, Super Heavy returned to the tower arms for the second time in the program’s history.',
  },
  {
    title: 'China launched and recovered on a maiden flight.',
    text: 'July 10, Wenchang. The Long March 10B put its first stage back on the ground the first time it ever flew.',
  },
  {
    title: 'Falcon 9 hit one hundred launches by August 22.',
    text: 'One hundred flights in 234 days. A decade ago that was an entire planet’s annual output.',
  },
  {
    title: 'And the industry counted its dead honestly.',
    text: 'Early this year the NTSB published its final report on the Potomac midair collision that killed 67 people. The finding was not pilot error. It was a helicopter route placed too close to a runway approach path, and a regulator that knew and did not act. That report is now driving changes to route design, separation procedures and collision avoidance across the National Airspace System. Somebody wrote that report. Several somebodies spent a year of their lives on it.',
  },
];

export default function NineMonthsMilestones() {
  return (
    <section aria-labelledby="nine-months-milestones" className="mt-14 sm:mt-20">
      <h2 id="nine-months-milestones" className="font-heading text-3xl font-normal leading-tight sm:text-4xl">What the industry did between January and September</h2>
      <div className="mt-8 divide-y divide-editorial-copper">
        {milestones.map(({ title, text }) => (
          <section key={title} className="py-7 sm:py-9">
            <h3 className="mb-3 font-heading text-2xl font-semibold leading-snug">{title}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </section>
  );
}