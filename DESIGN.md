# Exposed. — DESIGN.md

Concept : **un dossier confidentiel qu'on t'ouvre.** Pas un tableau de bord, un document.
Références mentales : couverture de rapport d'enquête, papier photocopié, tampon
« CONFIDENTIEL », mono de machine à écrire contre une grotesque très large pour les chiffres.

## Dials

`DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 6` · `VISUAL_DENSITY: 3`

Preset « Landing premium consumer ». Le concept impose la retenue : la variance vit dans
l'asymétrie des compositions, pas dans le nombre d'effets.

## Thème

**Sombre uniquement, sur tout le site, accueil compris.** C'est une instruction explicite
du propriétaire du produit, pas un oubli de mode clair. Le fond ne change jamais d'une
page à l'autre. Aucune section ne s'inverse.

## Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#0D0B0A` | Fond de toutes les pages. Noir biaisé vers le chaud, jamais `#000`. |
| `--surface` | `#171412` | Élévation minimale, base des cartes teintées. |
| `--text` | `#F4F1EC` | Texte principal. Blanc cassé, jamais `#fff`. |
| `--muted` | `#8E8781` | Métadonnées. Ratio 4.6:1 sur le fond, conforme AA. |
| `--line` | `#2C2724` | Bordures, 1 px pleines. Jamais 0.5 px. |
| `--paper` | `#F3EFE6` | **Surface rare.** Cartes de partage, citations, bouton principal. |
| `--ink` | `#141414` | Texte sur papier. |
| `--line-paper` | `#D9D3C6` | Bordures sur papier. |
| `--signal` | `#E8442A` | **Accent unique.** Tampon, chiffres clés, soulignements. |

Le papier n'est jamais un fond de page : une carte claire employée trois fois frappe plus
fort qu'une page entière.

### Les affiches

Chaque révélation est une **affiche en aplat**, pas une carte sombre. Fond de couleur
pleine, encre noire par-dessus, titre énorme, deux ou trois formes plates superposées, et
le wordmark en bas. C'est la seule forme de carte du site : il n'y a plus de fiche papier,
plus de carte teintée à 8 %, plus de filet de couleur sur fond noir.

L'affiche se lit d'abord sur un téléphone. Toute décision de composition se prend à
320 px de large, jamais sur un écran de bureau.

Les huit teintes sont choisies pour passer **4.5:1 avec l'encre `#141414`**, donc le
texte d'une affiche est toujours noir. Aucune exception, aucun texte clair sur couleur.

| Jeton | Valeur | Révélation |
|---|---|---|
| `--t1` | `#E8442A` | Ton cercle réel |
| `--t2` | `#F0803C` | Tes groupes |
| `--t3` | `#5C8CEA` | Qui ne te suit pas en retour |
| `--t4` | `#5FA85C` | Ce que tu dis vraiment |
| `--t5` | `#BE7ACD` | Tes inside jokes |
| `--t6` | `#E9BE3C` | Tes cinq records |
| `--t7` | `#2F9AA8` | Premier et dernier |
| `--t8` | `#C4703A` | Ton profil relationnel |
| `--t9` `--t10` | `#E86FA0` `#A8BE49` | Index des types |

Deux couleurs de service : `--orange #F0803C` pour l'action de soutien, `--vert #5FA85C`
pour les chiffres de confidentialité, où le vert dit « sain ».

### Le vocabulaire de formes

C'est ce qui remplit l'affiche. Une affiche avec une seule petite forme et beaucoup de
vide est fade : la couleur seule ne porte pas, c'est la **superposition** qui porte.

Huit formes, plates et géométriques, toutes empruntées au monde du dossier, toutes en CSS.

| Forme | Description | Où elle sert |
|---|---|---|
| Barre de censure | Rectangle plein, hauteur 13 à 40 px | En pile de 3 ou 4, largeurs inégales |
| Disque | Cercle plein, du logo | Répété, tailles différentes, un débordant d'un coin |
| Stries | Hachures diagonales de photocopie | En coin biseauté ou en fond de moitié d'affiche |
| Arc | Demi-disque | Ancré sur un bord, très grand |
| Cadre | Rectangle bordé 3 px | Encadre le chiffre, comme une pièce à conviction |
| Faisceau | Triangles depuis un bord | Lumière de photocopieuse au-dessus du document |
| Trame | Points réguliers, `radial-gradient` | Fond de zone, jamais sur du texte |
| Onglet | Languette rectangulaire en haut | Onglet de chemise cartonnée |

**Les cinq règles de composition, mobile d'abord.** L'affiche se dessine à 320 px de
large et ne fait que grandir ensuite. Elle n'est jamais recomposée pour le bureau.

1. **Deux à trois formes par affiche.** Une seule ne remplit rien, quatre font du bruit.
2. **Une forme au moins déborde du cadre**, coupée par le bord. C'est ce qui donne
   l'impression d'une image plus grande que l'affiche.
3. **Contraste d'échelle obligatoire** : une forme très grande, au moins un tiers de la
   hauteur, et une petite à côté. Deux formes moyennes ne produisent rien.
4. **Aucune bande vide de plus de 15 % de la hauteur.** Le vide se comble par une forme,
   jamais en agrandissant le texte.
5. **Le texte passe toujours au-dessus** et garde ses 4.5:1 avec l'aplat. Une forme sous
   du texte descend à `opacity: .25` maximum, ou s'écarte.

**Trois niveaux de profondeur, pas plus** : l'aplat, les formes, le texte.

**Deuxième ton autorisé.** L'encre à `.55` et `.25` compte comme un ton. Une seconde
couleur de la palette est permise sur une affiche, jamais une troisième.

**Contrainte d'export, à ne pas oublier.** Chaque affiche doit finir en image partageable.
Une forme qui ne se redessine pas trivialement dans un `canvas` ou un SVG est interdite,
quelle que soit sa beauté en CSS. Les huit formes ci-dessus tiennent en un rectangle, un
cercle, un arc ou une répétition : c'est le critère.

### Les aplats pleine largeur

La dernière section bascule en rouge plein sur toute la largeur. **Validée, et c'est le
seul aplat obligatoire du site.** C'est ce qui lui donne son impact.

Ailleurs, on y va léger. Un deuxième aplat au maximum sur toute la page d'accueil, jamais
deux qui se suivent, et jamais dans le tiers supérieur. L'impact du rouge final vient de
sa rareté : trois aplats et il ne reste rien.

### Les boutons

Un **bloc plein** en display gras, jamais une boîte à bord fin. Deux variantes seulement :
`--signal` sur fond sombre, `--paper` sur fond de couleur. Texte à l'encre dans les deux cas.

**Un seul bouton par écran.** Deux rectangles jumeaux côte à côte sont la signature la
plus reconnaissable d'une page générée : le hero n'en porte qu'un.

## Typographie

Deux familles, pas trois.

- **Display** : `Bricolage Grotesque` 700/800. Titres et gros chiffres.
- **Mono** : `JetBrains Mono` 400/500. Dates, identifiants, compteurs, tampons.

Interdits : `Inter`, `Fraunces`, `Instrument Serif`. Aucun sérif, aucun italique de sérif.
Pour insister sur un mot dans un titre, on emploie le gras de la même famille.

Le tracking est fonction de la taille, jamais une valeur unique : `-0.04em` au-delà de
48 px, `-0.02em` entre 24 et 48 px, `0` sur le corps de texte. `tabular-nums` sur tout
chiffre susceptible de s'animer.

## Formes

Rayon **3 px partout**, sans exception. Pas de pilule, pas de rayon complet, pas de
mélange de rayons. Bordures 1 px pleines. Une seule ombre autorisée dans tout le projet :
le papier posé sur le noir, `0 24px 48px -24px rgb(0 0 0 / .6)`.

Jamais de carte dans une carte. Pour grouper, on utilise le vide ou un filet.

## Espacement

Sections à `py-24` minimum, `py-32` par défaut. Colonne de contenu à 1200 px maximum,
680 px pour le texte suivi. Marges constantes : c'est la constance qui produit
l'impression de qualité, pas les effets.

## Mouvement

**Piloté par le scroll : autorisé et souhaité sur l'accueil.** L'utilisateur est la source
du mouvement et le contrôle image par image.

**Autonome : interdit partout.** Rien qui pulse, rien qui flotte, rien qui défile tout
seul, aucun bandeau en boucle, aucune pastille clignotante.

- Durées : 100 à 160 ms pour un retour d'appui, 150 à 250 ms pour une micro-interaction.
  **Dans l'application, rien ne dépasse 300 ms.** L'accueil, qui est du marketing
  explicatif, peut monter à 600 ms.
- Courbes : `--ease-out: cubic-bezier(.23,1,.32,1)` pour toute entrée ou sortie,
  `--ease-drawer: cubic-bezier(.32,.72,0,1)` pour les surfaces qui glissent, `ease` pour
  les survols, `linear` pour les compteurs. **Jamais `ease-in` sur de l'interface.**
- `transform` et `opacity` uniquement. Jamais de `height`, jamais de flou animé.
- Jamais `scale(0)` : une entrée démarre à `0.94`.
- Amplitude maximale : 24 px de translation à l'entrée, 3 degrés de rotation. Aucune rotation sous
  768 px, elle crée des conflits de zone tactile.
- Jamais d'animation à la sortie de l'écran. Une entrée, une fois, définitive.
- Trois éléments animés simultanément au maximum.
- Le scroll natif n'est jamais détourné. Pas de défilement fluide artificiel.
- Les entrées passent par `IntersectionObserver`, une seule fois, jamais en sortie.
- **Exception assumée pour les deux effets liés au scroll** (redressement de la carte,
  panoramique des révélations) : ils sont pilotés par **un seul écouteur `scroll` groupé
  par `requestAnimationFrame`, qui n'écrit que des `transform`**. `animation-timeline` en
  CSS est plus propre sur le papier et tourne sur le compositeur, mais il se révèle
  inactif ou figé dans plusieurs contextes embarqués, sans lever la moindre erreur : la
  page paraît simplement morte. La fiabilité prime sur l'élégance ici. Toute autre
  utilisation de `scroll` reste interdite.
- La page doit être entièrement lisible sans mouvement : `prefers-reduced-motion` et
  JavaScript désactivé donnent une page complète, à sa place.
- La fréquence décide : ce qui est vu des dizaines de fois par jour ne s'anime pas.
  Bouton *Recommencer*, sélection de période, changement d'onglet : instantanés.

## Interdits, liste opposable

Dégradés de fond, lueurs, ombres colorées, pilules, emojis dans l'interface, `Inter`,
sérifs, italiques de sérif, cartes imbriquées, trois cartes égales côte à côte, faux
aperçus de produit construits en `div`, icônes dessinées à la main, curseur personnalisé,
libellés sous 12 px, tout texte sous 4.5:1.

**Tiret cadratin interdit partout.** Aucun `—`, aucun `–`, ni dans les titres, ni dans le
corps, ni dans les libellés, ni dans les attributs `alt`. Un trait d'union simple, une
virgule, un point ou deux-points à la place.

**Micro-libellés en capitales espacées : un maximum pour trois sections.** Le titre suffit.
La position d'une section dans la page la catégorise déjà.

**Numérotation décorative de sections interdite** (`01 / INDEX`, `002 · Capacités`).
Le compteur `01 / 08` de l'application est autorisé : c'est une progression réelle,
pas une décoration.

**Aucune preuve sociale inventée.** Pas de logos clients, pas de témoignages, pas de
compteur d'utilisateurs. Tout chiffre affiché est soit réel, soit marqué comme exemple.

**Aucun indice de défilement** (`Scroll`, flèche animée, molette). Aucun bandeau de lieu,
d'heure ou de météo. Aucune étiquette de version.

## Signature obligatoire

Chaque écran doit porter un élément qu'un générateur n'aurait pas produit : le tampon
rouge incliné, le `o` rouge du logo, la carte papier sur le noir, ou une phrase sèche.
S'il n'y en a aucun, l'écran n'est pas fini.

## Logo

Wordmark seul : `exposed.` en bas de casse, en mono, le `o` remplacé par un disque plein
rouge. Aucune icône, aucun emprunt à Instagram.

## Chantier en cours, décidé le 3 septembre 2026

Ce qui reste à faire sur les affiches, dans l'ordre. Rien de tout cela n'est codé.

1. **Écrire les huit formes** en classes CSS réutilisables, avec les variantes de taille et
   les variantes débordantes. C'est une bibliothèque, pas huit bricolages.
2. **Recomposer les huit affiches** avec deux ou trois formes chacune, contraste d'échelle,
   une forme coupée par le bord. Aucune affiche ne garde une seule forme centrée.
3. **Remonter l'échelle typographique de l'affiche** : le chiffre est l'élément le plus
   grand de la composition, le titre vient ensuite.
4. **Vérifier au doigt**, à 320 et 390 px, avant de regarder quoi que ce soit en 1440.

### Ce que le passage à Next.js change, et ce qu'il ne change pas

| Sujet | En HTML aujourd'hui | En Next.js ensuite |
|---|---|---|
| Les formes | Classes CSS | Identique, dans un composant `Forme` |
| Les affiches | Huit blocs écrits à la main | Un composant `Affiche` et huit objets de données |
| Le scrub au scroll | Un écouteur groupé par `requestAnimationFrame` | Un `useMotionValue`, jamais un `useState` |
| L'export image | Impossible proprement | Le vrai sujet, voir ci-dessous |

**L'export image est la seule vraie question ouverte.** Rendre une affiche CSS en PNG
demande une bibliothèque qui relit le DOM, et ces bibliothèques rendent mal les dégradés,
les `clip-path` et les polices web. La route fiable est de redessiner l'affiche dans un
`canvas` au moment de l'export. Cela oblige à tenir les formes simples, ce qui est déjà la
contrainte écrite plus haut. À trancher avant d'écrire le bouton de partage.

**Ce qu'on ne fera pas** : ni 3D, ni WebGL, ni bibliothèque d'animation lourde. La page a
déjà été ralentie une fois par une salle 3D, et le verdict était sans appel.
