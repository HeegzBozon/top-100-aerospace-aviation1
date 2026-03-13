import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/entities/User";
import { themes, getAutoTheme, getCSSVariables } from "./brandTheme";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialMode = 'auto' }) {
  const [themeMode, setThemeMode] = useState(initialMode);
  const [currentTheme, setCurrentTheme] = useState(getAutoTheme());

  useEffect(() => {
    let interval;
    if (themeMode === 'auto') {
      setCurrentTheme(getAutoTheme());
      interval = setInterval(() => setCurrentTheme(getAutoTheme()), 60000);
    } else {
      setCurrentTheme(themeMode);
    }
    return () => clearInterval(interval);
  }, [themeMode]);

  const setTheme = async (newMode) => {
    setThemeMode(newMode);
    try {
      await User.updateMyUserData({ theme_mode: newMode });
    } catch {}
  };

  const themeVars = themes[currentTheme] || themes.brand;

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, themeVars, setTheme }}>
      <style>{getCSSVariables(themeVars)}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}