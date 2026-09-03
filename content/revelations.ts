import type { DonneesAffiche } from '@/components/Affiche';

/* Les huit affiches du sommaire. Les chiffres sont des exemples, marques comme
   tels sur chaque affiche : aucune preuve sociale inventee (cf. DESIGN.md).

   Chaque composition suit les cinq regles : deux ou trois formes, au moins une
   qui deborde du cadre, un ecart d'echelle net, aucune bande vide, et rien
   d'appuye sous le chiffre. Les formes posees sous du texte restent a `faible`. */
export const revelations: DonneesAffiche[] = [
  {
    piece: 'Pièce 01',
    titre: 'Ton cercle réel',
    chiffre: '10',
    note: 'personnes classées sur le volume, qui commence, et la fréquence.',
    ton: 1,
    formes: [
      { nom: 'disques', x: 34, y: 33, w: 84 },
      { nom: 'onglet', x: 62, y: -3, w: 46, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 02',
    titre: 'Tes groupes',
    chiffre: '3',
    note: "groupes où tu n'as pas répondu depuis plus de trente jours.",
    ton: 2,
    formes: [
      { nom: 'barres', x: 8, y: 33, w: 104 },
      { nom: 'trame', x: 60, y: 52, w: 56, ton: 'faible' },
    ],
  },
  {
    piece: 'Pièce 03',
    titre: 'Qui ne te suit pas en retour',
    note: 'Ceux à qui tu parles vraiment, séparés des comptes lointains.',
    ton: 3,
    formes: [
      { nom: 'stries', x: -20, y: 40, w: 76 },
      { nom: 'cadre', x: 56, y: 40, w: 54, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 04',
    titre: 'Ce que tu dis vraiment',
    chiffre: '68 %',
    note: 'de tes mots sont dans le lexique positif.',
    ton: 4,
    formes: [
      { nom: 'barres', x: 6, y: 34, w: 98 },
      { nom: 'arc', x: 66, y: 56, w: 52, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 05',
    titre: 'Tes inside jokes',
    chiffre: '« grumo »',
    note: '41 fois, et seulement dans cette conversation.',
    ton: 5,
    formes: [
      { nom: 'stries', x: 46, y: 30, w: 78 },
      { nom: 'disques', x: -14, y: 40, w: 44, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 06',
    titre: 'Tes cinq records',
    chiffre: '4 h 12',
    note: 'ton message le plus tardif de l’année.',
    ton: 6,
    formes: [
      { nom: 'arc', x: 22, y: 28, w: 96 },
      { nom: 'cadre', x: 66, y: 62, w: 44, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 07',
    titre: 'Premier et dernier',
    chiffre: '12 jan.',
    note: '8 h 04, à @sofia. Et le dernier, le 29 décembre.',
    ton: 7,
    formes: [
      { nom: 'cadre', x: -16, y: 28, w: 66 },
      { nom: 'disques', x: 64, y: 52, w: 56, ton: 'moyen' },
    ],
  },
  {
    piece: 'Pièce 08',
    titre: 'Ton profil relationnel',
    chiffre: 'Le Pilier',
    note: 'Quatre axes, un type. La conclusion du dossier.',
    ton: 8,
    formes: [
      // Le faisceau deborde a droite : a gauche il passait sous la deuxieme
      // ligne du titre, et l'encre a 55 % sous une encre pleine ne tient pas
      // les 4.5:1.
      { nom: 'faisceau', x: 74, y: 18, w: 64, rot: 90, ton: 'moyen' },
      { nom: 'barres', x: 6, y: 40, w: 36 },
    ],
  },
];

/** L'affiche du hero. Un vrai composant produit, pas un faux ecran. */
export const afficheHero: DonneesAffiche = {
  piece: 'Pièce 06 · Records',
  titre: 'Ta journée la plus intense',
  chiffre: '2 847',
  note: 'messages échangés avec la personne que tu ne mets jamais en close friends.',
  ton: 6,
  formes: [
    // Mesure faite sur l'affiche : le titre finit a 27 %, le chiffre commence a
    // 60 %. La grande forme vit dans cette bande, et nulle part ailleurs.
    { nom: 'arc', x: 26, y: 29, w: 84 },
    { nom: 'onglet', x: 68, y: -4, w: 46, ton: 'moyen' },
  ],
};

/** L'affiche epinglee de la section dossier. */
export const afficheDossier: DonneesAffiche = {
  piece: 'Pièce 01 · Ton cercle réel',
  titre: 'Le plus long silence',
  chiffre: '41',
  note: 'jours sans se parler, avec quelqu’un à qui tu écrivais tous les jours en janvier.',
  ton: 3,
  formes: [
    { nom: 'barres', x: 6, y: 34, w: 100 },
    { nom: 'trame', x: 62, y: 54, w: 52, ton: 'faible' },
  ],
};

/** Les dix types relationnels, index typographique de l'accueil. */
export const types = [
  'Le Pilier', 'Le Confident', 'Le Connecteur', 'Le Fidèle discret',
  'Le Silencieux choisi', "L'Ouvert", 'Le Veilleur', 'Le Répondant',
  'Le Constant', 'Le Sélectif',
];
