import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { groupByTaxon, useData } from "../context/DataContext";
import { FilterGroup } from "./FilterGroup";

export function FilterFab() {
  const [open, setOpen] = useState(false);
  const { filtered, all, filters, setFilters, options } = useData();
  const taxonCount = groupByTaxon(filtered).length;
  const allTaxonCount = groupByTaxon(all).length;

  const activeGroups = [
    filters.groupes.length < options.groupes.length,
    filters.sousTypes.length < options.sousTypes.length,
    filters.classes.length < options.classes.length,
    filters.bassins.length < options.bassins.length,
    filters.ages.length < options.ages.length,
    filters.references.length < options.references.length,
  ].filter(Boolean).length;

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2000,
          }}
        />
      )}

      {open && (
        <div
          className="scrollbar-thin"
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            width: 360,
            maxWidth: "calc(100vw - 48px)",
            maxHeight: "70vh",
            overflowY: "auto",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            padding: 20,
            zIndex: 2001,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--brand-cream)" }}>
              <SlidersHorizontal size={16} strokeWidth={1.75} color="var(--brand-copper)" aria-hidden />
              Filtres
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <FilterGroup
            label="Groupe"
            options={options.groupes}
            selected={filters.groupes}
            onChange={(v) => setFilters({ ...filters, groupes: v })}
          />
          <FilterGroup
            label="Sous-type"
            options={options.sousTypes}
            selected={filters.sousTypes}
            onChange={(v) => setFilters({ ...filters, sousTypes: v })}
          />
          <FilterGroup
            label="Classe"
            options={options.classes}
            selected={filters.classes}
            onChange={(v) => setFilters({ ...filters, classes: v })}
          />
          <FilterGroup
            label="Bassin"
            options={options.bassins}
            selected={filters.bassins}
            onChange={(v) => setFilters({ ...filters, bassins: v })}
          />
          <FilterGroup
            label="Âge géologique"
            options={options.ages}
            selected={filters.ages}
            onChange={(v) => setFilters({ ...filters, ages: v })}
          />
          <FilterGroup
            label="Référence"
            options={options.references}
            selected={filters.references}
            onChange={(v) => setFilters({ ...filters, references: v })}
          />

          <p style={{ fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 0 }}>
            <strong style={{ color: "var(--brand-cream)" }}>{taxonCount}</strong> taxons affichés sur{" "}
            <strong style={{ color: "var(--brand-cream)" }}>{allTaxonCount}</strong> total ·{" "}
            <strong style={{ color: "var(--brand-cream)" }}>{filtered.length}</strong> occurrences
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Filtres"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--brand-copper)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          cursor: "pointer",
          zIndex: 2002,
        }}
      >
        <SlidersHorizontal size={22} strokeWidth={2} color="#17140f" />
        {activeGroups > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              background: "var(--status-critical)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--page-plane)",
            }}
          >
            {activeGroups}
          </span>
        )}
      </button>
    </>
  );
}
