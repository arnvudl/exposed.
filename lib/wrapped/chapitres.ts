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

  // « Le ring » utilise un TAUX (insultes / messages), pas un total brut :
  // sinon le groupe le plus bavard gagne mecaniquement cette categorie
  // aussi, juste parce qu'il genere plus de tout.
  const classements: Record<string, GroupeStats[]> = {
    qg: [...actifs].sort((a, b) => b.score - a.score),
    leBondé: [...actifs].sort((a, b) => b.membres - a.membres),
    tuDebites: [...actifs].sort((a, b) => b.toiEnvoyes - a.toiEnvoyes),
    inutile: [...actifs].sort((a, b) => a.toiPart - b.toiPart),
    leRing: [...actifs].filter((g) => g.insultes > 0).sort((a, b) => b.tauxInsultes - a.tauxInsultes),
  };

  // Un meme groupe ne remporte pas deux titres.
  const ordre = ['qg', 'leBondé', 'tuDebites', 'inutile', 'leRing'] as const;
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
   prendre l'entree de `soi`, une fois `soi` connu.
   ============================================================ */
export function chapitre04(motsParExpediteur: Map<string, Map<string, number>>, soi: string): [string, number][] {
  const compte = motsParExpediteur.get(soi) ?? new Map<string, number>();
  return [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

/* ============================================================
   05 — TES CINQ RECORDS  (1:1 uniquement, pour un « avec qui » net)
   ============================================================ */
const FMT_HEURE_MIN = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
/** Sur une echelle 0-23h brute, 23:59 bat toujours 04:00 alors que 4h du
    matin est manifestement plus tard dans la nuit. On decale : les heures
    avant 6h du matin comptent comme la suite de la veille (+24h). */
function minutesDansLaNuit(ts: number): number {
  const [h, m] = FMT_HEURE_MIN.format(new Date(ts)).split(':').map(Number);
  const heureAjustee = h < 6 ? h + 24 : h;
  return heureAjustee * 60 + m;
}

const FMT_JOUR = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
});
function jourCle(ts: number): string { return FMT_JOUR.format(new Date(ts)); }

// En dessous, une "reponse" est presque toujours le meme envoi Instagram
// coupe en plusieurs messages (photo + legende), jamais un vrai
// aller-retour entre deux personnes.
const SEUIL_REPONSE_RAPIDE_MS = 2000;

export type RecordDelai = { ms: number; debut: number; ts: number; avec: string; messageAvant: string; messageApres: string };

export function chapitre05(conversations: Conversation[], soi: string) {
  let plusTardif: { ts: number; avec: string; minutes: number; message: string } | null = null;
  let remisInflige: RecordDelai | null = null; // toi -> lent a repondre
  let remisSubi: RecordDelai | null = null;    // l'autre -> lent a repondre
  let reponseRapide: RecordDelai | null = null;
  const messagesParJour = new Map<string, number>();

  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    const est1to1 = c.participants.length === 2 && autres.length === 1;
    const avec = est1to1 ? identifiantAffichable(c, autres[0]) : c.titre;
    const idxSoi = c.expediteurs.indexOf(soi);

    for (const m of c.messages) {
      const jour = jourCle(m.ts);
      messagesParJour.set(jour, (messagesParJour.get(jour) ?? 0) + 1);
    }

    if (!est1to1) continue;

    for (let i = 0; i < c.messages.length; i++) {
      const m = c.messages[i];
      if (m.sender === idxSoi) {
        const minutes = minutesDansLaNuit(m.ts);
        if (!plusTardif || minutes > plusTardif.minutes) {
          plusTardif = { ts: m.ts, avec, minutes, message: m.apercu };
        }
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
  let jourRecord: { date: string; messages: number } | null = null;
  if (jourRecordBrut) {
    const [an, mo, jr] = jourRecordBrut[0].split('-').map(Number);
    const label = new Date(Date.UTC(an, mo - 1, jr)).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
    jourRecord = { date: label, messages: jourRecordBrut[1] };
  }

  return { plusTardif, remisInflige, remisSubi, reponseRapide, jourRecord };
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
   ============================================================ */
export function chapitre07(conversations: Conversation[], soi: string) {
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
    if (totalToi + totalAutre >= 5) {
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
};

export function chapitreMedias(conversations: Conversation[], soi: string): StatsMedias {
  const s: StatsMedias = {
    vocaux: { toi: 0, autres: 0 },
    photos: { toi: 0, autres: 0 },
    stickers: { toi: 0, autres: 0 },
    appelsAudio: 0,
    appelsVideo: 0,
  };
  for (const c of conversations) {
    const idxSoi = c.expediteurs.indexOf(soi);
    for (const m of c.messages) {
      if (!m.medias) continue;
      const cote = m.sender === idxSoi ? 'toi' : 'autres';
      if (m.medias.vocaux) s.vocaux[cote] += m.medias.vocaux;
      if (m.medias.photos) s.photos[cote] += m.medias.photos;
      if (m.medias.stickers) s.stickers[cote] += m.medias.stickers;
      if (m.medias.appel === 'audio') s.appelsAudio++;
      if (m.medias.appel === 'video') s.appelsVideo++;
    }
  }
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
