/* ============================================================
   LEXIQUE  /  detection d'insultes dans un message
   Deplace hors de chapitres.ts pour etre appelable depuis parse.ts : le
   compte d'insultes d'une conversation est desormais accumule au moment du
   parse (pendant qu'on a encore le texte), pas recalcule plus tard sur
   `content` (qui a disparu de Message pour economiser la memoire).
   ============================================================ */
const MOTS_INSULTES = [
  'connard', 'connasse', 'abruti', 'abrutie', 'débile', 'con', 'conne',
  'idiot', 'idiote', 'pute', 'salope', 'bâtard', 'batard', 'merde',
  'enculé', 'enculée', 'crétin', 'crétine', 'stupide', 'ntm', 'ta gueule',
];

export function compteInsultes(texte: string): number {
  const t = texte.toLowerCase();
  let n = 0;
  for (const mot of MOTS_INSULTES) {
    const re = new RegExp(`\\b${mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    n += (t.match(re) ?? []).length;
  }
  return n;
}
