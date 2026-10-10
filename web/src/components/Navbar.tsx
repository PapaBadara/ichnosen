import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Map, BarChart3, ClipboardList, BookMarked, House } from "lucide-react";
import "./navbar.css";

const NAV_ITEMS = [
  { to: "/accueil", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/carte", label: "Carte", icon: Map },
  { to: "/analyses", label: "Analyses", icon: BarChart3 },
  { to: "/catalogue", label: "Catalogue", icon: ClipboardList },
  { to: "/bibliographie", label: "Bibliographie", icon: BookMarked },
];

export function Navbar() {
  return (
    <header className="nb">
      <Link to="/" title="Retour à la page d'accueil" className="nb-brand">
        <img src="/brand/logo-primary.svg" alt="" width={30} height={30} />
        Ichnosen
      </Link>

      <nav className="nb-nav" aria-label="Pages de la base">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nb-link${isActive ? " is-active" : ""}`}>
            <item.icon size={16} strokeWidth={1.75} color="var(--brand-copper)" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Link to="/" className="nb-home" aria-label="Page d'accueil">
        <House size={15} strokeWidth={1.75} aria-hidden />
        <span className="nb-home-label">Page d'accueil</span>
      </Link>
    </header>
  );
}
