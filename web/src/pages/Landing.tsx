import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  BarChart3,
  ClipboardList,
  BookMarked,
  ListTree,
  SlidersHorizontal,
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

// TODO : remplacer par l'adresse du profil LinkedIn de Khadija Thior
const AUTHOR_LINKEDIN = "https://www.linkedin.com/";

/** Logo LinkedIn (absent de lucide-react, qui ne fournit plus d'icônes de marques). */
function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

// Ancres de la page d'accueil (menu de l'en-tête)
const SECTIONS = [
  { id: "presentation", label: "Présentation" },
  { id: "chiffres", label: "Chiffres clés" },
  { id: "modules", label: "Modules" },
  { id: "publications", label: "Publications" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Section actuellement à l'écran, pour surligner l'entrée du menu. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const SECTION_IDS = SECTIONS.map((s) => s.id);

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
    desc: "Parcourez la classification complète, du groupe à l'espèce, foraminifères et ostracodes confondus.",
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
    icon: SlidersHorizontal,
    title: "Recherche et filtres",
    desc: "Recherche sans accents, filtres croisés et tri sur chaque tableau, avec fiche détaillée en un clic.",
    to: "/catalogue",
  },
];

// Spécimens mis en avant dans le héros (photos sur fond clair, cadrage carré)
const SPECIMEN_IDS = ["TX0008", "TX0271", "TX0326", "TX0012", "TX0548", "TX0357"];

/** En-tête commun à toutes les sections : libellé, titre, sous-titre. */
function SectionHead({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="lp-section-head">
      <div>
        <p className="lp-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="lp-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Landing() {
  const { all, references } = useData();
  const activeSection = useActiveSection(SECTION_IDS);

  // Lien direct vers une section (ex. /#modules) : le contenu est rendu après le
  // chargement, le navigateur ne peut donc pas défiler seul jusqu'à l'ancre.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);
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
        <a
          href="#presentation"
          className="lp-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src="/brand/logo-primary.svg" alt="" width={32} height={32} />
          Ichnosen
        </a>
        <nav className="lp-nav" aria-label="Sections de la page">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`lp-nav-link${activeSection === sec.id ? " is-active" : ""}`}
              aria-current={activeSection === sec.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(sec.id);
              }}
            >
              {sec.label}
            </a>
          ))}
        </nav>
        <Link to="/accueil" className="lp-btn lp-btn--primary lp-btn--sm lp-header-cta">
          Explorer la base
        </Link>
      </header>

      <section id="presentation" className="lp-hero">
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
                Explorer le catalogue
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

      <section id="chiffres" className="lp-band lp-band--alt">
        <div className="lp-container">
          <SectionHead
            eyebrow="Chiffres clés"
            title="La base en quelques chiffres"
            subtitle="Données consolidées à partir des publications dépouillées"
          />
          <div className="lp-grid-4">
            {stats.map((s) => (
              <div key={s.label} className="lp-card">
                <div className="lp-card-icon">
                  <s.icon size={20} strokeWidth={1.75} color="var(--brand-copper)" />
                </div>
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="lp-band">
        <div className="lp-container">
          <SectionHead
            eyebrow="Modules"
            title="Modules de la plateforme"
            subtitle="Tout ce qu'il faut pour explorer les données"
          />
          <div className="lp-grid-3">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to} className="lp-card lp-card--link">
                <div className="lp-card-icon">
                  <f.icon size={20} strokeWidth={1.75} color="var(--brand-copper)" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="publications" className="lp-band lp-band--alt">
        <div className="lp-container">
          <SectionHead
            eyebrow="Publications"
            title="Basé sur des publications scientifiques"
            subtitle={`${references.length} références dépouillées, consultables dans la bibliographie`}
            action={
              <Link to="/bibliographie" className="lp-head-link">
                Voir toute la bibliographie
              </Link>
            }
          />
          <div className="lp-grid-3">
            {topRefs.map((ref) => (
              <div key={ref.id} className="lp-card">
                <div className="lp-card-icon">
                  <BookMarked size={20} strokeWidth={1.75} color="var(--brand-copper)" />
                </div>
                <h3>{ref.citation}</h3>
                {ref.titre && <p className="lp-ref-title">{ref.titre}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <h2>Prêt à explorer la base ?</h2>
        <p>{taxa.length} taxons vous attendent dans le catalogue.</p>
        <Link to="/catalogue" className="lp-btn lp-btn--primary">
          Explorer le catalogue
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
          <div className="lp-footnote">
            <p>
              © {new Date().getFullYear()} Ichnosen · Données issues des travaux de Sarr et al. (1998–2023)
            </p>
            <a href={AUTHOR_LINKEDIN} target="_blank" rel="noopener noreferrer" className="lp-credit">
              Réalisé par Khadija Thior <LinkedinIcon size={15} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
