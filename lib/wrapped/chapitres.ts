/* ============================================================
   CHAPITRES  /  les 7 calculs, portes tels quels depuis analyse.mts
   Chaque fonction est pure : conversations en entree, resultat en sortie.
   Validees sur un vrai export dans le script Node avant d'atterrir ici.
   ============================================================ */
import { mediane } from './decode';
import { COMPTE_SUPPRIME, identifiantAffichable, nomExpediteur, type Conversation, type Message } from './parse';

/* ============================================================
   01 — TON CERCLE RÉEL
   ============================================================ */
export type LigneCercle = { qui: string; recus: number; envoyes: number; total: number };

export function chapitre01(conversations: Conversation[], soi: string): LigneCercle[] {
  const lignes: LigneCercle[] = [];
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    if (c.participants.length !== 2 || autres.length !== 1) continue;
    const autre = autres[0];
    if (autre === COMPTE_SUPPRIME) continue;
    const idxSoi = c.expediteurs.indexOf(soi);
    const idxAutre = c.expediteurs.indexOf(autre);
    let recus = 0, envoyes = 0;
    for (const m of c.messages) {
      if (m.sender === idxSoi) envoyes++;
      else if (m.sender === idxAutre) recus++;
    }
    const total = recus + envoyes;
    if (total === 0) continue;
    lignes.push({ qui: identifiantAffichable(c, autre), recus, envoyes, total });
  }
  return lignes.sort((a, b) => b.total - a.total).slice(0, 10);
}

/* ============================================================
   02 — TES GROUPES
   ============================================================ */
const SEUIL_MESSAGES_ACTIF = 50;
const SEUIL_JOURS_RECENCE = 365;

export type GroupeStats = {
  titre: string;
  membres: number;
  totalMessages: number;
  toiEnvoyes: number;
  toiPart: number;
  insultes: number;
  tauxInsultes: number;
  dernierMessage: number;
  actif: boolean;
  score: number;
};

export function chapitre02(conversations: Conversation[], soi: string) {
  const maintenant = Date.now();
  const groupes: GroupeStats[] = [];

  for (const c of conversations) {
    if (c.participants.length < 3 || c.messages.length === 0) continue;
    const idxSoi = c.expediteurs.indexOf(soi);
    const dernierMessage = c.messages[c.messages.length - 1].ts;
    const joursDepuis = (maintenant - dernierMessage) / 86_400_000;
    const toiEnvoyes = c.messages.filter((m) => m.sender === idxSoi).length;
    const insultes = c.insultes;
    const actif = c.messages.length >= SEUIL_MESSAGES_ACTIF && joursDepuis <= SEUIL_JOURS_RECENCE;
    const facteurRecence = Math.max(0.15, Math.min(1, 1 - joursDepuis / SEUIL_JOURS_RECENCE));

    groupes.push({
      titre: c.titre || 'Groupe sans nom',
      membres: c.participants.length,
      totalMessages: c.messages.length,
      toiEnvoyes,
      toiPart: toiEnvoyes / c.messages.length,
      insultes,
      tauxInsultes: insultes / c.messages.length,
      dernierMessage,
      actif,
      score: c.messages.length * facteurRecence,
    });
  }

  const actifs = groupes.filter((g) => g.actif);

  if (actifs.length === 0) {
    return { abandon: true as const, totalGroupes: groupes.length, actifs: [] as GroupeStats[], categories: null };
  }

  const classements: Record<string, GroupeStats[]> = {
    qg: [...actifs].sort((a, b) => b.score - a.score),
    leBondé: [...actifs].sort((a, b) => b.membres - a.membres),
    tuDebites: [...actifs].sort((a, b) => b.toiEnvoyes - a.toiEnvoyes),
    inutile: [...actifs].sort((a, b) => a.toiPart - b.toiPart),
  };

  // Un meme groupe ne remporte pas deux titres.
  const ordre = ['qg', 'leBondé', 'tuDebites', 'inutile'] as const;
  const dejaPris = new Set<string>();
  const categories: Record<string, GroupeStats | null> = {};
  for (const cle of ordre) {
    const gagnant = classements[cle].find((g) => !dejaPris.has(g.titre)) ?? null;
    categories[cle] = gagnant;
    if (gagnant) dejaPris.add(gagnant.titre);
  }

  return { abandon: false as const, totalGroupes: groupes.length, actifs, categories };
}

/* ============================================================
   03 — QUI NE TE SUIT PAS EN RETOUR
   Simple difference d'ensembles — sauf sur un piege reel d'Instagram :
   quand on choisit une periode a la demande d'export, elle limite les
   ABONNE(E)S ("followers") a cette fenetre, mais jamais les ABONNEMENTS
   ("following"), qui remontent toujours a la creation du compte. Comparer
   tel quel ferait ressortir comme "ne suit pas en retour" tout compte
   suivi avant la fenetre des abonnes -- des centaines de faux positifs sur
   un vieux compte. La comparaison est donc bornee a la meme fenetre que
   les abonnes (leur date la plus ancienne), des qu'on en a une.
   ============================================================ */
function dateLaPlusAncienne(m: Map<string, number>): number | null {
  let min: number | null = null;
  for (const ts of m.values()) if (min === null || ts < min) min = ts;
  return min;
}

const FMT_DATE_LONGUE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric',
});

// Sur un compte tout neuf, le tout premier abonnement peut precede le tout
// premier abonne de quelques minutes (l'ordre naturel : on suit avant qu'on
// nous suive) -- pas une preuve de troncature. Seul un ecart d'au moins une
// semaine est retenu comme signe reel que l'export des abonnes est limite a
// une periode plus courte que celui des abonnements.
const SEUIL_DECALAGE_MS = 7 * 86_400_000;

export function chapitre03(followers: Map<string, number>, following: Map<string, number>) {
  const depuisTs = dateLaPlusAncienne(followers);
  const followingLePlusAncien = dateLaPlusAncienne(following);
  const decalageDetecte = depuisTs !== null && followingLePlusAncien !== null
    && depuisTs - followingLePlusAncien >= SEUIL_DECALAGE_MS;

  const followingDansLaPeriode = depuisTs === null
    ? [...following.keys()]
    : [...following.entries()].filter(([, ts]) => ts >= depuisTs).map(([n]) => n);

  return {
    neSuiventPas: followingDansLaPeriode.filter((n) => !followers.has(n)).sort(),
    followers: followers.size,
    following: following.size,
    followingDansLaPeriode: followingDansLaPeriode.length,
    decalageDetecte,
    depuisDate: depuisTs !== null ? FMT_DATE_LONGUE.format(new Date(depuisTs)) : null,
  };
}

/* ============================================================
   04 — TES MOTS
   Le compte par mot est deja fait pendant le parse (voir parse.ts,
   Accumulateur.ingerer), pour chaque expediteur : il ne reste plus qu'a
   prendre l'entree de `soi`, une fois `soi` connu. `motsTotalParExpediteur`
   et `messagesParExpediteur` (compteurs bruts, non filtres, voir parse.ts)
   donnent le vrai volume d'ecriture -- distinct du top 10 qui, lui, exclut
   les mots vides. */
export type StatsMots = { top: [string, number][]; totalMots: number; totalMessages: number };

export function chapitre04(
  motsParExpediteur: Map<string, Map<string, number>>,
  motsTotalParExpediteur: Map<string, number>,
  messagesParExpediteur: Map<string, number>,
  soi: string,
): StatsMots {
  const compte = motsParExpediteur.get(soi) ?? new Map<string, number>();
  return {
    top: [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    totalMots: motsTotalParExpediteur.get(soi) ?? 0,
    totalMessages: messagesParExpediteur.get(soi) ?? 0,
  };
}

/* ============================================================
   05 — TES SIX RECORDS  (les delais de reponse et le "avec qui" du jour
   record restent 1:1 uniquement, pour un « avec qui » net -- le plus long
   message, lui, regarde aussi les groupes : un monologue s'y ecrit pareil)
   ============================================================ */
const FMT_JOUR = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
});
function jourCle(ts: number): string { return FMT_JOUR.format(new Date(ts)); }

// En dessous, une "reponse" est presque toujours le meme envoi Instagram
// coupe en plusieurs messages (photo + legende), jamais un vrai
// aller-retour entre deux personnes.
const SEUIL_REPONSE_RAPIDE_MS = 2000;

export type RecordDelai = { ms: number; debut: number; ts: number; avec: string; messageAvant: string; messageApres: string };
export type LigneJour = { qui: string; total: number };
export type PlusLongMessage = { avec: string; ts: number; longueur: number; texte: string };
export type Tirade = { messages: number; debut: number; fin: number; avec: string };

// En dessous, deux ou trois messages d'affilee (photo puis legende, ou un
// simple "ah" avant la vraie reponse) ne sont pas une vraie tirade -- juste
// le decoupage habituel d'un envoi Instagram.
const SEUIL_TIRADE = 4;

export function chapitre05(
  conversations: Conversation[],
  soi: string,
  plusLongMessageParExpediteur: Map<string, { dossier: string; ts: number; longueur: number; texte: string }>,
) {
  let remisInflige: RecordDelai | null = null; // toi -> lent a repondre
  let remisSubi: RecordDelai | null = null;    // l'autre -> lent a repondre
  let reponseRapide: RecordDelai | null = null;
  let tirade: Tirade | null = null;
  const messagesParJour = new Map<string, number>();
  // Meme cle que messagesParJour, mais par contact 1:1 (les groupes n'ont
  // pas un "qui" unique) : sert au "à qui tu as le plus parlé ce jour-là".
  const messagesParJourEtContact = new Map<string, Map<string, number>>();
  const avecParDossier = new Map<string, string>();
  // Bornes de la periode reellement couverte par des messages (tous
  // dossiers confondus) : sert a calculer une vraie moyenne quotidienne
  // (chapitre05.jourRecord.moyenneJournaliere), pas juste sur les jours ou
  // tu as ecrit -- le meme esprit que "premier"/"dernier" au chapitre 06.
  let totalMessages = 0;
  let premierTs: number | null = null;
  let dernierTs: number | null = null;

  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    const est1to1 = c.participants.length === 2 && autres.length === 1;
    const avec = est1to1 ? identifiantAffichable(c, autres[0]) : c.titre;
    const idxSoi = c.expediteurs.indexOf(soi);
    avecParDossier.set(c.dossier, avec);

    for (const m of c.messages) {
      const jour = jourCle(m.ts);
      messagesParJour.set(jour, (messagesParJour.get(jour) ?? 0) + 1);
      totalMessages++;
      if (premierTs === null || m.ts < premierTs) premierTs = m.ts;
      if (dernierTs === null || m.ts > dernierTs) dernierTs = m.ts;
      if (est1to1) {
        let parContact = messagesParJourEtContact.get(jour);
        if (!parContact) { parContact = new Map(); messagesParJourEtContact.set(jour, parContact); }
        parContact.set(avec, (parContact.get(avec) ?? 0) + 1);
      }
    }

    if (!est1to1) continue;

    // Serie de messages d'affilee de ta part, sans reponse entre-deux : reset
    // des qu'un message de l'autre s'intercale. Une conversation ne peut pas
    // hériter la serie d'une autre.
    let streak = 0;
    let streakDebut = 0;

    for (let i = 0; i < c.messages.length; i++) {
      const m = c.messages[i];
      if (m.sender === idxSoi) {
        if (streak === 0) streakDebut = m.ts;
        streak++;
        if (streak >= SEUIL_TIRADE && (!tirade || streak > tirade.messages)) {
          tirade = { messages: streak, debut: streakDebut, fin: m.ts, avec };
        }
      } else {
        streak = 0;
      }

      if (i === 0) continue;
      const prec = c.messages[i - 1];
      if (prec.sender !== m.sender) {
        const delta = m.ts - prec.ts;
        if (delta <= 0) continue;
        if (prec.sender !== idxSoi && m.sender === idxSoi) {
          if (!remisInflige || delta > remisInflige.ms) {
            remisInflige = { ms: delta, debut: prec.ts, ts: m.ts, avec, messageAvant: prec.apercu, messageApres: m.apercu };
          }
          if (delta >= SEUIL_REPONSE_RAPIDE_MS && (!reponseRapide || delta < reponseRapide.ms)) {
            reponseRapide = { ms: delta, debut: prec.ts, ts: m.ts, avec, messageAvant: prec.apercu, messageApres: m.apercu };
          }
        } else if (prec.sender === idxSoi && m.sender !== idxSoi) {
          if (!remisSubi || delta > remisSubi.ms) {
            remisSubi = { ms: delta, debut: prec.ts, ts: m.ts, avec, messageAvant: prec.apercu, messageApres: m.apercu };
          }
        }
      }
    }
  }

  const jourRecordBrut = [...messagesParJour.entries()].sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined;
  let jourRecord: { date: string; messages: number; moyenneJournaliere: number; topContacts: LigneJour[] } | null = null;
  if (jourRecordBrut && premierTs !== null && dernierTs !== null) {
    const [an, mo, jr] = jourRecordBrut[0].split('-').map(Number);
    const label = new Date(Date.UTC(an, mo - 1, jr)).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    // Moyenne sur toute la periode couverte (premier -> dernier message),
    // pas seulement les jours ou tu as ecrit : une vraie moyenne "par jour
    // depuis que tu es sur la plateforme", pour que le multiplicateur du
    // jour record dise quelque chose de honnete.
    const joursSpan = Math.max(1, Math.round((dernierTs - premierTs) / 86_400_000) + 1);
    const parContact = messagesParJourEtContact.get(jourRecordBrut[0]);
    const topContacts = parContact
      ? [...parContact.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([qui, total]) => ({ qui, total }))
      : [];
    jourRecord = { date: label, messages: jourRecordBrut[1], moyenneJournaliere: totalMessages / joursSpan, topContacts };
  }

  // Le plus long message envoye (par toi), tous dossiers confondus -- pas
  // seulement les 1:1 : un monologue dans un groupe compte aussi. Le texte
  // complet vient de l'Accumulateur (parse.ts), le seul endroit ou il
  // survit encore, borne a un candidat par expediteur.
  const longBrut = plusLongMessageParExpediteur.get(soi);
  const plusLongMessage: PlusLongMessage | null = longBrut
    ? { avec: avecParDossier.get(longBrut.dossier) ?? '', ts: longBrut.ts, longueur: longBrut.longueur, texte: longBrut.texte }
    : null;

  return { remisInflige, remisSubi, reponseRapide, jourRecord, plusLongMessage, tirade };
}

/* ============================================================
   06 — PREMIER ET DERNIER
   ============================================================ */
export type Borne = { ts: number; avec: string; de: string; message: string };

export function chapitre06(conversations: Conversation[], soi: string) {
  let premier: Borne | null = null;
  let dernier: Borne | null = null;
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    const est1to1 = c.participants.length === 2 && autres.length === 1;
    // Le meme « avec » que les records : le @ de la personne en 1:1, le nom
    // du groupe sinon. Et qui a ecrit ce message, parce qu'un premier message
    // recu et un premier message envoye ne racontent pas la meme chose.
    const avec = est1to1 ? identifiantAffichable(c, autres[0]) : (c.titre || autres.join(', '));
    const idxSoi = c.expediteurs.indexOf(soi);
    for (const m of c.messages) {
      const de = m.sender === idxSoi ? 'Toi' : nomExpediteur(c, m);
      if (!premier || m.ts < premier.ts) premier = { ts: m.ts, avec, de, message: m.apercu };
      if (!dernier || m.ts > dernier.ts) dernier = { ts: m.ts, avec, de, message: m.apercu };
    }
  }
  return { premier, dernier };
}

/* ============================================================
   07 — TON PROFIL RELATIONNEL (4 axes, jamais affiches tels quels)

   Seuil "partenaire actif" et diviseur d'ampleur recalibres le 2026-09-11,
   apres un premier retour beta ou deux comptes reels tombaient TOUJOURS sur
   "L'Ouvert" -- verifie avec un vrai corpus (script scripts/analyse.mts) :
   a l'ancien seuil (>= 5 messages, a vie, pour compter comme "actif"), un
   compte moyennement social atteint facilement 200+ "partenaires actifs"
   des les premieres annees d'usage (5 messages, meme tres vieux, est un
   bar quasi nul) -- l'axe ampleur (divise par 50) sature alors a 1.0 pour
   a peu pres tout le monde, et la rapidite de reponse (delai median tout
   confondu, souvent quelques minutes chez qui chatte casuellement) sature
   pareillement pres de 1.0 -- deux axes satures poussent mecaniquement vers
   les profils a forte ampleur/rapidite (L'Ouvert, Le Connecteur), quels que
   soient les deux autres axes. Seuil releve a >= 30 messages (une vraie
   relation suivie, pas juste un "salut" isole) et diviseur d'ampleur remonte
   en consequence dans profil.ts (voir son commentaire). Toujours une
   premiere calibration, a revoir des que plus de vrais comptes seront vus. */
export function chapitre07(conversations: Conversation[], soi: string) {
  const SEUIL_PARTENAIRE_ACTIF = 30;
  const uns1to1 = conversations.filter((c) => {
    const autres = c.participants.filter((p) => p !== soi);
    return c.participants.length === 2 && autres.length === 1 && autres[0] !== COMPTE_SUPPRIME;
  });

  let lancements = 0, conversationsCompteesPourLancement = 0;
  const deltasReponse: number[] = [];
  const longueursMessages: number[] = [];
  const partenairesActifs = new Set<string>();

  for (const c of uns1to1) {
    if (c.messages.length === 0) continue;
    const idxSoi = c.expediteurs.indexOf(soi);
    const totalToi = c.messages.filter((m) => m.sender === idxSoi).length;
    const totalAutre = c.messages.length - totalToi;
    if (totalToi + totalAutre >= SEUIL_PARTENAIRE_ACTIF) {
      partenairesActifs.add(c.dossier);
      conversationsCompteesPourLancement++;
      if (c.messages[0].sender === idxSoi) lancements++;
    }
    for (let i = 1; i < c.messages.length; i++) {
      const prec = c.messages[i - 1], cur = c.messages[i];
      if (prec.sender !== idxSoi && cur.sender === idxSoi) {
        const delta = cur.ts - prec.ts;
        if (delta > 0 && delta < 7 * 86_400_000) deltasReponse.push(delta / 60_000);
      }
    }
  }

  for (const c of conversations) {
    const idxSoi = c.expediteurs.indexOf(soi);
    for (const m of c.messages) {
      if (m.sender === idxSoi && m.longueur > 0) longueursMessages.push(m.longueur);
    }
  }

  return {
    axeQuiLance: conversationsCompteesPourLancement ? lancements / conversationsCompteesPourLancement : 0,
    axeAmpleur: partenairesActifs.size,
    axeVitesseMinutes: mediane(deltasReponse),
    axeLongueurCaracteres: mediane(longueursMessages),
  };
}

/* ============================================================
   BONUS — TES MÉDIAS  (pas un huitieme chapitre : le site promet « sept
   chapitres » partout, sur l'accueil comme dans le guide -- ces cartes
   s'ajoutent APRES le chapitre 07, etiquetees « Bonus », sans renumeroter
   ni casser cette promesse.)
   ============================================================ */
export type StatsMedias = {
  vocaux: { toi: number; autres: number };
  photos: { toi: number; autres: number };
  stickers: { toi: number; autres: number };
  appelsAudio: number;
  appelsVideo: number;
  /** Minutes cumulees, appels manques compris (duree 0). Pas d'equivalent
      pour les vocaux : voir le commentaire de `Medias.dureeSecondes`
      (parse.ts), Instagram ne stocke pas leur duree dans l'export. */
  dureeAppelsMinutes: number;
};

export function chapitreMedias(conversations: Conversation[], soi: string): StatsMedias {
  const s: StatsMedias = {
    vocaux: { toi: 0, autres: 0 },
    photos: { toi: 0, autres: 0 },
    stickers: { toi: 0, autres: 0 },
    appelsAudio: 0,
    appelsVideo: 0,
    dureeAppelsMinutes: 0,
  };
  let dureeSecondesTotal = 0;
  for (const c of conversations) {
    const idxSoi = c.expediteurs.indexOf(soi);
    for (const m of c.messages) {
      if (!m.medias) continue;
      const cote = m.sender === idxSoi ? 'toi' : 'autres';
      if (m.medias.vocaux) s.vocaux[cote] += m.medias.vocaux;
      if (m.medias.photos) s.photos[cote] += m.medias.photos;
      if (m.medias.stickers) s.stickers[cote] += m.medias.stickers;
      if (m.medias.dureeSecondes) dureeSecondesTotal += m.medias.dureeSecondes;
      if (m.medias.appel === 'audio') s.appelsAudio++;
      if (m.medias.appel === 'video') s.appelsVideo++;
    }
  }
  s.dureeAppelsMinutes = Math.round(dureeSecondesTotal / 60);
  return s;
}

export type LigneMedia = { qui: string; total: number };

/** Classement des 1:1, par ce que CETTE PERSONNE t'a envoye pour un type de
    media donne (pas le total echange dans les deux sens) : c'est la
    question qui interesse ("qui m'envoie le plus de vocaux"), pas un total
    neutre. `compter` lit un seul message et renvoie combien il contribue. */
function classementParContact(
  conversations: Conversation[],
  soi: string,
  compter: (m: Message) => number,
): LigneMedia[] {
  const lignes: LigneMedia[] = [];
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    if (c.participants.length !== 2 || autres.length !== 1) continue;
    const autre = autres[0];
    if (autre === COMPTE_SUPPRIME) continue;
    const idxAutre = c.expediteurs.indexOf(autre);
    let total = 0;
    for (const m of c.messages) {
      if (m.sender === idxAutre) total += compter(m);
    }
    if (total > 0) lignes.push({ qui: identifiantAffichable(c, autre), total });
  }
  return lignes.sort((a, b) => b.total - a.total);
}

export function classementVocaux(conversations: Conversation[], soi: string): LigneMedia[] {
  return classementParContact(conversations, soi, (m) => m.medias?.vocaux ?? 0);
}
export function classementPhotos(conversations: Conversation[], soi: string): LigneMedia[] {
  return classementParContact(conversations, soi, (m) => m.medias?.photos ?? 0);
}

/** Un appel n'est pas "envoye" par une des deux parties comme une photo --
    c'est un evenement partage. Compte donc chaque appel du 1:1, quel que
    soit qui a "termine" l'appel (le sender du message systeme), plutot que
    de reutiliser `classementParContact` (pense pour "ce que l'AUTRE t'a
    envoye", pas pertinent ici). */
export function classementAppels(conversations: Conversation[], soi: string): LigneMedia[] {
  const lignes: LigneMedia[] = [];
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    if (c.participants.length !== 2 || autres.length !== 1) continue;
    const autre = autres[0];
    if (autre === COMPTE_SUPPRIME) continue;
    let total = 0;
    for (const m of c.messages) {
      if (m.medias?.appel) total++;
    }
    if (total > 0) lignes.push({ qui: identifiantAffichable(c, autre), total });
  }
  return lignes.sort((a, b) => b.total - a.total);
}
