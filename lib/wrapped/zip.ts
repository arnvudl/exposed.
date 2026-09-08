/* ============================================================
   ZIP  /  les fichiers deposes -> consomme chaque .json au fil de la lecture
   Un export Instagram complet (avec les photos/videos) depasse souvent
   2 Go. Charger tout le ZIP en un seul buffer memoire echoue de facon
   systematique et reproductible dans Chrome au-dela de ~2 Go
   (`RangeError: Array buffer allocation failed`) : ce n'est ni un fichier
   verrouille, ni OneDrive, ni un souci ponctuel qu'un nouvel essai
   resoudrait. C'est une limite dure sur la taille d'UN SEUL buffer.

   La solution n'est donc pas de decouper la LECTURE (deja tente, ca ne
   change rien puisque le buffer final restait un seul gros bloc) mais de ne
   JAMAIS reconstituer l'archive entiere en memoire, NI garder le texte de
   toutes les entrees a la fois. zip.js lit le ZIP par petits acces cibles
   directement depuis le fichier (via `Blob.slice()`), entree par entree, et
   ne decompresse que celles qu'on lui demande. On va plus loin : le texte
   d'une entree est passe au consommateur puis aussitot relache (rien n'est
   stocke ici), donc le pic ne depend plus du nombre ni de la taille des
   fichiers JSON, seulement de la taille du plus gros d'entre eux.
   ============================================================ */
import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';

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

/** Appele pour chaque entree `.json` d'un ZIP, avec son texte. Le texte n'est
    plus valide une fois l'appel termine : ce qu'il faut en garder doit etre
    extrait tout de suite. */
export type Consommateur = (chemin: string, texte: string) => void;

// Rendre la main tous les N fichiers ingeres, pas a chaque fichier (le cout
// d'un setTimeout(0) additionne sur des milliers de petits JSON) ni jamais
// (le texte des fichiers precedents resterait reference plus longtemps que
// necessaire par la pile d'appels, retardant le ramasse-miettes).
const FICHIERS_ENTRE_RESPIRATIONS = 25;

function respirer(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function lireZips(
  fichiers: File[],
  consommer: Consommateur,
  onProgress?: (etape: string, fait: number, total: number) => void,
): Promise<void> {
  // Compte sur l'ensemble des ZIP, pas par fichier : Instagram decoupe un
  // gros export en parties, et une partie peut ne contenir que des medias.
  let htmlVu = false;
  let entreesJsonVues = 0;

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
        consommer(normaliserChemin(entree.filename), texte);
        entreesJsonVues++;
        if (entreesJsonVues % FICHIERS_ENTRE_RESPIRATIONS === 0) await respirer();
      }
    } catch (cause) {
      throw new ErreurLectureZip(fichiers[i].name, cause);
    } finally {
      await lecteur.close();
    }
  }
  onProgress?.('zip', fichiers.length, fichiers.length);

  if (entreesJsonVues === 0) throw htmlVu ? new ErreurExportHtml() : new ErreurExportVide();
}
