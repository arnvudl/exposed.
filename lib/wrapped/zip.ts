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

// Les exports Instagram complets (avec les photos/videos) depassent souvent
// 2 Go. Au-dela de cette taille, `Blob.arrayBuffer()` en un seul appel echoue
// dans Chrome avec « The requested file could not be read... » — une limite
// du navigateur sur la lecture d'un Blob d'un coup, pas un fichier corrompu
// ni un antivirus. La parade : decouper la lecture en tranches, chacune bien
// en dessous du plafond, puis les recoller en un seul buffer en memoire (ca,
// V8 le supporte sans probleme sur un navigateur 64 bits).
const TAILLE_TRANCHE = 512 * 1024 * 1024; // 512 Mo

/** Lit un fichier en memoire, par tranches si besoin. Ne fait rien de
    particulier pour les petits fichiers : `f.slice()` sur l'ensemble du
    fichier revient a le lire d'un coup. */
export async function lireFichierEnMemoire(f: File): Promise<ArrayBuffer> {
  if (f.size <= TAILLE_TRANCHE) return f.arrayBuffer();

  const resultat = new Uint8Array(f.size);
  let position = 0;
  while (position < f.size) {
    const fin = Math.min(position + TAILLE_TRANCHE, f.size);
    const tranche = await f.slice(position, fin).arrayBuffer();
    resultat.set(new Uint8Array(tranche), position);
    position = fin;
  }
  return resultat.buffer;
}

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
