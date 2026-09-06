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
  chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07,
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

const FMT_COURT = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
/** "12 janv., 08:04" -> "12 janv., 8 h 04" : le style maison, deja utilise
    dans les exemples de revelations.ts. */
function dateCourte(ts: number): string {
  return FMT_COURT.format(new Date(ts)).replace(':', ' h ').replace(/^0/, '');
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
      { nom: 'onglet', place: 'coin', x: 62, y: -3, w: 46, ton: 'moyen' },
    ],
  };
  if (c.length === 0) return [reveal];

  const classement: DonneesAffiche = {
    piece: piece(1),
    titre: 'Ton top 10',
    liste: c.map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
    note: 'total de messages échangés, tous les deux sens confondus.',
    ton: 1,
    formes: [{ nom: 'onglet', place: 'coin', x: 60, y: -4, w: 48, ton: 'moyen' }],
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
      ton: 2, formes: [{ nom: 'disques', w: 92, dx: 24 }, { nom: 'onglet', place: 'coin', x: 64, y: -3, w: 42, ton: 'moyen' }],
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
   03 — QUI NE TE SUIT PAS EN RETOUR
   ============================================================ */
export function mapChapitre03(c: C03): DonneesAffiche[] {
  return [{
    piece: piece(3),
    titre: 'Qui ne te suit pas en retour',
    chiffre: String(c.neSuiventPas.length),
    note: c.neSuiventPas[0]
      ? `dont @${c.neSuiventPas[0]}, sur ${nb(c.following)} comptes suivis.`
      : `sur ${nb(c.following)} comptes que tu suis.`,
    ton: 3,
    formes: [
      { nom: 'stries', w: 86, dx: -26 },
      { nom: 'cadre', w: 58, ton: 'moyen' },
    ],
  }];
}

/* ============================================================
   04 — TES MOTS  (le mot signature, puis le top 5)
   ============================================================ */
export function mapChapitre04(c: C04): DonneesAffiche[] {
  const [mot, occurrences] = c[0] ?? ['', 0];
  const reveal: DonneesAffiche = {
    piece: piece(4),
    titre: 'Ce que tu dis vraiment',
    chiffre: mot ? `« ${mot} »` : '—',
    note: occurrences ? `ton mot à toi, ${nb(occurrences)} fois.` : 'Pas encore assez de mots.',
    ton: 4,
    formes: [
      { nom: 'barres', w: 70 },
      { nom: 'arc', w: 54, ton: 'moyen' },
    ],
  };
  if (c.length === 0) return [reveal];

  const classement: DonneesAffiche = {
    piece: piece(4),
    titre: 'Tes 5 mots',
    liste: c.slice(0, 5).map(([m, n], i) => ({ rang: i + 1, texte: `« ${m} » · ${nb(n)}` })),
    note: 'hors mots vides (« je », « le », « et »...).',
    ton: 4,
    formes: [{ nom: 'trame', w: 46, ton: 'faible' }],
  };
  return [reveal, classement];
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
      ton: 6, formes: [{ nom: 'stries', w: 82, dx: -20, ton: 'moyen' }, { nom: 'onglet', place: 'coin', x: 60, y: -4, w: 44 }],
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
      ton: 6, formes: [{ nom: 'arc', w: 88, dx: 34 }, { nom: 'onglet', place: 'coin', x: 68, y: -4, w: 46, ton: 'moyen' }],
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
   06 — PREMIER ET DERNIER  (deja les deux faits sur une seule carte,
   via la paire : rien a eclater)
   ============================================================ */
export function mapChapitre06(c: C06): DonneesAffiche[] {
  const memeAvec = c.premier && c.dernier && c.premier.avec === c.dernier.avec;
  return [{
    piece: piece(6),
    titre: 'Premier et dernier',
    paire: [
      { k: 'Premier', v: c.premier ? dateCourte(c.premier.ts) : '—' },
      { k: 'Dernier', v: c.dernier ? dateCourte(c.dernier.ts) : '—' },
    ],
    note: memeAvec ? `les deux à ${c.premier!.avec}.` : 'à des moments très différents de ta vie.',
    ton: 7,
    formes: [
      { nom: 'stries', w: 56, dx: -26, ton: 'moyen' },
      { nom: 'onglet', place: 'coin', x: 58, y: -4, w: 52 },
    ],
  }];
}

/* ============================================================
   07 — TON PROFIL RELATIONNEL  (la revelation, puis la description
   complete deja ecrite pour l'index de l'accueil : le meme texte, pas
   une version raccourcie inventee pour tenir dans une carte)
   ============================================================ */
export function mapChapitre07(c: C07): DonneesAffiche[] {
  const profil = determinerProfil(c);
  const complet = PROFILS_COMPLETS.find((p) => p.nom === profil.nom);

  const reveal: DonneesAffiche = {
    piece: piece(7),
    titre: 'Ton profil relationnel',
    chiffre: profil.nom,
    note: profil.note,
    ton: 8,
    formes: [
      { nom: 'barres', w: 42 },
      { nom: 'faisceau', w: 78, ton: 'moyen' },
    ],
  };
  if (!complet) return [reveal];

  const description: DonneesAffiche = {
    piece: piece(7),
    titre: profil.nom,
    note: complet.description,
    ton: 8,
    formes: [{ nom: 'trame', w: 50, ton: 'faible' }],
  };
  return [reveal, description];
}
