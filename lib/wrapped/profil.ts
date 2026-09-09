/* ============================================================
   PROFIL  /  4 axes -> un des 10 profils
   Premiere version de la regle, jamais vue sur assez de comptes reels pour
   etre certaine : chaque profil est defini par une "signature" sur 4 axes
   normalises (0 = bas, 1 = haut), et on choisit celui dont la signature est
   la plus proche des tiens (distance euclidienne). Facile a retoucher une
   fois vu sur plusieurs vrais comptes.

   Les 4 axes bruts (voir chapitres.ts, chapitre07) n'ont pas la meme
   echelle : on les ramene tous entre 0 et 1 avant de comparer.
   ============================================================ */

export type AxesProfil = {
  axeQuiLance: number;        // 0-1 deja (fraction de convs que tu inities)
  axeAmpleur: number;         // nombre de partenaires actifs
  axeVitesseMinutes: number;  // delai median de reponse, en minutes
  axeLongueurCaracteres: number; // taille mediane d'un message
};

export type Signature = { quiLance: number; ampleur: number; rapidite: number; longueur: number };

const PROFILS: { nom: string; note: string; signature: Signature }[] = [
  {
    nom: 'Le Pilier',
    note: 'On vient te chercher quand ça compte.',
    signature: { quiLance: 0.15, ampleur: 0.5, rapidite: 0.4, longueur: 0.75 },
  },
  {
    nom: 'Le Confident',
    note: 'On te confie ce qu’on ne dit à personne.',
    signature: { quiLance: 0.4, ampleur: 0.35, rapidite: 0.4, longueur: 0.85 },
  },
  {
    nom: 'Le Connecteur',
    note: 'Tu relies les mondes entre eux.',
    signature: { quiLance: 0.75, ampleur: 0.9, rapidite: 0.5, longueur: 0.35 },
  },
  {
    nom: 'Le Fidèle discret',
    note: 'Présent depuis le premier jour, sans bruit.',
    signature: { quiLance: 0.25, ampleur: 0.25, rapidite: 0.6, longueur: 0.4 },
  },
  {
    nom: 'Le Silencieux choisi',
    note: 'Peu de mots, mais chacun a du poids.',
    signature: { quiLance: 0.4, ampleur: 0.15, rapidite: 0.4, longueur: 0.8 },
  },
  {
    nom: "L'Ouvert",
    note: 'Tu parles à tout le monde, et vite.',
    signature: { quiLance: 0.8, ampleur: 0.85, rapidite: 0.75, longueur: 0.35 },
  },
  {
    nom: 'Le Veilleur',
    note: 'Tu observes plus que tu ne participes.',
    signature: { quiLance: 0.15, ampleur: 0.5, rapidite: 0.45, longueur: 0.3 },
  },
  {
    nom: 'Le Répondant',
    note: 'On t’écrit, tu réponds. Toujours vite.',
    signature: { quiLance: 0.2, ampleur: 0.5, rapidite: 0.9, longueur: 0.35 },
  },
  {
    nom: 'Le Constant',
    note: 'Présent, régulièrement, sans effort apparent.',
    signature: { quiLance: 0.5, ampleur: 0.5, rapidite: 0.5, longueur: 0.5 },
  },
  {
    nom: 'Le Sélectif',
    note: 'Ton cercle est petit, choisi avec soin.',
    signature: { quiLance: 0.7, ampleur: 0.15, rapidite: 0.45, longueur: 0.5 },
  },
];

function normaliser(axes: AxesProfil): Signature {
  return {
    quiLance: Math.max(0, Math.min(1, axes.axeQuiLance)),
    ampleur: Math.max(0, Math.min(1, axes.axeAmpleur / 50)),
    // Rapidite = l'inverse du delai : moins de minutes, plus haut le score.
    rapidite: Math.max(0, Math.min(1, 1 - axes.axeVitesseMinutes / 120)),
    longueur: Math.max(0, Math.min(1, axes.axeLongueurCaracteres / 60)),
  };
}

function distance(a: Signature, b: Signature): number {
  return Math.hypot(a.quiLance - b.quiLance, a.ampleur - b.ampleur, a.rapidite - b.rapidite, a.longueur - b.longueur);
}

export function determinerProfil(axes: AxesProfil): { nom: string; note: string } {
  const cible = normaliser(axes);
  let meilleur = PROFILS[0];
  let meilleureDistance = Infinity;
  for (const p of PROFILS) {
    const d = distance(cible, p.signature);
    if (d < meilleureDistance) { meilleureDistance = d; meilleur = p; }
  }
  return { nom: meilleur.nom, note: meilleur.note };
}

/* ============================================================
   Utilise par le mode demo (lib/wrapped/demo.ts) : tirer un profil au hasard
   et fabriquer des axes qui y retombent exactement, plutot que d'exposer
   toute la liste PROFILS (sa "note" appartient a cette regle de calcul, pas
   au generateur de fausses donnees).
   ============================================================ */
export function nomsProfils(): string[] {
  return PROFILS.map((p) => p.nom);
}

export function signaturePourNom(nom: string): Signature {
  return (PROFILS.find((p) => p.nom === nom) ?? PROFILS[0]).signature;
}

/** L'inverse exact de `normaliser` : des axes qui, une fois renormalises,
    retombent a distance 0 de cette signature, donc que `determinerProfil`
    fait forcement ressortir. */
export function axesDepuisSignature(s: Signature): AxesProfil {
  return {
    axeQuiLance: s.quiLance,
    axeAmpleur: s.ampleur * 50,
    axeVitesseMinutes: (1 - s.rapidite) * 120,
    axeLongueurCaracteres: s.longueur * 60,
  };
}
