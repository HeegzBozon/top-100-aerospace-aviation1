import { useState } from "react";
import ArcadeHall from "@/components/arcade/ArcadeHall";
import ArcadeStage from "@/components/arcade/ArcadeStage";
import { cabinetById } from "@/components/arcade/arcadeConfig";

// The Arcade stands as a room of its own on the campus, and opens as a surface here.
// /arcade?cabinet=sentinel drops straight onto a machine, so a cabinet in the room and
// a cabinet on this page are the same cabinet.
export default function Arcade() {
  const asked = new URLSearchParams(window.location.search).get("cabinet");
  const [active, setActive] = useState(() => cabinetById(asked));

  return (
    <div className="min-h-full bg-editorial-navy">
      {active ? (
        <ArcadeStage cabinet={active} onExit={() => setActive(null)} />
      ) : (
        <ArcadeHall onPlay={(id) => setActive(cabinetById(id))} />
      )}
    </div>
  );
}