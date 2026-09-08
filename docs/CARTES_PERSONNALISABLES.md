# Cartes personnalisables — partage à la Genius / Spotify Wrapped

> Document d'instructions autonome. Il est écrit pour être suivi par quelqu'un (ou un
> modèle) qui n'a pas l'historique de la conversation qui a défini cette fonctionnalité.
> Tout ce qu'il faut savoir est ici ou dans les fichiers cités. Lis-le en entier avant de
> toucher au code. Rien n'est encore implémenté : ce document précède le code, il ne le
> documente pas après coup.

## 0. Le principe, en une phrase

Aujourd'hui, une carte de la story est fixe : un fait, un thème imposé (l'aplat de couleur
« Dossier »), aucun export possible. On construit un **compositeur** : l'utilisateur choisit
un fond (un des six thèmes, ou sa propre photo de galerie en fond plein cadre), choisit 2 à 3
faits parmi tout ce que l'analyse a calculé (pas seulement ceux de la carte d'où il est
parti), et télécharge le résultat en image — exactement le geste de partager un extrait sur
Genius ou une carte Spotify Wrapped.

## 1. Ce qui ne doit JAMAIS changer

1. **Zéro requête réseau.** La photo importée ne quitte jamais l'appareil : elle est lue en
   local (`URL.createObjectURL` / `FileReader`), dessinée dans un `<canvas>`, jamais uploadée
   nulle part, jamais transformée par un service tiers. C'est la même promesse que pour les
   messages, elle s'applique tout autant à une photo de galerie.
2. **Zéro persistance.** La photo et la sélection de faits ne survivent pas à la fermeture de
   l'écran de composition (sauf le temps de la session, en mémoire). Pas de `localStorage`.
3. **Aucun script tiers, aucune bibliothèque d'upload d'image.** Le rendu est fait main, en
   `<canvas>` 2D natif. `DESIGN.md` a été écrit dès le départ pour que chaque forme du
   vocabulaire du site soit « redessinable dans un canvas au moment de l'export » — c'est
   cette intention qu'on réalise ici, pas une bibliothèque de capture DOM (`html-to-image`,
   `dom-to-image`...), qui serait plus fragile avec des polices custom et moins prévisible.
4. **Jamais la liste complète d'un chapitre comme fait partageable.** Le chapitre 3 (qui ne
   te suit pas en retour) calcule jusqu'à des centaines de pseudos : le nombre agrégé
   (« 118 ») est un fait valable, la liste des 118 comptes ne l'est pas — publier les pseudos
   de comptes tiers dans une image de story n'a pas sa place ici (cf. `app/cgu/page.tsx`,
   qui demande déjà à l'utilisateur de réfléchir à qui il expose en partageant).
5. **Ne casse rien de l'existant.** `components/Affiche.tsx`, `lib/wrapped/mapper.ts` et le
   reste de la story (`app/wrapped/StoryPlayer.tsx`) continuent de fonctionner à l'identique
   pour le défilement normal. Cette fonctionnalité s'ajoute par-dessus, elle ne remplace rien.

## 2. Ce qu'il faut connaître avant de commencer

- **`components/Affiche.tsx` / `Affiche.module.css`** : le composant carte actuel, en HTML/CSS
  avec des unités `cqw` (container query width). Type `DonneesAffiche` : `piece`, `titre`,
  `chiffre?`, `paire?`, `liste?`, `note`, `ton` (1 à 10, une couleur par onglet), `formes`
  (vocabulaire de 8 formes : `barres`, `disques`, `stries`, `arc`, `cadre`, `faisceau`,
  `trame`, `onglet` — voir le fichier CSS pour les recettes exactes de chacune). Ce composant
  **n'est pas touché** par cette fonctionnalité : le nouveau moteur de rendu est un canvas
  séparé, qui s'inspire du même vocabulaire visuel sans en dépendre.
- **`lib/wrapped/mapper.ts`** : transforme les résultats bruts des 7 chapitres en tableaux de
  `DonneesAffiche`, une fonction par chapitre (`mapChapitre01`...`mapChapitre07`). C'est la
  source de données pour la bibliothèque de faits décrite en §4 — on ne recalcule rien, on
  relit ce qui existe déjà.
- **`app/wrapped/StoryPlayer.tsx`** : le lecteur plein écran. Regarde en particulier le
  mécanisme déjà en place pour la liste complète du chapitre 3 (`vueDetail`, `ouvrirDetail`,
  `fermerDetail`, la prop `details`) : le nouvel écran de composition doit suivre le même
  principe (suspend l'avance automatique de la story tant qu'il est ouvert, la referme
  proprement à la fermeture). Réutilise ce mécanisme plutôt que d'en inventer un autre.
- **`app/globals.css`** : les tokens de couleur (`--bg`, `--text`, `--muted`, `--paper`,
  `--ink`, `--signal`, `--orange`, `--vert`, `--t1`…`--t10`) et les deux polices
  (`--display` = Bricolage Grotesque, `--mono` = JetBrains Mono). Le compositeur réutilise
  exactement ces tokens, aucune nouvelle couleur ni police ne doit être introduite.
- **Périmètre déjà validé avec l'utilisateur** (ne pas rouvrir ces décisions) :
  - Six thèmes retenus (§3) — deux autres explorés (« Négatif », « Néon nuit ») ont été
    écartés explicitement, ne pas les réintroduire.
  - 2 à 3 faits par carte, jamais plus, la mise en page s'adapte automatiquement au nombre
    choisi (§5).
  - La photo peut devenir le fond plein cadre de n'importe lequel des six thèmes, pas
    seulement un encart réservé (§3).

## 3. Les six thèmes

Chaque thème définit une identité (couleurs, décor, traitement typographique) qui doit
fonctionner **avec ou sans photo personnelle**. Sans photo : un aplat de couleur (comme
aujourd'hui). Avec photo : la photo remplit tout le cadre, et le thème l'habille par-dessus
pour rester lisible et reconnaissable — jamais juste « une photo avec du texte dessus ».

| # | Thème | Sans photo | Avec photo (traitement par-dessus) |
|---|---|---|---|
| 1 | **Le Dossier** | Aplat `--t{ton}`, encre `--ink`, barres de censure + languette (`onglet`) en coin | Photo en fond, voile `--ink` à 45 % en `multiply`, teinte `--t{ton}` en `overlay` à 25 % : la photo garde sa lisibilité mais prend la couleur du thème |
| 2 | **Polaroid** | Fond `--paper`, cadre blanc légèrement penché (−2,5°) contenant un carré de dégradé, légende en italique dessous | Le carré du cadre blanc contient la vraie photo (recadrée en carré, `object-fit: cover` côté canvas = recadrage centré), reste identique sinon |
| 3 | **Argentique** | Dégradé sépia généré, perforations de pellicule sur les bords, compteur de vue en mono | La photo remplit la zone haute (66 % de la hauteur), désaturée puis teintée sépia (`grayscale` puis `overlay` brun `#5b4a34`), perforations et bandeau bas inchangés |
| 4 | **Une du jour** | Fond `--paper`, filets noirs, tampon rouge incliné « Exclusif » | Photo en fond sur toute la carte, désaturée en `grayscale` complet (comme un cliché de presse), filets et tampon par-dessus en `--ink` / `--signal`, un voile `--paper` à 20 % pour garder les filets lisibles |
| 5 | **Ticket de caisse** | Fond quasi blanc, tout en mono, pointillés, code-barres généré | Photo en fond, désaturée puis passée en tramage à points façon photocopie basse résolution (motif `trame` existant en `--ink`, cf. `Affiche.module.css`, appliqué en composite `multiply` sur la photo) — l'esprit « reçu imprimé », pas une vraie photo nette |
| 6 | **Badge** | Aplat `--t3`, photo-ID générique dans un carré en haut à gauche, bandeau bas `--ink` | La vraie photo remplit tout le cadre (pas seulement le petit carré), le petit carré ID en haut à gauche devient un **recadrage rond** de la même photo (comme une vignette de profil sur la photo elle-même), le bandeau bas reste opaque par-dessus |

Écartés et à ne pas reprendre : **Négatif** (néon rouge sur noir) et **Néon nuit** (cadre
lumineux rose) — jugés redondants et moins « à montrer aux potes » que les six ci-dessus.

## 4. La bibliothèque de faits

Un **fait** est un bloc de contenu que l'utilisateur peut poser sur sa carte. Il en choisit
2 ou 3. Chaque fait a un **type de forme**, qui détermine comment il se met en page (§5) :

- **atomique** : un `chiffre` + une `note` courte (ex. « 68 355 » / « messages avec @lou »).
- **paire** : deux valeurs de même poids (ex. Premier/Dernier message).
- **mini-liste** : un classement, **plafonné à 3 lignes** même si le chapitre en calcule plus
  (le top 10 du chapitre 1 devient un top 3 dans un fait ; le top 5 du chapitre 4 aussi).

| Chapitre | Fait proposé | Type | Source exacte |
|---|---|---|---|
| 01 · Cercle réel | Ton contact n°1 | atomique | `c[0]` : `chiffre = total`, `note = qui` |
| 01 · Cercle réel | Ton top 3 contacts | mini-liste | `c.slice(0, 3)` (le top 10 existant, tronqué) |
| 02 · Groupes | Ton QG / Le plus bondé / Tu débites ici / Ton groupe inutile / Le ring | atomique (un fait par catégorie existante) | `cat.qg`, `cat.leBondé`, `cat.tuDebites`, `cat.inutile`, `cat.leRing` — reprend tel quel le contenu déjà calculé par `mapChapitre02` |
| 03 · Follow-back | Qui ne te suit pas en retour | atomique | `chiffre = c.neSuiventPas.length`, jamais la liste (cf. §1.4) |
| 04 · Tes mots | Ton mot signature | atomique | `c[0]` |
| 04 · Tes mots | Ton top 3 mots | mini-liste | `c.slice(0, 3)` (tronqué depuis le top 10) |
| 05 · Records | Un des 5 records (au choix) | atomique | un fait par record présent : `plusTardif`, `remisInflige`, `remisSubi`, `reponseRapide`, `jourRecord` |
| 06 · Premier/dernier | Premier message / Dernier message | paire enrichie (quand + avec + citation courte) | `chapitre06` tel quel, un fait par borne |
| 07 · Profil | Ton profil relationnel | atomique | `chiffre = profil.nom`, `note` = description complète (`content/revelations.ts`) |

Le fait d'où l'utilisateur a ouvert le compositeur (le bouton « Partager » d'une carte
précise dans la story) est pré-sélectionné à l'ouverture ; il peut le retirer comme les autres.

## 5. Mise en page dynamique (1 à 3 faits)

Le canvas n'a pas de CSS grid : la mise en page se calcule en JavaScript, en fonction du
nombre de faits choisis et de leur type. Règles concrètes (zone verticale libre = tout
l'espace entre le bandeau haut du thème et le bandeau bas/marque, comme dans
`Affiche.module.css` la grille `auto 1fr auto`) :

- **1 fait** : occupe toute la zone libre. Atomique → chiffre géant (comme aujourd'hui, ~22
  % de la largeur de carte en hauteur de police). Mini-liste → jusqu'à 3 lignes, taille
  actuelle du `.classement` existant.
- **2 faits** : la zone libre se divise en deux bandes égales, séparées d'un filet fin
  `color-mix` à 20 % d'opacité. Chaque fait prend une taille de police réduite d'environ 40 %
  par rapport au cas à 1 seul (sinon deux chiffres géants se chevauchent).
- **3 faits** : trois bandes égales, réduction d'environ 55 %. Une mini-liste dans ce
  contexte n'affiche que 2 lignes (pas 3) pour ne pas déborder de sa bande.

Implémentation suggérée : une fonction pure `calculerMiseEnPage(faits: Fait[], hauteurLibre:
number): { fait: Fait; y: number; hauteur: number; echelle: number }[]` qui répartit
l'espace et renvoie une échelle de police par bloc, appelée par le moteur de rendu (§6) avant
de dessiner. Teste-la isolément (elle ne touche pas au canvas) avant de l'appeler depuis le
rendu.

## 6. Le moteur de rendu (canvas)

Nouveau fichier `lib/partage/rendu.ts`, fonction principale :

```ts
export async function dessinerCarte(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  faits: Fait[],
  photo: ImageBitmap | null,
): Promise<void>
```

Résolution cible : **1080 × 1920** (format story), toujours ce ratio quel que soit le thème.

Étapes, dans l'ordre :

1. **Attendre les polices** : `await document.fonts.ready` avant tout dessin de texte. Sans
   ça, le canvas dessine avec la police de repli sans prévenir (pas d'erreur, juste un rendu
   silencieusement faux) — piège classique, à tester explicitement (§9).
2. **Fond** : si `photo`, la dessiner en `cover` (calculer le recadrage centré comme
   `object-fit: cover`), puis appliquer le traitement du thème (§3) via
   `ctx.globalCompositeOperation` (`'multiply'`, `'overlay'`, etc. — tous supportés par
   Canvas2D) et des rectangles de teinte pleins. Sinon, `ctx.fillStyle` avec la couleur du
   thème (résoudre le `color-mix()` CSS en hex à l'avance en JS, Canvas2D ne comprend pas
   `color-mix()`).
3. **Décor du thème** : les éléments spécifiques (barres, perforations, tampon, pointillés,
   bandeau…) via primitives Canvas2D (`fillRect`, `arc`, `roundRect`, `setLineDash` pour les
   pointillés, `rotate`/`translate` pour le tampon incliné). Pas de nouvelle bibliothèque.
4. **Texte** : `ctx.font`, `ctx.fillText`. Le texte des faits est court et contrôlé (déjà
   tronqué en amont par le mapper existant), donc un retour à la ligne simple par mesure de
   largeur (`ctx.measureText`) suffit — pas besoin d'un moteur de wrap complexe.
5. **Marque** : `exposed.` toujours en bas, comme sur les cartes actuelles.

## 7. Import et traitement de la photo

- `<input type="file" accept="image/*">`, jamais de `capture` forcé (laisser le choix galerie
  vs appareil photo au système).
- Lire via `createImageBitmap(fichier)` directement (pas besoin de passer par une balise
  `<img>` intermédiaire).
- **Sous-échantillonner avant de dessiner** : une photo de téléphone moderne peut dépasser
  4000×3000 px. Downscaler vers au maximum 1080 px de large avant tout traitement (dessiner
  dans un canvas intermédiaire à cette taille), sinon les compositions `globalCompositeOperation`
  sur l'image pleine résolution sont lentes sur un téléphone milieu de gamme.
- Révoquer toute `ObjectURL` créée (`URL.revokeObjectURL`) une fois l'`ImageBitmap` obtenu.
- Ne jamais lire les métadonnées EXIF au-delà de l'orientation (le navigateur la gère déjà
  nativement pour `createImageBitmap` depuis Chrome/Safari récents — vérifier que ce n'est
  pas le cas sur le Safari ciblé, sinon corriger la rotation manuellement).

## 8. L'écran « Personnaliser »

Nouveau fichier `app/wrapped/Composer.tsx` (+ `.module.css`), monté depuis `StoryPlayer.tsx`
sur le même principe que `vueDetail` (§2) : un bouton **Partager** sur chaque carte (à côté
de « Voir les X en entier » quand il existe) ouvre le compositeur pour le fait de cette
carte, suspend l'avance automatique, et le referme proprement.

Trois zones, dans l'ordre où l'utilisateur les rencontre :

1. **Fond** : les 6 vignettes de thème (mini-aperçus, pas de texte dedans) + un bouton
   « Importer une photo ». Sélectionner un thème ne vide pas la photo déjà importée — les
   deux sont indépendants (thème = habillage, photo = fond), conformément à §3.
2. **Faits** : la bibliothèque du §4, présentée par chapitre, cases à cocher. Empêcher de
   dépasser 3 sélections (griser les autres cases une fois 3 atteintes, pas d'erreur
   bloquante). En dessous de 2, désactiver le bouton d'export avec une explication courte.
3. **Aperçu** : le `<canvas>` du §6 en direct (redessiné à chaque changement de sélection,
   debattu à ~150 ms pour ne pas redessiner à chaque frappe/clic), suivi du bouton
   **Télécharger**.

Export : `canvas.toBlob('image/png')` puis un lien `<a download="exposed-....png">` généré
à la volée et cliqué par script — aucune navigation, aucun aller-retour serveur.

## 9. Pièges connus

- `document.fonts.ready` non attendu → texte en police de secours sans erreur visible.
  Vérifier en forçant un thème `throttling` réseau lent en dev, puisque les polices sont
  auto-hébergées (`next/font`) mais un premier rendu peut arriver avant leur décodage.
- `color-mix()` et les variables CSS `cqw` n'existent pas en Canvas2D : toute couleur ou
  dimension du thème doit être résolue en valeur JS concrète (hex, pixels) avant de dessiner,
  jamais lue depuis `getComputedStyle` sur un élément caché (fragile, inutilement coûteux).
- Photo très haute résolution → downscaler d'abord (§7), sinon `globalCompositeOperation`
  peut geler l'UI une fraction de seconde sur un téléphone milieu de gamme.
- `canvas.toBlob` est asynchrone : ne pas oublier d'attendre le callback avant de créer le
  lien de téléchargement.
- Un fait « mini-liste » avec des pseudos très longs (`@un_pseudo_vraiment_interminable`) doit
  tronquer proprement (ellipse) plutôt que déborder du canvas — mesurer avec `measureText`
  et couper au caractère qui dépasse, pas au mot.
- Le thème **Argentique** utilisant déjà une photo par défaut (générée), vérifier que le
  rendu « sans photo personnelle » reste cohérent et ne se confond pas visuellement avec
  « avec photo » (garder le dégradé généré assez différent d'une vraie photo, ou ajouter une
  mention discrète « photo perso » quand l'utilisateur en a importé une).

## 10. Plan d'implémentation, étape par étape

Ne saute pas d'étape : chaque étape doit rester fonctionnelle et vérifiable avant la
suivante.

1. **Le moteur seul, un thème, sans photo.** `lib/partage/themes.ts` (juste « Le Dossier »),
   `lib/partage/rendu.ts`, un bouton de test temporaire qui dessine une carte fixe (1 fait
   codé en dur) dans un `<canvas>` visible. Valide la résolution 1080×1920, les polices, le
   téléchargement PNG. Rien d'autre ne doit changer dans l'app à ce stade.
2. **Les 6 thèmes, sans photo.** Étend `themes.ts` aux 5 autres, chacun testé visuellement
   avec le même fait fixe.
3. **La photo, thème par thème.** Ajoute l'import (§7) et le traitement propre à chaque
   thème (§3), un thème à la fois, en comparant au mockup de référence (l'artefact
   « Le nuancier » produit pendant la conception — redemande-le si besoin, il montre l'esprit
   visuel attendu pour chacun).
4. **La bibliothèque de faits.** `lib/partage/faits.ts` : la fonction qui, à partir des
   résultats déjà calculés par `analyser()`, produit la liste de `Fait[]` du §4. Teste-la
   avec `console.log` avant de la brancher à une interface.
5. **La mise en page dynamique.** `calculerMiseEnPage` (§5) en isolation (tests simples :
   1, 2, 3 faits de chaque type), puis branchée au moteur de rendu.
6. **L'écran Composer complet.** `app/wrapped/Composer.tsx`, branché à `StoryPlayer.tsx` via
   un bouton Partager, les 3 zones du §8, l'export réel.
7. **Nettoyage.** Retire tout bouton ou code de test temporaire de l'étape 1.

## 11. Critères d'acceptation

- [ ] `npm run lint` passe à chaque étape.
- [ ] Les 6 thèmes rendent correctement avec ET sans photo personnelle.
- [ ] 1, 2 et 3 faits sélectionnés produisent chacun une mise en page propre, sans texte
      débordant ni espace vide flagrant.
- [ ] Aucune requête réseau pendant l'import de la photo ni pendant l'export (vérifié dans
      l'onglet Réseau, comme pour le reste du site).
- [ ] La liste complète d'un chapitre (ex. les 118 comptes du chapitre 3) n'est jamais
      proposée comme fait exportable.
- [ ] L'image téléchargée fait bien 1080×1920, s'ouvre correctement, texte lisible sur les
      deux modes (couleur et photo) de chaque thème.
- [ ] Aucun fichier de `components/Affiche.tsx`, `lib/wrapped/mapper.ts` ou du reste de la
      story n'a été modifié par cette fonctionnalité.
