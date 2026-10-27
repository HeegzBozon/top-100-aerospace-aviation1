import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDevice } from "@/components/handheld/HandheldShell";
import CommsMainView from "@/components/comms/CommsMainView";
import MobileCommsView from "@/components/comms/MobileCommsView";

// The messaging surface, owned by the surface itself.
//
// It used to be drawn by the old comms layout, which meant the platform's chrome and this
// surface's chrome were the same piece of code — every page paid for it. It is an
// application on the machine like any other: it renders its own content inside the picture
// and asks the console to step aside only while a message is being written on a phone,
// when the keyboard needs the whole glass.
export default function CommsPage() {
  const isMobile = useIsMobile();
  const device = useDevice();
  const [composerActive, setComposerActive] = useState(false);

  useEffect(() => {
    if (!device) return undefined;
    device.setPutAway(composerActive);
    return () => device.setPutAway(false);
  }, [device, composerActive]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isMobile ? (
        <MobileCommsView onComposerActiveChange={setComposerActive} />
      ) : (
        <CommsMainView onOpenMobileSidebar={() => {}} />
      )}
    </div>
  );
}