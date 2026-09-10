/* ============================================================
   JEU  /  mini-devinettes intercalees dans la story
   Pas un mode a part : une question surgit juste avant certaines cartes
   (avant de reveler le cercle reel, avant de reveler le classement des
   groupes), avec 2 a 4 choix, jamais de texte libre. Chaque fonction est
   pure et ne fabrique une question que si les donnees le permettent
   vraiment (cf. commentaires) -- sinon elle renvoie null et la story
   continue sans detour, silencieusement.
   ============================================================ */
import type { chapitre01, chapitre02, LigneMedia } from './chapitres';

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;

export type OptionDevine = { texte: string; correcte: boolean };
export type DonneesDevine = {
  id: string;
  question: string;
  options: OptionDevine[];
};

/** Bornes deja formatees pour l'affichage ("3 mars 2026"), pas des
    timestamps : construites une fois cote appelant (page.tsx a la periode
    choisie par l'utilisateur, demo.ts a la periode fabriquee), pour que ce
    module reste pur et ignorant du formatage de date. */
export type ContextePeriode = { debut: string; fin: string };

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Prefixe une question avec la periode analysee, quand elle est connue :
    "Entre le 3 mars 2026 et le 12 juin 2026, à qui tu as le plus parlé ?"
    Sans periode (export complet, ou demo sans date fabriquee), la question
    reste telle quelle -- jamais de fausse precision. */
function poserQuestion(base: string, periode?: ContextePeriode): string {
  if (!periode) return base;
  const minuscule = base.charAt(0).toLocaleLowerCase('fr-FR') + base.slice(1);
  return `Entre le ${periode.debut} et le ${periode.fin}, ${minuscule}`;
}

/* ---------- devine 1 : « a qui tu as le plus parle ? » ----------
   Avant la carte reveal du chapitre 01. Le bon choix est le top 1, les
   leurres viennent des rangs suivants -- de vrais contacts frequents, pas
   n'importe qui, pour que rater soit plausible sans etre impossible. */
export function construireDevineTop(c: C01, periode?: ContextePeriode): DonneesDevine | null {
  if (c.length < 3) return null;
  const gagnant = c[0];
  const leurres = melanger(c.slice(1, 6)).slice(0, Math.min(3, c.length - 1));
  const options: OptionDevine[] = melanger([
    { texte: gagnant.qui, correcte: true },
    ...leurres.map((l) => ({ texte: l.qui, correcte: false })),
  ]);
  return { id: 'devine-top', question: poserQuestion('À qui tu as le plus parlé ?', periode), options };
}

/* ---------- devine 2 : versus entre deux contacts de tranche proche ----------
   Pas le 1er contre le 10e (evident) : la paire dont les totaux sont les
   plus proches parmi les rangs 2 a 10, pour un vrai dilemme. Skip le rang 1,
   deja utilise par construireDevineTop. */
export function construireDevineVersusContacts(c: C01, periode?: ContextePeriode): DonneesDevine | null {
  const reste = c.slice(1);
  if (reste.length < 2) return null;
  let meilleurePaire: [number, number] | null = null;
  let ecartMin = Infinity;
  for (let i = 0; i < reste.length - 1; i++) {
    const ecart = reste[i].total - reste[i + 1].total;
    if (ecart < ecartMin) { ecartMin = ecart; meilleurePaire = [i, i + 1]; }
  }
  if (!meilleurePaire) return null;
  const [a, b] = [reste[meilleurePaire[0]], reste[meilleurePaire[1]]];
  const options: OptionDevine[] = melanger([
    { texte: a.qui, correcte: a.total >= b.total },
    { texte: b.qui, correcte: b.total > a.total },
  ]);
  return {
    id: 'devine-versus-contacts',
    question: poserQuestion('Qui a échangé le plus de messages avec toi ?', periode),
    options,
  };
}

/* ---------- devine 3 : versus entre deux groupes actifs ----------
   Meme logique, sur les groupes actifs (pas seulement les 5 categories
   gagnantes) : la paire aux totaux les plus proches. */
export function construireDevineVersusGroupes(c: C02, periode?: ContextePeriode): DonneesDevine | null {
  if (c.abandon || !c.actifs || c.actifs.length < 2) return null;
  const tries = [...c.actifs].sort((x, y) => y.totalMessages - x.totalMessages);
  let meilleurePaire: [number, number] | null = null;
  let ecartMin = Infinity;
  for (let i = 0; i < tries.length - 1; i++) {
    const ecart = tries[i].totalMessages - tries[i + 1].totalMessages;
    if (ecart < ecartMin) { ecartMin = ecart; meilleurePaire = [i, i + 1]; }
  }
  if (!meilleurePaire) return null;
  const [a, b] = [tries[meilleurePaire[0]], tries[meilleurePaire[1]]];
  const options: OptionDevine[] = melanger([
    { texte: a.titre, correcte: a.totalMessages >= b.totalMessages },
    { texte: b.titre, correcte: b.totalMessages > a.totalMessages },
  ]);
  return {
    id: 'devine-versus-groupes',
    question: poserQuestion('Quel groupe a été le plus actif ?', periode),
    options,
  };
}

/* ---------- devine 4 : versus sur un media (vocaux, photos...) ----------
   Meme logique de paire proche, generalisee : sert aussi bien au classement
   des vocaux qu'a celui des photos (voir chapitreMedias, lib/wrapped/chapitres.ts).
   Le classement doit deja ne contenir que des contacts avec au moins 1 (voir
   `classementParContact`), donc pas de garde supplementaire ici que la
   longueur. */
export function construireDevineVersusMedia(
  classement: LigneMedia[],
  question: string,
  id: string,
  periode?: ContextePeriode,
): DonneesDevine | null {
  if (classement.length < 2) return null;
  const tries = [...classement].sort((x, y) => y.total - x.total);
  let meilleurePaire: [number, number] | null = null;
  let ecartMin = Infinity;
  for (let i = 0; i < tries.length - 1; i++) {
    const ecart = tries[i].total - tries[i + 1].total;
    if (ecart < ecartMin) { ecartMin = ecart; meilleurePaire = [i, i + 1]; }
  }
  if (!meilleurePaire) return null;
  const [a, b] = [tries[meilleurePaire[0]], tries[meilleurePaire[1]]];
  const options: OptionDevine[] = melanger([
    { texte: a.qui, correcte: a.total >= b.total },
    { texte: b.qui, correcte: b.total > a.total },
  ]);
  return { id, question: poserQuestion(question, periode), options };
}
