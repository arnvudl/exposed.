/* ============================================================
   ANALYSER  /  l'orchestrateur, appele depuis le Worker
   Emet un evenement des qu'une etape est prete, plutot que de tout calculer
   puis tout renvoyer d'un bloc : la premiere affiche peut s'afficher avant
   que la derniere soit calculee.
   ============================================================ */
import { lireZips } from './zip';
import { Accumulateur, detecterSoi, type Periode } from './parse';
import {
  chapitre01, chapitre02, chapitre03, chapitre04,
  chapitre05, chapitre06, chapitre07,
  chapitreMedias, classementVocaux, classementPhotos, classementAppels,
} from './chapitres';

export type EvenementAnalyse =
  | { type: 'etape'; etape: 'lecture_zip' | 'reconstruction' }
  | { type: 'chapitre'; numero: 1; donnees: ReturnType<typeof chapitre01> }
  | { type: 'chapitre'; numero: 2; donnees: ReturnType<typeof chapitre02> }
  | { type: 'chapitre'; numero: 3; donnees: ReturnType<typeof chapitre03> }
  | { type: 'chapitre'; numero: 4; donnees: ReturnType<typeof chapitre04> }
  | { type: 'chapitre'; numero: 5; donnees: ReturnType<typeof chapitre05> }
  | { type: 'chapitre'; numero: 6; donnees: ReturnType<typeof chapitre06> }
  | { type: 'chapitre'; numero: 7; donnees: ReturnType<typeof chapitre07> }
  | {
    type: 'medias';
    stats: ReturnType<typeof chapitreMedias>;
    vocaux: ReturnType<typeof classementVocaux>;
    photos: ReturnType<typeof classementPhotos>;
    appels: ReturnType<typeof classementAppels>;
  }
  | { type: 'termine'; conversations: number; soi: string }
  | { type: 'erreur'; message: string };

/** Laisse la boucle d'evenements respirer entre deux chapitres : sans ca,
    un Worker qui enchaine 7 calculs synchrones ne laisse jamais l'occasion
    de poster (et donc d'afficher) le resultat precedent avant la fin. */
function respirer(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function analyser(
  fichiers: File[],
  emettre: (e: EvenementAnalyse) => void,
  periode?: Periode,
): Promise<void> {
  try {
    emettre({ type: 'etape', etape: 'lecture_zip' });
    const acc = new Accumulateur(periode);
    await lireZips(fichiers, (chemin, texte) => acc.ingerer(chemin, texte));
    await respirer();

    emettre({ type: 'etape', etape: 'reconstruction' });
    const {
      conversations, followers, following, motsParExpediteur, motsTotalParExpediteur, messagesParExpediteur,
      plusLongMessageParExpediteur,
    } = acc.terminer();
    // Le chapitre 03 (follow-back) ne depend que de followers/following, pas
    // des messages : un export sans « Messages » cochee (ou une periode qui
    // les elimine tous) doit encore le montrer, pas bloquer toute la page.
    if (conversations.length === 0 && followers.size === 0 && following.size === 0) {
      emettre({
        type: 'erreur',
        message: 'Aucune donnée dans cet export : ni messages, ni abonnés/abonnements. Refais ' +
          'la demande à Instagram en cochant au moins l’une des deux catégories.',
      });
      return;
    }
    const soi = detecterSoi(conversations);
    await respirer();

    // Ordre d'emission = ordre d'affichage dans la story (page.tsx ajoute
    // chaque lot de cartes a la fin de `cartesRef` des qu'il arrive) : voir
    // le commentaire de NOMS_CHAPITRES dans mapper.ts pour la numerotation
    // d'affichage, differente des `numero` ci-dessous (identite des
    // fonctions, inchangee depuis toujours pour ne pas casser leurs
    // references ailleurs -- seul l'ORDRE des emissions a change).
    emettre({ type: 'chapitre', numero: 1, donnees: chapitre01(conversations, soi) });
    await respirer();

    emettre({
      type: 'chapitre', numero: 4,
      donnees: chapitre04(motsParExpediteur, motsTotalParExpediteur, messagesParExpediteur, soi),
    });
    await respirer();

    emettre({
      type: 'medias',
      stats: chapitreMedias(conversations, soi),
      vocaux: classementVocaux(conversations, soi),
      photos: classementPhotos(conversations, soi),
      appels: classementAppels(conversations, soi),
    });
    await respirer();

    emettre({ type: 'chapitre', numero: 2, donnees: chapitre02(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 3, donnees: chapitre03(followers, following) });
    await respirer();

    emettre({ type: 'chapitre', numero: 5, donnees: chapitre05(conversations, soi, plusLongMessageParExpediteur) });
    await respirer();

    emettre({ type: 'chapitre', numero: 6, donnees: chapitre06(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 7, donnees: chapitre07(conversations, soi) });

    emettre({ type: 'termine', conversations: conversations.length, soi });
  } catch (erreur) {
    emettre({ type: 'erreur', message: erreur instanceof Error ? erreur.message : String(erreur) });
  }
}
