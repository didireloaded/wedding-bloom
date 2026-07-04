import { ReactNode } from "react";

export type MobileNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  badge?: number;
  accent?: boolean;
};

/**
 * Fixed bottom navigation bar for mobile viewports.
 * Auto-hides at md+ breakpoints. Respects iOS safe-area.
 * Consumers should add `pb-24` (or similar) to their page container
 * to prevent content being covered.
 */
export function MobileBottomNav({ items }: { items: MobileNavItem[] }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0C0A09]/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 h-[64px]">
        {items.slice(0, 5).map((it) => {
          const isAccent = it.accent && !it.active;
          return (
            <li key={it.id} className="flex">
              <button
                onClick={it.onClick}
                aria-label={it.label}
                aria-current={it.active ? "page" : undefined}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors ${
                  it.active
                    ? "text-[#D4A853]"
                    : isAccent
                    ? "text-[#0C0A09]"
                    : "text-[#A8A29E] hover:text-[#FAF7F2]"
                }`}
              >
                {it.active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#D4A853] rounded-full" />
                )}
                <span
                  className={`flex items-center justify-center ${
                    isAccent
                      ? "w-11 h-11 -mt-6 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8872E] shadow-lg shadow-[#D4A853]/30"
                      : "w-6 h-6"
                  }`}
                >
                  {it.icon}
                  {typeof it.badge === "number" && it.badge > 0 && !isAccent && (
                    <span className="absolute top-1.5 right-[calc(50%-16px)] min-w-[16px] h-[16px] px-1 text-[9px] font-bold bg-[#D4A853] text-[#0C0A09] rounded-full flex items-center justify-center">
                      {it.badge > 99 ? "99+" : it.badge}
                    </span>
                  )}
                </span>
                <span className={`truncate max-w-[64px] ${isAccent ? "mt-0.5" : ""}`}>{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileBottomNav;
