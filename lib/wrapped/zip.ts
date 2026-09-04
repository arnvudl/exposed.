/* ============================================================
   ZIP  /  les fichiers deposes -> une FileMap
   Instagram decoupe parfois un gros export en plusieurs ZIP (part 1, part
   2...). On les fusionne tous dans une seule Map, en ne gardant que le JSON
   (les photos/videos ne servent jamais aux 7 chapitres : les decompresser
   couterait du temps et de la memoire pour rien).
   ============================================================ */
import JSZip from 'jszip';
import type { FileMap } from './parse';

// Un ZIP peut envelopper le contenu dans un dossier (nom du compte, date...) :
// on ancre chaque chemin a partir du repere qui compte vraiment, pour que
// deux ZIP avec des enveloppes differentes se fusionnent quand meme.
const ANCRES = ['your_instagram_activity/', 'connections/'];

function normaliserChemin(chemin: string): string {
  for (const ancre of ANCRES) {
    const idx = chemin.indexOf(ancre);
    if (idx !== -1) return chemin.slice(idx);
  }
  return chemin;
}

export async function construireFileMap(
  fichiers: File[],
  onProgress?: (etape: string, fait: number, total: number) => void,
): Promise<FileMap> {
  const map: FileMap = new Map();

  for (let i = 0; i < fichiers.length; i++) {
    onProgress?.('zip', i, fichiers.length);
    const zip = await JSZip.loadAsync(fichiers[i]);
    const entrees = Object.values(zip.files).filter((f) => !f.dir && f.name.endsWith('.json'));
    for (const entree of entrees) {
      const texte = await entree.async('string');
      map.set(normaliserChemin(entree.name), texte);
    }
  }
  onProgress?.('zip', fichiers.length, fichiers.length);

  return map;
}
