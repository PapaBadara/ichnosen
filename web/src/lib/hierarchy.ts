interface TreeNode {
  id: string;
  children?: TreeNode[];
  value?: number;
}

/** Builds a nested count tree (for sunburst/treemap) by successively grouping on `keys`. */
export function buildTree<T extends object>(rows: T[], keys: (keyof T)[]): TreeNode[] {
  if (keys.length === 0) return [];
  const [key, ...rest] = keys;
  // Rows with a blank value at this level are bucketed under "Non renseigné"
  // rather than dropped: silently skipping them would zero out the value of
  // whole ancestor branches once every row at a deeper level is blank (e.g.
  // sous_type is null for every ostracode occurrence).
  const groups = new Map<string, T[]>();
  rows.forEach((row) => {
    const raw = row[key];
    const k = raw === null || raw === undefined || raw === "" ? "Non renseigné" : String(raw);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(row);
  });

  return Array.from(groups.entries()).map(([id, subrows]) => {
    if (rest.length === 0) {
      return { id, value: subrows.length };
    }
    return { id, children: buildTree(subrows, rest) };
  });
}
