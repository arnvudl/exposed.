/* ============================================================
   FAITS  /  bibliotheque de contenu selectionnable pour une carte
   Voir docs/CARTES_PERSONNALISABLES.md §4. Construit a partir des resultats
   BRUTS des 8 chapitres (pas des DonneesAffiche de la story) : la story
   figure certains faits en plusieurs cartes (ex. chapitre 01 -> reveal +
   top 10), le compositeur veut au contraire des faits ATOMIQUES et courts
   (top 3, jamais top 10) pour tenir a plusieurs sur une seule carte.
   ============================================================ */
import type {
  chapitre01, chapitre02, chapitre03, chapitre04, chapitre05, chapitre06, chapitre07,
} from '@/lib/wrapped/chapitres';
import { determinerProfil } from '@/lib/wrapped/profil';
import { profils as PROFILS_COMPLETS } from '@/content/revelations';

export type Fait =
  | { type: 'atomique'; label: string; chiffre: string; note: string }
  | { type: 'paire'; label: string; quand: string; avec: string; citation: string }
  | { type: 'mini-liste'; label: string; lignes: { rang: number; texte: string }[] };

/** Une entree par chapitre, presente seulement si ce chapitre a fini de
    calculer (le compositeur ne s'ouvre qu'une fois toute l'analyse
    terminee, mais le type reste partiel par prudence). */
export type DonneesBrutesChapitres = {
  1?: ReturnType<typeof chapitre01>;
  2?: ReturnType<typeof chapitre02>;
  3?: ReturnType<typeof chapitre03>;
  4?: ReturnType<typeof chapitre04>;
  5?: ReturnType<typeof chapitre05>;
  6?: ReturnType<typeof chapitre06>;
  7?: ReturnType<typeof chapitre07>;
};

const nb = (n: number) => n.toLocaleString('fr-FR');

// Petits utilitaires de mise en forme, duplique de lib/wrapped/mapper.ts :
// deux fichiers legers cote navigateur, meme raison que la-bas (pas d'acces
// fs pour partager avec le script Node).
function dateAvecAnnee(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
}
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
const MAX_CITATION = 90;
function citation(de: string, texte: string): string {
  const t = texte.length > MAX_CITATION ? `${texte.slice(0, MAX_CITATION).trimEnd()}…` : texte;
  return `${de} : « ${t} »`;
}

export function construireFaits(d: DonneesBrutesChapitres): Fait[] {
  const faits: Fait[] = [];

  if (d[1]?.length) {
    const top = d[1][0];
    faits.push({
      type: 'atomique', label: 'Chapitre 01 · Ton contact n°1',
      chiffre: String(top.total), note: `messages avec ${top.qui}.`,
    });
    if (d[1].length > 1) {
      faits.push({
        type: 'mini-liste', label: 'Chapitre 01 · Ton top 3 contacts',
        lignes: d[1].slice(0, 3).map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
      });
    }
  }

  if (d[2] && !d[2].abandon && d[2].categories) {
    const cat = d[2].categories;
    if (cat.qg) faits.push({ type: 'atomique', label: 'Chapitre 04 · Ton QG', chiffre: cat.qg.titre, note: `${nb(cat.qg.totalMessages)} messages, ton groupe le plus vivant.` });
    if (cat.leBondé) faits.push({ type: 'atomique', label: 'Chapitre 04 · Le plus bondé', chiffre: cat.leBondé.titre, note: `${nb(cat.leBondé.membres)} membres dans ce groupe.` });
    if (cat.tuDebites) faits.push({ type: 'atomique', label: 'Chapitre 04 · Tu débites ici', chiffre: nb(cat.tuDebites.toiEnvoyes), note: `messages de toi dans « ${cat.tuDebites.titre} ».` });
    if (cat.inutile) faits.push({ type: 'atomique', label: 'Chapitre 04 · Ton groupe inutile', chiffre: `${Math.round(cat.inutile.toiPart * 100)}%`, note: `de tes messages dans « ${cat.inutile.titre} ».` });
  }

  if (d[3]) {
    // Meme logique que la carte de la story (lib/wrapped/mapper.ts) : le
    // chiffre compare des comptes suivis sur la meme fenetre que les
    // abonnes connus (followingDansLaPeriode), jamais le total brut, sinon
    // il inclurait des annees que les abonnes ne couvrent pas. Ce fait part
    // en carte partageable, donc c'est ici que le disclaimer protege le
    // plus — celui qui partage ne doit pas se faire contredire par un
    // compte suivi de longue date qu'Instagram n'a pas remonte comme
    // abonne recent.
    const bornage = d[3].decalageDetecte ? ` depuis le ${d[3].depuisDate}` : '';
    faits.push({
      type: 'atomique', label: 'Chapitre 05 · Qui ne te suit pas en retour',
      chiffre: String(d[3].neSuiventPas.length),
      note: `sur ${nb(d[3].followingDansLaPeriode)} comptes suivis${bornage}, ${nb(d[3].followers)} ` +
        `abonnés. D’après l’export, pas en direct.`,
    });
  }

  if (d[4]?.top.length) {
    const [mot, occurrences] = d[4].top[0];
    faits.push({ type: 'atomique', label: 'Chapitre 02 · Ton mot signature', chiffre: `« ${mot} »`, note: `${nb(occurrences)} fois.` });
    if (d[4].top.length > 1) {
      faits.push({
        type: 'mini-liste', label: 'Chapitre 02 · Ton top 3 mots',
        lignes: d[4].top.slice(0, 3).map(([m, n], i) => ({ rang: i + 1, texte: `« ${m} » · ${nb(n)}` })),
      });
    }
    if (d[4].totalMessages > 0) {
      faits.push({
        type: 'atomique', label: 'Chapitre 02 · Ton total de messages',
        chiffre: nb(d[4].totalMessages), note: `${nb(d[4].totalMots)} mots tapés au total.`,
      });
    }
  }

  if (d[5]) {
    const r = d[5];
    if (r.remisInflige) faits.push({ type: 'atomique', label: 'Chapitre 06 · Le plus long remis (toi)', chiffre: dureeCourte(r.remisInflige.debut, r.remisInflige.ts), note: `avant que tu répondes à ${r.remisInflige.avec}.` });
    if (r.remisSubi) faits.push({ type: 'atomique', label: 'Chapitre 06 · Le plus long remis (subi)', chiffre: dureeCourte(r.remisSubi.debut, r.remisSubi.ts), note: `avant que ${r.remisSubi.avec} te réponde.` });
    if (r.reponseRapide) faits.push({ type: 'atomique', label: 'Chapitre 06 · Ta réponse la plus rapide', chiffre: formatDureeCourteLocale(r.reponseRapide.ms), note: `à ${r.reponseRapide.avec}.` });
    if (r.jourRecord) faits.push({ type: 'atomique', label: 'Chapitre 06 · Ta journée la plus intense', chiffre: nb(r.jourRecord.messages), note: `messages le ${r.jourRecord.date}.` });
    if (r.jourRecord?.topContacts.length) {
      faits.push({
        type: 'mini-liste', label: 'Chapitre 06 · Ce jour-là, surtout eux',
        lignes: r.jourRecord.topContacts.map((l, i) => ({ rang: i + 1, texte: `${l.qui} · ${nb(l.total)}` })),
      });
    }
    if (r.plusLongMessage) {
      faits.push({
        type: 'atomique', label: 'Chapitre 06 · Ton plus long message',
        chiffre: `${nb(r.plusLongMessage.longueur)} caractères`, note: `à ${r.plusLongMessage.avec}.`,
      });
    }
    if (r.tirade) {
      faits.push({
        type: 'atomique', label: 'Chapitre 06 · Ta plus longue tirade',
        chiffre: `${nb(r.tirade.messages)} messages`, note: `à la suite, sans réponse, à ${r.tirade.avec}.`,
      });
    }
  }

  if (d[6]?.premier) {
    const p = d[6].premier;
    faits.push({ type: 'paire', label: 'Chapitre 07 · Le premier message', quand: dateAvecAnnee(p.ts), avec: p.avec, citation: citation(p.de, p.message) });
  }
  if (d[6]?.dernier) {
    const p = d[6].dernier;
    faits.push({ type: 'paire', label: 'Chapitre 07 · Le dernier message', quand: dateAvecAnnee(p.ts), avec: p.avec, citation: citation(p.de, p.message) });
  }

  if (d[7] && (d[7].axeAmpleur > 0 || d[7].axeLongueurCaracteres > 0)) {
    const profil = determinerProfil(d[7]);
    const complet = PROFILS_COMPLETS.find((p) => p.nom === profil.nom);
    faits.push({
      type: 'atomique', label: 'Chapitre 08 · Ton profil relationnel',
      chiffre: profil.nom, note: complet ? complet.description : profil.note,
    });
  }

  return faits;
}
