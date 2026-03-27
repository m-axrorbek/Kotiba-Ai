import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("kotiba-theme") === "dark" || 
      (!localStorage.getItem("kotiba-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kotiba-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kotiba-theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-full border border-ink-200 bg-white/80 text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-white dark:hover:bg-ink-700"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
