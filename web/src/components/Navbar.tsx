import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Map, BarChart3, ClipboardList, BookMarked, House, Menu, X } from "lucide-react";
import "./navbar.css";

const NAV_ITEMS = [
  { to: "/accueil", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/carte", label: "Carte", icon: Map },
  { to: "/analyses", label: "Analyses", icon: BarChart3 },
  { to: "/catalogue", label: "Catalogue", icon: ClipboardList },
  { to: "/bibliographie", label: "Bibliographie", icon: BookMarked },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nb${open ? " is-open" : ""}`}>
      <Link to="/" title="Retour à la page d'accueil" className="nb-brand">
        <img src="/brand/logo-primary.svg" alt="" width={30} height={30} />
        Ichnosen
      </Link>

      {/* Un clic sur un lien referme le menu */}
      <nav id="nb-menu" className="nb-nav" aria-label="Pages de la base" onClick={() => setOpen(false)}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nb-link${isActive ? " is-active" : ""}`}>
            <item.icon size={16} strokeWidth={1.75} color="var(--brand-copper)" aria-hidden />
            {item.label}
          </NavLink>
        ))}
        <Link to="/" className="nb-link nb-link--home">
          <House size={16} strokeWidth={1.75} color="var(--brand-copper)" aria-hidden />
          Page d'accueil
        </Link>
      </nav>

      <Link to="/" className="nb-home" aria-label="Page d'accueil">
        <House size={15} strokeWidth={1.75} aria-hidden />
        <span className="nb-home-label">Page d'accueil</span>
      </Link>

      <button
        className="nb-burger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="nb-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
      </button>

      {open && <div className="nb-backdrop" onClick={() => setOpen(false)} />}
    </header>
  );
}
