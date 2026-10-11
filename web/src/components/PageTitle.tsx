import type { LucideIcon } from "lucide-react";

export function PageTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h1
      style={{
        fontSize: "clamp(22px, 5.5vw, 28px)",
        color: "var(--brand-cream)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Icon size={26} strokeWidth={1.6} color="var(--brand-copper)" aria-hidden />
      {children}
    </h1>
  );
}
