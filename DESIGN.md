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
| `--bg` | `#0B0B0C` | Fond de toutes les pages. Noir légèrement chaud, jamais `#000`. |
| `--surface` | `#121213` | Élévation minimale, employée avec parcimonie. |
| `--text` | `#F2F1EE` | Texte principal. Blanc cassé, jamais `#fff`. |
| `--muted` | `#8A8A8E` | Métadonnées. Ratio 4.6:1 sur le fond, conforme AA. |
| `--line` | `#2A2A2C` | Bordures, 1 px pleines. Jamais 0.5 px. |
| `--paper` | `#F3EFE6` | **Surface rare.** Cartes de partage, citations, bouton principal. |
| `--ink` | `#141414` | Texte sur papier. |
| `--line-paper` | `#D9D3C6` | Bordures sur papier. |
| `--signal` | `#E8442A` | **Accent unique.** Tampon, chiffres clés, soulignements. |

Un seul accent sur tout le site, sans exception ni variante par section. Le papier n'est
jamais un fond de page : une carte claire employée trois fois frappe plus fort qu'une
page entière. Le contenu fournit toute la couleur restante.

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
- Amplitude maximale : 16 px de translation, 3 degrés de rotation. Aucune rotation sous
  768 px, elle crée des conflits de zone tactile.
- Jamais d'animation à la sortie de l'écran. Une entrée, une fois, définitive.
- Trois éléments animés simultanément au maximum.
- Le scroll natif n'est jamais détourné. Pas de défilement fluide artificiel.
- Aucun écouteur `scroll` en JavaScript. `animation-timeline` en CSS, sinon
  `IntersectionObserver`.
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
