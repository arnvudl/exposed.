/* ============================================================
   RENDU  /  dessine une carte (theme + 1-3 faits + photo eventuelle) dans
   un canvas, au format story (1080x1920). Voir
   docs/CARTES_PERSONNALISABLES.md §6. Le fond est rempli ici (commun a
   tous les themes) ; chaque theme dessine ensuite son propre decor, sa
   propre repartition des faits et son propre traitement photo
   (lib/partage/themes.ts).
   ============================================================ */
import type { Theme } from './themes';
import type { Fait } from './faits';

export const LARGEUR = 1080;
export const HAUTEUR = 1920;
export const MAX_FAITS = 3;

export async function dessinerCarte(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  faits: Fait[],
  photo?: ImageBitmap,
): Promise<void> {
  // Les polices auto-hebergees peuvent ne pas encore etre decodees au tout
  // premier rendu : dessiner avant que `fonts.ready` soit resolu donne un
  // texte silencieusement rendu dans la police de repli, sans erreur.
  await document.fonts.ready;

  ctx.clearRect(0, 0, LARGEUR, HAUTEUR);
  ctx.fillStyle = theme.fond;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);

  if (faits.length > 0) {
    theme.dessiner(ctx, { w: LARGEUR, h: HAUTEUR }, faits.slice(0, MAX_FAITS), photo);
  }
}
