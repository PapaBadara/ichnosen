import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  Search,
  ListTree,
  Microscope,
  MapPin,
  Clock,
  FileText,
  Waves,
  Globe,
  StickyNote,
  BookMarked,
  type LucideIcon,
} from "lucide-react";
import { groupByTaxon, useData } from "../context/DataContext";
import { SectionTitle } from "../components/KpiCard";
import { PageTitle } from "../components/PageTitle";
import { Tabs } from "../components/Tabs";
import { TaxonTree } from "../components/TaxonTree";
import { exportCsv, exportJson } from "../lib/export";
import type { Occurrence, TaxonGroup } from "../types";

const DISPLAY_COLS: { key: keyof TaxonGroup; label: string }[] = [
  { key: "nom_taxon", label: "Nom_taxon" },
  { key: "groupe", label: "Groupe" },
  { key: "sous_type", label: "Sous-type" },
  { key: "classe", label: "Classe" },
  { key: "groupe_ordre", label: "Groupe/Ordre" },
  { key: "decouvreur", label: "Découvreur" },
];

const CLASSIFICATION_FIELDS: { key: keyof TaxonGroup; label: string }[] = [
  { key: "regne", label: "Règne" },
  { key: "embranchement", label: "Embranchement" },
  { key: "classe", label: "Classe" },
  { key: "groupe_ordre", label: "Groupe/Ordre" },
  { key: "sous_type", label: "Sous-type" },
  { key: "decouvreur", label: "Découvreur" },
];

export function Catalogue() {
  const { all, filtered } = useData();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  const allTaxa = useMemo(() => groupByTaxon(all), [all]);
  const filteredTaxa = useMemo(() => groupByTaxon(filtered), [filtered]);

  const directTaxonId = params.get("taxon");
  const directTaxon = directTaxonId ? allTaxa.find((t) => t.taxon_id === directTaxonId) ?? null : null;
  const directOutsideFilters = !!directTaxon && !filteredTaxa.some((t) => t.taxon_id === directTaxon.taxon_id);

  useEffect(() => {
    if (directTaxon) setSelected(directTaxon.taxon_id);
  }, [directTaxonId]);

  const results = useMemo(() => {
    if (!search.trim()) return filteredTaxa;
    const q = search.toLowerCase();
    return filteredTaxa.filter(
      (taxon) =>
        Object.values(taxon).some((v) => v !== null && typeof v !== "object" && String(v).toLowerCase().includes(q)) ||
        taxon.occurrences.some((occ) =>
          Object.values(occ).some((v) => v !== null && String(v).toLowerCase().includes(q))
        )
    );
  }, [filteredTaxa, search]);

  const detail = directTaxon ?? results.find((r) => r.taxon_id === selected) ?? results[0] ?? null;

  function selectFromTree(taxonId: string) {
    setParams({});
    setSelected(taxonId);
  }

  const exportRows = results.map((t) => ({
    nom_taxon: t.nom_taxon,
    groupe: t.groupe,
    sous_type: t.sous_type,
    classe: t.classe,
    groupe_ordre: t.groupe_ordre,
    decouvreur: t.decouvreur,
    nb_occurrences: t.occurrences.length,
  }));

  return (
    <div>
      <PageTitle icon={ClipboardList}>Catalogue des taxons</PageTitle>

      {directOutsideFilters && (
        <p
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--brand-copper)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--text-secondary)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Fiche ouverte directement depuis la carte : ce taxon est hors des filtres actifs de la barre latérale.{" "}
          <button
            onClick={() => setParams({})}
            style={{ background: "none", border: "none", color: "var(--brand-copper)", cursor: "pointer", padding: 0 }}
          >
            Revenir à la recherche
          </button>
        </p>
      )}

      <div>
        <Tabs
          tabs={[
            {
              label: "Recherche",
              icon: Search,
              content: (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search
                        size={16}
                        strokeWidth={1.75}
                        color="var(--text-muted)"
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                        aria-hidden
                      />
                      <input
                        type="text"
                        placeholder="Rechercher un taxon (nom, découvreur, description, site…)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px 10px 40px",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "var(--surface-1)",
                          color: "var(--text-primary)",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, whiteSpace: "nowrap" }}>
                      <strong style={{ color: "var(--brand-cream)" }}>{results.length}</strong> résultats
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ExportButton label="CSV" onClick={() => exportCsv(exportRows, "ichnosen-taxons.csv")} />
                      <ExportButton label="JSON" onClick={() => exportJson(exportRows, "ichnosen-taxons.json")} />
                    </div>
                  </div>

                  <div
                    className="scrollbar-thin"
                    style={{
                      maxHeight: 320,
                      overflowY: "auto",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      marginBottom: 32,
                    }}
                  >
                    <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--surface-1)", position: "sticky", top: 0 }}>
                          {DISPLAY_COLS.map((col) => (
                            <th
                              key={col.key}
                              style={{
                                textAlign: "left",
                                padding: "8px 10px",
                                color: "var(--text-secondary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row) => (
                          <tr
                            key={row.taxon_id}
                            onClick={() => {
                              setParams({});
                              setSelected(row.taxon_id);
                            }}
                            style={{
                              cursor: "pointer",
                              background: row.taxon_id === detail?.taxon_id ? "var(--surface-2)" : "transparent",
                              borderBottom: "1px solid var(--gridline)",
                            }}
                          >
                            {DISPLAY_COLS.map((col) => (
                              <td
                                key={col.key}
                                title={row[col.key] !== null ? String(row[col.key]) : undefined}
                                style={{
                                  padding: "7px 10px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {(row[col.key] as string) ?? "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            },
            {
              label: "Navigateur taxonomique",
              icon: ListTree,
              content: (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
                    Groupe → ordre → genre (dérivé du nom scientifique) → espèce. Cliquer une espèce ouvre sa fiche.
                  </p>
                  <TaxonTree taxa={filteredTaxa} onSelect={selectFromTree} />
                </div>
              ),
            },
          ]}
        />
      </div>

      <SectionTitle>Fiche détaillée</SectionTitle>
      {!detail ? (
        <p style={{ color: "var(--text-muted)" }}>Aucun taxon disponible.</p>
      ) : (
        <TaxonSheet taxon={detail} />
      )}
    </div>
  );
}

function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-1)",
        color: "var(--text-secondary)",
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <p style={{ margin: "4px 0", fontSize: 14 }}>
      <strong style={{ color: "var(--text-primary)" }}>{label}</strong>{" "}
      <span style={{ color: "var(--text-secondary)" }}>: {String(value)}</span>
    </p>
  );
}

function FieldGroupTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h4
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "var(--brand-copper)",
        fontSize: 13,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden />
      {children}
    </h4>
  );
}

function TaxonSheet({ taxon }: { taxon: TaxonGroup }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--brand-cream)", marginBottom: 4 }}>
        {taxon.nom_taxon}
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}>
        {taxon.occurrences.length} occurrence{taxon.occurrences.length > 1 ? "s" : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: taxon.photo ? "180px 1fr" : "1fr", gap: 24, marginBottom: 20 }}>
        {taxon.photo && (
          <img
            src={taxon.photo}
            alt={taxon.nom_taxon}
            style={{
              width: "100%",
              height: 160,
              objectFit: "contain",
              background: "#ffffff",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          />
        )}
        <div>
          <FieldGroupTitle icon={Microscope}>Classification</FieldGroupTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {CLASSIFICATION_FIELDS.map((f) => (
              <Field key={f.key} label={f.label} value={taxon[f.key]} />
            ))}
          </div>
        </div>
      </div>

      <FieldGroupTitle icon={MapPin}>{`Occurrences (${taxon.occurrences.length})`}</FieldGroupTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {taxon.occurrences.map((occ) => (
          <OccurrenceCard key={occ.id} occ={occ} />
        ))}
      </div>
    </div>
  );
}

function OccurrenceCard({ occ }: { occ: Occurrence }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
        <div>
          <FieldGroupTitle icon={Clock}>Contexte</FieldGroupTitle>
          <Field label="Localité" value={occ.locality_nom} />
          <Field label="Bassin" value={occ.bassin} />
          <Field label="Âge géologique" value={occ.age} />
          <Field label="Biozones" value={occ.biozones} />
          <Field label="Stratigraphie" value={occ.stratigraphie} />
          <Field label="Formation" value={occ.formation} />
        </div>
        <div>
          <FieldGroupTitle icon={BookMarked}>Référence &amp; collection</FieldGroupTitle>
          <Field label="Référence" value={occ.reference_citation} />
          <Field label="N° collection" value={occ.n_collection} />
        </div>
      </div>

      {occ.description && (
        <div style={{ marginBottom: 12 }}>
          <FieldGroupTitle icon={FileText}>Description morphologique</FieldGroupTitle>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{occ.description}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {occ.paleoenv && (
          <div>
            <FieldGroupTitle icon={Waves}>Paléoenvironnement</FieldGroupTitle>
            <p style={{ fontSize: 13, color: "var(--status-good)", margin: 0 }}>{occ.paleoenv}</p>
          </div>
        )}
        {occ.paleogeo && (
          <div>
            <FieldGroupTitle icon={Globe}>Paléogéographie</FieldGroupTitle>
            <p style={{ fontSize: 13, color: "var(--status-good)", margin: 0 }}>{occ.paleogeo}</p>
          </div>
        )}
      </div>

      {occ.notes && (
        <div style={{ marginTop: 12 }}>
          <FieldGroupTitle icon={StickyNote}>Notes</FieldGroupTitle>
          <p style={{ fontSize: 13, color: "var(--status-warning)", margin: 0 }}>{occ.notes}</p>
        </div>
      )}
    </div>
  );
}
