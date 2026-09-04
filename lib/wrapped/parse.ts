/* ============================================================
   PARSE  /  FileMap -> conversations utilisables
   FileMap est un Map<chemin, texte> construit depuis un ou plusieurs ZIP
   (voir zip.ts). Cette couche ne connait ni fs ni JSZip : elle prend une
   Map en entree, comme le fait scripts/analyse.mts avec le disque.
   ============================================================ */
import { decodeMojibake } from './decode';

export type FileMap = Map<string, string>;

export type Message = {
  sender: string;
  ts: number;
  content?: string;
  aDesMedias: boolean;
  estSupprime: boolean;
};

export type Conversation = {
  dossier: string;
  titre: string;
  participants: string[];
  messages: Message[];
};

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
const RE_MESSAGE_INBOX = /your_instagram_activity\/messages\/inbox\/([^/]+)\/(message_\d+\.json)$/;

export function chargerConversations(fichiers: FileMap): Conversation[] {
  const parDossier = new Map<string, { nomFichier: string; chemin: string }[]>();

  for (const chemin of fichiers.keys()) {
    const m = chemin.match(RE_MESSAGE_INBOX);
    if (!m) continue;
    const [, dossier, nomFichier] = m;
    if (!parDossier.has(dossier)) parDossier.set(dossier, []);
    parDossier.get(dossier)!.push({ nomFichier, chemin });
  }

  const conversations: Conversation[] = [];

  for (const [dossier, entrees] of parDossier) {
    // Certaines conversations tres longues sont decoupees en plusieurs
    // fichiers : on les fusionne dans l'ordre.
    entrees.sort((a, b) => Number(a.nomFichier.match(/\d+/)![0]) - Number(b.nomFichier.match(/\d+/)![0]));

    let titre = '';
    let participants: string[] = [];
    const messages: Message[] = [];

    for (const { chemin } of entrees) {
      const data = JSON.parse(fichiers.get(chemin)!);
      titre = decodeMojibake(data.title ?? '');
      participants = (data.participants ?? []).map((p: any) => decodeMojibake(p.name));
      for (const m of data.messages ?? []) {
        const contenuBrut = typeof m.content === 'string' ? decodeMojibake(m.content) : undefined;
        // Un texte systeme (« Not everyone can message this profile. »,
        // notification d'appel...) n'est pas un tour de conversation.
        if (contenuBrut && estContenuSysteme(contenuBrut)) continue;
        const aDesMedias = !!(m.photos?.length || m.videos?.length || m.audio_files?.length || m.share || m.call_duration != null);
        messages.push({
          sender: decodeMojibake(m.sender_name ?? ''),
          ts: m.timestamp_ms,
          content: contenuBrut,
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

/** Les fichiers followers_N.json / following.json, ou qu'ils se trouvent
    dans le ZIP (le dossier `connections` existe parfois en double). */
function nomsDepuisRelations(fichiers: FileMap, motif: RegExp, cle: string): Set<string> {
  const noms = new Set<string>();
  for (const [chemin, texte] of fichiers) {
    if (!motif.test(chemin)) continue;
    const data = JSON.parse(texte);
    const liste = Array.isArray(data) ? data : (data[cle] ?? []);
    for (const entree of liste) {
      const titre = entree.title;
      const valeur = entree.string_list_data?.[0]?.value;
      const identifiant = (titre && titre.length > 0 ? titre : valeur) as string | undefined;
      if (identifiant) noms.add(decodeMojibake(identifiant).toLowerCase());
    }
  }
  return noms;
}

export function chargerRelations(fichiers: FileMap) {
  const followers = nomsDepuisRelations(
    fichiers, /connections\/followers_and_following\/followers_\d+\.json$/, 'relationships_followers',
  );
  const following = nomsDepuisRelations(
    fichiers, /connections\/followers_and_following\/following\.json$/, 'relationships_following',
  );
  return { followers, following };
}
