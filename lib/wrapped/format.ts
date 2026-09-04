/* ============================================================
   FORMAT  /  mise en forme partagee des resultats
   ============================================================ */
import type { Message } from './parse';

const FMT_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
export function formatDate(ts: number): string {
  return FMT_DATE.format(new Date(ts));
}

/** Decoupe une duree en annees / mois / jours, calcule sur le vrai
    calendrier (pas une division par 365.25) : on part de la date de debut et
    on retire des annees puis des mois entiers avant de compter les jours
    restants, donc « 4 ans, 1 mois, 3 jours » veut vraiment dire ça. */
export function formatDureeDecoupee(debutMs: number, finMs: number): string {
  const d = new Date(debutMs);
  const fin = new Date(finMs);

  let annees = fin.getUTCFullYear() - d.getUTCFullYear();
  let mois = fin.getUTCMonth() - d.getUTCMonth();
  let jours = fin.getUTCDate() - d.getUTCDate();

  if (jours < 0) {
    mois -= 1;
    const dernierJourMoisPrecedent = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), 0)).getUTCDate();
    jours += dernierJourMoisPrecedent;
  }
  if (mois < 0) { annees -= 1; mois += 12; }

  const parties: string[] = [];
  if (annees > 0) parties.push(`${annees} an${annees > 1 ? 's' : ''}`);
  if (mois > 0) parties.push(`${mois} mois`);
  if (jours > 0 || parties.length === 0) parties.push(`${jours} jour${jours > 1 ? 's' : ''}`);
  return parties.join(', ');
}

export function formatDureeCourte(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const min = s / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  return `${(min / 60).toFixed(1)} h`;
}

/** Un aperçu court du message : le vrai texte, ou une etiquette si le
    message n'a pas de texte (photo, appel, message supprime...). */
export function apercu(m: Message | undefined): string {
  if (!m) return '';
  if (m.content) return m.content.length > 140 ? `${m.content.slice(0, 140)}…` : m.content;
  if (m.estSupprime) return '(message supprimé)';
  if (m.aDesMedias) return '(photo, vidéo ou audio, sans texte)';
  return '(message vide)';
}
