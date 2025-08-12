// client/src/components/ThemeToggle.jsx
import { useEffect, useState } from 'react';

const KEY = 'theme'; // 'light' | 'dark'

function apply(theme) {
  const root = document.documentElement; // <html>
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme'); // light
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || 'light');
  const isDark = theme === 'dark';

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <button
      type="button"
      className={`toggle-btn ${isDark ? 'on' : ''}`}
      onClick={toggle}
      aria-pressed={isDark}
      title="สลับโหมด Light/Dark"
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-text">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
