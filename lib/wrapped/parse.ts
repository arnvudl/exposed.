/* ============================================================
   PARSE  /  fichiers .json (lus au fil du ZIP) -> conversations utilisables
   Contrairement a une FileMap qui garderait le texte de tous les fichiers en
   memoire, l'Accumulateur ingere un fichier a la fois (voir zip.ts) : le
   texte d'un message_N.json est parse puis relache aussitot. Message ne
   garde plus le texte complet (`content`) : chaque chapitre a ete relu pour
   verifier qu'aucun n'en a besoin apres le parsing (voir docs/GROS_EXPORTS_MOBILE.md
   §3), seulement un aperçu court et sa longueur.
   ============================================================ */
import { decodeMojibake, tokeniser, MOTS_VIDES } from './decode';
import { apercu } from './format';
import { compteInsultes } from './lexique';

export type Message = {
  /** Index dans `expediteurs` (voir Conversation) : une chaine par message
      couterait dix fois plus cher qu'un entier sur un export de plusieurs
      centaines de milliers de messages. */
  sender: number;
  ts: number;
  apercu: string;
  longueur: number;
  aDesMedias: boolean;
  estSupprime: boolean;
};

export type Conversation = {
  dossier: string;
  titre: string;
  /** Roster officiel de la conversation (champ `participants` d'Instagram) :
      sert au compte de membres, a la detection des 1:1 et de `soi`. Ne
      contient jamais un expediteur ajoute a la volee (voir `expediteurs`). */
  participants: string[];
  /** Sert uniquement a interner `Message.sender` (un entier plutot qu'une
      chaine par message). Construit a partir des vrais expediteurs de
      messages, PAS de `participants` : un message peut venir de quelqu'un
      qui a quitte le groupe (donc absent de `participants`), ce tableau le
      gere naturellement, sans jamais toucher au compte de membres. Les
      index sont stables : on n'ajoute qu'a la fin. */
  expediteurs: string[];
  messages: Message[];
  /** Nombre total d'insultes (tous expediteurs confondus), compte au moment
      du parse pendant que le texte existe encore (chapitre02). */
  insultes: number;
};

/** Le nom de l'expediteur d'un message. */
export function nomExpediteur(conv: Conversation, m: Message): string {
  return conv.expediteurs[m.sender];
}

export const COMPTE_SUPPRIME = 'Utilisateur Instagram';

/* Instagram stocke ses messages systeme en ANGLAIS, meme sur un export dont
   toute l'interface est en francais. Les deux langues sont donc necessaires
   ici, sinon "X started an audio call" pollue les mots. */
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
  /Not everyone can message this profile/i, /This person is unable to receive messages/i,
  /Your message request has been (accepted|declined)/i, /You can't reply to this conversation/i,
  /unsent a message/i, /set the disappearing message/i,
];
function estContenuSysteme(c: string): boolean {
  return MOTS_SYSTEME.some((re) => re.test(c));
}

/** Cherche les fichiers `message_N.json` de l'inbox, peu importe le prefixe
    exact devant `your_instagram_activity/messages/inbox/` (un ZIP peut etre
    enveloppe dans un dossier portant le nom du compte). */
const RE_MESSAGE_INBOX = /your_instagram_activity\/messages\/inbox\/([^/]+)\/message_\d+\.json$/;

const RE_FOLLOWERS = /connections\/followers_and_following\/followers_\d+\.json$/;
const RE_FOLLOWING = /connections\/followers_and_following\/following\.json$/;

/** Les fichiers followers_N.json / following.json ont la meme forme : soit
    un tableau direct, soit un objet avec une cle contenant le tableau. */
function nomsDepuisRelations(texte: string, cle: string): string[] {
  const data = JSON.parse(texte);
  const liste = Array.isArray(data) ? data : (data[cle] ?? []);
  const noms: string[] = [];
  for (const entree of liste) {
    const titre = entree.title;
    const valeur = entree.string_list_data?.[0]?.value;
    const identifiant = (titre && titre.length > 0 ? titre : valeur) as string | undefined;
    if (identifiant) noms.push(decodeMojibake(identifiant).toLowerCase());
  }
  return noms;
}

type ConversationEnCours = {
  titre: string;
  participants: string[];
  expediteurs: string[];
  messages: Message[];
  insultes: number;
};

/** Plage optionnelle sur `timestamp_ms` : chaque borne absente laisse ce
    cote-la ouvert (`debut` seul = "depuis cette date", `fin` seul =
    "jusqu'a cette date"). Rien ne filtre quand l'objet est vide. */
export type Periode = { debut?: number; fin?: number };

/** Accumule, fichier par fichier, ce que les ZIP contiennent : appeler
    `ingerer` pour chaque entree `.json` lue (voir zip.ts), dans un ordre
    quelconque — y compris entre plusieurs ZIP d'un meme export decoupe en
    parties. Rien n'est conclu avant `terminer()`. Le texte d'un fichier n'est
    jamais garde : seul ce qui est extrait ci-dessous survit a l'appel. */
export class Accumulateur {
  private parDossier = new Map<string, ConversationEnCours>();
  private followers = new Set<string>();
  private following = new Set<string>();
  /** Compte de mots par expediteur (nom brut), tous dossiers confondus : on
      ne sait pas encore qui est `soi` pendant le parse (il faut avoir tout
      lu pour le deviner), donc chapitre04 ne peut pas filtrer avant coup.
      Une fois `soi` connu, seule son entree est gardee (voir chapitres.ts). */
  private motsParExpediteur = new Map<string, Map<string, number>>();

  constructor(private periode: Periode = {}) {}

  /** Un message hors de la periode choisie ne doit exister nulle part : ni
      dans `messages`, ni dans le compte de mots, ni dans les insultes. Filtrer
      ici, au seul endroit qui voit chaque message avant que son contenu soit
      jete, evite de refiltrer separement chacun des 7 chapitres. */
  private horsPeriode(ts: number): boolean {
    const { debut, fin } = this.periode;
    return (debut != null && ts < debut) || (fin != null && ts > fin);
  }

  ingerer(chemin: string, texte: string): void {
    const mInbox = chemin.match(RE_MESSAGE_INBOX);
    if (mInbox) {
      const dossier = mInbox[1];
      let entree = this.parDossier.get(dossier);
      if (!entree) {
        entree = { titre: '', participants: [], expediteurs: [], messages: [], insultes: 0 };
        this.parDossier.set(dossier, entree);
      }
      const data = JSON.parse(texte);
      entree.titre = decodeMojibake(data.title ?? '');
      // `participants` reste ecrase a chaque fichier, exactement comme
      // avant le refactor (y compris d'eventuels doublons du JSON source) :
      // c'est ce que comptent chapitre02 (membres) et la detection des 1:1,
      // et ca ne doit pas bouger d'un refactor purement interne. `expediteurs`
      // n'en depend pas : il est construit uniquement a partir des vrais
      // expediteurs de messages (voir plus bas), donc gere nativement le cas
      // d'un expediteur parti du groupe (absent de `participants`).
      entree.participants = (data.participants ?? []).map((p: any) => decodeMojibake(p.name));
      for (const m of data.messages ?? []) {
        if (this.horsPeriode(m.timestamp_ms)) continue;

        const contenuBrut = typeof m.content === 'string' ? decodeMojibake(m.content) : undefined;
        // Un texte systeme (« Not everyone can message this profile. »,
        // notification d'appel...) n'est pas un tour de conversation.
        if (contenuBrut && estContenuSysteme(contenuBrut)) continue;

        const nomExp = decodeMojibake(m.sender_name ?? '');
        let idx = entree.expediteurs.indexOf(nomExp);
        if (idx === -1) {
          entree.expediteurs.push(nomExp);
          idx = entree.expediteurs.length - 1;
        }

        const aDesMedias = !!(m.photos?.length || m.videos?.length || m.audio_files?.length || m.share || m.call_duration != null);
        const estSupprime = !!m.is_unsent;
        entree.messages.push({
          sender: idx,
          ts: m.timestamp_ms,
          apercu: apercu(contenuBrut, estSupprime, aDesMedias),
          longueur: contenuBrut?.length ?? 0,
          aDesMedias,
          estSupprime,
        });

        if (contenuBrut) {
          entree.insultes += compteInsultes(contenuBrut);

          let motsExp = this.motsParExpediteur.get(nomExp);
          if (!motsExp) { motsExp = new Map(); this.motsParExpediteur.set(nomExp, motsExp); }
          for (const mot of tokeniser(contenuBrut)) {
            if (mot.length < 2 || MOTS_VIDES.has(mot)) continue;
            motsExp.set(mot, (motsExp.get(mot) ?? 0) + 1);
          }
        }
      }
      return;
    }
    if (RE_FOLLOWERS.test(chemin)) {
      for (const n of nomsDepuisRelations(texte, 'relationships_followers')) this.followers.add(n);
      return;
    }
    if (RE_FOLLOWING.test(chemin)) {
      for (const n of nomsDepuisRelations(texte, 'relationships_following')) this.following.add(n);
      return;
    }
  }

  terminer(): {
    conversations: Conversation[];
    followers: Set<string>;
    following: Set<string>;
    motsParExpediteur: Map<string, Map<string, number>>;
  } {
    const conversations: Conversation[] = [];
    for (const [dossier, { titre, participants, expediteurs, messages, insultes }] of this.parDossier) {
      // Les fichiers message_N.json d'une meme conversation peuvent arriver
      // dans un ordre quelconque : seul l'ordre final par `ts` compte.
      messages.sort((a, b) => a.ts - b.ts);
      conversations.push({ dossier, titre, participants, expediteurs, messages, insultes });
    }
    return { conversations, followers: this.followers, following: this.following, motsParExpediteur: this.motsParExpediteur };
  }
}

/** Le participant present dans le plus de conversations, c'est toi. Evite
    de coder un nom en dur : ca marche pour n'importe quel export. */
export function detecterSoi(conversations: Conversation[]): string {
  const compte = new Map<string, number>();
  for (const c of conversations) {
    for (const p of new Set(c.participants)) compte.set(p, (compte.get(p) ?? 0) + 1);
  }
  return [...compte.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

/** Pour les 1:1 seulement : le nom de dossier suit `identifiant_id`. Quand
    l'identifiant est un pseudo lisible (pas de l'emoji illisible), c'est le
    vrai @ de l'autre personne. Sinon on retombe sur son nom affiche. */
export function identifiantAffichable(conv: Conversation, autre: string): string {
  const m = conv.dossier.match(/^([a-zA-Z0-9._]+)_\d+$/);
  return m ? `@${m[1]}` : autre;
}
