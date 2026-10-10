import { Link } from "react-router-dom";
import {
  Map,
  BarChart3,
  ClipboardList,
  BookMarked,
  ListTree,
  Download,
  ArrowRight,
  ArrowUpRight,
  Layers,
  MapPin,
  FlaskConical,
} from "lucide-react";
import { groupByTaxon, useData } from "../context/DataContext";
import "./landing.css";

const NAV_LINKS = [
  { to: "/carte", label: "Carte" },
  { to: "/analyses", label: "Analyses" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/bibliographie", label: "Bibliographie" },
];

const FEATURES = [
  {
    icon: Map,
    title: "Carte interactive",
    desc: "Localisez chaque occurrence sur les bassins sénégalo-mauritanien et de Casamance, avec regroupement par cluster.",
    to: "/carte",
  },
  {
    icon: ListTree,
    title: "Navigateur taxonomique",
    desc: "Parcourez la classification complète (groupe → ordre → genre → espèce), foraminifères et ostracodes confondus.",
    to: "/catalogue",
  },
  {
    icon: BarChart3,
    title: "Analyses statistiques",
    desc: "Hiérarchie taxonomique, paléoenvironnements et stratigraphie visualisés par bassin.",
    to: "/analyses",
  },
  {
    icon: ClipboardList,
    title: "Fiches illustrées",
    desc: "Description morphologique, contexte stratigraphique et photo de spécimen quand elle est disponible.",
    to: "/catalogue",
  },
  {
    icon: BookMarked,
    title: "Bibliographie",
    desc: "Chaque occurrence est rattachée à sa publication source, consultable dans son intégralité.",
    to: "/bibliographie",
  },
  {
    icon: Download,
    title: "Export ouvert",
    desc: "Jeux de données filtrés exportables en CSV ou JSON.",
    to: "/catalogue",
  },
];

// Spécimens mis en avant dans le héros (photos sur fond clair, cadrage carré)
const SPECIMEN_IDS = ["TX0008", "TX0271", "TX0326", "TX0012", "TX0548", "TX0357"];

export function Landing() {
  const { all, references } = useData();
  const taxa = groupByTaxon(all);
  const nLocalities = new Set(all.map((o) => o.locality_nom).filter(Boolean)).size;

  const stats = [
    { icon: FlaskConical, value: taxa.length, label: "Taxons" },
    { icon: Layers, value: all.length, label: "Occurrences" },
    { icon: MapPin, value: nLocalities, label: "Localités" },
    { icon: BookMarked, value: references.length, label: "Références" },
  ];

  const topRefs = [...references]
    .sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0))
    .slice(0, 3);

  const specimens = SPECIMEN_IDS.map((id) => taxa.find((t) => t.taxon_id === id)).filter(
    (t): t is NonNullable<typeof t> => t?.photo != null,
  );

  return (
    <div className="lp">
      <header className="lp-header">
        <Link to="/" className="lp-brand">
          <img src="/brand/logo-primary.svg" alt="" width={32} height={32} />
          Ichnosen
        </Link>
        <nav className="lp-nav">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="lp-nav-link">
              {l.label}
            </Link>
          ))}
          <Link to="/accueil" className="lp-btn lp-btn--primary lp-btn--sm">
            Explorer la base <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </nav>
      </header>

      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div>
            <p className="lp-eyebrow">Chronicles of Earth</p>
            <h1>Les microfossiles du Sénégal</h1>
            <p className="lp-lead">
              Base de référence sur les foraminifères et ostracodes des bassins sénégalo-mauritanien et de
              Casamance, consolidée à partir des travaux de Sarr et al. (1998–2023).
            </p>
            <div className="lp-actions">
              <Link to="/catalogue" className="lp-btn lp-btn--primary">
                Explorer le catalogue <ArrowRight size={17} strokeWidth={2} />
              </Link>
              <Link to="/carte" className="lp-btn lp-btn--ghost">
                Voir la carte
              </Link>
            </div>
          </div>
          <div className="lp-specimens">
            {specimens.map((t) => (
              <Link key={t.taxon_id} to={`/catalogue?taxon=${t.taxon_id}`} className="lp-specimen" title={t.nom_taxon}>
                <figure style={{ margin: 0, height: "100%" }}>
                  <img src={t.photo!} alt={t.nom_taxon} loading="lazy" />
                  <figcaption>{t.nom_taxon}</figcaption>
                </figure>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-container">
        <section className="lp-stats">
          {stats.map((s) => (
            <div key={s.label} className="lp-stat">
              <s.icon size={22} strokeWidth={1.75} color="var(--brand-copper)" />
              <div className="lp-stat-value">{s.value}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="lp-section">
          <div className="lp-section-head">
            <h2>Modules de la plateforme</h2>
            <p>Tout ce qu'il faut pour explorer les données</p>
          </div>
          <div className="lp-grid-3">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to} className="lp-card lp-card--link">
                <ArrowUpRight size={18} strokeWidth={1.75} className="lp-card-arrow" />
                <div className="lp-card-icon">
                  <f.icon size={20} strokeWidth={1.75} color="var(--brand-copper)" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-section-head">
            <h2>Basé sur des publications scientifiques</h2>
            <p>{references.length} références dépouillées, consultables dans la bibliographie</p>
          </div>
          <div className="lp-grid-3">
            {topRefs.map((ref) => (
              <div key={ref.id} className="lp-card lp-ref">
                <h3>{ref.citation}</h3>
                {ref.titre && <p>{ref.titre}</p>}
              </div>
            ))}
          </div>
          <div className="lp-more">
            <Link to="/bibliographie">
              Voir toute la bibliographie <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </section>
      </div>

      <section className="lp-cta">
        <h2>Prêt à explorer la base ?</h2>
        <p>{taxa.length} taxons vous attendent dans le catalogue.</p>
        <Link to="/catalogue" className="lp-btn lp-btn--primary">
          Explorer le catalogue <ArrowRight size={17} strokeWidth={2} />
        </Link>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-brand" style={{ fontSize: 16 }}>
                <img src="/brand/logo-primary.svg" alt="" width={28} height={28} />
                Ichnosen
              </div>
              <p>Plateforme de référence sur les microfossiles du bassin sénégalo-mauritanien.</p>
            </div>
            <div>
              <h4>Explorer</h4>
              <div className="lp-footer-links">
                {NAV_LINKS.map((l) => (
                  <Link key={l.to} to={l.to}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="lp-footnote">Ichnosen : données issues des travaux de Sarr et al. (1998–2023)</p>
        </div>
      </footer>
    </div>
  );
}
