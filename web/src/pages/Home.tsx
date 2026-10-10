import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { groupByTaxon, useData } from "../context/DataContext";
import { KpiCard, SectionTitle } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { SERIES_HEX } from "../lib/colors";
import { nivoTheme, chartTooltip } from "../lib/nivoTheme";

export function Home() {
  const { filtered } = useData();
  const taxa = groupByTaxon(filtered);

  const nBassins = new Set(filtered.map((t) => t.bassin).filter(Boolean)).size;
  const nGroupes = new Set(filtered.map((t) => t.groupe)).size;
  const nAges = new Set(filtered.map((t) => t.age).filter(Boolean)).size;

  const groupeCounts = new Map<string, number>();
  taxa.forEach((t) => {
    groupeCounts.set(t.groupe, (groupeCounts.get(t.groupe) ?? 0) + 1);
  });
  const pieData = Array.from(groupeCounts.entries()).map(([id, value]) => ({ id, label: id, value }));

  const bassins = Array.from(new Set(filtered.map((t) => t.bassin).filter((b): b is string => !!b))).sort();
  const ageCounts = new Map<string, number>();
  filtered.forEach((t) => {
    if (t.age) ageCounts.set(t.age, (ageCounts.get(t.age) ?? 0) + 1);
  });
  // Les âges sont du texte libre (70+ intitulés stratigraphiques distincts) :
  // on limite aux plus fréquents pour garder l'axe lisible.
  const topAges = Array.from(ageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([age]) => age);
  const barData = topAges.map((age) => {
    const row: Record<string, string | number> = { age };
    bassins.forEach((b) => {
      row[b] = filtered.filter((t) => t.age === age && t.bassin === b).length;
    });
    return row;
  });

  const summary = bassins.map((b) => {
    const rows = filtered.filter((t) => t.bassin === b);
    const rowTaxa = groupByTaxon(rows);
    return {
      Bassin: b,
      Taxons: rowTaxa.length,
      Occurrences: rows.length,
      Classes: new Set(rows.map((r) => r.classe).filter(Boolean)).size,
      Ages: new Set(rows.map((r) => r.age).filter(Boolean)).size,
    };
  });

  return (
    <div>
      <h1 style={{ fontSize: 32, color: "var(--brand-cream)", marginBottom: 8 }}>
        Ichnosen : Microfossiles du Sénégal
      </h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: 680, marginBottom: 28 }}>
        Base de données consolidée de foraminifères et ostracodes issus des travaux de Sarr et al.
        (1998–2023) sur les bassins sénégalo-mauritanien et de Casamance.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KpiCard value={taxa.length} label="Taxons filtrés" />
        <KpiCard value={filtered.length} label="Occurrences" />
        <KpiCard value={nBassins} label="Bassins" />
        <KpiCard value={nAges} label="Âges géologiques" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 24, marginBottom: 32 }}>
        <div>
          <SectionTitle>Répartition par groupe</SectionTitle>
          <div style={{ height: 300, background: "var(--surface-1)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <ResponsivePie
              data={pieData}
              theme={nivoTheme}
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={3}
              colors={SERIES_HEX}
              borderWidth={0}
              arcLabel={(d) => `${d.value}`}
              arcLinkLabelsTextColor="var(--text-secondary)"
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsTextColor="#17140f"
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 36,
                  itemWidth: 110,
                  itemHeight: 18,
                  itemTextColor: "var(--text-secondary)",
                  symbolSize: 10,
                  symbolShape: "circle",
                },
              ]}
            />
          </div>
        </div>
        <div>
          <SectionTitle>Distribution par âge géologique &amp; bassin (12 âges les plus fréquents)</SectionTitle>
          <div style={{ height: 300, background: "var(--surface-1)", borderRadius: 12, border: "1px solid var(--border)", padding: "8px 8px 0" }}>
            {nGroupes === 0 || topAges.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: 16 }}>Aucune donnée pour les filtres sélectionnés.</p>
            ) : (
              <ResponsiveBar
                data={barData}
                theme={nivoTheme}
                keys={bassins}
                indexBy="age"
                margin={{ top: 10, right: 200, bottom: 90, left: 40 }}
                padding={0.3}
                colors={SERIES_HEX}
                axisBottom={{ tickRotation: -35 }}
                enableLabel={false}
                tooltip={chartTooltip}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "right",
                    direction: "column",
                    translateX: 190,
                    itemWidth: 180,
                    itemHeight: 22,
                    itemTextColor: "var(--text-secondary)",
                    symbolSize: 10,
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <SectionTitle>Résumé par bassin</SectionTitle>
      <DataTable
        rows={summary}
        columns={[
          { key: "bassin", label: "Bassin", value: (r) => r.Bassin },
          { key: "taxons", label: "Taxons", value: (r) => r.Taxons, align: "right" },
          { key: "occ", label: "Occurrences", value: (r) => r.Occurrences, align: "right" },
          { key: "classes", label: "Classes", value: (r) => r.Classes, align: "right" },
          { key: "ages", label: "Âges", value: (r) => r.Ages, align: "right" },
        ]}
        rowKey={(r) => r.Bassin}
      />
    </div>
  );
}
