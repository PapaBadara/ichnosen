import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useData } from "../context/DataContext";
import { PageTitle } from "../components/PageTitle";
import { colorScaleFor } from "../lib/colors";

const CENTER: [number, number] = [14.3, -16.5];

export function MapPage() {
  const { filtered } = useData();
  const [showSites, setShowSites] = useState(false);

  const geo = useMemo(
    () => filtered.filter((t) => t.latitude !== null && t.longitude !== null),
    [filtered]
  );

  const bassins = useMemo(() => Array.from(new Set(geo.map((t) => t.bassin).filter((b): b is string => !!b))).sort(), [geo]);
  const colorFor = useMemo(() => colorScaleFor(bassins), [bassins]);

  const sites = useMemo(() => {
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
        const ages = Array.from(new Set(rows.map((r) => r.age).filter(Boolean))).sort().join(" | ");
        return {
          lieu,
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
                    Voir la fiche →
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
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 32 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Lieu</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Bassin</th>
              <th style={{ textAlign: "right", padding: "8px 10px" }}>Occurrences</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Groupes</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Âges</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.lieu} style={{ borderBottom: "1px solid var(--gridline)" }}>
                <td style={{ padding: "7px 10px" }}>{s.lieu}</td>
                <td style={{ padding: "7px 10px" }}>{s.bassin}</td>
                <td style={{ textAlign: "right", padding: "7px 10px" }}>{s.taxons}</td>
                <td style={{ padding: "7px 10px" }}>{s.groupes}</td>
                <td style={{ padding: "7px 10px" }}>{s.ages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
