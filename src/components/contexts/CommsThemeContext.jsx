import React, { createContext, useContext, useState, useEffect } from "react";

const CommsThemeContext = createContext(null);

export const COMMS_THEMES = {
  dark: {
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
    label: "Light Mode",
  },
  light: {
    bg: "linear-gradient(135deg, #f0f4f8 0%, #e8eef5 50%, #dce6f0 100%)",
    drawerBg: "linear-gradient(180deg, #e8eef5 0%, #dce6f0 100%)",
    drawerBorder: "rgba(30, 58, 90, 0.15)",
    drawerHeaderBg: "rgba(201, 168, 124, 0.12)",
    drawerHeaderBorder: "rgba(201, 168, 124, 0.3)",
    headerBg: "linear-gradient(to right, #e8eef5, #edf2f7, #e8eef5)",
    headerBorder: "rgba(30,58,90,0.1)",
    crpBg: "linear-gradient(to right, rgba(232,238,245,0.9), rgba(220,230,240,0.8))",
    crpBorder: "rgba(30,58,90,0.1)",
    constellations: false,
    label: "Dark Mode",
  },
};

export function CommsThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("comms_theme") || "dark"; } catch { return "dark"; }
  });

  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    try { localStorage.setItem("comms_theme", next); } catch {}
  };

  const theme = COMMS_THEMES[mode] || COMMS_THEMES.dark;

  return (
    <CommsThemeContext.Provider value={{ mode, theme, toggleMode }}>
      {children}
    </CommsThemeContext.Provider>
  );
}

export function useCommsTheme() {
  const ctx = useContext(CommsThemeContext);
  if (!ctx) throw new Error("useCommsTheme must be used within CommsThemeProvider");
  return ctx;
}