import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { groupByTaxon, useData } from "../context/DataContext";
import { FilterGroup } from "./FilterGroup";
import "./filterfab.css";

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
      {open && <div className="ff-backdrop" onClick={() => setOpen(false)} />}

      {open && (
        <div className="ff-panel scrollbar-thin" role="dialog" aria-label="Filtres">
          <div className="ff-head">
            <div className="ff-title">
              <SlidersHorizontal size={16} strokeWidth={1.75} color="var(--brand-copper)" aria-hidden />
              Filtres
            </div>
            <button className="ff-close" onClick={() => setOpen(false)} aria-label="Fermer">
              <X size={20} strokeWidth={1.75} />
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

          <p className="ff-summary">
            <strong>{taxonCount}</strong> taxons affichés sur <strong>{allTaxonCount}</strong> total ·{" "}
            <strong>{filtered.length}</strong> occurrences
          </p>
        </div>
      )}

      <button className={`ff-fab${open ? " is-open" : ""}`} onClick={() => setOpen((o) => !o)} aria-label="Filtres">
        <SlidersHorizontal size={22} strokeWidth={2} color="#17140f" />
        {activeGroups > 0 && <span className="ff-badge">{activeGroups}</span>}
      </button>
    </>
  );
}
