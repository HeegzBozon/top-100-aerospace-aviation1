import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EditorialTerminal from '@/components/terminal/EditorialTerminal';

const markdownContent = `
# The Women Behind the Mission: TOP 100 Fellows and the Artemis 2 Moment

*By TOP 100 Aerospace & Aviation | April 2026*

---

On April 4, 2026, four humans will climb into an Orion capsule, ride the most powerful rocket ever built, and fly around the Moon for the first time since 1972.

Most of the world will watch the launch.

We looked at who built what gets them there.

TOP 100 Aerospace & Aviation recognizes and measures accomplished professionals across the global aerospace and aviation industry. Our directory spans 100 verified Fellows across 49 countries. When Artemis 2 lifted off, we went through every profile to answer a simple question: who in our community has a direct connection to this mission?

The answer: ten women. Systems engineers. Bioastronautics researchers. Lunar landing AI developers. Analog astronaut commanders. Space architects. A NASA headquarters communications lead. A space programme manager at a NASA commercial partner. A policy architect who has spent decades building the institutional infrastructure that makes missions like this possible.

They are not bystanders to history. They are threads in its fabric.

---

## The Engineers

**Jacquelyn Noel** (Fellow #36) is a systems engineer on the NASA Human Landing System — the program designed to deliver astronauts from lunar orbit to the surface of the Moon. While Artemis 2 is a crewed lunar flyby rather than a surface landing, it is the critical precursor. Everything Noel's team builds is one successful mission closer to deployment. She works at Stellar Solutions, one of the engineering firms embedded in NASA's HLS architecture.

**Alice Pellegrino** (Fellow #52) is a programme manager at Redwire Space, a company that has become one of NASA's most significant commercial partners in the Artemis era. Redwire's work spans in-space manufacturing, deployable structures, and payload systems on both ISS and Artemis infrastructure. Pellegrino manages the operational side of that work — the coordination layer that holds complex, multi-stakeholder programmes together.

**Martina Dimoska** (Fellow #64) works at the intersection of human spaceflight and additive manufacturing. The ability to manufacture components in space — rather than launching every bolt from Earth — is one of the technologies that will determine whether sustained lunar presence becomes economically viable. Dimoska is working on that problem now.

---

## The Scientists

**Luísa Santos** (Fellow #58) is a deep learning engineer whose research focuses specifically on landing future astronauts on the Moon. Her work applies machine learning to the guidance and navigation challenges of lunar descent — the twelve most dangerous minutes of any crewed lunar mission. She is also training as an analog astronaut, bridging the gap between the researcher who models the problem and the operator who will one day live it.

**Noor Haj-Tamim** (Fellow #75) is a bioastronautics researcher developing technologies to advance human performance in aviation and space. Artemis 2 is a ten-day crewed mission. The crew will experience microgravity, radiation exposure, sleep disruption, and the psychological weight of being further from Earth than any humans have been in over fifty years. Haj-Tamim's research addresses the science of keeping them capable under those conditions.

**Michaela Musilova** (Fellow #96) has led over thirty simulated missions to the Moon and Mars as an analog astronaut. As an astrobiologist, her scientific focus is on the extreme limits of life on Earth — and what those limits tell us about the possibility of life elsewhere. She has rehearsed lunar surface operations more times than most people have thought about them. When Artemis 2 departs, she will be watching with a rare and specific depth of knowledge.

**Charlotte Pouwels** (Fellow #78) is a space engineer from the Netherlands who specializes in analog astronaut missions and satellite navigation systems. Navigation is one of the most technically demanding aspects of a crewed lunar flyby — the difference between a free-return trajectory that brings the crew home safely and one that does not is measured in milliseconds and meters. Pouwels works on the systems that make that precision possible.

---

## The Architects and Designers

**Melodie Yashar** (Fellow #91) is a space architect and researcher in human-machine interaction. Her work asks a question that sounds simple but isn't: what does it feel like to be human in a spacecraft? What configurations reduce cognitive load? What layouts support the physical and psychological demands of a mission that takes crew members beyond the reach of any rescue? Yashar's research feeds directly into the habitat and crew systems design that Artemis will eventually require for longer missions. Artemis 2 is the proof of concept. The architecture Yashar studies is the long game.

---

## The Infrastructure

**Holly Pascal** (Fellow #94) works at NASA Headquarters as part of the Space Communications and Navigation (SCaN) program. SCaN is the communications backbone for all NASA missions — the network of ground stations, relay satellites, and protocols that ensure signals travel reliably between spacecraft and Earth. For Artemis 2, that means voice communication, telemetry, video downlink, and navigation data across a quarter-million miles. Pascal also leads the Women's Aerospace Network at NASA, amplifying underrepresented voices in the agency that is currently executing the most ambitious human spaceflight program since Apollo.

**Shelli Brunswick** (Fellow #7) is CEO of SB Global LLC and one of the most recognized voices in the global space ecosystem. Her career spans the U.S. Air Force, the Space Foundation, and advisory roles across commercial, government, and international space sectors. She has spent decades building the policy frameworks, partnership structures, and public narratives that make programs like Artemis politically and institutionally viable. Artemis does not exist in a vacuum. It exists because of decades of work by people like Brunswick to maintain the conditions under which large-scale human spaceflight remains funded, prioritized, and supported across administrations.

---

## What This Moment Means

Artemis 2 is a mission. It is also a symbol — proof that humanity did not stop at low Earth orbit. That we decided to go back, and further.

But symbols are made of specifics. The signal that reaches Earth because of communications infrastructure. The trajectory calculated by navigation systems. The landing algorithms being refined right now. The analog training that turns a simulation into muscle memory. The policy architecture that kept the budget intact through four administrations.

Every one of those specifics has people behind it.

Ten of those people are in our directory.

We built TOP 100 Aerospace & Aviation because we believe the aerospace industry deserves a record — not of missions, but of people. The platform measures contribution, verification, and engagement over time. It does not rank. It documents.

This is what that documentation looks like when history is in motion.

---

*TOP 100 Aerospace & Aviation is an institutional recognition platform for accomplished professionals in aerospace and aviation. Season 4 is now open. Learn more at top100aero.space. Support our platform build at wefunder.com/top.100.aerospace.aviation.*
`;

export default function ArtemisArticle() {
  return (
    <EditorialTerminal>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-serif pt-12 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
            <ReactMarkdown 
              className="prose prose-invert prose-slate max-w-none 
                prose-headings:font-serif prose-headings:text-[#c9a87c]
                prose-h1:text-3xl md:prose-h1:text-5xl prose-h1:font-bold prose-h1:leading-tight prose-h1:mb-8
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-white prose-strong:font-bold
                prose-hr:border-slate-800 prose-hr:my-10
                prose-em:text-slate-400 prose-em:italic"
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </EditorialTerminal>
  );
}