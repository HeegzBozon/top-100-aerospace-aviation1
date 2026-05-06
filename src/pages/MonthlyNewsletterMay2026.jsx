import EditorialTerminal from '@/components/terminal/EditorialTerminal';
import ArticleHero from '@/components/newsletter/ArticleHero';
import ArticleSection from '@/components/newsletter/ArticleSection';
import QuoteBand from '@/components/newsletter/QuoteBand';
import NewsletterCTA from '@/components/newsletter/NewsletterCTA';
import { Plane, Shield, Rocket, Sparkles, MapPin } from 'lucide-react';

const artemisFellows = [
  ['Jacquelyn Noel', '#36', 'Systems Engineer at Stellar Solutions, building HLS systems that move us closer to surface deployment.'],
  ['Alice Pellegrino', '#52', 'Operational coordination at Redwire Space, holding complex multi-year programmes together.'],
  ['Martina Dimoska', '#64', 'Additive manufacturing for space, a prerequisite for sustained lunar presence.'],
  ['Charlotte Pouwels', '#78', 'Satellite navigation engineering where margins are measured in milliseconds and meters.'],
  ['Luísa Santos', '#58', 'Machine learning for guidance and navigation through the most dangerous minutes of descent.'],
  ['Noor Haj-Tamim', '#75', 'Human performance research across microgravity, radiation exposure, and sleep disruption.'],
  ['Michaela Musilova, PhD.', '#96', 'Analog mission leadership and research at the extreme limits of life.'],
  ['Melodie Yashar', '#91', 'Space architecture for the human reality of living and working inside spacecraft.'],
  ['Holly Pascal', '#94', 'NASA SCaN communications infrastructure across voice, telemetry, video, and navigation data.'],
  ['Shelli Brunswick', '#7', 'Policy frameworks and public narratives that keep programs like Artemis institutionally viable.'],
];

function Paragraph({ children }) {
  return <p>{children}</p>;
}

export default function MonthlyNewsletterMay2026() {
  return (
    <EditorialTerminal>
      <main className="min-h-screen bg-slate-950 text-white">
        <ArticleHero
          eyebrow="Monthly Briefing • May 2026"
          title="The Sky Was Stress-Tested. The Index Kept Building."
          subtitle="Four months into 2026, aerospace and aviation has been reshaped by war, budgets, bankruptcies, orbital filings, and the return of humans beyond Earth orbit."
        />

        <div className="mx-auto max-w-5xl space-y-12 px-6 pb-24 md:px-12 -mt-10 relative z-20">
          <section className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-7 shadow-2xl backdrop-blur-xl md:p-11">
            <div className="space-y-5 text-base leading-8 text-slate-300 md:text-lg md:leading-9">
              <Paragraph>In the first four months of 2026, the aerospace and aviation sector has been stress-tested across every dimension simultaneously: a Middle East war that grounded a million passengers overnight, a Pentagon budget request that rewrote the meaning of defense spending, and a space race that now involves six-figure satellite filings and the largest IPO in history waiting in the wings.</Paragraph>
              <Paragraph>The people in our index are building, flying, and deciding inside these conditions right now. And if you're reading this, so are you. This is the world we are navigating, together.</Paragraph>
            </div>
            <QuoteBand>Let&apos;s get into it.</QuoteBand>
          </section>

          <ArticleSection id="commercial-aviation" kicker="Sector Signal" title="Commercial Aviation" icon={Plane}>
            <Paragraph>More than 20,000 flights grounded in the war&apos;s opening days. Over a million passengers stranded. That is not a disruption. That is a restructuring.</Paragraph>
            <Paragraph>And then, at 3:00 AM on May 2nd, Spirit Airlines turned off the lights. No merger. No rescue. No buyer. After failed acquisition attempts with JetBlue and Frontier, and with fuel prices spiking in the wake of the conflict, Spirit&apos;s CEO told CNBC the airline had simply “run out of runway.” The planes stopped. The gates went dark. The carrier that flew 44 million Americans last year ceased to exist overnight.</Paragraph>
            <Paragraph>Within days, a viral grassroots campaign called “Let&apos;s Buy Spirit” drew tens of thousands of supporters pledging millions of dollars to resurrect the airline as a community-owned model. A 22-year-old TikToker named Hunter Peterson posted the idea, stood up a website, watched it crash under traffic, and by Monday had roughly $88 million in non-binding pledges. The target is $1.75 billion.</Paragraph>
            <Paragraph>Experts are skeptical, and they&apos;re probably right. Spirit doesn&apos;t even have enough cash to host an organized auction of its own aircraft. The economics of airline ownership are brutal. But that&apos;s not the signal.</Paragraph>
            <Paragraph>The signal is that the disappearance of Spirit represents a possible erosion of genuinely low-cost flying. Eighty-eight million dollars in pledges didn&apos;t appear because people loved Spirit. It appeared because people understand, instinctively, what losing it means for the price of the next ticket.</Paragraph>
            <Paragraph>Meanwhile, Qatar Airways canceled nearly 5,000 flights across four weeks of conflict. Emirates, Etihad, and Qatar Airways are operating at 71%, 65%, and 38% of pre-conflict capacity. Lufthansa Group and British Airways have suspended London-Abu Dhabi service through October. Forty percent of India&apos;s $130B annual airline revenue transits the Gulf.</Paragraph>
            <Paragraph>And yet: Boeing logged 143 deliveries in Q1 against a $695B record backlog of more than 6,100 aircraft. Airbus is targeting 870 deliveries in 2026. The production picture, medium-term, is intact.</Paragraph>
            <Paragraph>The industry is absorbing the shock. But the people who depend on affordable access to the sky are watching closely. So are we.</Paragraph>
          </ArticleSection>

          <ArticleSection id="defense" kicker="Budget Shock" title="Defense" icon={Shield}>
            <Paragraph>A “golden opportunity” — Lockheed CEO Jim Taiclet&apos;s words, not ours. But the numbers back it up, and the opportunity is real.</Paragraph>
            <Paragraph>The Pentagon&apos;s FY27 request comes in at $1.5 trillion, up 44%. Lockheed&apos;s Q1 2026 all-defense backlog hit a record $194 billion. THAAD interceptor production has quadrupled. RTX is carrying $268B in backlog. Patriot, SM-6, Tomahawk: all ramping.</Paragraph>
            <Paragraph>Stocks have been volatile despite the tailwinds. iShares ITA fell 12% from early March. LMT and RTX both logged their worst weeks since 2020 in late April on margin and cash flow concerns. “Peak defense” worries are real, even as the demand signals aren&apos;t.</Paragraph>
            <Paragraph>U.S. munitions stockpiles are roughly half-depleted on Patriot and THAAD, and approximately 45% depleted on precision strike. Replacement timelines are measured in years, not quarters.</Paragraph>
            <Paragraph>The European side of this story is its own signal: Exail Technologies up 420% in 2025. NATO&apos;s €1B innovation fund. Poland at 4.7% of GDP in defense. Germany scaling from €86B to €152B by 2029.</Paragraph>
            <Paragraph>The production floors are full. The order books are heavy. The industry is hiring, retooling, and running hot. This is the environment the people in our index are building inside of, right now. And they are not slowing down.</Paragraph>
          </ArticleSection>

          <ArticleSection id="space" kicker="Deep Space" title="Space" icon={Rocket}>
            <Paragraph>On April 1, 2026, humans left Earth orbit for the first time in 54 years.</Paragraph>
            <Paragraph>Artemis II launched from Kennedy Space Center Launch Pad 39B. Ten days later, Commander Reid Wiseman, pilot Victor Glover, mission specialist Christina Koch, and CSA astronaut Jeremy Hansen splashed down off San Diego. Their Orion spacecraft, named “Integrity” by the crew, traveled 252,756 miles from Earth at maximum distance, surpassing the Apollo 13 distance record by 4,105 miles. NASA declared mission well accomplished.</Paragraph>
            <Paragraph>That mission did not happen in a vacuum. It happened because of thousands of professionals across hundreds of institutions building the systems, running the science, holding the comms lines, and designing the interfaces that keep crews alive and capable in deep space. Some of those professionals are in our index.</Paragraph>

            <div className="my-8 grid gap-4 md:grid-cols-2">
              {artemisFellows.map(([name, rank, copy]) => (
                <div key={name} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a87c]">{rank} • TOP 100 Women 2025</div>
                  <h3 className="mt-2 text-xl font-bold text-white">{name}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>

            <Paragraph>Ten Fellows. One mission. All measured, not ranked. See the full Artemis alumni feature at <a href="https://top100aero.space/artemis-2" className="text-[#c9a87c] underline decoration-[#c9a87c]/40 underline-offset-4">top100aero.space/artemis-2</a>.</Paragraph>
            <Paragraph>Elsewhere in space: Lunar Gateway has been cancelled, reshaping the entire Artemis architecture and opening commercial lunar access to a more direct competitive field. China has filed for approximately 200,000 satellite slots with the ITU. SpaceX has roughly 9,400 active Starlinks, recently approved for 7,500 more. Starship V3 completed its first integrated flight test in January.</Paragraph>
            <Paragraph>A SpaceX IPO targeting an approximately $800B valuation may be the largest in history. And Starlink&apos;s documented battlefield role in the Iran war has settled the strategic case for sovereign satellite capacity for every major power on Earth.</Paragraph>
            <QuoteBand>Timelines that were measured in decades are now measured in years.</QuoteBand>
            <Paragraph>The turbulence and the opportunity are the same event, seen from different altitudes. The TOP 100 in this index are flying at all of them. We are proud to follow their contributions.</Paragraph>
          </ArticleSection>

          <ArticleSection id="season-4" kicker="Nominations Open" title="Season 4 Deadline: September 1st" icon={Sparkles} accent>
            <Paragraph>Every person named in this newsletter got here because someone in this community saw them clearly. The engineers who got Orion to the Moon and back. The programme managers holding complex systems together. The scientists studying the edge of human endurance.</Paragraph>
            <Paragraph>Someone knew. Someone nominated. Someone said: this person deserves to be recognized. That is the mechanism. And Season 4 is open right now.</Paragraph>
            <Paragraph>If you know someone building, flying, funding, or shaping the future of aerospace and aviation, put their name in. Women, men, angels. Forty countries, seventy disciplines, one standard.</Paragraph>
            <NewsletterCTA title="Nominate for Season 4" body="Put forward the builders, operators, investors, scientists, and leaders shaping aerospace and aviation now." buttonLabel="Nominate Now" to="/nominate" />
          </ArticleSection>

          <ArticleSection id="local-legends" kicker="P.S." title="One More Thing: Local Legends" icon={MapPin}>
            <Paragraph>You know the gym that&apos;s kept you sane through crunch cycles. The childcare center that makes your schedule actually work. The therapist who&apos;s heard things your manager never will. The meal prep service that bought you back two hours on a Tuesday.</Paragraph>
            <Paragraph>Those businesses made your career possible in ways that never show up on a resume. They&apos;ve never been recognized for it. That changes now.</Paragraph>
            <Paragraph>Local Legends is a community spotlight for the businesses that fuel the people building the future of flight. Nominate the ones in your city. We build the map. Every hub we cover becomes a relocation guide for the next aerospace professional who lands there and needs to know where to go.</Paragraph>
            <Paragraph>You nominate, they get recognized, the whole community inherits the resource. The nomination lives right inside the same form as Women, Men, and Angels. One stop.</Paragraph>
            <NewsletterCTA title="Think Global. Act Local. Ad Astra." body="Nominate the local businesses powering aerospace communities from the ground up." buttonLabel="Nominate a Local Legend" to="/nominate" />
          </ArticleSection>
        </div>
      </main>
    </EditorialTerminal>
  );
}