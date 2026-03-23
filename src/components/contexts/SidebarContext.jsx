import { createContext, useContext, useState, useMemo } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const value = useMemo(() => ({ sidebarExpanded, setSidebarExpanded }), [sidebarExpanded]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}