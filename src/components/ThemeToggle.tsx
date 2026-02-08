import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

declare global {
  interface Window {
    toggleTheme: () => string;
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const handler = (e: Event) => {
      setDark((e as CustomEvent).detail === 'dark');
    };
    document.addEventListener('theme-changed', handler);
    return () => document.removeEventListener('theme-changed', handler);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.toggleTheme()}
      className="collapse-toggle"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
