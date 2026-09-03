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
pleine, encre noire par-dessus, titre énorme, une forme plate, et le wordmark en bas.
C'est la seule forme de carte du site : il n'y a plus de fiche papier, plus de carte
teintée à 8 %, plus de filet de couleur sur fond noir.

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

Des formes **plates et géométriques**, en encre noire sur l'aplat, empruntées au monde du
dossier : barres de censure, pastilles, stries diagonales, arc. Une seule par affiche,
jamais deux. Elles sont faites en CSS, jamais en SVG dessiné à la main.

### Un aplat pleine largeur, un seul

La dernière section bascule en rouge plein sur toute la largeur. C'est la seule bascule
de fond du site, et c'est ce qui lui donne son impact. Ailleurs, le fond ne change jamais.

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
