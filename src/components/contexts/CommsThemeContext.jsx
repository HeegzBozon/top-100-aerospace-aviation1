import React, { createContext, useContext } from "react";

const CommsThemeContext = createContext(null);

export const COMMS_THEME = {
  bg: "linear-gradient(135deg, #0f1d2d 0%, #152a42 50%, #1e3a5a 100%)",
  drawerBg: "linear-gradient(180deg, #0f1f33 0%, #1a2f47 100%)",
  drawerBorder: "rgba(201, 168, 124, 0.15)",
  drawerHeaderBg: "rgba(201, 168, 124, 0.08)",
  drawerHeaderBorder: "rgba(201, 168, 124, 0.2)",
  headerBg: "linear-gradient(to right, #0d1e33, #111f35, #0d1e33)",
  headerBorder: "rgba(255,255,255,0.08)",
  crpBg: "linear-gradient(to right, rgba(15,31,51,0.8), rgba(30,58,90,0.6))",
  crpBorder: "rgba(255,255,255,0.1)",
  constellations: true,
};

export function CommsThemeProvider({ children }) {
  return (
    <CommsThemeContext.Provider value={{ theme: COMMS_THEME }}>
      {children}
    </CommsThemeContext.Provider>
  );
}

export function useCommsTheme() {
  const ctx = useContext(CommsThemeContext);
  if (!ctx) throw new Error("useCommsTheme must be used within CommsThemeProvider");
  return ctx;
}