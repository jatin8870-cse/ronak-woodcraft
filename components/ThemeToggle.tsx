
"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let savedTheme: Theme = "system";

    try {
      const saved = localStorage.getItem("rwc-theme");

      if (saved === "light" || saved === "dark") {
        savedTheme = saved;
      }
    } catch {}

    setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "system" ? media.matches : theme === "dark";

      setDark(isDark);

      document.documentElement.dataset.theme = isDark
        ? "dark"
        : "light";

      document.documentElement.style.colorScheme = isDark
        ? "dark"
        : "light";
    };

    applyTheme();

    if (theme === "system") {
      media.addEventListener("change", applyTheme);
    }

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [theme, mounted]);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";

    setTheme(next);
    setDark(next === "dark");

    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;

    try {
      localStorage.setItem("rwc-theme", next);
    } catch {}
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={
        theme === "system"
          ? "System theme"
          : dark
            ? "Dark mode"
            : "Light mode"
      }
    >
      {theme === "system" ? (
        <Monitor size={18} />
      ) : dark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}

