import { useState } from "react";
import type { TaxonGroup } from "../types";
import { buildTaxonomyTree } from "../lib/taxonomy";

export function TaxonTree({ taxa, onSelect }: { taxa: TaxonGroup[]; onSelect: (taxonId: string) => void }) {
  const tree = buildTaxonomyTree(taxa);
  const [openGroupes, setOpenGroupes] = useState<Set<string>>(new Set());
  const [openOrdres, setOpenOrdres] = useState<Set<string>>(new Set());
  const [openGenres, setOpenGenres] = useState<Set<string>>(new Set());

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  }

  return (
    <div
      className="scrollbar-thin"
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--surface-1)",
        padding: 8,
        maxHeight: "min(560px, 70dvh)",
        overflowY: "auto",
      }}
    >
      {tree.map((groupeNode) => {
        const groupeOpen = openGroupes.has(groupeNode.groupe);
        return (
          <div key={groupeNode.groupe} style={{ marginBottom: 4 }}>
            <button
              onClick={() => toggle(openGroupes, setOpenGroupes, groupeNode.groupe)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-3)",
                border: "1px solid var(--brand-copper)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--brand-cream)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span>
                {groupeOpen ? "▾" : "▸"} {groupeNode.groupe}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{groupeNode.count}</span>
            </button>

            {groupeOpen && (
              <div style={{ paddingLeft: 12, marginTop: 4 }}>
                {groupeNode.ordres.map((ordreNode) => {
                  const ordreKey = `${groupeNode.groupe}__${ordreNode.ordre}`;
                  const ordreOpen = openOrdres.has(ordreKey);
                  return (
                    <div key={ordreKey} style={{ marginBottom: 4 }}>
                      <button
                        onClick={() => toggle(openOrdres, setOpenOrdres, ordreKey)}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "7px 10px",
                          color: "var(--brand-cream)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <span>
                          {ordreOpen ? "▾" : "▸"} {ordreNode.ordre}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{ordreNode.count}</span>
                      </button>

                      {ordreOpen && (
                        <div style={{ paddingLeft: 18, marginTop: 4 }}>
                          {ordreNode.genres.map((genreNode) => {
                            const genreKey = `${ordreKey}__${genreNode.genre}`;
                            const genreOpen = openGenres.has(genreKey);
                            return (
                              <div key={genreKey} style={{ marginBottom: 2 }}>
                                <button
                                  onClick={() => toggle(openGenres, setOpenGenres, genreKey)}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "transparent",
                                    border: "none",
                                    borderLeft: "2px solid var(--brand-copper)",
                                    padding: "6px 10px",
                                    color: "var(--text-primary)",
                                    fontSize: 13,
                                    fontStyle: "italic",
                                    cursor: "pointer",
                                  }}
                                >
                                  <span>
                                    {genreOpen ? "▾" : "▸"} {genreNode.genre}
                                  </span>
                                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{genreNode.count}</span>
                                </button>

                                {genreOpen && (
                                  <div style={{ paddingLeft: 22 }}>
                                    {genreNode.taxa.map((taxon) => (
                                      <button
                                        key={taxon.taxon_id}
                                        onClick={() => onSelect(taxon.taxon_id)}
                                        style={{
                                          display: "block",
                                          width: "100%",
                                          textAlign: "left",
                                          background: "transparent",
                                          border: "none",
                                          padding: "4px 10px",
                                          color: "var(--text-secondary)",
                                          fontSize: 13,
                                          cursor: "pointer",
                                          borderRadius: 6,
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        {taxon.nom_taxon}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
