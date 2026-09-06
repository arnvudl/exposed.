/* ============================================================
   ZIP  /  les fichiers deposes -> une FileMap
   Un export Instagram complet (avec les photos/videos) depasse souvent
   2 Go. Charger tout le ZIP en un seul buffer memoire echoue de facon
   systematique et reproductible dans Chrome au-dela de ~2 Go
   (`RangeError: Array buffer allocation failed`) : ce n'est ni un fichier
   verrouille, ni OneDrive, ni un souci ponctuel qu'un nouvel essai
   resoudrait. C'est une limite dure sur la taille d'UN SEUL buffer.

   La solution n'est donc pas de decouper la LECTURE (deja tente, ca ne
   change rien puisque le buffer final restait un seul gros bloc) mais de ne
   JAMAIS reconstituer l'archive entiere en memoire. zip.js lit le ZIP par
   petits acces cibles directement depuis le fichier (via `Blob.slice()`),
   entree par entree, et ne decompresse que celles qu'on lui demande — donc
   jamais plus que quelques Ko a la fois pour les JSON qui nous interessent,
   quelle que soit la taille du ZIP.
   ============================================================ */
import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';
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

/** Une erreur de lecture nomme le fichier fautif : sans ca, un des trois ZIP
    d'Instagram qui coince ne se distingue pas des deux autres. */
export class ErreurLectureZip extends Error {
  constructor(public nomFichier: string, cause: unknown) {
    super(`Impossible de lire « ${nomFichier} ». Le fichier est peut-être corrompu ou incomplet ` +
      `(re-télécharge-le depuis Instagram si le problème persiste).`);
    this.cause = cause;
  }
}

/** L'erreur la plus frequente : l'export demande en HTML au lieu de JSON.
    Elle merite son propre message, pas un dossier vide. */
export class ErreurExportHtml extends Error {
  constructor() {
    super('Ton export est au format HTML : le site ne peut rien y lire. Redemande-le à ' +
      'Instagram en choisissant le format JSON (voir le guide d’export).');
  }
}

export class ErreurExportVide extends Error {
  constructor() {
    super('Aucun fichier JSON trouvé dans ce ZIP. Vérifie que c’est bien l’export envoyé ' +
      'par Instagram, et qu’il est complet.');
  }
}

export async function construireFileMap(
  fichiers: File[],
  onProgress?: (etape: string, fait: number, total: number) => void,
): Promise<FileMap> {
  const map: FileMap = new Map();
  // Compte sur l'ensemble des ZIP, pas par fichier : Instagram decoupe un
  // gros export en parties, et une partie peut ne contenir que des medias.
  let htmlVu = false;

  for (let i = 0; i < fichiers.length; i++) {
    onProgress?.('zip', i, fichiers.length);
    const lecteur = new ZipReader(new BlobReader(fichiers[i]));
    try {
      const entrees = await lecteur.getEntries();
      for (const entree of entrees) {
        if (entree.directory || !entree.getData) continue;
        if (entree.filename.endsWith('.html')) { htmlVu = true; continue; }
        if (!entree.filename.endsWith('.json')) continue;
        const texte = await entree.getData(new TextWriter());
        map.set(normaliserChemin(entree.filename), texte);
      }
    } catch (cause) {
      throw new ErreurLectureZip(fichiers[i].name, cause);
    } finally {
      await lecteur.close();
    }
  }
  onProgress?.('zip', fichiers.length, fichiers.length);

  if (map.size === 0) throw htmlVu ? new ErreurExportHtml() : new ErreurExportVide();

  return map;
}
