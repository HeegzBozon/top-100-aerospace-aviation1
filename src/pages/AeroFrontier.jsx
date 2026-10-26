import { useState } from "react";
import { Map, Plane, ScrollText, Sprout, Wrench } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import useGlass from "@/hooks/useGlass";
import GlassConsole from "@/components/handheld/GlassConsole";
import useAeroFrontier from "@/components/aero-frontier/useAeroFrontier";
import AeroHeader from "@/components/aero-frontier/AeroHeader";
import AeroOpening from "@/components/aero-frontier/AeroOpening";
import AeroFieldPanel from "@/components/aero-frontier/AeroFieldPanel";
import AeroAircraftPanel from "@/components/aero-frontier/AeroAircraftPanel";
import AeroFlightPanel from "@/components/aero-frontier/AeroFlightPanel";
import AeroLogPanel from "@/components/aero-frontier/AeroLogPanel";
import AeroRoadmapPanel from "@/components/aero-frontier/AeroRoadmapPanel";

// Aero-Frontier. The game surface: an inherited airfield, a monoplane under a
// tarp, and a season of weekends between the two.
//
// On the glass it is a console like every other surface — the panels are handed
// to GlassConsole, so the click wheel walks them and A opens one. On the desk the
// same panels stack in two columns, because a field is no less work on a wide
// screen, it is just easier to see at once.
export default function AeroFrontier() {
  const glass = useGlass();
  const aero = useAeroFrontier();
  const [openPanel, setOpenPanel] = useState(null);

  if (aero.status === "loading") return <AeroOpening />;

  if (aero.status === "failed" || !aero.doc) {
    return (
      <AeroOpening
        label="The field would not open"
        note="The save could not be read this time. Nothing has been lost; the field is still there."
        onRetry={aero.retry}
      />
    );
  }

  const panels = [
    {
      key: "field",
      label: "The Field",
      hint: "Work the ground before you touch the aeroplane",
      icon: Sprout,
      node: <AeroFieldPanel aero={aero} />,
    },
    {
      key: "airframe",
      label: "The Airframe",
      hint: "Salvage, hours, and a monoplane coming back",
      icon: Wrench,
      node: <AeroAircraftPanel aero={aero} />,
    },
    {
      key: "flight",
      label: "The First Flight",
      hint: "Five legs over the foothills",
      icon: Plane,
      node: <AeroFlightPanel aero={aero} />,
    },
    {
      key: "log",
      label: "The Field Log",
      hint: "Days worked, and what they cost",
      icon: ScrollText,
      node: <AeroLogPanel aero={aero} />,
    },
    {
      key: "plan",
      label: "The Road Ahead",
      hint: "Four acts, one field",
      icon: Map,
      node: <AeroRoadmapPanel aero={aero} />,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      {glass ? (
        <>
          <AeroHeader aero={aero} glass />
          <div className="mt-3">
            <GlassConsole
              kicker="Aero-Frontier"
              panels={panels}
              openKey={openPanel}
              onOpen={setOpenPanel}
            />
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <AeroHeader aero={aero} />

          <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
            {panels.map((panel) => {
              const Icon = panel.icon;
              return (
                <section
                  key={panel.key}
                  className="overflow-hidden rounded-2xl pb-2"
                  style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
                >
                  <div className="flex items-center gap-2 px-4 pt-4">
                    <Icon className="h-[14px] w-[14px]" style={{ color: B.copper }} />
                    <h2 className="font-heading text-[15px]" style={{ color: B.navy }}>
                      {panel.label}
                    </h2>
                  </div>
                  <p className="px-4 pt-1 text-[11px]" style={{ color: B.muted }}>
                    {panel.hint}
                  </p>
                  <div className="mt-1">{panel.node}</div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}