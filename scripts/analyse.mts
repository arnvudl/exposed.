/* ============================================================
   ANALYSE  /  script de developpement, jamais expedie
   Lit data/ (ton export Instagram, ignore par git), calcule les 8 chapitres
   avec tes vraies donnees, et les imprime dans le terminal. Rien ici ne
   touche le site : c'est l'etape qui sert a figer les definitions avant
   d'ecrire la meme logique cote navigateur.

   Lancement : node scripts/analyse.ts
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const RACINE = path.resolve(import.meta.dirname, '..', 'data');
const INBOX = path.join(RACINE, 'your_instagram_activity', 'messages', 'inbox');
const CONNECTIONS = path.join(RACINE, 'your_instagram_activity', 'connections', 'followers_and_following');

/* ============================================================
   OUTILS
   ============================================================ */

/** Instagram encode l'UTF-8 puis le relit en Latin-1 : chaque octet devient
    un caractere. Le detour inverse restaure les accents et les emojis. */
function decodeMojibake(s: string): string {
  return Buffer.from(s, 'latin1').toString('utf8');
}

function lireJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 ? tri[milieu] : (tri[milieu - 1] + tri[milieu]) / 2;
}

const FMT_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
function formatDate(ts: number): string {
  return FMT_DATE.format(new Date(ts));
}

function formatDureeJours(ms: number): string {
  const jours = ms / 86_400_000;
  if (jours >= 1) return `${jours.toFixed(1)} jours`;
  const heures = ms / 3_600_000;
  return `${heures.toFixed(1)} heures`;
}

function formatDureeCourte(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const min = s / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  return `${(min / 60).toFixed(1)} h`;
}

/* ============================================================
   CHARGEMENT DES CONVERSATIONS
   Uniquement inbox/ (les conversations acceptees). message_requests/ (305
   entrees, surtout des demandes jamais acceptees) et broadcast/ sont hors
   perimetre pour cette premiere passe : ils polluent plus qu'ils n'informent.
   ============================================================ */

type Message = {
  sender: string;
  ts: number;
  content?: string;
  aDesMedias: boolean;
  estSupprime: boolean;
};

type Conversation = {
  dossier: string;
  titre: string;
  participants: string[];
  messages: Message[];
};

/* Instagram stocke ses messages systeme en ANGLAIS, meme sur un export dont
   toute l'interface est en francais. Les deux langues sont donc necessaires
   ici, sinon "X started an audio call" pollue les mots et les inside jokes. */
const MOTS_SYSTEME = [
  // Francais
  /^Vous avez envoyé /i, /^.+ a envoyé /i, /^Vous avez supprimé un message/i,
  /^.+ a supprimé un message/i, /^Vous avez réagi /i, /^.+ a réagi /i,
  /^Cet appel (vidéo|audio) a été manqué/i, /^Vous avez manqué /i,
  /^Le partage de position en direct a démarré/i, /^L'appel (vidéo|audio) a démarré/i,
  /^Vous avez démarré un appel/i, /^.+ a démarré un appel/i,
  /^Vous avez configuré une disparition/i, /^.+ a configuré une disparition/i,
  // Anglais (appels, groupes, notifications systeme)
  /started an (audio|video) call/i, /started a video chat/i, /^Video chat started/i,
  /^Video chat ended/i, /missed (your|an|a) (video |audio )?call/i,
  /wasn't notified about this message/i, /reacted .+ to (your|.+'s) message/i,
  /changed the group photo/i, /changed the group name/i, /named the group/i,
  /set (the|your|.+'s) nickname/i, /cleared (the|your|.+'s) nickname/i,
  /added .+ to the (group|chat)/i, /left the group/i, /removed .+ from the group/i,
  /is no longer in the call/i, /joined the call/i, /left the call/i,
  /created a poll/i, /voted (for|on)/i, /poll is no longer available/i,
  /sent an attachment/i, /You are now connected on Messenger/i,
  /unsent a message/i, /set the disappearing message/i,
];
function estContenuSysteme(c: string): boolean {
  return MOTS_SYSTEME.some((re) => re.test(c));
}

function chargerConversations(): Conversation[] {
  const dossiers = fs.readdirSync(INBOX, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const conversations: Conversation[] = [];

  for (const dossier of dossiers) {
    const chemin = path.join(INBOX, dossier);
    const fichiers = fs.readdirSync(chemin).filter((f) => /^message_\d+\.json$/.test(f));
    if (fichiers.length === 0) continue;
    // Certaines conversations tres longues sont decoupees en plusieurs
    // fichiers : on les fusionne dans l'ordre.
    fichiers.sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

    let titre = '';
    let participants: string[] = [];
    const messages: Message[] = [];

    for (const f of fichiers) {
      const data = lireJson(path.join(chemin, f));
      titre = decodeMojibake(data.title ?? '');
      participants = (data.participants ?? []).map((p: any) => decodeMojibake(p.name));
      for (const m of data.messages ?? []) {
        const contenuBrut = typeof m.content === 'string' ? decodeMojibake(m.content) : undefined;
        const aDesMedias = !!(m.photos?.length || m.videos?.length || m.audio_files?.length || m.share || m.call_duration != null);
        messages.push({
          sender: decodeMojibake(m.sender_name ?? ''),
          ts: m.timestamp_ms,
          content: contenuBrut && !estContenuSysteme(contenuBrut) ? contenuBrut : undefined,
          aDesMedias,
          estSupprime: !!m.is_unsent,
        });
      }
    }

    messages.sort((a, b) => a.ts - b.ts);
    conversations.push({ dossier, titre, participants, messages });
  }

  return conversations;
}

/** Le participant present dans le plus de conversations, c'est toi. Evite
    de coder ton nom en dur : ca marche pour n'importe quel export. */
function detecterSoi(conversations: Conversation[]): string {
  const compte = new Map<string, number>();
  for (const c of conversations) {
    for (const p of new Set(c.participants)) compte.set(p, (compte.get(p) ?? 0) + 1);
  }
  return [...compte.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Pour les 1:1 seulement : le nom de dossier suit `identifiant_id`. Quand
    l'identifiant est un pseudo lisible (pas de l'emoji illisible), c'est le
    vrai @ de l'autre personne. Sinon on retombe sur son nom affiche. */
function identifiantAffichable(conv: Conversation, autre: string): string {
  const m = conv.dossier.match(/^([a-zA-Z0-9._]+)_\d+$/);
  return m ? `@${m[1]}` : autre;
}

const COMPTE_SUPPRIME = 'Utilisateur Instagram';

/* ============================================================
   01 — TON CERCLE RÉEL
   ============================================================ */
type LigneCercle = { qui: string; recus: number; envoyes: number; total: number };

function chapitre01(conversations: Conversation[], soi: string): LigneCercle[] {
  const lignes: LigneCercle[] = [];
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    if (c.participants.length !== 2 || autres.length !== 1) continue;
    const autre = autres[0];
    if (autre === COMPTE_SUPPRIME) continue;
    let recus = 0, envoyes = 0;
    for (const m of c.messages) {
      if (m.sender === soi) envoyes++;
      else if (m.sender === autre) recus++;
    }
    const total = recus + envoyes;
    if (total === 0) continue;
    lignes.push({ qui: identifiantAffichable(c, autre), recus, envoyes, total });
  }
  return lignes.sort((a, b) => b.total - a.total).slice(0, 10);
}

/* ============================================================
   02 — TES GROUPES
   Palmarès à 5 categories. Un groupe doit etre « actif » (assez de messages
   ET recent) pour concourir ; sinon il compte pour le tas des abandonnes.
   ============================================================ */
const SEUIL_MESSAGES_ACTIF = 50;
const SEUIL_JOURS_RECENCE = 365;

const MOTS_INSULTES = [
  'connard', 'connasse', 'abruti', 'abrutie', 'débile', 'con', 'conne',
  'idiot', 'idiote', 'pute', 'salope', 'bâtard', 'batard', 'merde',
  'enculé', 'enculée', 'crétin', 'crétine', 'stupide', 'ntm', 'ta gueule',
];
function compteInsultes(texte: string): number {
  const t = texte.toLowerCase();
  let n = 0;
  for (const mot of MOTS_INSULTES) {
    const re = new RegExp(`\\b${mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    n += (t.match(re) ?? []).length;
  }
  return n;
}

type GroupeStats = {
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

function chapitre02(conversations: Conversation[], soi: string) {
  const maintenant = Date.now();
  const groupes: GroupeStats[] = [];

  for (const c of conversations) {
    if (c.participants.length < 3 || c.messages.length === 0) continue;
    const dernierMessage = c.messages[c.messages.length - 1].ts;
    const joursDepuis = (maintenant - dernierMessage) / 86_400_000;
    const toiEnvoyes = c.messages.filter((m) => m.sender === soi).length;
    const insultes = c.messages.reduce((acc, m) => acc + (m.content ? compteInsultes(m.content) : 0), 0);
    const actif = c.messages.length >= SEUIL_MESSAGES_ACTIF && joursDepuis <= SEUIL_JOURS_RECENCE;
    const facteurRecence = Math.max(0.15, Math.min(1, 1 - joursDepuis / SEUIL_JOURS_RECENCE));

    groupes.push({
      titre: c.titre || `Groupe (${c.participants.length} membres)`,
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
    return { abandon: true, totalGroupes: groupes.length, actifs: [] as GroupeStats[], categories: null };
  }

  // Classements par critere. « Le ring » utilise un TAUX (insultes / messages),
  // pas un total brut : sinon le groupe le plus bavard gagne mecaniquement
  // cette categorie aussi, juste parce qu'il genere plus de tout.
  const classements: Record<string, GroupeStats[]> = {
    qg: [...actifs].sort((a, b) => b.score - a.score),
    leBondé: [...actifs].sort((a, b) => b.membres - a.membres),
    tuDebites: [...actifs].sort((a, b) => b.toiEnvoyes - a.toiEnvoyes),
    inutile: [...actifs].sort((a, b) => a.toiPart - b.toiPart),
    leRing: [...actifs].filter((g) => g.insultes > 0).sort((a, b) => b.tauxInsultes - a.tauxInsultes),
  };

  // Un meme groupe ne remporte pas deux titres : moins interessant a lire,
  // et ca cache les autres groupes actifs derriere le plus gros. Priorite
  // dans l'ordre d'affichage prevu sur l'affiche.
  const ordre = ['qg', 'leBondé', 'tuDebites', 'inutile', 'leRing'] as const;
  const dejaPris = new Set<string>();
  const categories: Record<string, GroupeStats | null> = {};
  for (const cle of ordre) {
    const gagnant = classements[cle].find((g) => !dejaPris.has(g.titre)) ?? null;
    categories[cle] = gagnant;
    if (gagnant) dejaPris.add(gagnant.titre);
  }

  return { abandon: false, totalGroupes: groupes.length, actifs, categories };
}

/* ============================================================
   03 — QUI NE TE SUIT PAS EN RETOUR
   ============================================================ */
function nomsDepuisRelations(cheminFichier: string, cle: string): Set<string> {
  if (!fs.existsSync(cheminFichier)) return new Set();
  const data = lireJson(cheminFichier);
  const liste = Array.isArray(data) ? data : (data[cle] ?? []);
  const noms = new Set<string>();
  for (const entree of liste) {
    const titre = entree.title;
    const valeur = entree.string_list_data?.[0]?.value;
    const identifiant = (titre && titre.length > 0 ? titre : valeur) as string | undefined;
    if (identifiant) noms.add(decodeMojibake(identifiant).toLowerCase());
  }
  return noms;
}

function chapitre03() {
  // followers_1.json, followers_2.json... s'il y en a plusieurs.
  const fichiersFollowers = fs.readdirSync(CONNECTIONS).filter((f) => /^followers_\d+\.json$/.test(f));
  const followers = new Set<string>();
  for (const f of fichiersFollowers) {
    for (const n of nomsDepuisRelations(path.join(CONNECTIONS, f), 'relationships_followers')) followers.add(n);
  }
  const following = nomsDepuisRelations(path.join(CONNECTIONS, 'following.json'), 'relationships_following');

  const neSuiventPas = [...following].filter((n) => !followers.has(n)).sort();
  return neSuiventPas;
}

/* ============================================================
   04 — TES MOTS (au pluriel : un top, pas un seul mot)
   ============================================================ */
const MOTS_VIDES = new Set([
  'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les',
  'un', 'une', 'des', 'de', 'du', 'ce', 'cette', 'ces', 'cet', 'et', 'ou', 'mais',
  'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'a', 'au', 'aux',
  'en', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'comme', 'si', 'ne',
  'pas', 'plus', 'moins', 'très', 'trop', 'bien', 'alors', 'aussi', 'encore',
  'déjà', 'deja', 'oui', 'non', 'ok', 'voila', 'voilà', 'ca', 'ça', 'cela', 'moi',
  'toi', 'lui', 'eux', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
  'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'est', 'es', 'suis', 'sommes',
  'êtes', 'etes', 'sont', 'était', 'etait', 'étais', 'etais', 'été', 'ete',
  'avoir', 'ai', 'as', 'avons', 'avez', 'ont', 'va', 'vas', 'vont', 'fait',
  'faire', 'dit', 'dire', 'ya', 'y', 'a', 'me', 'te', 'se', 'qu', 'j', 'c', 'l',
  'd', 'n', 's', 't', 'm', 'jsp', 'jsuis', 'osef', 'tkt', 'stp', 'dsl',
]);

function tokeniser(texte: string): string[] {
  return texte
    .toLowerCase()
    .replace(/[’]/g, "'")
    .match(/[a-zàâäéèêëïîôöùûüÿçœæ]+/gi)
    ?.map((t) => t.toLowerCase()) ?? [];
}

function chapitre04(conversations: Conversation[], soi: string) {
  const compte = new Map<string, number>();
  for (const c of conversations) {
    for (const m of c.messages) {
      if (m.sender !== soi || !m.content) continue;
      for (const mot of tokeniser(m.content)) {
        if (mot.length < 2 || MOTS_VIDES.has(mot)) continue;
        compte.set(mot, (compte.get(mot) ?? 0) + 1);
      }
    }
  }
  return [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
}

/* ============================================================
   05 — TES INSIDE JOKES
   Une expression (2 a 4 mots), repetee au moins 5 fois, concentree a 90 %+
   dans UNE conversation, et cette conversation fait partie de ton top 10
   (chapitre 01). C'est ce qui la distingue du 04 : un mot qu'on dit partout
   n'est pas une blague, une expression qu'on ne dit qu'a une personne l'est.
   ============================================================ */
function ngrammes(tokens: string[], n: number): string[] {
  const res: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) res.push(tokens.slice(i, i + n).join(' '));
  return res;
}

function chapitre05(conversations: Conversation[], soi: string, top10Dossiers: Set<string>) {
  // Frequence globale de chaque expression, tous messages confondus.
  const globalPar = new Map<string, number>();
  const parConversation = new Map<string, Map<string, number>>();

  for (const c of conversations) {
    const local = new Map<string, number>();
    for (const m of c.messages) {
      if (!m.content) continue;
      const tokens = tokeniser(m.content);
      for (const n of [2, 3, 4]) {
        for (const g of ngrammes(tokens, n)) {
          if (g.split(' ').every((mot) => MOTS_VIDES.has(mot))) continue;
          local.set(g, (local.get(g) ?? 0) + 1);
          globalPar.set(g, (globalPar.get(g) ?? 0) + 1);
        }
      }
    }
    parConversation.set(c.dossier, local);
  }

  type Candidate = { dossier: string; titre: string; expression: string; occurrences: number; concentration: number };
  const candidats: Candidate[] = [];

  for (const c of conversations) {
    if (!top10Dossiers.has(c.dossier)) continue;
    const local = parConversation.get(c.dossier)!;
    let meilleur: Candidate | null = null;
    for (const [expr, n] of local.entries()) {
      if (n < 5) continue;
      const total = globalPar.get(expr) ?? n;
      const concentration = n / total;
      if (concentration < 0.9) continue;
      if (!meilleur || n > meilleur.occurrences) {
        meilleur = { dossier: c.dossier, titre: c.titre, expression: expr, occurrences: n, concentration };
      }
    }
    if (meilleur) candidats.push(meilleur);
  }

  return candidats.sort((a, b) => b.occurrences - a.occurrences);
}

/* ============================================================
   06 — TES CINQ RECORDS  (1:1 uniquement, pour un « avec qui » net)
   ============================================================ */
// Formatter reutilise : en construire un par message (au lieu d'un par
// comparaison) fait passer le chapitre de plusieurs dizaines de secondes a
// quelques centaines de millisecondes.
const FMT_HEURE_MIN = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
function minutesDansLaJournee(ts: number): number {
  const [h, m] = FMT_HEURE_MIN.format(new Date(ts)).split(':').map(Number);
  return h * 60 + m;
}

// En dessous, une "reponse" est presque toujours le meme envoi Instagram
// coupe en plusieurs messages (photo + legende, deux pieces jointes...),
// jamais un vrai aller-retour entre deux personnes.
const SEUIL_REPONSE_RAPIDE_MS = 2000;

function chapitre06(conversations: Conversation[], soi: string) {
  let plusTardif: { ts: number; avec: string; minutes: number } | null = null;
  let remisInflige: { ms: number; ts: number; avec: string } | null = null; // toi -> lent a repondre
  let remisSubi: { ms: number; ts: number; avec: string } | null = null;    // l'autre -> lent a repondre
  let reponseRapide: { ms: number; ts: number; avec: string } | null = null;
  const messagesParJour = new Map<string, number>();

  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    const est1to1 = c.participants.length === 2 && autres.length === 1;
    const avec = est1to1 ? identifiantAffichable(c, autres[0]) : c.titre;

    for (const m of c.messages) {
      const jour = new Date(m.ts).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
      messagesParJour.set(jour, (messagesParJour.get(jour) ?? 0) + 1);
    }

    if (!est1to1) continue;

    for (let i = 0; i < c.messages.length; i++) {
      const m = c.messages[i];
      if (m.sender === soi) {
        const minutes = minutesDansLaJournee(m.ts);
        if (!plusTardif || minutes > plusTardif.minutes) plusTardif = { ts: m.ts, avec, minutes };
      }
      if (i === 0) continue;
      const prec = c.messages[i - 1];
      if (prec.sender !== m.sender) {
        const delta = m.ts - prec.ts;
        if (delta <= 0) continue;
        if (prec.sender !== soi && m.sender === soi) {
          // l'autre a parle, tu reponds : ton delai a toi
          if (!remisInflige || delta > remisInflige.ms) remisInflige = { ms: delta, ts: m.ts, avec };
          // En dessous du seuil, c'est presque toujours le meme envoi coupe en
          // deux messages par Instagram (ex: photo + legende), pas un humain
          // qui a vraiment repondu en une fraction de seconde.
          if (delta >= SEUIL_REPONSE_RAPIDE_MS && (!reponseRapide || delta < reponseRapide.ms)) {
            reponseRapide = { ms: delta, ts: m.ts, avec };
          }
        } else if (prec.sender === soi && m.sender !== soi) {
          // tu as parle, l'autre reponds : son delai a lui
          if (!remisSubi || delta > remisSubi.ms) remisSubi = { ms: delta, ts: m.ts, avec };
        }
      }
    }
  }

  const jourRecord = [...messagesParJour.entries()].sort((a, b) => b[1] - a[1])[0];

  return { plusTardif, remisInflige, remisSubi, reponseRapide, jourRecord };
}

/* ============================================================
   07 — PREMIER ET DERNIER
   ============================================================ */
function chapitre07(conversations: Conversation[], soi: string) {
  let premier: { ts: number; avec: string } | null = null;
  let dernier: { ts: number; avec: string } | null = null;
  for (const c of conversations) {
    for (const m of c.messages) {
      if (!premier || m.ts < premier.ts) premier = { ts: m.ts, avec: c.titre || c.participants.filter((p) => p !== soi).join(', ') };
      if (!dernier || m.ts > dernier.ts) dernier = { ts: m.ts, avec: c.titre || c.participants.filter((p) => p !== soi).join(', ') };
    }
  }
  return { premier, dernier };
}

/* ============================================================
   08 — TON PROFIL RELATIONNEL (4 axes, usage interne uniquement)
   Le script les imprime pour qu'on regarde de vrais chiffres et qu'on
   ecrive ensemble la regle de classement. Le site, lui, n'affichera JAMAIS
   ces nombres : uniquement le profil final en clair.
   ============================================================ */
function chapitre08(conversations: Conversation[], soi: string) {
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
    const totalToi = c.messages.filter((m) => m.sender === soi).length;
    const totalAutre = c.messages.length - totalToi;
    if (totalToi + totalAutre >= 5) {
      partenairesActifs.add(c.dossier);
      conversationsCompteesPourLancement++;
      if (c.messages[0].sender === soi) lancements++;
    }
    for (let i = 1; i < c.messages.length; i++) {
      const prec = c.messages[i - 1], cur = c.messages[i];
      if (prec.sender !== soi && cur.sender === soi) {
        const delta = cur.ts - prec.ts;
        if (delta > 0 && delta < 7 * 86_400_000) deltasReponse.push(delta / 60_000); // minutes
      }
    }
  }

  for (const c of conversations) {
    for (const m of c.messages) {
      if (m.sender === soi && m.content) longueursMessages.push(m.content.length);
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
   MAIN
   ============================================================ */
function main() {
  const t0 = Date.now();
  const conversations = chargerConversations();
  const soi = detecterSoi(conversations);
  console.log(`Chargé : ${conversations.length} conversations. Toi = "${soi}".\n`);

  console.log('='.repeat(60));
  console.log('01 — TON CERCLE RÉEL (top 10, 1:1)');
  console.log('='.repeat(60));
  const c01 = chapitre01(conversations, soi);
  console.table(c01);

  console.log('\n' + '='.repeat(60));
  console.log('02 — TES GROUPES');
  console.log('='.repeat(60));
  const c02 = chapitre02(conversations, soi);
  if (c02.abandon) {
    console.log(`Aucun groupe actif (≥${SEUIL_MESSAGES_ACTIF} messages, actif dans les ${SEUIL_JOURS_RECENCE} derniers jours) sur ${c02.totalGroupes} groupes au total.`);
    console.log('→ Affiche à prévoir : « Tes groupes à l’abandon ».');
  } else {
    console.log(`${c02.actifs.length} groupe(s) actif(s) sur ${c02.totalGroupes} au total.\n`);
    const cat = c02.categories!;
    console.log('QG (le plus vivant)      :', cat.qg?.titre, `— ${cat.qg?.totalMessages} messages`);
    console.log('Le plus bondé             :', cat.leBondé?.titre, `— ${cat.leBondé?.membres} membres`);
    console.log('Tu débites ici            :', cat.tuDebites?.titre, `— toi: ${cat.tuDebites?.toiEnvoyes} messages`);
    console.log('Ton groupe inutile        :', cat.inutile?.titre, `— toi: ${((cat.inutile?.toiPart ?? 0) * 100).toFixed(1)}% des messages (${cat.inutile?.toiEnvoyes}/${cat.inutile?.totalMessages})`);
    console.log('Le ring                   :', cat.leRing ? `${cat.leRing.titre} — ${cat.leRing.insultes} vannes/insultes (${(cat.leRing.tauxInsultes * 100).toFixed(1)}% des messages)` : '(aucune insulte détectée, catégorie vide)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('03 — QUI NE TE SUIT PAS EN RETOUR');
  console.log('='.repeat(60));
  const c03 = chapitre03();
  console.log(`${c03.length} comptes.`);
  console.log(c03.slice(0, 30).join(', ') + (c03.length > 30 ? `, … (+${c03.length - 30})` : ''));

  console.log('\n' + '='.repeat(60));
  console.log('04 — TES MOTS (top 15, hors mots vides)');
  console.log('='.repeat(60));
  console.table(chapitre04(conversations, soi).map(([mot, n]) => ({ mot, occurrences: n })));

  console.log('\n' + '='.repeat(60));
  console.log('05 — TES INSIDE JOKES (top 10 uniquement)');
  console.log('='.repeat(60));
  const top10Dossiers = new Set<string>();
  // Retrouver le dossier de chaque ligne du chapitre 01.
  for (const c of conversations) {
    const autres = c.participants.filter((p) => p !== soi);
    if (c.participants.length !== 2 || autres.length !== 1) continue;
    const id = identifiantAffichable(c, autres[0]);
    if (c01.some((l) => l.qui === id)) top10Dossiers.add(c.dossier);
  }
  const c05 = chapitre05(conversations, soi, top10Dossiers);
  if (c05.length === 0) {
    console.log('Aucune expression assez concentrée trouvée (seuils : ≥5 occurrences, ≥90% dans une conv du top 10).');
  } else {
    console.table(c05.slice(0, 10).map((c) => ({
      conversation: c.titre || c.dossier, expression: c.expression,
      occurrences: c.occurrences, concentration: `${(c.concentration * 100).toFixed(0)}%`,
    })));
  }

  console.log('\n' + '='.repeat(60));
  console.log('06 — TES CINQ RECORDS');
  console.log('='.repeat(60));
  const c06 = chapitre06(conversations, soi);
  if (c06.plusTardif) console.log('Plus tardif        :', formatDate(c06.plusTardif.ts), 'avec', c06.plusTardif.avec);
  if (c06.remisInflige) console.log('Remis le + long (toi)   :', formatDureeJours(c06.remisInflige.ms), 'avec', c06.remisInflige.avec, '—', formatDate(c06.remisInflige.ts));
  if (c06.remisSubi) console.log('Remis le + long (subi)  :', formatDureeJours(c06.remisSubi.ms), 'avec', c06.remisSubi.avec, '—', formatDate(c06.remisSubi.ts));
  if (c06.reponseRapide) console.log('Réponse la + rapide     :', formatDureeCourte(c06.reponseRapide.ms), 'avec', c06.reponseRapide.avec);
  if (c06.jourRecord) console.log('Journée la + intense    :', c06.jourRecord[0], '—', c06.jourRecord[1], 'messages');

  console.log('\n' + '='.repeat(60));
  console.log('07 — PREMIER ET DERNIER');
  console.log('='.repeat(60));
  const c07 = chapitre07(conversations, soi);
  if (c07.premier) console.log('Premier :', formatDate(c07.premier.ts), '—', c07.premier.avec);
  if (c07.dernier) console.log('Dernier :', formatDate(c07.dernier.ts), '—', c07.dernier.avec);

  console.log('\n' + '='.repeat(60));
  console.log('08 — PROFIL RELATIONNEL (axes bruts, usage interne)');
  console.log('='.repeat(60));
  const c08 = chapitre08(conversations, soi);
  console.log('Qui lance (% de convs initiées par toi) :', `${(c08.axeQuiLance * 100).toFixed(1)}%`);
  console.log('Ampleur (partenaires actifs, ≥5 msg)     :', c08.axeAmpleur);
  console.log('Vitesse (délai médian de réponse)        :', `${c08.axeVitesseMinutes.toFixed(1)} min`);
  console.log('Longueur (taille médiane d’un message)   :', `${c08.axeLongueurCaracteres.toFixed(0)} caractères`);

  console.log(`\n(terminé en ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

main();
