import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  ListTree,
  Microscope,
  MapPin,
  Clock,
  FileText,
  Waves,
  Globe,
  StickyNote,
  BookMarked,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { groupByTaxon, useData } from "../context/DataContext";
import { PageTitle } from "../components/PageTitle";
import { Tabs } from "../components/Tabs";
import { TaxonTree } from "../components/TaxonTree";
import { DataTable, type Column } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ImageViewer } from "../components/ImageViewer";
import type { Occurrence, TaxonGroup } from "../types";
import "./catalogue.css";

const CLASSIFICATION_FIELDS: { key: keyof TaxonGroup; label: string }[] = [
  { key: "regne", label: "Règne" },
  { key: "embranchement", label: "Embranchement" },
  { key: "classe", label: "Classe" },
  { key: "groupe_ordre", label: "Groupe/Ordre" },
  { key: "sous_type", label: "Sous-type" },
  { key: "decouvreur", label: "Découvreur" },
];

type Photo = { src: string; alt: string };

function Thumb({ taxon, onOpen }: { taxon: { photo: string | null; nom_taxon: string }; onOpen: (p: Photo) => void }) {
  if (!taxon.photo) return <span className="dt-null">-</span>;
  return (
    <button
      className="dt-thumb"
      onClick={() => onOpen({ src: taxon.photo!, alt: taxon.nom_taxon })}
      title="Agrandir la photo"
      aria-label={`Agrandir la photo de ${taxon.nom_taxon}`}
    >
      <img src={taxon.photo} alt="" loading="lazy" />
    </button>
  );
}

const taxonSearchText = (t: TaxonGroup) =>
  [
    t.nom_taxon,
    t.groupe,
    t.sous_type,
    t.classe,
    t.groupe_ordre,
    t.decouvreur,
    ...t.occurrences.flatMap((o) => Object.values(o).filter((v) => v !== null)),
  ].join(" ");

const occurrenceSearchText = (o: Occurrence) => Object.values(o).filter((v) => v !== null).join(" ");

export function Catalogue() {
  const { all, filtered } = useData();
  const [params, setParams] = useSearchParams();
  const [occDetail, setOccDetail] = useState<Occurrence | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);

  const allTaxa = useMemo(() => groupByTaxon(all), [all]);
  const filteredTaxa = useMemo(() => groupByTaxon(filtered), [filtered]);

  // La fiche ouverte est portée par l'URL (?taxon=…) : liens depuis la carte ou la page d'accueil.
  const taxonId = params.get("taxon");
  const taxonDetail = taxonId ? allTaxa.find((t) => t.taxon_id === taxonId) ?? null : null;

  const openTaxon = useCallback((id: string) => setParams({ taxon: id }), [setParams]);
  const closeTaxon = useCallback(() => setParams({}), [setParams]);
  const closeOcc = useCallback(() => setOccDetail(null), []);
  const closePhoto = useCallback(() => setPhoto(null), []);

  const taxonColumns: Column<TaxonGroup>[] = [
    { key: "photo", label: "Photo", value: (t) => (t.photo ? 1 : 0), render: (t) => <Thumb taxon={t} onOpen={setPhoto} />, width: 70, sortable: false },
    { key: "nom", label: "Taxon", value: (t) => t.nom_taxon, render: (t) => <em>{t.nom_taxon}</em>, filter: "text" },
    { key: "groupe", label: "Groupe", value: (t) => t.groupe, filter: "select" },
    { key: "sous_type", label: "Sous-type", value: (t) => t.sous_type, filter: "select" },
    { key: "classe", label: "Classe", value: (t) => t.classe, filter: "select" },
    { key: "ordre", label: "Groupe/Ordre", value: (t) => t.groupe_ordre, filter: "select" },
    { key: "decouvreur", label: "Découvreur", value: (t) => t.decouvreur, filter: "text" },
    { key: "n", label: "Occurrences", value: (t) => t.occurrences.length, align: "right" },
  ];

  const occColumns: Column<Occurrence>[] = [
    { key: "taxon", label: "Taxon", value: (o) => o.nom_taxon, render: (o) => <em>{o.nom_taxon}</em>, filter: "text" },
    { key: "groupe", label: "Groupe", value: (o) => o.groupe, filter: "select" },
    { key: "localite", label: "Localité", value: (o) => o.locality_nom, filter: "select" },
    { key: "bassin", label: "Bassin", value: (o) => o.bassin, filter: "select" },
    { key: "age", label: "Âge", value: (o) => o.age, filter: "select" },
    { key: "reference", label: "Référence", value: (o) => o.reference_citation, filter: "select" },
  ];

  return (
    <div>
      <PageTitle icon={ClipboardList}>Catalogue des taxons</PageTitle>

      <Tabs
        tabs={[
          {
            label: "Taxons",
            icon: Microscope,
            content: (
              <DataTable
                rows={filteredTaxa}
                columns={taxonColumns}
                rowKey={(t) => t.taxon_id}
                searchText={taxonSearchText}
                searchPlaceholder="Rechercher un taxon (nom, découvreur, description, site…)"
                onView={(t) => openTaxon(t.taxon_id)}
              />
            ),
          },
          {
            label: "Occurrences",
            icon: Layers,
            content: (
              <DataTable
                rows={filtered}
                columns={occColumns}
                rowKey={(o) => o.id}
                searchText={occurrenceSearchText}
                searchPlaceholder="Rechercher dans les occurrences (stratigraphie, description, notes…)"
                onView={setOccDetail}
              />
            ),
          },
          {
            label: "Navigateur taxonomique",
            icon: ListTree,
            content: (
              <div style={{ marginBottom: 32 }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
                  Hiérarchie : groupe, ordre, genre (dérivé du nom scientifique), puis espèce. Cliquer une espèce ouvre sa fiche.
                </p>
                <TaxonTree taxa={filteredTaxa} onSelect={openTaxon} />
              </div>
            ),
          },
        ]}
      />

      {taxonDetail && (
        <Modal
          title={<em>{taxonDetail.nom_taxon}</em>}
          subtitle={`${taxonDetail.groupe} · ${taxonDetail.occurrences.length} occurrence${taxonDetail.occurrences.length > 1 ? "s" : ""}`}
          onClose={closeTaxon}
        >
          <TaxonSheet taxon={taxonDetail} onPhoto={setPhoto} />
        </Modal>
      )}

      {occDetail && (
        <Modal
          title={<em>{occDetail.nom_taxon}</em>}
          subtitle={[occDetail.locality_nom, occDetail.age].filter(Boolean).join(" · ")}
          onClose={closeOcc}
        >
          <OccurrenceCard occ={occDetail} />
          <button
            className="dt-view"
            style={{ marginTop: 16 }}
            onClick={() => {
              setOccDetail(null);
              openTaxon(occDetail.taxon_id);
            }}
          >
            <Microscope size={14} strokeWidth={1.75} aria-hidden />
            Voir la fiche du taxon
          </button>
        </Modal>
      )}

      {photo && <ImageViewer src={photo.src} alt={photo.alt} onClose={closePhoto} />}
    </div>
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

function TaxonSheet({ taxon, onPhoto }: { taxon: TaxonGroup; onPhoto: (p: Photo) => void }) {
  return (
    <div>
      <div className="taxon-head" style={{ gridTemplateColumns: taxon.photo ? "200px 1fr" : "1fr" }}>
        {taxon.photo && (
          <button
            className="taxon-photo"
            onClick={() => onPhoto({ src: taxon.photo!, alt: taxon.nom_taxon })}
            title="Agrandir la photo"
          >
            <img src={taxon.photo} alt={taxon.nom_taxon} />
            <span>Agrandir</span>
          </button>
        )}
        <div>
          <FieldGroupTitle icon={Microscope}>Classification</FieldGroupTitle>
          <div className="field-grid">
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
      <div className="field-grid" style={{ marginBottom: 12 }}>
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

      <div className="field-grid">
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
