import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      aria-pressed={isDark}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={`inline-flex items-center justify-center rounded-full border border-[#e4e7ec] bg-white text-[#344054] transition hover:border-[#155eef]/40 hover:text-[#155eef] dark:border-[#273858] dark:bg-[#14213a] dark:text-[#dbe7ff] dark:hover:border-[#4f8cff] ${compact ? "size-9" : "h-10 gap-2 px-3 text-sm font-semibold"}`}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {!compact && <span>{isDark ? "Clair" : "Sombre"}</span>}
    </button>
  );
}
