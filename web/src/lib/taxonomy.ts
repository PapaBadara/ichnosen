import type { TaxonGroup } from "../types";

/** The data has no separate Genre/Famille columns; nom_taxon is "Genre espèce...".
 *  We derive the genus as its first token, which is the closest honest proxy
 *  to the charter's "genre → famille → ordre" browser without fabricating data. */
export function deriveGenre(nomTaxon: string | null): string {
  if (!nomTaxon) return "?";
  return nomTaxon.trim().replace(/^"/, "").split(/\s+/)[0];
}

export interface GroupeNode {
  groupe: string;
  count: number;
  ordres: OrdreNode[];
}

export interface OrdreNode {
  ordre: string;
  count: number;
  genres: GenreNode[];
}

export interface GenreNode {
  genre: string;
  count: number;
  taxa: TaxonGroup[];
}

export function buildTaxonomyTree(taxa: TaxonGroup[]): GroupeNode[] {
  const byGroupe = new Map<string, TaxonGroup[]>();
  taxa.forEach((t) => {
    if (!byGroupe.has(t.groupe)) byGroupe.set(t.groupe, []);
    byGroupe.get(t.groupe)!.push(t);
  });

  return Array.from(byGroupe.entries())
    .map(([groupe, groupeTaxa]) => {
      const byOrdre = new Map<string, TaxonGroup[]>();
      groupeTaxa.forEach((t) => {
        const ordre = t.groupe_ordre ?? "Non renseigné";
        if (!byOrdre.has(ordre)) byOrdre.set(ordre, []);
        byOrdre.get(ordre)!.push(t);
      });

      const ordres = Array.from(byOrdre.entries())
        .map(([ordre, ordreTaxa]) => {
          const byGenre = new Map<string, TaxonGroup[]>();
          ordreTaxa.forEach((t) => {
            const genre = deriveGenre(t.nom_taxon);
            if (!byGenre.has(genre)) byGenre.set(genre, []);
            byGenre.get(genre)!.push(t);
          });
          const genres = Array.from(byGenre.entries())
            .map(([genre, taxa]) => ({ genre, count: taxa.length, taxa }))
            .sort((a, b) => a.genre.localeCompare(b.genre, "fr"));
          return { ordre, count: ordreTaxa.length, genres };
        })
        .sort((a, b) => b.count - a.count);

      return { groupe, count: groupeTaxa.length, ordres };
    })
    .sort((a, b) => b.count - a.count);
}
