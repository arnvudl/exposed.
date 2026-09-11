import type { DonneesAffiche } from '@/components/Affiche';

/* Les huit chapitres du dossier.

   Les « inside jokes » ont ete retirees : detecter une vraie blague interne
   demande de comprendre le sens, pas seulement de compter des repetitions.
   Sans ca, le resultat melange de vraies blagues, des noms de marque et des
   fragments de phrase, et une affiche qui se trompe une fois sur deux abime
   la confiance dans les six autres.

   Deux decisions de contenu, prises ensemble :

   1. Toutes les affiches donnent un exemple, aucune n'explique. Un sommaire ou
      la moitie des cartes montre un resultat et l'autre decrit une methode se
      lit comme deux sommaires colles.
   2. Les valeurs sont fausses et marquees « exemple » sur chaque affiche.
      Aucune preuve sociale inventee : rien ici ne se fait passer pour un vrai
      resultat d'utilisateur.

   Une note depasse rarement 62 caracteres : au-dela elle prend quatre lignes,
   la bande libre tombe sous 10 % et la forme n'a plus la place d'exister.

   Chaque composition suit les cinq regles de DESIGN.md : deux ou trois formes,
   au moins une qui deborde, un ecart d'echelle net, aucune bande vide, et
   aucune forme au-dessus de 30 % d'opacite sous du texte. */
export const revelations: DonneesAffiche[] = [
  {
    piece: 'Chapitre 01',
    titre: 'Ton cercle réel',
    chiffre: '10',
    note: 'Les 10 personnes à qui tu parles le plus.',
    ton: 1,
    formes: [
      { nom: 'disques', w: 98, dx: 34 },
    ],
  },
  {
    piece: 'Chapitre 02',
    titre: 'Ce que tu dis vraiment',
    chiffre: '« mdrrr »',
    note: 'ton mot à toi. Tu l’écris plus souvent que « oui ».',
    ton: 4,
    formes: [
      { nom: 'barres', w: 70 },
      { nom: 'arc', w: 54, ton: 'moyen' },
    ],
  },
  {
    piece: 'Chapitre 03',
    titre: 'Tes médias',
    chiffre: '212',
    note: 'messages vocaux reçus. Puis tes appels, tes photos.',
    ton: 9,
    formes: [
      { nom: 'faisceau', w: 82, ton: 'moyen' },
      { nom: 'arc', w: 46 },
    ],
  },
  {
    piece: 'Chapitre 04',
    titre: 'Tes groupes',
    chiffre: 'Le groupe soirée',
    note: 'celui où tu ris le plus, et où tu réponds le plus vite.',
    ton: 2,
    formes: [
      { nom: 'barres', w: 74 },
      { nom: 'trame', w: 52, ton: 'faible' },
    ],
  },
  {
    piece: 'Chapitre 05',
    titre: 'Qui ne te suit pas en retour',
    chiffre: '17',
    note: 'qui font les stars avec toi.',
    ton: 3,
    formes: [
      { nom: 'stries', w: 86, dx: -26 },
      { nom: 'cadre', w: 58, ton: 'moyen' },
    ],
  },
  {
    piece: 'Chapitre 06',
    titre: 'Tes six records',
    chiffre: '4 h 12',
    note: 'le plus long remis. Puis le plus rapide, le plus intense.',
    ton: 6,
    formes: [
      { nom: 'arc', w: 76, dx: -14 },
      { nom: 'cadre', w: 52, ton: 'moyen' },
    ],
  },
  {
    piece: 'Chapitre 07',
    titre: 'Premier et dernier',
    paire: [
      { k: 'Premier', v: '12 janvier, 8 h 04' },
      { k: 'Dernier', v: '29 décembre, 23 h 51' },
    ],
    note: 'les deux à @sofia.mrt.',
    ton: 7,
    formes: [
      { nom: 'stries', w: 56, dx: -26, ton: 'moyen' },
    ],
  },
  {
    piece: 'Chapitre 08',
    titre: 'Ton profil relationnel',
    chiffre: 'Le Pilier',
    note: 'Quatre axes, un profil. La dernière page du dossier.',
    ton: 8,
    formes: [
      { nom: 'barres', w: 42 },
      { nom: 'faisceau', w: 78, ton: 'moyen' },
    ],
  },
];

/** L'affiche du hero. Un vrai composant produit, pas un faux ecran. */
export const afficheHero: DonneesAffiche = {
  piece: 'Chapitre 06 · Records',
  titre: 'Ta journée la plus intense',
  chiffre: '2 847',
  note: 'avec @lena.mrt, qui n’est pas dans tes close friends.',
  ton: 6,
  formes: [
    { nom: 'arc', w: 88, dx: 34 },
  ],
};

/** L'affiche epinglee de la section dossier. */
export const afficheDossier: DonneesAffiche = {
  piece: 'Chapitre 01 · Ton cercle réel',
  titre: 'Le plus long remis',
  chiffre: '41',
  note: 'jours entre son message et ta réponse. Tu l’avais lu le jour même.',
  ton: 3,
  formes: [
    { nom: 'barres', w: 76 },
    { nom: 'trame', w: 48, ton: 'faible' },
  ],
};

/** Les dix profils relationnels, index typographique de l'accueil. */
export const profils: { nom: string; description: string }[] = [
  { nom: 'Le Pilier', description: `On vient te chercher quand ça compte vraiment. Tu ne parles pas fort, mais quand tu parles, les gens écoutent. Et restent.` },
  { nom: 'Le Confident', description: `Les gens te racontent des choses qu’ils ne disent à personne d’autre. Tu portes les secrets des autres sans jamais t’en plaindre.` },
  { nom: 'Le Connecteur', description: `Tu connais toujours quelqu’un qui connaît quelqu’un. Tu lies les mondes entre eux, souvent sans même t’en rendre compte.` },
  { nom: 'Le Fidèle discret', description: `Tu ne likes pas, tu ne commentes pas, mais tu es là depuis le premier jour. Ta présence ne fait pas de bruit. Elle fait la différence.` },
  { nom: 'Le Silencieux choisi', description: `Peu de conversations, mais chacune a du poids. Tu ne gaspilles pas tes mots, et c’est exactement pour ça qu’on les retient.` },
  { nom: "L'Ouvert", description: `Tu réponds à tout le monde, tu parles à tout le monde. Les gens se sentent à l’aise avec toi avant même de te connaître.` },
  { nom: 'Le Veilleur', description: `Tu observes plus que tu ne participes. Mais quand quelqu’un a besoin d’aide, tu es souvent le premier à le remarquer.` },
  { nom: 'Le Répondant', description: `On t’écrit, tu réponds. Vite. Toujours. Les gens comptent sur ta réactivité sans même s’en rendre compte.` },
  { nom: 'Le Constant', description: `Tes amitiés ne font pas de montagnes russes. Tu maintiens le lien, régulièrement, sans effort apparent. Et c’est ta force.` },
  { nom: 'Le Sélectif', description: `Tu choisis tes gens avec soin. Ton cercle est petit, mais ceux qui en font partie savent qu’ils comptent vraiment.` },
];
