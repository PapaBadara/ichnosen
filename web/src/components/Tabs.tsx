import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          marginBottom: 20,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              borderBottom: i === active ? "2px solid var(--brand-copper)" : "2px solid transparent",
              color: i === active ? "var(--brand-cream)" : "var(--text-muted)",
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: i === active ? 600 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon && (
              <tab.icon
                size={15}
                strokeWidth={1.75}
                color={i === active ? "var(--brand-copper)" : "currentColor"}
                aria-hidden
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  );
}
