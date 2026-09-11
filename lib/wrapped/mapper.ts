/* ============================================================
   MAPPER  /  resultats des 8 chapitres -> DonneesAffiche[]
   Chaque chapitre renvoie UN TABLEAU de cartes, pas une seule : un chapitre
   qui calcule plusieurs faits distincts (les 4 categories de groupes, les 6
   records, un top 10 ou un top 5) les montre tous, une carte par fait.
   C'est deliberement nomme « Tes six records » : en montrer un seul ne
   tient pas la promesse.

   Chaque carte porte aussi le nom du chapitre dans `piece`
   (« Chapitre 02 · Ce que tu dis vraiment »), pas juste son numero : en
   pleine story, loin du sommaire, un numero seul ne dit pas de quoi on parle.

   Numerotation d'AFFICHAGE (NOMS_CHAPITRES) distincte du nom des fonctions
   ci-dessous : `mapChapitre04` calcule toujours les mots (meme identite que
   `chapitre04` dans chapitres.ts), mais s'affiche en Chapitre 02 depuis le
   2026-09-11 (demande explicite : les mots passent avant les groupes, les
   medias deviennent un vrai chapitre juste apres). Les noms de fonctions ne
   bougent pas -- seul l'argument passe a `piece()` change.
   ============================================================ */
import type { DonneesAffiche } from '@/components/Affiche';
import type {
  Borne, chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07,
  StatsMedias, StatsMots, LigneMedia,
} from './chapitres';
import { determinerProfil } from './profil';
import { profils as PROFILS_COMPLETS } from '@/content/revelations';

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;
type C03 = ReturnType<typeof chapitre03>;
type C04 = StatsMots;
type C05 = ReturnType<typeof chapitre05>;
type C06 = ReturnType<typeof chapitre06>;
type C07 = ReturnType<typeof chapitre07>;

const NOMS_CHAPITRES: Record<number, string> = {
  1: 'Ton cercle réel', 2: 'Ce que tu dis vraiment', 3: 'Tes médias', 4: 'Tes groupes',
  5: 'Qui ne te suit pas en retour', 6: 'Tes six records', 7: 'Premier et dernier',
  8: 'Ton profil relationnel',
};
const piece = (n: number) => `Chapitre ${String(n).padStart(2, '0')} · ${NOMS_CHAPITRES[n]}`;

const FMT_JOUR_ANNEE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'short', year: 'numeric',
});
/** "12 janv. 2016" : pour un premier message, l'annee compte plus que l'heure. */
function dateAvecAnnee(ts: number): string {
  return FMT_JOUR_ANNEE.format(new Date(ts));
}

const nb = (n: number) => n.toLocaleString('fr-FR');

/* ============================================================
   01 — TON CERCLE RÉEL  (la grande revelation, puis le classement complet)
   ============================================================ */
export function mapChapitre01(c: C01): DonneesAffiche[] {
  const top = c[0];
  const reveal: DonneesAffiche = {
    piece: piece(1),
    titre: 'Ton cercle réel',
    chiffre: top ? String(top.total) : '0',
    note: top
      ? `messages avec ${top.qui}, ton contact le plus proche sur ${c.length}.`
      : 'Pas encore assez de messages pour en voir un.',
    ton: 1,
    formes: [
      { nom: 'disques', w: 98, dx: 34 },
    ],
  };
  if (c.length === 0) return [reveal];

  const classement: DonneesAffiche = {
    piece: piece(1),
    titre: 'Ton top 10',
    liste: c.map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
    note: 'total de messages échangés, tous les deux sens confondus.',
    ton: 1,
    formes: [],
  };
  return [reveal, classement];
}

/* ============================================================
   04 (affiche en 02) — TES MOTS  (le total avec un comparatif en mots
   d'abord, puis le mot signature)
   ============================================================ */

// Comparatif generique par paliers, du plus gros au plus petit -- des
// references reconnaissables plutot qu'un chiffre abstrait ("38 000 mots"
// ne dit rien a personne). Chaque valeur est une estimation publique
// approximative, pas un decompte exact -- assez pour un ordre de grandeur,
// pas pour une preuve. Partage entre le comparatif en mots (chapitre04) et
// celui des minutes d'appel (chapitreMedias) : meme mecanique, juste deux
// echelles de references differentes.
type ReferenceEchelle = { seuil: number; nom: string };
function construireComparatif(total: number, references: ReferenceEchelle[]): string {
  for (const ref of references) {
    if (total < ref.seuil) continue;
    const fois = total / ref.seuil;
    return fois < 1.15 ? `autant que ${ref.nom}.` : `${fois.toFixed(1)} fois ${ref.nom}.`;
  }
  const plusPetit = references[references.length - 1];
  const pct = Math.max(1, Math.round((total / plusPetit.seuil) * 100));
  // Pas de "% de X" : X commence parfois par un article ("Le Petit Prince")
  // qui se contracterait mal ("du" pas "de le") -- cette forme l'evite.
  return `${plusPetit.nom} : t’en es déjà à ${pct}%.`;
}

// Liste retravaillee le 2026-09-11 : Petit Prince / L'Étranger / Seigneur des
// anneaux juges "pas assez référentiels" -- remplaces par des scénarios de
// films recents et grand public (meme registre que les films/séries du
// comparatif des appels), Bible et dictionnaire gardes tels quels.
const REFERENCES_MOTS: ReferenceEchelle[] = [
  { seuil: 780_000, nom: 'la Bible' },
  { seuil: 77_000, nom: 'Harry Potter à l’école des sorciers' },
  { seuil: 59_000, nom: 'le Petit Larousse illustré' },
  { seuil: 34_000, nom: 'le scénario d’Oppenheimer' },
  { seuil: 30_000, nom: 'le scénario d’Avengers: Endgame' },
  { seuil: 25_000, nom: 'le scénario de Spider-Man: No Way Home' },
  { seuil: 21_000, nom: 'le scénario d’Inception' },
  { seuil: 15_000, nom: 'le scénario du film Minecraft' },
];
const comparatifMots = (total: number) => construireComparatif(total, REFERENCES_MOTS);

export function mapChapitre04(c: C04): DonneesAffiche[] {
  const cartes: DonneesAffiche[] = [];

  if (c.totalMessages > 0) {
    // Ton 4 (vert) : la couleur du chapitre, pas une exception -- et cette
    // carte passe maintenant EN PREMIER (demande explicite du 2026-09-11),
    // le mot signature juste apres.
    cartes.push({
      piece: piece(2),
      titre: 'Ton total de messages',
      chiffre: nb(c.totalMessages),
      note: `${nb(c.totalMots)} mots tapés en tout, ${comparatifMots(c.totalMots)}`,
      ton: 4,
      formes: [
        { nom: 'disques', w: 84, dx: 20 },
        { nom: 'trame', w: 46, ton: 'faible' },
      ],
    });
  }

  const [mot, occurrences] = c.top[0] ?? ['', 0];
  cartes.push({
    piece: piece(2),
    titre: 'Ce que tu dis vraiment',
    chiffre: mot ? `« ${mot} »` : '—',
    liste: c.top.length > 1 ? c.top.slice(0, 5).map(([m, n], i) => ({ rang: i + 1, texte: `« ${m} » · ${nb(n)}` })) : undefined,
    note: occurrences ? `ton mot à toi, ${nb(occurrences)} fois.` : 'Pas encore assez de mots.',
    ton: 4,
    formes: [
      { nom: 'barres', w: 70 },
      { nom: 'arc', w: 54, ton: 'moyen' },
    ],
  });

  return cartes;
}

/* ============================================================
   BONUS (affiche en 03) — TES MÉDIAS  (un vrai chapitre depuis le
   2026-09-11 : huit chapitres maintenant, pas sept -- voir chapitreMedias,
   lib/wrapped/chapitres.ts. Ordre demande : vocaux, appels, photos, puis
   stickers en dernier (pas mentionnes dans la demande, garde a la fin,
   toujours silencieux si absents).)
   ============================================================ */

// Meme mecanique que le comparatif en mots, sur une echelle de minutes :
// films connus pour le bas/milieu, une saison ou une serie entiere pour le
// haut (un compte tres bavard au telephone depasse vite la duree d'un film).
const REFERENCES_MINUTES_APPELS: ReferenceEchelle[] = [
  { seuil: 5_200, nom: 'l’intégrale de Friends' },
  { seuil: 800, nom: 'une saison de Stranger Things' },
  { seuil: 182, nom: 'Avengers: Endgame' },
  { seuil: 180, nom: 'Oppenheimer' },
  { seuil: 148, nom: 'Spider-Man: No Way Home' },
  { seuil: 101, nom: 'le film Minecraft' },
];
const comparatifMinutesAppels = (total: number) => construireComparatif(total, REFERENCES_MINUTES_APPELS);

const MAX_TOP_MEDIA = 5;

export function mapChapitreMedias(m: StatsMedias, topVocaux: LigneMedia[], topAppels: LigneMedia[]): DonneesAffiche[] {
  const cartes: DonneesAffiche[] = [];

  if (m.vocaux.toi + m.vocaux.autres > 0) {
    cartes.push({
      piece: piece(3),
      titre: 'Tes vocaux',
      paire: [
        { k: 'Reçus', v: nb(m.vocaux.autres) },
        { k: 'Envoyés', v: nb(m.vocaux.toi) },
      ],
      note: 'messages vocaux échangés.',
      ton: 9,
      formes: [{ nom: 'faisceau', w: 82, ton: 'moyen' }, { nom: 'arc', w: 46 }],
    });
  }
  if (topVocaux.length > 0) {
    cartes.push({
      piece: piece(3),
      titre: 'Qui t’envoie le plus de vocaux',
      liste: topVocaux.slice(0, MAX_TOP_MEDIA).map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
      note: 'messages vocaux reçus de leur part.',
      ton: 9,
      formes: [{ nom: 'trame', w: 58 }],
    });
  }

  if (m.appelsAudio + m.appelsVideo > 0) {
    // Pas d'equivalent pour les vocaux : voir le commentaire de
    // `Medias.dureeSecondes` (lib/wrapped/parse.ts), Instagram ne stocke
    // leur duree nulle part dans l'export.
    const note = m.dureeAppelsMinutes > 0
      ? `appels passés ou reçus, manqués compris, ${nb(m.dureeAppelsMinutes)} min au total. ` +
        `${comparatifMinutesAppels(m.dureeAppelsMinutes)}`
      : 'appels passés ou reçus, manqués compris.';
    cartes.push({
      piece: piece(3),
      titre: 'Tes appels',
      paire: [
        { k: 'Vidéo', v: nb(m.appelsVideo) },
        { k: 'Normaux', v: nb(m.appelsAudio) },
      ],
      note,
      ton: 9,
      formes: [{ nom: 'barres', w: 60 }, { nom: 'stries', w: 52, dx: -16, ton: 'moyen' }],
    });
  }
  if (topAppels.length > 0) {
    cartes.push({
      piece: piece(3),
      titre: 'Avec qui tu as le plus appelé',
      liste: topAppels.slice(0, MAX_TOP_MEDIA).map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
      note: 'appels échangés, manqués compris.',
      ton: 9,
      formes: [{ nom: 'faisceau', w: 50 }],
    });
  }

  if (m.photos.toi + m.photos.autres > 0) {
    cartes.push({
      piece: piece(3),
      titre: 'Tes photos',
      paire: [
        { k: 'Reçues', v: nb(m.photos.autres) },
        { k: 'Envoyées', v: nb(m.photos.toi) },
      ],
      note: 'photos échangées, stories et pièces jointes comprises.',
      ton: 9,
      formes: [{ nom: 'disques', w: 90, dx: 20 }],
    });
  }

  if (m.stickers.toi + m.stickers.autres > 0) {
    cartes.push({
      piece: piece(3),
      titre: 'Tes stickers',
      paire: [
        { k: 'Reçus', v: nb(m.stickers.autres) },
        { k: 'Envoyés', v: nb(m.stickers.toi) },
      ],
      note: 'stickers échangés.',
      ton: 9,
      formes: [{ nom: 'trame', w: 68 }, { nom: 'cadre', w: 44, ton: 'moyen' }],
    });
  }

  return cartes;
}

/* ============================================================
   02 (affiche en 04) — TES GROUPES  (jusqu'a 4 cartes : une par categorie
   reellement calculee, dans l'ordre du palmares)
   ============================================================ */
export function mapChapitre02(c: C02): DonneesAffiche[] {
  if (c.abandon || !c.categories) {
    return [{
      piece: piece(4),
      titre: 'Tes groupes à l’abandon',
      chiffre: String(c.totalGroupes),
      note: 'groupes au total, aucun assez vivant pour concourir.',
      ton: 2,
      formes: [
        { nom: 'cadre', w: 62, ton: 'moyen' },
        { nom: 'trame', w: 44, ton: 'faible' },
      ],
    }];
  }

  const cat = c.categories;
  const cartes: DonneesAffiche[] = [];

  if (cat.qg) {
    cartes.push({
      piece: piece(4), titre: 'Ton QG', chiffre: cat.qg.titre,
      note: `${nb(cat.qg.totalMessages)} messages, ton groupe le plus vivant.`,
      ton: 2, formes: [{ nom: 'barres', w: 74 }, { nom: 'trame', w: 52, ton: 'faible' }],
    });
  }
  if (cat.leBondé) {
    cartes.push({
      piece: piece(4), titre: 'Le plus bondé', chiffre: cat.leBondé.titre,
      note: `${nb(cat.leBondé.membres)} membres dans ce groupe.`,
      ton: 2, formes: [{ nom: 'disques', w: 92, dx: 24 }],
    });
  }
  if (cat.tuDebites) {
    cartes.push({
      piece: piece(4), titre: 'Tu débites ici', chiffre: nb(cat.tuDebites.toiEnvoyes),
      note: `messages de toi dans « ${cat.tuDebites.titre} ».`,
      ton: 2, formes: [{ nom: 'barres', w: 58 }, { nom: 'arc', w: 46, ton: 'moyen' }],
    });
  }
  if (cat.inutile) {
    cartes.push({
      piece: piece(4), titre: 'Ton groupe inutile', chiffre: `${Math.round(cat.inutile.toiPart * 100)}%`,
      note: `de tes messages dans « ${cat.inutile.titre} ». Le reste, silence.`,
      ton: 2, formes: [{ nom: 'cadre', w: 66, ton: 'moyen' }, { nom: 'stries', w: 40, dx: -18, ton: 'faible' }],
    });
  }
  return cartes.length ? cartes : mapChapitre02({ abandon: true, totalGroupes: c.totalGroupes } as C02);
}

/* ============================================================
   03 (affiche en 05) — QUI NE TE SUIT PAS EN RETOUR  (des exemples sur la
   carte, la liste complete accessible a part, en dehors du defilement de
   la story)

   Impossible de privilegier les « petits comptes non certifies » : l'export
   Instagram ne donne ni le nombre d'abonnes ni le statut de certification
   des AUTRES comptes, seulement leurs pseudos. Avoir cette info demanderait
   un appel reseau vers Instagram, contraire a la promesse du site. A defaut,
   les exemples sont tires au hasard a chaque calcul plutot que de toujours
   montrer les memes (les premiers par ordre alphabetique). */
const MAX_EXEMPLES_FOLLOWBACK = 10;
function echantillon<T>(liste: T[], n: number): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie.slice(0, n);
}

export function mapChapitre03(c: C03): DonneesAffiche[] {
  const exemples = echantillon(c.neSuiventPas, MAX_EXEMPLES_FOLLOWBACK);
  const reste = c.neSuiventPas.length - exemples.length;
  // Le chiffre du haut compare toujours des comptes suivis sur la MEME
  // fenetre que les abonnes connus (voir chapitre03) : la note doit donc
  // parler de `followingDansLaPeriode`, pas du total `following` (qui, sur
  // un export tronque, inclurait des annees que les abonnes ne couvrent
  // pas et rendrait le chiffre du haut incoherent avec ce qu'elle annonce).
  const base = reste > 0
    ? `parmi d’autres, sur ${nb(c.followingDansLaPeriode)} comptes suivis`
    : `sur ${nb(c.followingDansLaPeriode)} comptes que tu suis`;
  return [{
    id: 'follow-back',
    piece: piece(5),
    titre: 'Qui ne te suit pas en retour',
    chiffre: String(c.neSuiventPas.length),
    liste: exemples.length ? exemples.map((n, i) => ({ rang: i + 1, texte: `@${n}` })) : undefined,
    note: c.decalageDetecte ? `${base}, depuis le ${c.depuisDate}.` : `${base}.`,
    // Un vrai piege Instagram, pas une nuance : la periode choisie a la
    // demande d'export limite les ABONNES a cette fenetre, jamais les
    // ABONNEMENTS, qui remontent toujours a la creation du compte. Vu
    // seulement quand la difference est prouvee (chapitre03,
    // decalageDetecte), pas a chaque fois. Les deux totaux bruts vivent ici
    // (pas dans une bulle a part) : c'est justement ce qui explique le
    // chiffre du haut, ça doit se lire sans avoir a chercher.
    alerte: c.decalageDetecte
      ? `${nb(c.followers)} abonnés, ${nb(c.following)} abonnements au total, mais ton export ne ` +
        `connaît tes abonnés que depuis le ${c.depuisDate}. Instagram limite ça à la période ` +
        `choisie à la demande, jamais les abonnements. Pour tout voir, redemande ton export depuis ` +
        `le début.`
      : undefined,
    ton: 3,
    formes: [
      { nom: 'stries', w: 86, dx: -26 },
      { nom: 'cadre', w: 58, ton: 'moyen' },
    ],
  }];
}

/* ============================================================
   05 (affiche en 06) — TES SIX RECORDS  (jusqu'a 7 cartes -- le jour
   record ajoute une carte compagnon avec qui tu as le plus parle ce
   jour-la -- une par record reellement trouve : le titre promet six, on
   les montre tous)
   ============================================================ */
export function mapChapitre05(c: C05): DonneesAffiche[] {
  const cartes: DonneesAffiche[] = [];

  if (c.remisInflige) {
    cartes.push({
      piece: piece(6), titre: 'Le plus long remis (toi)', chiffre: dureeCourte(c.remisInflige.debut, c.remisInflige.ts),
      note: `avant que tu répondes à ${c.remisInflige.avec}.`,
      ton: 6, formes: [{ nom: 'stries', w: 82, dx: -20, ton: 'moyen' }],
    });
  }
  if (c.remisSubi) {
    cartes.push({
      piece: piece(6), titre: 'Le plus long remis (subi)', chiffre: dureeCourte(c.remisSubi.debut, c.remisSubi.ts),
      note: `avant que ${c.remisSubi.avec} te réponde.`,
      ton: 6, formes: [{ nom: 'trame', w: 70 }, { nom: 'cadre', w: 48, ton: 'moyen' }],
    });
  }
  if (c.reponseRapide) {
    cartes.push({
      piece: piece(6), titre: 'Ta réponse la plus rapide', chiffre: formatDureeCourteLocale(c.reponseRapide.ms),
      note: `à ${c.reponseRapide.avec}.`,
      ton: 6, formes: [{ nom: 'faisceau', w: 78, ton: 'moyen' }, { nom: 'barres', w: 40 }],
    });
  }
  if (c.jourRecord) {
    // Multiplicateur arrondi a une decimale sous 10x (le detail compte a
    // cette echelle), a l'entier au-dela (un "23,4x" n'ajoute rien a "23x").
    const ratio = c.jourRecord.messages / c.jourRecord.moyenneJournaliere;
    const ratioTexte = ratio < 10 ? ratio.toFixed(1) : String(Math.round(ratio));
    cartes.push({
      piece: piece(6), titre: 'Ta journée la plus intense', chiffre: nb(c.jourRecord.messages),
      note: `messages le ${c.jourRecord.date}, soit ${ratioTexte}× ta moyenne quotidienne ` +
        `(${Math.round(c.jourRecord.moyenneJournaliere)}/jour).`,
      ton: 6, formes: [{ nom: 'arc', w: 88, dx: 34 }],
    });
    // Carte compagnon, juste apres : seulement les contacts 1:1 (un groupe
    // n'a pas de "qui" unique), donc silencieuse si ce jour-la n'etait fait
    // que de groupes.
    if (c.jourRecord.topContacts.length > 0) {
      cartes.push({
        piece: piece(6),
        titre: 'Ce jour-là, surtout eux',
        liste: c.jourRecord.topContacts.map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
        note: `messages échangés le ${c.jourRecord.date}.`,
        ton: 6,
        formes: [{ nom: 'trame', w: 60 }, { nom: 'cadre', w: 44, ton: 'moyen' }],
      });
    }
  }

  if (c.plusLongMessage) {
    // Note tronquee comme les autres citations (voir `citation`), avec un
    // bouton "voir en entier" (StoryPlayer, prop `detailsTexte`) quand le
    // vrai texte depasse cette troncature -- voir page.tsx/demo.ts, qui
    // decident de peupler `detailsTexte['plus-long-message']` ou non selon
    // la longueur reelle.
    cartes.push({
      id: 'plus-long-message',
      piece: piece(6),
      titre: 'Ton plus long message',
      paire: [
        { k: 'Quand', v: dateAvecAnnee(c.plusLongMessage.ts) },
        { k: 'Avec', v: c.plusLongMessage.avec },
      ],
      note: `${nb(c.plusLongMessage.longueur)} caractères. ${citation(c.plusLongMessage.texte)}`,
      ton: 6,
      formes: [{ nom: 'stries', w: 70, dx: -18 }, { nom: 'cadre', w: 46, ton: 'moyen' }],
    });
  }

  if (c.tirade) {
    cartes.push({
      piece: piece(6),
      titre: 'Ta plus longue tirade',
      chiffre: `${nb(c.tirade.messages)} messages`,
      note: `à la suite, sans réponse, à ${c.tirade.avec}.`,
      ton: 6,
      formes: [{ nom: 'barres', w: 66 }, { nom: 'faisceau', w: 52, ton: 'moyen' }],
    });
  }

  return cartes.length ? cartes : [{
    piece: piece(6), titre: 'Tes six records', chiffre: '—', note: 'Pas encore assez de messages.',
    ton: 6, formes: [{ nom: 'arc', w: 76, dx: -14 }, { nom: 'cadre', w: 52, ton: 'moyen' }],
  }];
}

// Duree en jours/mois/ans, sans dependre du script Node (pas d'acces fs ici).
function dureeCourte(debutMs: number, finMs: number): string {
  const d = new Date(debutMs); const fin = new Date(finMs);
  let annees = fin.getUTCFullYear() - d.getUTCFullYear();
  let mois = fin.getUTCMonth() - d.getUTCMonth();
  let jours = fin.getUTCDate() - d.getUTCDate();
  if (jours < 0) { mois -= 1; jours += new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), 0)).getUTCDate(); }
  if (mois < 0) { annees -= 1; mois += 12; }
  if (annees > 0) return `${annees} an${annees > 1 ? 's' : ''}`;
  if (mois > 0) return `${mois} mois`;
  return `${jours} j`;
}
function formatDureeCourteLocale(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const min = s / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  return `${(min / 60).toFixed(1)} h`;
}

/* ============================================================
   06 (affiche en 07) — PREMIER ET DERNIER  (deux cartes : chacune dit
   quand, avec qui, et ce que disait le message. Deux dates seules ne
   racontaient rien.)
   ============================================================ */
// Exporte : page.tsx et demo.ts s'en servent pour decider si le "plus long
// message" a besoin d'un bouton "voir en entier" (texte reellement tronque
// ici) ou non.
export const MAX_CITATION = 110;
function citation(texte: string): string {
  const t = texte.length > MAX_CITATION ? `${texte.slice(0, MAX_CITATION).trimEnd()}…` : texte;
  return `« ${t} »`;
}

function carteBorne(titre: string, b: Borne | null, formes: DonneesAffiche['formes']): DonneesAffiche {
  if (!b) return { piece: piece(7), titre, chiffre: '—', note: 'Rien à montrer.', ton: 7, formes };
  return {
    piece: piece(7),
    titre,
    paire: [
      { k: 'Quand', v: dateAvecAnnee(b.ts) },
      { k: 'Avec', v: b.avec },
    ],
    note: `${b.de} : ${citation(b.message)}`,
    ton: 7,
    formes,
  };
}

export function mapChapitre06(c: C06): DonneesAffiche[] {
  return [
    carteBorne('Le premier message', c.premier, [
      { nom: 'stries', w: 56, dx: -26, ton: 'moyen' },
    ]),
    carteBorne('Le dernier message', c.dernier, [
      { nom: 'arc', w: 62, dx: 18, ton: 'moyen' },
    ]),
  ];
}

/* ============================================================
   07 (affiche en 08) — TON PROFIL RELATIONNEL  (la revelation, puis la
   description complete deja ecrite pour l'index de l'accueil : le meme
   texte, pas une version raccourcie inventee pour tenir dans une carte)
   ============================================================ */
export function mapChapitre07(c: C07): DonneesAffiche[] {
  // Aucun message de toi nulle part (mediane de rien = 0) et aucun 1:1 actif :
  // determinerProfil renverrait quand meme un profil, mais sur du vide, ce
  // qui contredit la promesse « rien d'invente ».
  if (c.axeAmpleur === 0 && c.axeLongueurCaracteres === 0) {
    return [{
      piece: piece(8),
      titre: 'Ton profil relationnel',
      chiffre: '—',
      note: 'Pas assez de messages pour en tirer un profil.',
      ton: 8,
      formes: [{ nom: 'barres', w: 42 }, { nom: 'faisceau', w: 78, ton: 'moyen' }],
    }];
  }
  const profil = determinerProfil(c);
  const complet = PROFILS_COMPLETS.find((p) => p.nom === profil.nom);
  return [{
    piece: piece(8),
    titre: 'Ton profil relationnel',
    chiffre: profil.nom,
    note: complet ? complet.description : profil.note,
    ton: 8,
    formes: [
      { nom: 'barres', w: 42 },
      { nom: 'faisceau', w: 78, ton: 'moyen' },
    ],
  }];
}
