import { useDarkMode } from "@/hooks/useDarkMode";

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 bg-background text-foreground border border-border px-2 py-1 text-sm cursor-pointer"
      style={{ borderRadius: 0 }}
    >
      {isDark ? "light" : "dark"}
    </button>
  );
}
