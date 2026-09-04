/* ============================================================
   ANALYSER  /  l'orchestrateur, appele depuis le Worker
   Emet un evenement des qu'une etape est prete, plutot que de tout calculer
   puis tout renvoyer d'un bloc : la premiere affiche peut s'afficher avant
   que la septieme soit calculee.
   ============================================================ */
import { construireFileMap, type ZipEnMemoire } from './zip';
import { chargerConversations, chargerRelations, detecterSoi } from './parse';
import {
  chapitre01, chapitre02, chapitre03, chapitre04,
  chapitre05, chapitre06, chapitre07,
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
  | { type: 'termine'; conversations: number; soi: string }
  | { type: 'erreur'; message: string };

/** Laisse la boucle d'evenements respirer entre deux chapitres : sans ca,
    un Worker qui enchaine 7 calculs synchrones ne laisse jamais l'occasion
    de poster (et donc d'afficher) le resultat precedent avant la fin. */
function respirer(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function analyser(
  zips: ZipEnMemoire[],
  emettre: (e: EvenementAnalyse) => void,
): Promise<void> {
  try {
    emettre({ type: 'etape', etape: 'lecture_zip' });
    const fileMap = await construireFileMap(zips);
    await respirer();

    emettre({ type: 'etape', etape: 'reconstruction' });
    const conversations = chargerConversations(fileMap);
    const { followers, following } = chargerRelations(fileMap);
    const soi = detecterSoi(conversations);
    await respirer();

    emettre({ type: 'chapitre', numero: 1, donnees: chapitre01(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 2, donnees: chapitre02(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 3, donnees: chapitre03(followers, following) });
    await respirer();

    emettre({ type: 'chapitre', numero: 4, donnees: chapitre04(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 5, donnees: chapitre05(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 6, donnees: chapitre06(conversations, soi) });
    await respirer();

    emettre({ type: 'chapitre', numero: 7, donnees: chapitre07(conversations, soi) });

    emettre({ type: 'termine', conversations: conversations.length, soi });
  } catch (erreur) {
    emettre({ type: 'erreur', message: erreur instanceof Error ? erreur.message : String(erreur) });
  }
}
