import { ResponsiveSunburst } from "@nivo/sunburst";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { ResponsiveBar } from "@nivo/bar";
import { BarChart3, Box, Waves, Layers } from "lucide-react";
import { useData } from "../context/DataContext";
import { SectionTitle } from "../components/KpiCard";
import { PageTitle } from "../components/PageTitle";
import { ChartCard } from "../components/ChartCard";
import { Tabs } from "../components/Tabs";
import { DataTable } from "../components/DataTable";
import { buildTree } from "../lib/hierarchy";
import { SERIES_HEX, SEQUENTIAL_HEX, capCategories } from "../lib/colors";
import { nivoTheme, chartTooltip } from "../lib/nivoTheme";
import type { Occurrence } from "../types";

export function Analyses() {
  const { filtered } = useData();

  return (
    <div>
      <PageTitle icon={BarChart3}>Analyses statistiques</PageTitle>
      <Tabs
        tabs={[
          { label: "Taxonomie", icon: Box, content: <TaxonomieTab rows={filtered} /> },
          { label: "Paléoenvironnement", icon: Waves, content: <EnvTab rows={filtered} /> },
          { label: "Stratigraphie", icon: Layers, content: <StratiTab rows={filtered} /> },
        ]}
      />
    </div>
  );
}

function TaxonomieTab({ rows }: { rows: Occurrence[] }) {
  const sunburstData = { id: "root", children: buildTree(rows, ["groupe", "classe", "groupe_ordre"]) };

  const ordreCounts = new Map<string, number>();
  rows.forEach((r) => {
    const o = r.groupe_ordre;
    if (o) ordreCounts.set(o, (ordreCounts.get(o) ?? 0) + 1);
  });
  const ordreData = Array.from(ordreCounts.entries())
    .map(([ordre, n]) => ({ ordre, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 10)
    .reverse();

  const embTree = { id: "root", children: buildTree(rows, ["regne", "embranchement"]) };

  const classes = Array.from(new Set(rows.map((r) => r.classe).filter((c): c is string => !!c)));
  const bassins = Array.from(new Set(rows.map((r) => r.bassin))).sort();
  const pivot = classes.map((cl) => {
    const row: Record<string, string | number> = { Classe: cl };
    bassins.forEach((b) => {
      row[b as string] = rows.filter((r) => r.classe === cl && r.bassin === b).length;
    });
    return row;
  });

  return (
    <div>
      <SectionTitle>Hiérarchie taxonomique (groupe, classe, ordre)</SectionTitle>
      <ChartCard height={420}>
        <ResponsiveSunburst
          data={sunburstData}
          theme={nivoTheme}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          id="id"
          value="value"
          cornerRadius={2}
          borderWidth={2}
          borderColor="var(--surface-1)"
          colors={SERIES_HEX}
          childColor={{ from: "color", modifiers: [["brighter", 0.4]] }}
          animate={false}
        />
      </ChartCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
        <div>
          <SectionTitle>Top 10 Ordres / Groupes</SectionTitle>
          <ChartCard height={320}>
            <ResponsiveBar
              data={ordreData}
              theme={nivoTheme}
              keys={["n"]}
              indexBy="ordre"
              layout="horizontal"
              margin={{ top: 10, right: 20, bottom: 30, left: 160 }}
              padding={0.25}
              colors={[SEQUENTIAL_HEX[3]]}
              enableLabel
              labelTextColor="#17140f"
              tooltip={chartTooltip}
            />
          </ChartCard>
        </div>
        <div>
          <SectionTitle>Règne &amp; Embranchement</SectionTitle>
          <ChartCard height={320}>
            <ResponsiveTreeMap
              data={embTree}
              theme={nivoTheme}
              identity="id"
              value="value"
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              labelSkipSize={20}
              labelTextColor="#17140f"
              colors={SERIES_HEX}
              borderColor="var(--surface-1)"
              animate={false}
            />
          </ChartCard>
        </div>
      </div>

      <SectionTitle>
        <span style={{ display: "block", marginTop: 32 }}>Nombre d'occurrences : Classe × Bassin</span>
      </SectionTitle>
      <DataTable
        rows={pivot}
        columns={[
          { key: "Classe", label: "Classe", value: (r) => r.Classe, filter: "text" },
          ...bassins.map((b) => ({
            key: String(b),
            label: String(b),
            value: (r: Record<string, string | number>) => r[String(b)],
            align: "right" as const,
          })),
        ]}
        rowKey={(r) => String(r.Classe)}
      />
    </div>
  );
}

function EnvTab({ rows }: { rows: Occurrence[] }) {
  const envCounts = new Map<string, number>();
  rows.forEach((r) => {
    const e = r.paleoenv;
    if (e) envCounts.set(e, (envCounts.get(e) ?? 0) + 1);
  });
  const envData = Array.from(envCounts.entries())
    .map(([env, n]) => ({ env, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12)
    .reverse();

  const bassins = Array.from(new Set(rows.map((r) => r.bassin).filter((b): b is string => !!b))).sort();
  const capped = capCategories(
    Array.from(envCounts.entries()).map(([label, value]) => ({ label, value }))
  );
  const keptEnvs = new Set(capped.filter((c) => c.label !== "Autres").map((c) => c.label));

  const envSrcData = bassins.map((b) => {
    const row: Record<string, string | number> = { bassin: b };
    const rowsForB = rows.filter((r) => r.bassin === b);
    let autres = 0;
    rowsForB.forEach((r) => {
      const e = r.paleoenv;
      if (!e) return;
      if (keptEnvs.has(e)) {
        row[e] = ((row[e] as number) ?? 0) + 1;
      } else {
        autres += 1;
      }
    });
    if (autres > 0) row["Autres"] = autres;
    return row;
  });
  const envKeys = [...Array.from(keptEnvs), ...(envSrcData.some((r) => "Autres" in r) ? ["Autres"] : [])];

  if (envData.length === 0) {
    return <p style={{ color: "var(--text-muted)" }}>Aucune donnée de paléoenvironnement pour les filtres sélectionnés.</p>;
  }

  return (
    <div>
      <SectionTitle>Types de paléoenvironnements</SectionTitle>
      <ChartCard height={380}>
        <ResponsiveBar
          data={envData}
          theme={nivoTheme}
          keys={["n"]}
          indexBy="env"
          layout="horizontal"
          margin={{ top: 10, right: 20, bottom: 30, left: 220 }}
          padding={0.25}
          colors={[SEQUENTIAL_HEX[3]]}
          tooltip={chartTooltip}
        />
      </ChartCard>

      <SectionTitle>
        <span style={{ display: "block", marginTop: 32 }}>Environnement par bassin</span>
      </SectionTitle>
      <ChartCard height={380}>
        <ResponsiveBar
          data={envSrcData}
          theme={nivoTheme}
          keys={envKeys}
          indexBy="bassin"
          margin={{ top: 10, right: 260, bottom: 40, left: 40 }}
          padding={0.3}
          colors={SERIES_HEX}
          tooltip={chartTooltip}
          legends={[
            {
              dataFrom: "keys",
              anchor: "right",
              direction: "column",
              translateX: 200,
              itemWidth: 240,
              itemHeight: 22,
              itemTextColor: "var(--text-secondary)",
              symbolSize: 10,
            },
          ]}
        />
      </ChartCard>
    </div>
  );
}

function StratiTab({ rows }: { rows: Occurrence[] }) {
  const bassins = Array.from(new Set(rows.map((r) => r.bassin).filter((b): b is string => !!b))).sort();
  const biozones = Array.from(new Set(rows.map((r) => r.biozones).filter((b): b is string => !!b)));
  const biozoneData = biozones.map((bz) => {
    const row: Record<string, string | number> = { biozone: bz };
    bassins.forEach((b) => {
      row[b] = rows.filter((r) => r.biozones === bz && r.bassin === b).length;
    });
    return row;
  });

  if (biozones.length === 0) {
    return <p style={{ color: "var(--text-muted)" }}>Aucune donnée de biozone pour les filtres sélectionnés.</p>;
  }

  return (
    <div>
      <SectionTitle>Distribution des biozones par bassin</SectionTitle>
      <ChartCard height={380}>
        <ResponsiveBar
          data={biozoneData}
          theme={nivoTheme}
          keys={bassins}
          indexBy="biozone"
          groupMode="grouped"
          margin={{ top: 10, right: 200, bottom: 80, left: 40 }}
          padding={0.3}
          colors={SERIES_HEX}
          axisBottom={{ tickRotation: -40 }}
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
      </ChartCard>
    </div>
  );
}
