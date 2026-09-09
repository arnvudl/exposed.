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
import type { chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07, GroupeStats } from './chapitres';
import {
  mapChapitre01, mapChapitre02, mapChapitre03, mapChapitre04,
  mapChapitre05, mapChapitre06, mapChapitre07,
} from './mapper';
import { nomsProfils, signaturePourNom, axesDepuisSignature, type Signature } from './profil';

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;
type C03 = ReturnType<typeof chapitre03>;
type C04 = [string, number][];
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

  // Cinq groupes, chacun fabrique pour remporter une seule categorie : la
  // demo garantit ainsi les cinq cartes plutot que de dependre d'un tri.
  const qg = construire(nomsGroupes[0], alea(3, 6), alea(3200, 6000), alea(700, 1400), alea(10, 60), alea(0, 3));
  const leBonde = construire(nomsGroupes[1], alea(16, 40), alea(700, 1900), alea(20, 130), alea(0, 8), alea(1, 30));
  // Red flag assumé : tu portes cette conversation a toi seul.
  const tuDebites = construire(nomsGroupes[2], alea(3, 6), alea(1300, 2600), alea(950, 2100), alea(0, 12), alea(0, 8));
  const inutile = construire(nomsGroupes[3], alea(4, 8), alea(500, 1200), alea(4, 22), 0, alea(35, 220));
  // Red flag assumé : le taux de vannes le plus haut du lot.
  const leRing = construire(nomsGroupes[4], alea(3, 6), alea(800, 2000), alea(100, 480), alea(160, 520), alea(0, 15));

  const actifs = [qg, leBonde, tuDebites, inutile, leRing];
  return {
    abandon: false,
    totalGroupes: actifs.length + alea(1, 4),
    actifs,
    categories: { qg, leBondé: leBonde, tuDebites, inutile, leRing },
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
  };
}

function genererMots(): C04 {
  const mots = melanger(MOTS_CANDIDATS).slice(0, alea(5, 7));
  let n = alea(180, 420);
  return mots.map((m): [string, number] => {
    const valeur = Math.max(20, Math.round(n));
    n = Math.round(n * (0.55 + Math.random() * 0.2));
    return [m, valeur];
  });
}

function genererRecords(pseudo: () => string, sig: Signature, maintenant: number): C05 {
  const heureTardive = new Date(maintenant - alea(60, 500) * JOUR_MS);
  heureTardive.setHours(alea(1, 5), alea(0, 59), 0, 0);

  // Red flag assumé : plus "rapidite" est basse, plus le remis infligé traine.
  const infligeMs = Math.round((2 + (1 - sig.rapidite) * 10 + Math.random() * 4) * JOUR_MS);
  const debutInflige = maintenant - alea(80, 400) * JOUR_MS;
  const subiMs = Math.round((1 + sig.rapidite * 3 + Math.random() * 8) * JOUR_MS);
  const debutSubi = maintenant - alea(80, 400) * JOUR_MS;
  const rapideMs = Math.round(2000 + sig.rapidite * 3000 + Math.random() * 4000);
  const debutRapide = maintenant - alea(10, 300) * JOUR_MS;

  const jourDate = new Date(maintenant - alea(20, 300) * JOUR_MS);

  return {
    plusTardif: { ts: heureTardive.getTime(), avec: `@${pseudo()}`, minutes: 0, message: '' },
    remisInflige: { ms: infligeMs, debut: debutInflige, ts: debutInflige + infligeMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    remisSubi: { ms: subiMs, debut: debutSubi, ts: debutSubi + subiMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    reponseRapide: { ms: rapideMs, debut: debutRapide, ts: debutRapide + rapideMs, avec: `@${pseudo()}`, messageAvant: '', messageApres: '' },
    jourRecord: {
      date: jourDate.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' }),
      messages: alea(80, 260),
    },
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

/** Cle sessionStorage utilisee par le bouton demo de l'accueil et du guide
    pour dire a /wrapped de lancer la demo des l'arrivee sur la page, sans
    passer par un parametre d'URL (evite le Suspense qu'impose
    useSearchParams en export statique pour un simple aller aussi leger). */
export const CLE_DEMO = 'exposed:demo';

export function genererDemo(): { cartes: DonneesAffiche[]; details: Record<string, string[]>; donneesChapitres: DonneesBrutesChapitres } {
  const nom = choisir(nomsProfils());
  const sig = signaturePourNom(nom);
  const pseudo = creerGenerateurPseudos();
  const maintenant = Date.now();

  const c1 = genererCercle(pseudo, sig);
  const c2 = genererGroupes(melanger(GROUPES_NOMS).slice(0, 5), maintenant);
  const c3 = genererFollowBack(pseudo);
  const c4 = genererMots();
  const c5 = genererRecords(pseudo, sig, maintenant);
  const c6 = genererBornes(pseudo, maintenant);
  const c7: C07 = axesDepuisSignature(sig);

  const donneesChapitres: DonneesBrutesChapitres = { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6, 7: c7 };

  const cartes: DonneesAffiche[] = [
    ...mapChapitre01(c1), ...mapChapitre02(c2), ...mapChapitre03(c3),
    ...mapChapitre04(c4), ...mapChapitre05(c5), ...mapChapitre06(c6), ...mapChapitre07(c7),
  ];

  return { cartes, details: { 'follow-back': c3.neSuiventPas }, donneesChapitres };
}
