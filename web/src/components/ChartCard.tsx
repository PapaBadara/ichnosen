import type { ReactNode } from "react";

export function ChartCard({ height = 320, legend, children }: { height?: number; legend?: ReactNode; children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        padding: "8px 8px 0",
      }}
    >
      <div style={{ height }}>{children}</div>
      {legend}
    </div>
  );
}

/** Légende HTML sous le graphique : remplace la légende Nivo sur petit écran, où elle prendrait toute la largeur. */
export function ChartLegend({ keys, colors }: { keys: string[]; colors: string[] }) {
  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 14px",
        listStyle: "none",
        margin: 0,
        padding: "4px 8px 12px",
        fontSize: 12,
        color: "var(--text-secondary)",
      }}
    >
      {keys.map((k, i) => (
        <li key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
          {k}
        </li>
      ))}
    </ul>
  );
}
