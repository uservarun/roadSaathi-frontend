import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle-icon-btn"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "Light" : "Dark"} theme`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} theme`}
    >
      <span style={{ fontSize: "16px", lineHeight: 1, display: "block" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
