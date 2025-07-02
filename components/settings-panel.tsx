"use client"

import React, { useState, useEffect } from "react"

type Theme = {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  sidebarColor: string;
  borderColor: string;
  buttonColor: string;
  buttonHoverColor: string;
};

const themes: Theme[] = [
  {
    id: "dark",
    name: "Dark (Default)",
    backgroundColor: "#1e1e1e",
    textColor: "#ffffff",
    sidebarColor: "#252526",
    borderColor: "#2d2d30",
    buttonColor: "#0e639c",
    buttonHoverColor: "#1177bb",
  },
  {
    id: "light",
    name: "Light",
    backgroundColor: "#ffffff",
    textColor: "#1e1e1e",
    sidebarColor: "#f3f3f3",
    borderColor: "#e0e0e0",
    buttonColor: "#007acc",
    buttonHoverColor: "#005f99",
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    backgroundColor: "#002b36",
    textColor: "#839496",
    sidebarColor: "#073642",
    borderColor: "#586e75",
    buttonColor: "#268bd2",
    buttonHoverColor: "#2aa198",
  },
  {
    id: "dracula",
    name: "Dracula",
    backgroundColor: "#282a36",
    textColor: "#f8f8f2",
    sidebarColor: "#21222c",
    borderColor: "#44475a",
    buttonColor: "#bd93f9",
    buttonHoverColor: "#ff79c6",
  },
];

export function SettingsPanel() {
  const [selectedTheme, setSelectedTheme] = useState<string>("dark");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("algorand-ide-theme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark"); // Apply default dark theme if no theme is saved
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty("--background-color", theme.backgroundColor);
      document.documentElement.style.setProperty("--text-color", theme.textColor);
      document.documentElement.style.setProperty("--sidebar-color", theme.sidebarColor);
      document.documentElement.style.setProperty("--border-color", theme.borderColor);
      document.documentElement.style.setProperty("--button-color", theme.buttonColor);
      document.documentElement.style.setProperty("--button-hover-color", theme.buttonHoverColor);
    }
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newThemeId = event.target.value;
    setSelectedTheme(newThemeId);
    applyTheme(newThemeId);
    localStorage.setItem("algorand-ide-theme", newThemeId);
  };

  return (
    <div className="p-4 h-full overflow-auto" style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}>
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Theme</h3>
        <select
          value={selectedTheme}
          onChange={handleThemeChange}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      {/* Other settings can be added here */}
    </div>
  );
}
