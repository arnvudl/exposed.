/* ============================================================
   MAPPER  /  resultats des 7 chapitres -> DonneesAffiche[]
   Chaque chapitre renvoie UN TABLEAU de cartes, pas une seule : un chapitre
   qui calcule plusieurs faits distincts (les 5 categories de groupes, les 5
   records, un top 10 ou un top 5) les montre tous, une carte par fait.
   C'est deliberement nomme « Tes cinq records » : en montrer un seul ne
   tient pas la promesse.

   Chaque carte porte aussi le nom du chapitre dans `piece`
   (« Chapitre 02 · Tes groupes »), pas juste son numero : en pleine story,
   loin du sommaire, un numero seul ne dit pas de quoi on parle.
   ============================================================ */
import type { DonneesAffiche } from '@/components/Affiche';
import type {
  Borne, chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07,
} from './chapitres';
import { determinerProfil } from './profil';
import { profils as PROFILS_COMPLETS } from '@/content/revelations';

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;
type C03 = ReturnType<typeof chapitre03>;
type C04 = [string, number][];
type C05 = ReturnType<typeof chapitre05>;
type C06 = ReturnType<typeof chapitre06>;
type C07 = ReturnType<typeof chapitre07>;

const NOMS_CHAPITRES: Record<number, string> = {
  1: 'Ton cercle réel', 2: 'Tes groupes', 3: 'Qui ne te suit pas en retour',
  4: 'Ce que tu dis vraiment', 5: 'Tes cinq records', 6: 'Premier et dernier',
  7: 'Ton profil relationnel',
};
const piece = (n: number) => `Chapitre ${String(n).padStart(2, '0')} · ${NOMS_CHAPITRES[n]}`;

const FMT_JOUR_ANNEE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'short', year: 'numeric',
});
/** "12 janv. 2016" : pour un premier message, l'annee compte plus que l'heure. */
function dateAvecAnnee(ts: number): string {
  return FMT_JOUR_ANNEE.format(new Date(ts));
}

function heureCourte(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(new Date(ts)).replace(':', ' h ');
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
   02 — TES GROUPES  (jusqu'a 5 cartes : une par categorie reellement
   calculee, dans l'ordre du palmares)
   ============================================================ */
export function mapChapitre02(c: C02): DonneesAffiche[] {
  if (c.abandon || !c.categories) {
    return [{
      piece: piece(2),
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
      piece: piece(2), titre: 'Ton QG', chiffre: cat.qg.titre,
      note: `${nb(cat.qg.totalMessages)} messages, ton groupe le plus vivant.`,
      ton: 2, formes: [{ nom: 'barres', w: 74 }, { nom: 'trame', w: 52, ton: 'faible' }],
    });
  }
  if (cat.leBondé) {
    cartes.push({
      piece: piece(2), titre: 'Le plus bondé', chiffre: cat.leBondé.titre,
      note: `${nb(cat.leBondé.membres)} membres dans ce groupe.`,
      ton: 2, formes: [{ nom: 'disques', w: 92, dx: 24 }],
    });
  }
  if (cat.tuDebites) {
    cartes.push({
      piece: piece(2), titre: 'Tu débites ici', chiffre: nb(cat.tuDebites.toiEnvoyes),
      note: `messages de toi dans « ${cat.tuDebites.titre} ».`,
      ton: 2, formes: [{ nom: 'barres', w: 58 }, { nom: 'arc', w: 46, ton: 'moyen' }],
    });
  }
  if (cat.inutile) {
    cartes.push({
      piece: piece(2), titre: 'Ton groupe inutile', chiffre: `${Math.round(cat.inutile.toiPart * 100)}%`,
      note: `de tes messages dans « ${cat.inutile.titre} ». Le reste, silence.`,
      ton: 2, formes: [{ nom: 'cadre', w: 66, ton: 'moyen' }, { nom: 'stries', w: 40, dx: -18, ton: 'faible' }],
    });
  }
  if (cat.leRing) {
    cartes.push({
      piece: piece(2), titre: 'Le ring', chiffre: String(cat.leRing.insultes),
      note: `vannes échangées dans « ${cat.leRing.titre} », ${Math.round(cat.leRing.tauxInsultes * 100)}% des messages.`,
      ton: 2, formes: [{ nom: 'faisceau', w: 80, ton: 'moyen' }, { nom: 'cadre', w: 50 }],
    });
  }

  return cartes.length ? cartes : mapChapitre02({ abandon: true, totalGroupes: c.totalGroupes } as C02);
}

/* ============================================================
   03 — QUI NE TE SUIT PAS EN RETOUR  (des exemples sur la carte, la liste
   complete accessible a part, en dehors du defilement de la story)

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
    piece: piece(3),
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
   04 — TES MOTS  (une carte : le mot signature en tete, le top 5 dessous)
   ============================================================ */
export function mapChapitre04(c: C04): DonneesAffiche[] {
  const [mot, occurrences] = c[0] ?? ['', 0];
  return [{
    piece: piece(4),
    titre: 'Ce que tu dis vraiment',
    chiffre: mot ? `« ${mot} »` : '—',
    liste: c.length > 1 ? c.slice(0, 5).map(([m, n], i) => ({ rang: i + 1, texte: `« ${m} » · ${nb(n)}` })) : undefined,
    note: occurrences ? `ton mot à toi, ${nb(occurrences)} fois.` : 'Pas encore assez de mots.',
    ton: 4,
    formes: [
      { nom: 'barres', w: 70 },
      { nom: 'arc', w: 54, ton: 'moyen' },
    ],
  }];
}

/* ============================================================
   05 — TES CINQ RECORDS  (jusqu'a 5 cartes, une par record reellement
   trouve : le titre promet cinq, on les montre tous)
   ============================================================ */
export function mapChapitre05(c: C05): DonneesAffiche[] {
  const cartes: DonneesAffiche[] = [];

  if (c.plusTardif) {
    cartes.push({
      piece: piece(5), titre: 'Le plus tardif', chiffre: heureCourte(c.plusTardif.ts),
      note: `avec ${c.plusTardif.avec}.`,
      ton: 6, formes: [{ nom: 'arc', w: 76, dx: -14 }, { nom: 'cadre', w: 52, ton: 'moyen' }],
    });
  }
  if (c.remisInflige) {
    cartes.push({
      piece: piece(5), titre: 'Le plus long remis (toi)', chiffre: dureeCourte(c.remisInflige.debut, c.remisInflige.ts),
      note: `avant que tu répondes à ${c.remisInflige.avec}.`,
      ton: 6, formes: [{ nom: 'stries', w: 82, dx: -20, ton: 'moyen' }],
    });
  }
  if (c.remisSubi) {
    cartes.push({
      piece: piece(5), titre: 'Le plus long remis (subi)', chiffre: dureeCourte(c.remisSubi.debut, c.remisSubi.ts),
      note: `avant que ${c.remisSubi.avec} te réponde.`,
      ton: 6, formes: [{ nom: 'trame', w: 70 }, { nom: 'cadre', w: 48, ton: 'moyen' }],
    });
  }
  if (c.reponseRapide) {
    cartes.push({
      piece: piece(5), titre: 'Ta réponse la plus rapide', chiffre: formatDureeCourteLocale(c.reponseRapide.ms),
      note: `à ${c.reponseRapide.avec}.`,
      ton: 6, formes: [{ nom: 'faisceau', w: 78, ton: 'moyen' }, { nom: 'barres', w: 40 }],
    });
  }
  if (c.jourRecord) {
    cartes.push({
      piece: piece(5), titre: 'Ta journée la plus intense', chiffre: nb(c.jourRecord.messages),
      note: `messages le ${c.jourRecord.date}.`,
      ton: 6, formes: [{ nom: 'arc', w: 88, dx: 34 }],
    });
  }

  return cartes.length ? cartes : [{
    piece: piece(5), titre: 'Tes cinq records', chiffre: '—', note: 'Pas encore assez de messages.',
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
   06 — PREMIER ET DERNIER  (deux cartes : chacune dit quand, avec qui, et
   ce que disait le message. Deux dates seules ne racontaient rien.)
   ============================================================ */
const MAX_CITATION = 110;
function citation(texte: string): string {
  const t = texte.length > MAX_CITATION ? `${texte.slice(0, MAX_CITATION).trimEnd()}…` : texte;
  return `« ${t} »`;
}

function carteBorne(titre: string, b: Borne | null, formes: DonneesAffiche['formes']): DonneesAffiche {
  if (!b) return { piece: piece(6), titre, chiffre: '—', note: 'Rien à montrer.', ton: 7, formes };
  return {
    piece: piece(6),
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
   07 — TON PROFIL RELATIONNEL  (la revelation, puis la description
   complete deja ecrite pour l'index de l'accueil : le meme texte, pas
   une version raccourcie inventee pour tenir dans une carte)
   ============================================================ */
export function mapChapitre07(c: C07): DonneesAffiche[] {
  // Aucun message de toi nulle part (mediane de rien = 0) et aucun 1:1 actif :
  // determinerProfil renverrait quand meme un profil, mais sur du vide, ce
  // qui contredit la promesse « rien d'invente ».
  if (c.axeAmpleur === 0 && c.axeLongueurCaracteres === 0) {
    return [{
      piece: piece(7),
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
    piece: piece(7),
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
