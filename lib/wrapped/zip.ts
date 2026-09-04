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

export type ZipEnMemoire = { nom: string; donnees: ArrayBuffer };

/** Une erreur de lecture nomme le fichier fautif : sans ca, un des trois ZIP
    d'Instagram qui coince (fichier OneDrive pas encore telecharge en local,
    verrouille par un antivirus...) ne se distingue pas des deux autres. */
export class ErreurLectureZip extends Error {
  constructor(public nomFichier: string, cause: unknown) {
    super(`Impossible de lire « ${nomFichier} ». Le fichier est peut-etre encore "en ligne uniquement" ` +
      `(OneDrive, Google Drive...) et pas telecharge sur cet appareil, ou verrouille par un antivirus. ` +
      `Verifie qu'il est disponible hors connexion, puis reessaie.`);
    this.cause = cause;
  }
}

export async function construireFileMap(
  zips: ZipEnMemoire[],
  onProgress?: (etape: string, fait: number, total: number) => void,
): Promise<FileMap> {
  const map: FileMap = new Map();

  for (let i = 0; i < zips.length; i++) {
    onProgress?.('zip', i, zips.length);
    let zip;
    try {
      zip = await JSZip.loadAsync(zips[i].donnees);
    } catch (cause) {
      throw new ErreurLectureZip(zips[i].nom, cause);
    }
    const entrees = Object.values(zip.files).filter((f) => !f.dir && f.name.endsWith('.json'));
    for (const entree of entrees) {
      const texte = await entree.async('string');
      map.set(normaliserChemin(entree.name), texte);
    }
  }
  onProgress?.('zip', zips.length, zips.length);

  return map;
}
