import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDevice } from "@/components/handheld/HandheldShell";
import CommsMainView from "@/components/comms/CommsMainView";
import MobileCommsView from "@/components/comms/MobileCommsView";
import { useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/mobile/PullToRefresh";

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
  const queryClient = useQueryClient();

  // A pull at the head of the list re-reads the threads, the channels and the counts.
  const refresh = () =>
    Promise.all(
      ["conversations", "public-channels", "messages", "unread-counts"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );

  useEffect(() => {
    if (!device) return undefined;
    device.setPutAway(composerActive);
    return () => device.setPutAway(false);
  }, [device, composerActive]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isMobile && !composerActive && <PullToRefresh onRefresh={refresh} />}
      {isMobile ? (
        <MobileCommsView onComposerActiveChange={setComposerActive} />
      ) : (
        <CommsMainView onOpenMobileSidebar={() => {}} />
      )}
    </div>
  );
}