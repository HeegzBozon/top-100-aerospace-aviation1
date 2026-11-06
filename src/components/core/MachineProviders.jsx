import { ThemeProvider } from "@/components/core/ThemeContext";
import { ConversationProvider } from "@/components/contexts/ConversationContext";
import { UnreadProvider } from "@/components/contexts/UnreadContext";
import { SidebarProvider } from "@/components/contexts/SidebarContext";
import { CommsThemeProvider } from "@/components/contexts/CommsThemeContext";
import { useAuth } from "@/lib/AuthContext";
import usePresenceBeacon from "@/components/core/usePresenceBeacon";

// The machine's own services — the operating system's layer, mounted once above every
// surface. A surface is handed these; it never mounts them for itself, and no page layout
// owns them any more.
//
// The case colour comes from the record standing behind the reading rather than from the
// reading itself: an operator previewing the platform as a visitor still sits at their own
// machine.
export default function MachineProviders({ children }) {
  const { realUser } = useAuth();

  // The heartbeat the desks read: one beat a minute from whoever is signed in, written on
  // their own row, so "on the wire" is a reading of now rather than of the last visit.
  usePresenceBeacon(realUser);

  return (
    <ThemeProvider initialMode={realUser?.theme_mode || "auto"}>
      <ConversationProvider>
        <UnreadProvider>
          <CommsThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </CommsThemeProvider>
        </UnreadProvider>
      </ConversationProvider>
    </ThemeProvider>
  );
}