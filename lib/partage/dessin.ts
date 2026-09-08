/* ============================================================
   DESSIN  /  primitives Canvas2D partagees entre les themes
   Rien ici ne connait un theme precis : ce sont des outils generiques
   (rectangle arrondi, retour a la ligne, degrade) reutilises par
   lib/partage/themes.ts. Voir docs/CARTES_PERSONNALISABLES.md §6.
   ============================================================ */

/** Rectangle a coins arrondis choisis un par un (les coins non demandes
    restent droits) : Canvas2D n'a pas d'equivalent a border-radius CSS
    par coin, donc on le construit a la main une fois pour toutes. */
export function tracerRectArrondi(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  rayons: { hautGauche?: number; hautDroit?: number; basGauche?: number; basDroit?: number } = {},
): void {
  const { hautGauche: hg = 0, hautDroit: hd = 0, basGauche: bg = 0, basDroit: bd = 0 } = rayons;
  ctx.beginPath();
  ctx.moveTo(x + hg, y);
  ctx.lineTo(x + w - hd, y);
  ctx.arcTo(x + w, y, x + w, y + hd, hd);
  ctx.lineTo(x + w, y + h - bd);
  ctx.arcTo(x + w, y + h, x + w - bd, y + h, bd);
  ctx.lineTo(x + bg, y + h);
  ctx.arcTo(x, y + h, x, y + h - bg, bg);
  ctx.lineTo(x, y + hg);
  ctx.arcTo(x, y, x + hg, y, hg);
  ctx.closePath();
}

/** Retour a la ligne simple par mesure de largeur : les textes des faits
    sont courts et deja tronques en amont (cf. mapper.ts), un decoupage
    mot par mot suffit, pas besoin d'un moteur de wrap complet. Renvoie le
    nombre de lignes ecrites, pour que l'appelant sache combien d'espace
    a ete pris. */
export function envelopperTexte(
  ctx: CanvasRenderingContext2D, texte: string, x: number, y: number,
  largeurMax: number, interligne: number, alignement: 'gauche' | 'centre' = 'gauche',
): number {
  const mots = texte.split(' ');
  const lignes: string[] = [];
  let ligne = '';
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  if (ligne) lignes.push(ligne);

  const ancienAlign = ctx.textAlign;
  ctx.textAlign = alignement === 'centre' ? 'center' : 'left';
  const xEcriture = alignement === 'centre' ? x + largeurMax / 2 : x;
  lignes.forEach((l, i) => ctx.fillText(l, xEcriture, y + i * interligne));
  ctx.textAlign = ancienAlign;

  return lignes.length;
}

/** Dessine une image en « cover » (comme `object-fit: cover` CSS) : elle
    remplit tout le rectangle cible sans se deformer, l'exces est rogne et
    centre. Utilise pour poser la photo personnelle dans n'importe quel
    cadre (fond plein cadre, carre du polaroid, vignette ronde du badge). */
export function dessinerPhotoCouverture(
  ctx: CanvasRenderingContext2D,
  photo: ImageBitmap,
  x: number, y: number, w: number, h: number,
): void {
  const ratioCible = w / h;
  const ratioSource = photo.width / photo.height;
  let sx = 0, sy = 0, sw = photo.width, sh = photo.height;
  if (ratioSource > ratioCible) {
    sw = photo.height * ratioCible;
    sx = (photo.width - sw) / 2;
  } else {
    sh = photo.width / ratioCible;
    sy = (photo.height - sh) / 2;
  }
  ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h);
}

/** Meme chose, mais rognee en cercle : la vignette « photo d'identite » du
    theme Badge quand une vraie photo est importee. */
export function dessinerPhotoRonde(
  ctx: CanvasRenderingContext2D, photo: ImageBitmap, cx: number, cy: number, rayon: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
  ctx.clip();
  dessinerPhotoCouverture(ctx, photo, cx - rayon, cy - rayon, rayon * 2, rayon * 2);
  ctx.restore();
}

/** Trame de points (comme .trame dans Affiche.module.css) : sert a habiller
    une photo en « photocopie basse resolution » plutot que de la montrer
    nette, dans l'esprit du theme Ticket de caisse. */
export function dessinerTrame(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pas: number, couleur: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = couleur;
  for (let py = y; py < y + h + pas; py += pas) {
    for (let px = x; px < x + w + pas; px += pas) {
      ctx.beginPath();
      ctx.arc(px, py, pas * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Repartit 1 a 3 faits dans une zone verticale libre (cf.
    docs/CARTES_PERSONNALISABLES.md §5) : plus il y en a, plus chaque bande
    est petite et l'echelle de police reduite, pour que rien ne deborde ni
    ne laisse un vide flagrant. Fonction pure, testable sans canvas. */
export type BlocMiseEnPage<T> = { fait: T; y: number; hauteur: number; echelle: number };

export function calculerMiseEnPage<T>(faits: T[], zoneY: number, zoneH: number): BlocMiseEnPage<T>[] {
  const n = Math.min(faits.length, 3);
  if (n === 0) return [];
  const hauteurBloc = zoneH / n;
  const echelle = n === 1 ? 1 : n === 2 ? 0.62 : 0.46;
  return faits.slice(0, n).map((fait, i) => ({ fait, y: zoneY + i * hauteurBloc, hauteur: hauteurBloc, echelle }));
}

/** Degrade lineaire generique, angle en degres (0 = gauche->droite,
    90 = haut->bas), utilise comme substitut visuel a une vraie photo tant
    qu'aucune n'a ete importee (etapes 1-2 ; l'import reel arrive §7 du doc). */
export function degradePlaceholder(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  arrets: [number, string][], angleDeg: number,
): void {
  const rad = (angleDeg * Math.PI) / 180;
  const cx = x + w / 2, cy = y + h / 2;
  const demiDiag = Math.sqrt(w * w + h * h) / 2;
  const dx = Math.cos(rad) * demiDiag, dy = Math.sin(rad) * demiDiag;
  const degrade = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  for (const [pos, couleur] of arrets) degrade.addColorStop(pos, couleur);
  ctx.fillStyle = degrade;
  ctx.fillRect(x, y, w, h);
}
