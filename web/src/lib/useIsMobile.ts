import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 640px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Vrai sur écran étroit (même seuil que les media queries CSS) : sert à adapter les graphiques Nivo. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Raccourcit un libellé d'axe trop long pour un petit écran. */
export function truncate(label: string | number, max: number): string {
  const s = String(label);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
