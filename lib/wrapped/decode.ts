/* ============================================================
   DECODE  /  texte brut Instagram -> texte utilisable
   Porte depuis scripts/analyse.mts, valide sur un vrai export avant d'etre
   deplace ici. Aucune dependance a Node : ces fonctions tournent aussi bien
   dans un Web Worker que dans le script de developpement.
   ============================================================ */

/** Instagram encode l'UTF-8 puis le relit en Latin-1 : chaque octet devient
    un caractere. Le detour inverse restaure les accents et les emojis.
    Le meme bug existe cote navigateur (JSZip decode aussi en UTF-8), donc
    le correctif est identique des deux cotes. */
export function decodeMojibake(s: string): string {
  // TextDecoder/TextEncoder remplacent Buffer, absent du navigateur.
  const octets = Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
  return new TextDecoder('utf-8').decode(octets);
}

export function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const tri = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(tri.length / 2);
  return tri.length % 2 ? tri[milieu] : (tri[milieu - 1] + tri[milieu]) / 2;
}

export const MOTS_VIDES = new Set([
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
  // Mots frequents chez n'importe qui, pas des tics personnels : « rien du
  // tout » ou « il faut » se disent partout, ce n'est pas ta signature.
  'tout', 'tous', 'toute', 'toutes', 'même', 'meme', 'rien', 'là', 'la',
  'faut', 'fallait', 'faudrait', 'quand', 'parce', 'fais',
  // Contractions courantes : le tokeniseur les garde entieres maintenant
  // (« j'ai » plutot que « j » + « ai »), donc elles ont besoin de leur
  // propre entree ici.
  "j'ai", "j'suis", "c'est", "c'était", "c'etait", "n'est", "n'ai", "n'a",
  "qu'il", "qu'elle", "qu'on", "t'as", "y'a", "s'il", "s'en", "d'accord",
]);

// Une seule lettre etiree ("eeeeeeeeee", "aaaaah" version pure) n'est pas un
// mot : c'est un cri ou un rire clavier, pas un token comparable aux autres.
const LETTRE_ETIREE = /^(.)\1{3,}$/;

export function tokeniser(texte: string): string[] {
  return (texte
    .toLowerCase()
    .replace(/[’]/g, "'")
    // L'apostrophe reste attachee au mot : « l'inutilité » est un seul token,
    // pas « l » puis « inutilité » separement.
    .match(/[a-zàâäéèêëïîôöùûüÿçœæ]+(?:'[a-zàâäéèêëïîôöùûüÿçœæ]+)*/gi) ?? [])
    .map((t) => t.toLowerCase())
    .filter((t) => !LETTRE_ETIREE.test(t));
}
