import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Eye, Search, SlidersHorizontal, X } from "lucide-react";
import "./datatable.css";

const PAGE_SIZES = [5, 10, 20, 40, 80, 100];

type CellValue = string | number | null | undefined;

export interface Column<T> {
  key: string;
  label: string;
  /** Valeur brute, utilisée pour le tri, les filtres et l'affichage par défaut. */
  value: (row: T) => CellValue;
  render?: (row: T) => ReactNode;
  /** "select" : liste des valeurs présentes ; "text" : saisie libre. */
  filter?: "select" | "text";
  align?: "left" | "right";
  width?: number | string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Texte parcouru par la recherche globale ; sans lui, pas de champ de recherche. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  onView?: (row: T) => void;
  defaultPageSize?: number;
  emptyText?: string;
}

/** Minuscules sans accents, pour des recherches tolérantes (« ecaille » trouve « écaille »). */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function asText(v: CellValue): string {
  return v === null || v === undefined ? "" : String(v);
}

function compare(a: CellValue, b: CellValue): number {
  const emptyA = a === null || a === undefined || a === "";
  const emptyB = b === null || b === undefined || b === "";
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" });
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Rechercher…",
  onView,
  defaultPageSize = 10,
  emptyText = "Aucun résultat.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);
  // Sur mobile, les filtres de colonnes sont repliés derrière un bouton.
  const [showFilters, setShowFilters] = useState(false);

  const filterCols = columns.filter((c) => c.filter);
  const searchIndex = useMemo(
    () => (searchText ? new Map(rows.map((r) => [rowKey(r), normalize(searchText(r))])) : null),
    [rows, rowKey, searchText],
  );

  /** Lignes qui passent la recherche et tous les filtres, sauf éventuellement `except`. */
  function applyFilters(except?: string): T[] {
    const q = normalize(search.trim());
    return rows.filter((row) => {
      if (q && searchIndex && !searchIndex.get(rowKey(row))?.includes(q)) return false;
      return filterCols.every((col) => {
        const f = filters[col.key];
        if (!f || col.key === except) return true;
        const v = asText(col.value(row));
        return col.filter === "select" ? v === f : normalize(v).includes(normalize(f));
      });
    });
  }

  const visible = applyFilters();

  // Filtres à facettes : chaque liste ne propose que les valeurs encore présentes
  // compte tenu des autres filtres, avec leur effectif.
  const facetOptions: Record<string, { value: string; count: number }[]> = {};
  filterCols
    .filter((c) => c.filter === "select")
    .forEach((col) => {
      const counts = new Map<string, number>();
      applyFilters(col.key).forEach((row) => {
        const v = asText(col.value(row));
        if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
      });
      facetOptions[col.key] = Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
        a.value.localeCompare(b.value, "fr", { numeric: true }),
      );
    });

  const sortCol = sort && columns.find((c) => c.key === sort.key);
  const sorted = sortCol ? [...visible].sort((a, b) => compare(sortCol.value(a), sortCol.value(b)) * sort.dir) : visible;

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const activeFilters = filterCols.filter((c) => filters[c.key]);
  const hasCriteria = activeFilters.length > 0 || search.trim() !== "";

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  function resetAll() {
    setFilters({});
    setSearch("");
    setPage(1);
  }

  function toggleSort(key: string) {
    setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));
  }

  return (
    <div className="dt">
      <div className="dt-toolbar">
        {searchText && (
          <div className="dt-search">
            <Search size={16} strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        {filterCols.length > 0 && (
          <button
            className={`dt-filters-toggle${activeFilters.length ? " is-set" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden />
            Filtres{activeFilters.length > 0 && ` (${activeFilters.length})`}
          </button>
        )}
        <p className="dt-count">
          <strong>{visible.length}</strong> résultat{visible.length > 1 ? "s" : ""}
          {visible.length !== rows.length && <span> sur {rows.length}</span>}
        </p>
      </div>

      {filterCols.length > 0 && (
        <div className={`dt-filters${showFilters ? " is-open" : ""}`}>
          {filterCols.map((col) =>
            col.filter === "select" ? (
              <label key={col.key} className={`dt-filter${filters[col.key] ? " is-set" : ""}`}>
                <span>{col.label}</span>
                <select value={filters[col.key] ?? ""} onChange={(e) => setFilter(col.key, e.target.value)}>
                  <option value="">Tous</option>
                  {facetOptions[col.key].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.value} ({o.count})
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label key={col.key} className={`dt-filter${filters[col.key] ? " is-set" : ""}`}>
                <span>{col.label}</span>
                <input
                  type="text"
                  placeholder="Contient…"
                  value={filters[col.key] ?? ""}
                  onChange={(e) => setFilter(col.key, e.target.value)}
                />
              </label>
            ),
          )}
        </div>
      )}

      {hasCriteria && (
        <div className="dt-chips">
          {search.trim() && (
            <button className="dt-chip" onClick={() => setSearch("")}>
              « {search.trim()} » <X size={12} aria-label="Retirer" />
            </button>
          )}
          {activeFilters.map((col) => (
            <button key={col.key} className="dt-chip" onClick={() => setFilter(col.key, "")}>
              {col.label} : {filters[col.key]} <X size={12} aria-label="Retirer" />
            </button>
          ))}
          <button className="dt-reset" onClick={resetAll}>
            Effacer tout
          </button>
        </div>
      )}

      {/* Tri sur mobile : l'en-tête du tableau est masqué au profit de cartes */}
      <label className="dt-mobile-sort">
        Trier par
        <select
          value={sort ? `${sort.key}:${sort.dir}` : ""}
          onChange={(e) => {
            const [key, dir] = e.target.value.split(":");
            setSort(key ? { key, dir: Number(dir) as 1 | -1 } : null);
          }}
        >
          <option value="">Ordre par défaut</option>
          {columns
            .filter((c) => c.sortable !== false)
            .flatMap((c) => [
              <option key={`${c.key}:1`} value={`${c.key}:1`}>
                {c.label} (croissant)
              </option>,
              <option key={`${c.key}:-1`} value={`${c.key}:-1`}>
                {c.label} (décroissant)
              </option>,
            ])}
        </select>
      </label>

      <div className="dt-scroll scrollbar-thin">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                const dir = sort?.key === col.key ? sort.dir : 0;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align ?? "left" }}
                    aria-sort={dir === 1 ? "ascending" : dir === -1 ? "descending" : undefined}
                  >
                    {sortable ? (
                      <button className="dt-sort" onClick={() => toggleSort(col.key)} title="Trier">
                        {col.label}
                        <span className={`dt-sort-icon${dir ? " is-on" : ""}`} aria-hidden>
                          {dir === -1 ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                        </span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
              {onView && <th style={{ width: 120, textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onView ? 1 : 0)} className="dt-empty">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => {
                    const raw = asText(col.value(row));
                    return (
                      <td
                        key={col.key}
                        data-label={col.label}
                        style={{ textAlign: col.align ?? "left" }}
                        title={col.render ? undefined : raw}
                      >
                        {col.render ? col.render(row) : raw || <span className="dt-null">-</span>}
                      </td>
                    );
                  })}
                  {onView && (
                    <td className="dt-actions" style={{ textAlign: "right" }}>
                      <button className="dt-view" onClick={() => onView(row)}>
                        <Eye size={14} strokeWidth={1.75} aria-hidden />
                        Détail
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dt-footer">
        <label className="dt-size">
          Afficher
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          par page
        </label>
        <p className="dt-range">
          {sorted.length === 0 ? "0 résultat" : `${start + 1} à ${start + pageRows.length} sur ${sorted.length}`}
        </p>
        <Pagination page={current} pageCount={pageCount} onChange={setPage} />
      </div>
    </div>
  );
}

/** Numéros de page avec ellipses : 1 … 4 5 6 … 20 */
function pageItems(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(count - 1, page + 1);
  if (from > 2) items.push("…");
  for (let i = from; i <= to; i++) items.push(i);
  if (to < count - 1) items.push("…");
  items.push(count);
  return items;
}

function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  return (
    <nav className="dt-pages" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>
        Précédent
      </button>
      {pageItems(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="dt-ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            className={p === page ? "is-current" : undefined}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button disabled={page === pageCount} onClick={() => onChange(page + 1)}>
        Suivant
      </button>
    </nav>
  );
}
