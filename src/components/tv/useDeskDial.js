import { useEffect, useRef } from "react";
import { registerDeskTuner } from "@/components/desktop/radio/deskTuner";
import { dialNumber } from "@/components/tv/tvChannels";

// THE SET ON THE DESK'S FACEPLATE.
//
// While the television stands on the picture, the faceplate is the set's: the CH knob
// walks the dial and SCAN steps it on, PUSH presses the station under the pointer, and the
// readout prints the station rather than a surface. The machine's own band is handed back
// whole when the surface goes, so nothing else on the desk learns a second behaviour.
export default function useDeskDial({ channels, index, onTune }) {
  const live = useRef({});
  live.current = { channels, index, onTune };

  useEffect(
    () =>
      registerDeskTuner({
        count: () => live.current.channels.length,
        index: () => live.current.index,
        target: () => {
          const channel = live.current.channels[live.current.index];
          if (!channel) return null;
          return { band: "STATION", label: `${dialNumber(channel.number)} · ${channel.name}` };
        },
        step: (direction) => {
          const channel = live.current.channels[live.current.index + direction];
          if (!channel) return;
          live.current.onTune(channel);
        },
        enter: () => {
          const channel = live.current.channels[live.current.index];
          if (!channel) return;
          live.current.onTune(channel);
        },
      }),
    [],
  );
}