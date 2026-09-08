/* ============================================================
   THEMES  /  habillages du compositeur de partage
   Voir docs/CARTES_PERSONNALISABLES.md §3 et §5. Chaque theme dessine son
   decor (et son traitement photo eventuel) une seule fois, puis pose 1 a 3
   faits dans sa propre « zone libre » via le renderer partage
   `dessinerBlocsFaits`, qui gere la repartition dynamique (calculerMiseEnPage)
   et le rendu de chaque type de fait (atomique / paire / mini-liste).
   Les couleurs sont en hex, jamais en var() ni color-mix() (Canvas2D ne
   comprend ni l'un ni l'autre).
   ============================================================ */
import type { Fait } from './faits';
import {
  calculerMiseEnPage, degradePlaceholder, dessinerPhotoCouverture, dessinerPhotoRonde,
  dessinerTrame, envelopperTexte, tracerRectArrondi,
} from './dessin';

export type IdTheme = 'dossier' | 'polaroid' | 'argentique' | 'tabloid' | 'ticket' | 'badge';

export type Theme = {
  id: IdTheme;
  nom: string;
  /** Couleur de fond quand il n'y a pas de photo personnelle. */
  fond: string;
  /** `photo`, si fournie, remplace tout ou partie du fond selon le theme
      (cf. §3 du doc) : jamais juste posee telle quelle, toujours habillee
      par le theme pour rester lisible et garder son identite. `faits` va
      de 1 a 3 elements (§5). */
  dessiner(ctx: CanvasRenderingContext2D, taille: { w: number; h: number }, faits: Fait[], photo?: ImageBitmap): void;
};

const INK = '#141414';
const PAPER = '#F3EFE6';
const SIGNAL = '#E8442A';

type Palette = {
  couleurTitre: string;
  couleurNote: string;
  familleTitre: string;
  familleNote: string;
  alignement?: 'gauche' | 'centre';
};

/** Dessine 1 a 3 faits dans une zone verticale libre : c'est le seul
    endroit ou la mise en page depend du nombre de faits choisis, chaque
    theme n'a qu'a definir sa zone et sa palette. */
function dessinerBlocsFaits(
  ctx: CanvasRenderingContext2D,
  zone: { x: number; y: number; w: number; h: number },
  faits: Fait[],
  palette: Palette,
): void {
  const blocs = calculerMiseEnPage(faits, zone.y, zone.h);
  const align = palette.alignement ?? 'gauche';

  blocs.forEach(({ fait, y, echelle }, i) => {
    if (i > 0) {
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = palette.couleurNote;
      ctx.lineWidth = zone.w * 0.0018;
      ctx.beginPath(); ctx.moveTo(zone.x, y); ctx.lineTo(zone.x + zone.w, y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const padHaut = i > 0 ? zone.w * 0.035 : 0;
    dessinerUnFait(ctx, fait, zone.x, y + padHaut, zone.w, echelle, palette, align);
  });
}

function dessinerUnFait(
  ctx: CanvasRenderingContext2D, fait: Fait, x: number, y: number, w: number,
  echelle: number, palette: Palette, align: 'gauche' | 'centre',
): void {
  const xEcr = align === 'centre' ? x + w / 2 : x;

  if (fait.type === 'mini-liste') {
    const tailleLigne = w * 0.052 * echelle;
    ctx.font = `700 ${Math.round(tailleLigne)}px ${palette.familleNote}`;
    ctx.fillStyle = palette.couleurTitre;
    ctx.textAlign = align === 'centre' ? 'center' : 'left';
    // 3 lignes normalement, 2 seulement quand la carte est deja tres
    // chargee (3 faits, echelle reduite) pour ne pas deborder de sa bande.
    const maxLignes = echelle < 0.5 ? 2 : 3;
    fait.lignes.slice(0, maxLignes).forEach((l, i) => {
      ctx.fillText(`${String(l.rang).padStart(2, '0')}  ${l.texte}`, xEcr, y + tailleLigne * 1.35 * (i + 1));
    });
    ctx.textAlign = 'left';
    return;
  }

  if (fait.type === 'paire') {
    ctx.fillStyle = palette.couleurNote;
    ctx.globalAlpha = 0.75;
    ctx.font = `500 ${Math.round(w * 0.026 * echelle)}px "JetBrains Mono", monospace`;
    ctx.textAlign = align === 'centre' ? 'center' : 'left';
    ctx.fillText(fait.quand, xEcr, y + w * 0.026 * echelle);
    ctx.globalAlpha = 1;

    ctx.fillStyle = palette.couleurTitre;
    ctx.font = `800 ${Math.round(w * 0.1 * echelle)}px ${palette.familleTitre}`;
    const yAvec = y + w * 0.09 * echelle;
    // envelopperTexte attend le bord GAUCHE de la zone (x, pas xEcr) : elle
    // calcule elle-meme le centrage a partir de `largeurMax` quand demande.
    const nL = envelopperTexte(ctx, fait.avec, x, yAvec, w, w * 0.1 * echelle * 0.95, align);

    ctx.font = `400 ${Math.round(w * 0.032 * echelle)}px ${palette.familleNote}`;
    ctx.fillStyle = palette.couleurNote;
    ctx.globalAlpha = 0.9;
    envelopperTexte(ctx, fait.citation, x, yAvec + nL * w * 0.1 * echelle * 0.95 + w * 0.03, w, w * 0.044 * echelle, align);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    return;
  }

  // atomique
  ctx.fillStyle = palette.couleurTitre;
  ctx.font = `800 ${Math.round(w * 0.16 * echelle)}px ${palette.familleTitre}`;
  const yTitre = y + w * 0.16 * echelle * 0.85;
  const nL = envelopperTexte(ctx, fait.chiffre, x, yTitre, w, w * 0.16 * echelle * 0.95, align);

  ctx.font = `400 ${Math.round(w * 0.032 * echelle)}px ${palette.familleNote}`;
  ctx.fillStyle = palette.couleurNote;
  ctx.globalAlpha = 0.95;
  envelopperTexte(ctx, fait.note, x, yTitre + nL * w * 0.16 * echelle * 0.95 + w * 0.035, align === 'centre' ? w : w * 0.9, w * 0.044 * echelle, align);
  ctx.globalAlpha = 1;
}

export const THEME_DOSSIER: Theme = {
  id: 'dossier',
  nom: 'Le Dossier',
  fond: '#C4703A', // --t8
  dessiner(ctx, { w, h }, faits, photo) {
    const padX = w * 0.065;

    // Photo en fond plein cadre, voile encre puis teinte du theme par-dessus
    // (multiply puis overlay) : la photo garde sa lisibilite et prend la
    // couleur de la chemise, elle ne flotte jamais nue sous le texte.
    if (photo) {
      dessinerPhotoCouverture(ctx, photo, 0, 0, w, h);
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#C4703A';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Languette de chemise cartonnee, coin haut-droit (cf. .onglet du site).
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = INK;
    const coinW = w * 0.38, coinH = coinW / 3.4;
    tracerRectArrondi(ctx, w - w * 0.08 - coinW, -h * 0.008, coinW, coinH, { basGauche: 2, basDroit: 2 });
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = INK;
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 0.9;
    ctx.font = `500 ${Math.round(w * 0.041)}px "JetBrains Mono", monospace`;
    ctx.fillText('exposed.', padX, h * 0.055 + w * 0.041);
    ctx.globalAlpha = 1;

    // Barres de censure, entre l'eyebrow et la zone de contenu.
    const bandeY = h * 0.28, barH = w * 0.032, gap = w * 0.023;
    [0.32, 0.22, 0.14].forEach((f, i) => {
      tracerRectArrondi(ctx, padX, bandeY + i * (barH + gap), f * w, barH, { hautGauche: 1, hautDroit: 1, basGauche: 1, basDroit: 1 });
      ctx.fill();
    });

    dessinerBlocsFaits(ctx, { x: padX, y: h * 0.68, w: w - padX * 2, h: h * 0.24 }, faits, {
      couleurTitre: INK, couleurNote: INK, familleTitre: '"Bricolage Grotesque", sans-serif', familleNote: '"Bricolage Grotesque", sans-serif',
    });
  },
};

export const THEME_POLAROID: Theme = {
  id: 'polaroid',
  nom: 'Polaroid',
  fond: PAPER,
  dessiner(ctx, { w, h }, faits, photo) {
    const padX = w * 0.09;
    const frameW = w - padX * 2;
    const padInterne = w * 0.028;
    const photoSide = frameW - padInterne * 2;
    const frameH = padInterne * 2 + photoSide;
    const frameY = h * 0.07;

    ctx.save();
    ctx.translate(padX + frameW / 2, frameY + frameH / 2);
    ctx.rotate((-2.5 * Math.PI) / 180);
    ctx.translate(-(padX + frameW / 2), -(frameY + frameH / 2));

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = w * 0.02;
    ctx.shadowOffsetY = w * 0.012;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padX, frameY, frameW, frameH);
    ctx.restore();

    if (photo) {
      dessinerPhotoCouverture(ctx, photo, padX + padInterne, frameY + padInterne, photoSide, photoSide);
    } else {
      degradePlaceholder(
        ctx, padX + padInterne, frameY + padInterne, photoSide, photoSide,
        [[0, '#d7c9b3'], [0.6, '#8f7a5c'], [1, '#5b4a34']], 150,
      );
    }
    ctx.restore();

    const yZone = frameY + frameH + h * 0.06;
    dessinerBlocsFaits(ctx, { x: padX, y: yZone, w: frameW, h: h * 0.96 - yZone }, faits, {
      couleurTitre: INK, couleurNote: INK,
      familleTitre: 'italic 800 "Bricolage Grotesque", sans-serif',
      familleNote: 'italic "Bricolage Grotesque", sans-serif',
    });

    ctx.font = `500 ${Math.round(w * 0.028)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#F0803C';
    ctx.fillText('exposed.', padX, h - h * 0.035);
  },
};

export const THEME_ARGENTIQUE: Theme = {
  id: 'argentique',
  nom: 'Argentique',
  fond: '#1b1712',
  dessiner(ctx, { w, h }, faits, photo) {
    const zoneBasH = h * 0.34;
    const zonePhotoH = h - zoneBasH;

    if (photo) {
      ctx.save();
      ctx.filter = 'grayscale(1) sepia(0.55) contrast(1.05)';
      dessinerPhotoCouverture(ctx, photo, 0, 0, w, zonePhotoH);
      ctx.restore();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#3c2814';
      ctx.fillRect(0, 0, w, zonePhotoH);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    } else {
      degradePlaceholder(ctx, 0, 0, w, zonePhotoH, [[0, '#7a5230'], [0.65, '#3c2814'], [1, '#1b1108']], 160);
    }

    const perfoLargeur = w * 0.028;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, perfoLargeur, zonePhotoH);
    ctx.fillRect(w - perfoLargeur, 0, perfoLargeur, zonePhotoH);
    ctx.fillStyle = '#403626';
    const nTrous = 7;
    for (let i = 0; i < nTrous; i++) {
      const y = (zonePhotoH / (nTrous + 1)) * (i + 1);
      const trouW = perfoLargeur * 0.4, trouH = perfoLargeur * 0.55;
      tracerRectArrondi(ctx, (perfoLargeur - trouW) / 2, y - trouH / 2, trouW, trouH, { hautGauche: 1, hautDroit: 1, basGauche: 1, basDroit: 1 });
      ctx.fill();
      tracerRectArrondi(ctx, w - perfoLargeur + (perfoLargeur - trouW) / 2, y - trouH / 2, trouW, trouH, { hautGauche: 1, hautDroit: 1, basGauche: 1, basDroit: 1 });
      ctx.fill();
    }

    ctx.fillStyle = SIGNAL;
    ctx.globalAlpha = 0.9;
    ctx.font = `500 ${Math.round(w * 0.026)}px "JetBrains Mono", monospace`;
    ctx.fillText('24A', w * 0.075, h * 0.045);
    ctx.globalAlpha = 1;

    const padX = w * 0.075;
    const yBas = h - zoneBasH + h * 0.05;
    dessinerBlocsFaits(ctx, { x: padX, y: yBas, w: w - padX * 2, h: zoneBasH - h * 0.09 }, faits, {
      couleurTitre: PAPER, couleurNote: PAPER, familleTitre: '"Bricolage Grotesque", sans-serif', familleNote: '"Bricolage Grotesque", sans-serif',
    });

    ctx.font = `500 ${Math.round(w * 0.026)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = PAPER;
    ctx.globalAlpha = 0.7;
    ctx.fillText('exposed.', padX, h - h * 0.03);
    ctx.globalAlpha = 1;
  },
};

export const THEME_TABLOID: Theme = {
  id: 'tabloid',
  nom: 'Une du jour',
  fond: PAPER,
  dessiner(ctx, { w, h }, faits, photo) {
    const padX = w * 0.075;

    if (photo) {
      ctx.save();
      ctx.filter = 'grayscale(1) contrast(1.05)';
      dessinerPhotoCouverture(ctx, photo, 0, 0, w, h);
      ctx.restore();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(w - padX - w * 0.11, h * 0.06 + w * 0.02);
    ctx.rotate((8 * Math.PI) / 180);
    ctx.strokeStyle = SIGNAL;
    ctx.lineWidth = w * 0.0035;
    ctx.font = `500 ${Math.round(w * 0.024)}px "JetBrains Mono", monospace`;
    const texteTampon = 'Exclusif';
    const lTampon = ctx.measureText(texteTampon).width;
    tracerRectArrondi(ctx, -lTampon / 2 - w * 0.02, -w * 0.03, lTampon + w * 0.04, w * 0.06, { hautGauche: 2, hautDroit: 2, basGauche: 2, basDroit: 2 });
    ctx.stroke();
    ctx.fillStyle = SIGNAL;
    ctx.textAlign = 'center';
    ctx.fillText(texteTampon, 0, w * 0.008);
    ctx.textAlign = 'left';
    ctx.restore();

    ctx.fillStyle = INK;
    ctx.font = `500 ${Math.round(w * 0.026)}px "JetBrains Mono", monospace`;
    ctx.fillText('Édition du jour', padX, h * 0.09);

    ctx.strokeStyle = INK;
    ctx.lineWidth = w * 0.0045;
    ctx.beginPath(); ctx.moveTo(padX, h * 0.11); ctx.lineTo(w - padX, h * 0.11); ctx.stroke();

    dessinerBlocsFaits(ctx, { x: padX, y: h * 0.21, w: w - padX * 2, h: h * 0.73 }, faits, {
      couleurTitre: INK, couleurNote: INK, familleTitre: '"Bricolage Grotesque", sans-serif', familleNote: '"Bricolage Grotesque", sans-serif',
    });

    ctx.font = `500 ${Math.round(w * 0.026)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.save();
    ctx.letterSpacing = `${w * 0.003}px`;
    ctx.fillText('E X P O S E D .', w / 2, h - h * 0.035);
    ctx.restore();
    ctx.textAlign = 'left';
  },
};

export const THEME_TICKET: Theme = {
  id: 'ticket',
  nom: 'Ticket de caisse',
  fond: '#fbfaf6',
  dessiner(ctx, { w, h }, faits, photo) {
    const padX = w * 0.08;
    const zoneX = padX * 0.4, zoneW = w - padX * 0.8;

    if (photo) {
      ctx.save();
      ctx.filter = 'grayscale(1) brightness(1.15)';
      dessinerPhotoCouverture(ctx, photo, zoneX, h * 0.03, zoneW, h * 0.94);
      ctx.restore();
      ctx.globalCompositeOperation = 'multiply';
      dessinerTrame(ctx, zoneX, h * 0.03, zoneW, h * 0.94, w * 0.018, INK);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = '#fbfaf6';
      ctx.fillRect(zoneX, h * 0.03, zoneW, h * 0.94);
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = '#b9b3a4';
    ctx.setLineDash([w * 0.012, w * 0.012]);
    ctx.lineWidth = w * 0.003;
    ctx.strokeRect(zoneX, h * 0.03, zoneW, h * 0.94);
    ctx.setLineDash([]);

    ctx.fillStyle = INK;
    ctx.font = `500 ${Math.round(w * 0.026)}px "JetBrains Mono", monospace`;

    function ligne(y: number, gauche: string, droite: string) {
      ctx.textAlign = 'left'; ctx.fillText(gauche, padX, y);
      ctx.textAlign = 'right'; ctx.fillText(droite, w - padX, y);
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#cfc9ba';
      ctx.setLineDash([w * 0.006, w * 0.008]);
      ctx.lineWidth = w * 0.0015;
      ctx.beginPath(); ctx.moveTo(padX, y + h * 0.014); ctx.lineTo(w - padX, y + h * 0.014); ctx.stroke();
      ctx.setLineDash([]);
    }

    ligne(h * 0.1, 'CHAPITRE', `${faits.length} FAIT${faits.length > 1 ? 'S' : ''}`);
    ligne(h * 0.14, 'DU', 'JOUR');

    dessinerBlocsFaits(ctx, { x: padX, y: h * 0.19, w: w - padX * 2, h: h * 0.59 }, faits, {
      couleurTitre: INK, couleurNote: INK, familleTitre: '"JetBrains Mono", monospace', familleNote: '"JetBrains Mono", monospace',
      alignement: 'centre',
    });

    ctx.fillStyle = INK;
    const codeY = h * 0.82, codeH = h * 0.045;
    let x = padX;
    while (x < w - padX) {
      const bw = w * (0.003 + Math.random() * 0.006);
      ctx.fillRect(x, codeY, bw, codeH);
      x += bw + w * 0.006;
    }

    ctx.textAlign = 'center';
    ctx.font = `500 ${Math.round(w * 0.024)}px "JetBrains Mono", monospace`;
    ctx.fillText('*** exposed. ***', w / 2, h * 0.9);
    ctx.textAlign = 'left';
  },
};

export const THEME_BADGE: Theme = {
  id: 'badge',
  nom: 'Badge',
  fond: '#5C8CEA', // --t3
  dessiner(ctx, { w, h }, faits, photo) {
    const padX = w * 0.075;

    if (photo) {
      dessinerPhotoCouverture(ctx, photo, 0, 0, w, h);
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#5C8CEA';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.8;
    ctx.textAlign = 'right';
    ctx.font = `500 ${Math.round(w * 0.024)}px "JetBrains Mono", monospace`;
    ctx.fillText('N° 004821', w - padX, h * 0.05);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    const photoSide = w * 0.3;
    const photoY = h * 0.075;
    ctx.lineWidth = w * 0.006;
    ctx.strokeStyle = INK;
    if (photo) {
      dessinerPhotoRonde(ctx, photo, padX + photoSide / 2, photoY + photoSide / 2, photoSide / 2);
      ctx.beginPath();
      ctx.arc(padX + photoSide / 2, photoY + photoSide / 2, photoSide / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      degradePlaceholder(ctx, padX, photoY, photoSide, photoSide, [[0, '#eef3ff'], [0.6, '#9fb6e6'], [1, '#4d6aa8']], 160);
      ctx.strokeRect(padX, photoY, photoSide, photoSide);
    }

    const stripeH = h * 0.16;
    const yZone = photoY + photoSide + h * 0.04;
    dessinerBlocsFaits(ctx, { x: padX, y: yZone, w: w - padX * 2, h: h - stripeH - yZone - h * 0.02 }, faits, {
      couleurTitre: INK, couleurNote: INK, familleTitre: '"Bricolage Grotesque", sans-serif', familleNote: '"JetBrains Mono", monospace',
    });

    ctx.fillStyle = INK;
    ctx.fillRect(0, h - stripeH, w, stripeH);
    ctx.fillStyle = PAPER;
    ctx.globalAlpha = 0.95;
    ctx.font = `400 ${Math.round(w * 0.032)}px "Bricolage Grotesque", sans-serif`;
    ctx.fillText('exposed.', padX, h - stripeH + stripeH * 0.6);
    ctx.globalAlpha = 1;
  },
};

export const THEMES: Theme[] = [
  THEME_DOSSIER, THEME_POLAROID, THEME_ARGENTIQUE, THEME_TABLOID, THEME_TICKET, THEME_BADGE,
];
