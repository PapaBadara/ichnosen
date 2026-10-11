import { BookMarked } from "lucide-react";
import { useData } from "../context/DataContext";
import { PageTitle } from "../components/PageTitle";

export function Bibliographie() {
  const { references, all } = useData();

  const countByRef = new Map<string, number>();
  all.forEach((o) => {
    countByRef.set(o.reference_id, (countByRef.get(o.reference_id) ?? 0) + 1);
  });

  const sorted = [...references].sort((a, b) => (a.annee ?? 0) - (b.annee ?? 0));

  return (
    <div>
      <PageTitle icon={BookMarked}>Bibliographie</PageTitle>
      <p style={{ color: "var(--text-secondary)", maxWidth: 680, marginBottom: 28 }}>
        Publications source ayant fait l'objet d'un dépouillement dans la base Ichnosen.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sorted.map((ref) => (
          <div
            key={ref.id}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "clamp(14px, 4vw, 20px)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--brand-cream)", margin: 0 }}>
                {ref.citation}
              </h3>
              <span style={{ color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                {countByRef.get(ref.id) ?? 0} occurrences
              </span>
            </div>
            {ref.titre && (
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "8px 0 0", fontStyle: "italic" }}>
                {ref.titre}
              </p>
            )}
            {ref.revue && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 0" }}>{ref.revue}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
