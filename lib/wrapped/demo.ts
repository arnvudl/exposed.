/* ============================================================
   DEMO  /  donnees inventees, generees a la volee, jamais stockees
   Un clic tire un profil au hasard parmi les dix (voir profil.ts) et fabrique
   des chiffres plausibles qui y correspondent, pour montrer le rendu sans
   attendre un vrai export. Rien ici n'est un vrai compte ni un vrai message :
   ce generateur alimente les memes fonctions que l'analyse reelle
   (mapChapitreNN, construireFaits), donc le rendu est identique — seule la
   source des chiffres change. Rien n'est ecrit sur disque ni envoye nulle
   part : tout vit dans la memoire de l'onglet, comme une vraie analyse.
   ============================================================ */
import type { DonneesAffiche } from '@/components/Affiche';
import type { DonneesBrutesChapitres } from '@/lib/partage/faits';
import type {
  chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07,
  GroupeStats, StatsMedias, StatsMots, LigneMedia,
} from './chapitres';
import {
  mapChapitre01, mapChapitre02, mapChapitre03, mapChapitre04,
  mapChapitre05, mapChapitre06, mapChapitre07, mapChapitreMedias, MAX_CITATION,
} from './mapper';
import { nomsProfils, signaturePourNom, axesDepuisSignature, type Signature } from './profil';
import {
  construireDevineTop, construireDevineVersusContacts, construireDevineVersusGroupes,
  construireDevineVersusMedia, type DonneesDevine, type ContextePeriode,
} from './jeu';

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;
type C03 = ReturnType<typeof chapitre03>;
type C04 = StatsMots;
type C05 = ReturnType<typeof chapitre05>;
type C06 = ReturnType<typeof chapitre06>;
type C07 = ReturnType<typeof chapitre07>;

function alea(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function choisir<T>(liste: T[]): T {
  return liste[alea(0, liste.length - 1)];
}
function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = alea(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const PRENOMS = [
  'lina', 'nolan', 'camille', 'yanis', 'sacha', 'ines', 'matteo', 'chloe',
  'naim', 'lea', 'enzo', 'manon', 'rayan', 'zoe', 'hugo', 'sarah', 'adam',
  'jade', 'lucas', 'nina', 'rania', 'tom', 'maya', 'noah', 'lou', 'kenza',
  'bilal', 'alia', 'milo', 'eva', 'younes', 'romy', 'malo', 'sofia',
];

/** Un pseudo Instagram plausible par appel, jamais deux fois le meme dans
    une demo : les vrais pseudos sont uniques, un doublon casserait
    l'illusion plus vite qu'un pseudo un peu artificiel. */
function creerGenerateurPseudos() {
  const utilises = new Set<string>();
  return function pseudo(): string {
    let p: string;
    do {
      const base = choisir(PRENOMS);
      p = choisir([
        `${base}.ig`, `${base}_`, `${base}${alea(10, 99)}`, `${base}.off`,
        `${base}.x`, `_${base}`, `${base}.${alea(1, 9)}`,
      ]);
    } while (utilises.has(p));
    utilises.add(p);
    return p;
  };
}

const GROUPES_NOMS = [
  'Les cousins', 'Bac + rien', 'Team projet', 'Vacances d’été', 'Anciens du lycée',
  'Le five', 'Sortie samedi', 'Les intoxs', 'Chill zone', 'Potes de fac',
];
const MOTS_CANDIDATS = ['mdr', 'grave', 'genre', 'franchement', 'ouais', 'carrément', 'bref', 'en vrai', 'trop', 'sah'];
const PREMIERS_MESSAGES = [
  'Hey, ça va ?', 'Salut ! On se connaît de la soirée de Sacha', 'Yo t’as eu mon message ?',
  'Coucou, je crois qu’on est dans le même groupe TD', 'Salut, tu vas bien ?',
  'Hey ! Ça faisait longtemps', 'On se suit depuis un moment, je me lance', 'Slt, dispo ce soir ?',
];
const DERNIERS_MESSAGES = [
  'Ok ça marche, à demain', 'Mdr n’importe quoi', 'Grave, on se tient au courant',
  'Ouais carrément', 'Nickel, merci', 'Haha ok bref', 'On se voit ce week-end alors',
  'À plus', 'Ouais je sais pas trop en vrai', 'On se capte cette semaine',
];

const JOUR_MS = 86_400_000;

function genererCercle(pseudo: () => string, sig: Signature): C01 {
  const base = 800 + Math.round(sig.ampleur * 1200);
  const lignes: C01 = [];
  for (let i = 0; i < 10; i++) {
    const decroissance = 0.62 ** i;
    const total = Math.max(12, Math.round(base * decroissance * (0.85 + Math.random() * 0.3)));
    const partEnvoyee = Math.min(0.85, Math.max(0.15, 0.35 + sig.quiLance * 0.3 + (Math.random() * 0.1 - 0.05)));
    const envoyes = Math.round(total * partEnvoyee);
    lignes.push({ qui: `@${pseudo()}`, envoyes, recus: total - envoyes, total });
  }
  return lignes.sort((a, b) => b.total - a.total);
}

function genererGroupes(nomsGroupes: string[], maintenant: number): C02 {
  const construire = (
    titre: string, membres: number, totalMessages: number,
    toiEnvoyes: number, insultes: number, joursDepuis: number,
  ): GroupeStats => ({
    titre, membres, totalMessages, toiEnvoyes,
    toiPart: toiEnvoyes / totalMessages,
    insultes, tauxInsultes: insultes / totalMessages,
    dernierMessage: maintenant - joursDepuis * JOUR_MS,
    actif: true, score: totalMessages,
  });

  // Quatre groupes, chacun fabrique pour remporter une seule categorie : la
  // demo garantit ainsi les quatre cartes plutot que de dependre d'un tri.
  const qg = construire(nomsGroupes[0], alea(3, 6), alea(3200, 6000), alea(700, 1400), alea(10, 60), alea(0, 3));
  const leBonde = construire(nomsGroupes[1], alea(16, 40), alea(700, 1900), alea(20, 130), alea(0, 8), alea(1, 30));
  // Red flag assumé : tu portes cette conversation a toi seul.
  const tuDebites = construire(nomsGroupes[2], alea(3, 6), alea(1300, 2600), alea(950, 2100), alea(0, 12), alea(0, 8));
  const inutile = construire(nomsGroupes[3], alea(4, 8), alea(500, 1200), alea(4, 22), 0, alea(35, 220));

  const actifs = [qg, leBonde, tuDebites, inutile];
  return {
    abandon: false,
    totalGroupes: actifs.length + alea(1, 4),
    actifs,
    categories: { qg, leBondé: leBonde, tuDebites, inutile },
  };
}

function genererFollowBack(pseudo: () => string): C03 {
  const following = alea(280, 640);
  const followers = alea(180, following);
  // Red flag assumé : un ecart de follow-back qui se voit.
  const ecart = alea(15, 60);
  return {
    neSuiventPas: melanger(Array.from({ length: ecart }, () => pseudo())).sort(),
    followers,
    following,
    // La demo n'a pas besoin de simuler le piege de periode tronquee (voir
    // chapitre03 dans lib/wrapped/chapitres.ts) : ces trois champs restent
    // au cas "pas de decalage detecte", identique a un export complet.
    followingDansLaPeriode: following,
    decalageDetecte: false,
    depuisDate: null,
  };
}

function genererMots(sig: Signature): C04 {
  const mots = melanger(MOTS_CANDIDATS).slice(0, alea(5, 7));
  let n = alea(180, 420);
  const top: [string, number][] = mots.map((m): [string, number] => {
    const valeur = Math.max(20, Math.round(n));
    n = Math.round(n * (0.55 + Math.random() * 0.2));
    return [m, valeur];
  });
  // Meme echelle que le reste de la demo (genererCercle) : un compte plus
  // "ample" ecrit aussi plus de messages au total.
  const totalMessages = 800 + Math.round(sig.ampleur * 12_000);
  const totalMots = Math.round(totalMessages * (2.2 + Math.random() * 1.6));
  return { top, totalMots, totalMessages };
}

function genererRecords(pseudo: () => string, sig: Signature, maintenant: number): C05 {
  // Red flag assumé : plus "rapidite" est basse, plus le remis infligé traine.
  const infligeMs = Math.round((2 + (1 - sig.rapidite) * 10 + Math.random() * 4) * JOUR_MS);
  const debutInflige = maintenant - alea(80, 400) * JOUR_MS;
  const subiMs = Math.round((1 + sig.rapidite * 3 + Math.random() * 8) * JOUR_MS);
  const debutSubi = maintenant - alea(80, 400) * JOUR_MS;
  const rapideMs = Math.round(2000 + sig.rapidite * 3000 + Math.random() * 4000);
  const debutRapide = maintenant - alea(10, 300) * JOUR_MS;

  const jourDate = new Date(maintenant - alea(20, 300) * JOUR_MS);
  const messagesJourRecord = alea(80, 260);
  // La moyenne fabriquee reste sous le jour record par construction (c'est
  // un pic), a une echelle plausible pour un compte demo.
  const moyenneJournaliere = messagesJourRecord / alea(4, 20);
  // Trois contacts fabriques, en tranches decroissantes plausibles pour ce
  // jour-la (jamais plus que le total du jour).
  let resteJour = messagesJourRecord;
  const topContacts = [0.4, 0.25, 0.15].map((part) => {
    const total = Math.min(resteJour, Math.max(1, Math.round(messagesJourRecord * part)));
    resteJour -= total;
    return { qui: `@${pseudo()}`, total };
  });

  const MONOLOGUES = [
    'Ok alors laisse-moi t’expliquer depuis le début parce que sinon tu vas rien comprendre, en gros on était censés partir vendredi mais finalement le mec a annulé au dernier moment donc on a dû tout replanifier',
    'Franchement je sais pas comment lui dire sans que ça parte en vrille, j’ai déjà essayé trois fois et à chaque fois ça tourne en dispute alors que c’est juste une question toute simple à la base',
    'Bref je te raconte pas la soirée, c’était le chaos total, genre personne savait où on allait, on a fini par marcher une heure pour rien et au final le bar était fermé de toute façon',
  ];
  const plusLongMessage = {
    avec: `@${pseudo()}`,
    ts: maintenant - alea(5, 400) * JOUR_MS,
    texte: choisir(MONOLOGUES),
  };

  const finTirade = maintenant - alea(5, 350) * JOUR_MS;
  const nbMessagesTirade = alea(4, 11);
  const tirade = {
    messages: nbMessagesTirade,
    debut: finTirade - nbMessagesTirade * alea(20_000, 90_000),
    fin: finTirade,
    avec: `@${pseudo()}`,
  };

  return {
    remisInflige: { ms: infligeMs, debut: debutInflige, ts: debutInflige + infligeMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    remisSubi: { ms: subiMs, debut: debutSubi, ts: debutSubi + subiMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    reponseRapide: { ms: rapideMs, debut: debutRapide, ts: debutRapide + rapideMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    jourRecord: {
      date: jourDate.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' }),
      messages: messagesJourRecord,
      moyenneJournaliere,
      topContacts,
    },
    plusLongMessage: { ...plusLongMessage, longueur: plusLongMessage.texte.length },
    tirade,
  };
}

function genererBornes(pseudo: () => string, maintenant: number): C06 {
  const avecPremier = `@${pseudo()}`;
  const avecDernier = `@${pseudo()}`;
  return {
    premier: {
      ts: maintenant - alea(700, 2200) * JOUR_MS,
      avec: avecPremier,
      de: Math.random() < 0.5 ? 'Toi' : avecPremier,
      message: choisir(PREMIERS_MESSAGES),
    },
    dernier: {
      ts: maintenant - alea(0, 5) * JOUR_MS,
      avec: avecDernier,
      de: Math.random() < 0.5 ? 'Toi' : avecDernier,
      message: choisir(DERNIERS_MESSAGES),
    },
  };
}

/** Meme esprit que le reste de la demo : des totaux plausibles, mis a
    l'echelle par `sig.ampleur`, plus un classement par contact (pour la
    devinette) aux totaux volontairement rapproches -- voir
    construireDevineVersusMedia, qui cherche deja la paire la plus proche,
    mais autant lui donner une vraie tranche resserree des le depart. */
function genererMedias(
  pseudo: () => string, sig: Signature,
): { stats: StatsMedias; vocaux: LigneMedia[]; photos: LigneMedia[]; appels: LigneMedia[] } {
  const base = 40 + Math.round(sig.ampleur * 260);
  const stats: StatsMedias = {
    vocaux: { toi: alea(Math.round(base * 0.3), Math.round(base * 0.8)), autres: alea(Math.round(base * 0.4), Math.round(base * 0.9)) },
    photos: { toi: alea(Math.round(base * 0.4), Math.round(base * 1.0)), autres: alea(Math.round(base * 0.5), Math.round(base * 1.2)) },
    stickers: { toi: alea(0, 12), autres: alea(0, 12) },
    appelsAudio: alea(0, 30),
    appelsVideo: alea(0, 18),
    dureeAppelsMinutes: alea(20, 600),
  };

  const nContacts = alea(4, 7);
  const classement = (haut: number): LigneMedia[] =>
    Array.from({ length: nContacts }, () => ({ qui: `@${pseudo()}`, total: alea(2, haut) }))
      .sort((a, b) => b.total - a.total);

  return { stats, vocaux: classement(80), photos: classement(110), appels: classement(24) };
}

/** Cle sessionStorage utilisee par le bouton demo de l'accueil et du guide
    pour dire a /wrapped de lancer la demo des l'arrivee sur la page, sans
    passer par un parametre d'URL (evite le Suspense qu'impose
    useSearchParams en export statique pour un simple aller aussi leger). */
export const CLE_DEMO = 'exposed:demo';

export function genererDemo(): {
  cartes: DonneesAffiche[];
  details: Record<string, string[]>;
  detailsTexte: Record<string, string>;
  donneesChapitres: DonneesBrutesChapitres;
  devines: Record<number, DonneesDevine>;
} {
  const nom = choisir(nomsProfils());
  const sig = signaturePourNom(nom);
  const pseudo = creerGenerateurPseudos();
  const maintenant = Date.now();

  const c1 = genererCercle(pseudo, sig);
  const c2 = genererGroupes(melanger(GROUPES_NOMS).slice(0, 4), maintenant);
  const c3 = genererFollowBack(pseudo);
  const c4 = genererMots(sig);
  const c5 = genererRecords(pseudo, sig, maintenant);
  const c6 = genererBornes(pseudo, maintenant);
  const c7: C07 = axesDepuisSignature(sig);
  const cMedias = genererMedias(pseudo, sig);

  const donneesChapitres: DonneesBrutesChapitres = { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6, 7: c7 };

  // Les devinettes montrent aussi le contexte de periode : on fabrique la
  // meme forme que page.tsx (des dates deja formatees), a partir des bornes
  // premier/dernier deja generees pour le chapitre 06 -- toujours connues en
  // demo (genererBornes ne renvoie jamais null), donc `periodeDevine` existe
  // toujours ici, contrairement a la vraie analyse ou "Tout" ne donne rien.
  const FMT_MOIS_ANNEE_DEVINE = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
  // "1er" ecrit a la main, meme raison que jourLong() dans app/wrapped/page.tsx.
  const jourLongDemo = (ts: number): string => {
    const d = new Date(ts);
    const quantieme = d.getDate() === 1 ? '1er' : String(d.getDate());
    return `${quantieme} ${FMT_MOIS_ANNEE_DEVINE.format(d)}`;
  };
  const periodeDevine: ContextePeriode = {
    debut: jourLongDemo(c6.premier!.ts),
    fin: jourLongDemo(c6.dernier!.ts),
  };

  // Ordre d'affichage depuis le 2026-09-11 (voir NOMS_CHAPITRES,
  // lib/wrapped/mapper.ts) : cercle, mots, medias, groupes, follow-back,
  // records, premier/dernier, profil -- meme ordre que l'emission reelle
  // (lib/wrapped/analyser.ts).
  const cartes1 = mapChapitre01(c1);
  const cartes4 = mapChapitre04(c4);
  const cartesMedias = mapChapitreMedias(cMedias.stats, cMedias.vocaux, cMedias.appels);
  const cartes2 = mapChapitre02(c2);
  const cartes5 = mapChapitre05(c5);
  const cartes: DonneesAffiche[] = [
    ...cartes1, ...cartes4, ...cartesMedias, ...cartes2, ...mapChapitre03(c3),
    ...cartes5, ...mapChapitre06(c6), ...mapChapitre07(c7),
  ];

  // Memes devinettes que sur une vraie analyse (lib/wrapped/jeu.ts), placees
  // aux memes positions relatives, pour que la demo montre le jeu aussi.
  const devines: Record<number, DonneesDevine> = {};
  const devineTop = construireDevineTop(c1, periodeDevine);
  if (devineTop) devines[0] = devineTop;
  if (cartes1.length > 1) {
    const devineVersus = construireDevineVersusContacts(c1, periodeDevine);
    if (devineVersus) devines[1] = devineVersus;
  }
  if (cartesMedias.length > 0) {
    const indexMedias = cartes1.length + cartes4.length;
    const devineMedia = construireDevineVersusMedia(
      cMedias.vocaux, 'Qui t’envoie le plus de messages vocaux ?', 'devine-vocaux', periodeDevine,
    );
    if (devineMedia) devines[indexMedias] = devineMedia;
  }
  const indexGroupes = cartes1.length + cartes4.length + cartesMedias.length;
  const devineGroupes = construireDevineVersusGroupes(c2, periodeDevine);
  if (devineGroupes) devines[indexGroupes] = devineGroupes;

  // "Plus long message" : bouton "voir en entier" seulement si le texte
  // fabrique depasse vraiment la troncature de la carte (meme condition
  // que page.tsx pour une vraie analyse).
  const detailsTexte: Record<string, string> = {};
  if (c5.plusLongMessage && c5.plusLongMessage.texte.length > MAX_CITATION) {
    detailsTexte['plus-long-message'] = c5.plusLongMessage.texte;
  }

  return { cartes, details: { 'follow-back': c3.neSuiventPas }, detailsTexte, donneesChapitres, devines };
}
