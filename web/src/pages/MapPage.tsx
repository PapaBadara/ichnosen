import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useData } from "../context/DataContext";
import { PageTitle } from "../components/PageTitle";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import type { Occurrence } from "../types";
import { colorScaleFor } from "../lib/colors";

const CENTER: [number, number] = [14.3, -16.5];

interface Site {
  key: string;
  lieu: string;
  rows: Occurrence[];
  nAges: number;
  bassin: string | null;
  taxons: number;
  lat: number;
  lon: number;
  groupes: string;
  ages: string[];
}

export function MapPage() {
  const { filtered } = useData();
  const [showSites, setShowSites] = useState(false);
  const [siteDetail, setSiteDetail] = useState<Site | null>(null);
  const closeSite = useCallback(() => setSiteDetail(null), []);

  const geo = useMemo(
    () => filtered.filter((t) => t.latitude !== null && t.longitude !== null),
    [filtered]
  );

  const bassins = useMemo(() => Array.from(new Set(geo.map((t) => t.bassin).filter((b): b is string => !!b))).sort(), [geo]);
  const colorFor = useMemo(() => colorScaleFor(bassins), [bassins]);

  const sites = useMemo((): Site[] => {
    const groups = new Map<string, typeof geo>();
    geo.forEach((row) => {
      const key = `${row.locality_nom}__${row.locality_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });
    return Array.from(groups.entries())
      .map(([key, rows]) => {
        const [lieu] = key.split("__");
        const groupes = Array.from(new Set(rows.map((r) => r.groupe))).sort().join(", ");
        const ages = Array.from(new Set(rows.map((r) => r.age).filter((a): a is string => !!a))).sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        return {
          key,
          lieu,
          rows,
          nAges: new Set(rows.map((r) => r.age).filter(Boolean)).size,
          bassin: rows[0].bassin,
          taxons: rows.length,
          lat: rows[0].latitude!,
          lon: rows[0].longitude!,
          groupes,
          ages,
        };
      })
      .sort((a, b) => b.taxons - a.taxons);
  }, [geo]);

  if (geo.length === 0) {
    return (
      <div>
        <PageTitle icon={MapIcon}>Carte des découvertes</PageTitle>
        <p style={{ color: "var(--status-warning)" }}>
          Aucune donnée géolocalisée disponible pour les filtres sélectionnés.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle icon={MapIcon}>Carte des découvertes paléontologiques</PageTitle>
      <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        Localisation des sites de découverte des foraminifères et ostracodes au Sénégal.
      </p>

      <p
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 16px",
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        <strong style={{ color: "var(--brand-cream)" }}>{geo.length}</strong> occurrences géolocalisées sur{" "}
        <strong style={{ color: "var(--brand-cream)" }}>{filtered.length}</strong>, un point par localité.
      </p>

      <div style={{ height: 540, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 32 }}>
        <MapContainer center={CENTER} zoom={7} style={{ height: "100%", width: "100%", background: "var(--surface-1)" }}>
          <TileLayer
            className="map-tiles-dark"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>
            {geo.map((row) => (
              <CircleMarker
                key={row.id}
                center={[row.latitude!, row.longitude!]}
                radius={9}
                pathOptions={{
                  color: colorFor[row.bassin ?? ""],
                  fillColor: colorFor[row.bassin ?? ""],
                  fillOpacity: 0.85,
                  weight: 1,
                }}
              >
                <Popup>
                  <strong>{row.nom_taxon}</strong>
                  <br />
                  {row.groupe} · {row.age}
                  <br />
                  {row.locality_nom}
                  <br />
                  <em>{row.bassin}</em>
                  <br />
                  <Link to={`/catalogue?taxon=${row.taxon_id}`} style={{ fontSize: 12 }}>
                    Voir la fiche
                  </Link>
                </Popup>
              </CircleMarker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <button
        onClick={() => setShowSites((v) => !v)}
        aria-expanded={showSites}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid var(--border)",
          background: showSites ? "rgba(197, 120, 45, 0.18)" : "transparent",
          color: "var(--brand-cream)",
          borderRadius: 999,
          padding: "6px 14px",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {showSites ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {showSites ? "Masquer" : "Afficher"} les sites de découverte ({sites.length})
      </button>

      {showSites && (
        <DataTable
          rows={sites}
          columns={[
            { key: "lieu", label: "Lieu", value: (s) => s.lieu, filter: "text" },
            { key: "bassin", label: "Bassin", value: (s) => s.bassin, filter: "select" },
            { key: "n", label: "Occurrences", value: (s) => s.taxons, align: "right" },
            { key: "groupes", label: "Groupes", value: (s) => s.groupes, filter: "select" },
            { key: "nAges", label: "Âges", value: (s) => s.nAges, align: "right" },
          ]}
          rowKey={(s) => s.key}
          searchText={(s) => [s.lieu, s.bassin, s.groupes, s.ages.join(" "), ...s.rows.map((r) => r.nom_taxon)].join(" ")}
          searchPlaceholder="Rechercher un site, un âge, un taxon…"
          onView={setSiteDetail}
        />
      )}

      {siteDetail && (
        <Modal
          title={siteDetail.lieu}
          subtitle={`${siteDetail.bassin ?? "Bassin non renseigné"} · ${siteDetail.taxons} occurrence${siteDetail.taxons > 1 ? "s" : ""}`}
          onClose={closeSite}
        >
          <SiteSheet site={siteDetail} />
        </Modal>
      )}
    </div>
  );
}

function SiteSheet({ site }: { site: Site }) {
  const label = { color: "var(--brand-copper)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: "0 0 8px" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 14, color: "var(--text-secondary)" }}>
      <div>
        <p style={label}>Localisation</p>
        <p style={{ margin: 0 }}>
          {site.lat.toFixed(4)}, {site.lon.toFixed(4)} · {site.groupes}
        </p>
      </div>
      <div>
        <p style={label}>Âges ({site.ages.length})</p>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          {site.ages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      <div>
        <p style={label}>Taxons signalés ({site.rows.length})</p>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, columns: "2 240px" }}>
          {site.rows.map((r) => (
            <li key={r.id}>
              <Link to={`/catalogue?taxon=${r.taxon_id}`}>
                <em>{r.nom_taxon}</em>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
