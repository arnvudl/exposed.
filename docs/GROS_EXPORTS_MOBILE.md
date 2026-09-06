# Gros exports sur téléphone — instructions de mise en œuvre

> Document d'instructions autonome. Il est écrit pour être suivi par quelqu'un (ou un
> modèle) qui n'a pas l'historique du projet. Tout ce qu'il faut savoir est ici ou dans
> les fichiers cités. Lis-le en entier avant de toucher au code.

## 0. Le problème, en une phrase

Sur un téléphone, un export Instagram de plusieurs Go de messages fait planter l'onglet,
parce que le site garde **tout le texte JSON en mémoire, puis tout le JSON parsé**, avant
de commencer à calculer. Un iPhone accorde environ 1 à 1,5 Go de mémoire à un onglet
Safari ; un ordinateur en accorde 4 à 8 fois plus, c'est pourquoi le bug ne se voit que sur
mobile.

Le but : que le pic de mémoire dépende du **nombre de messages** (petites structures
compactes), jamais de la **taille des fichiers JSON** (texte brut, redondant, dix fois plus
gros).

## 1. Ce qui ne doit JAMAIS changer

Ces contraintes sont le produit lui-même. Aucune optimisation ne les vaut.

1. **Zéro requête réseau pendant l'analyse.** Pas d'API, pas de CDN, pas de service de
   parsing, pas de « juste envoyer les métadonnées ». L'utilisateur vérifie dans l'onglet
   Réseau de son navigateur qu'il ne se passe rien. C'est l'argument central du site.
2. **Zéro persistance.** Ni `localStorage`, ni `IndexedDB`, ni cache. Fermer l'onglet
   efface tout.
3. **Ne jamais charger un ZIP entier dans un seul buffer.** Chrome refuse d'allouer un
   `ArrayBuffer` de plus de ~2 Go (`RangeError: Array buffer allocation failed`). C'est
   déjà résolu : `@zip.js/zip.js` lit le ZIP par petits `Blob.slice()`, entrée par entrée.
   Ne remplace pas zip.js, ne réintroduis pas `file.arrayBuffer()` ni JSZip.
4. **Les résultats des 7 chapitres doivent rester identiques**, au message près, avant et
   après. Le script `scripts/analyse.mts` sert de témoin (voir §6).
5. **L'API vue par l'interface ne change pas** : `analyser(fichiers: File[], emettre)` dans
   `lib/wrapped/analyser.ts` continue d'émettre les mêmes `EvenementAnalyse`, dans le même
   ordre, depuis le Worker `app/wrapped/analyse.worker.ts`. Ne touche ni à `app/wrapped/`,
   ni à `lib/wrapped/mapper.ts`, ni à `components/`.

## 2. L'architecture actuelle (à lire avant de modifier)

Tout vit dans `lib/wrapped/`. Le flux, aujourd'hui :

```
File[] (les ZIP déposés)
  │
  ▼  zip.ts        construireFileMap(fichiers) → FileMap = Map<chemin, texteJSON>
  │                (garde en mémoire le TEXTE de tous les .json)          ← problème n°1
  ▼  parse.ts      chargerConversations(fileMap) → Conversation[]
  │                (JSON.parse de tout, garde `content` complet de chaque message)
  │                                                                       ← problème n°2
  │                chargerRelations(fileMap) → { followers, following }
  │                detecterSoi(conversations) → string
  ▼  chapitres.ts  chapitre01..07(conversations, soi) → résultats bruts
  ▼  analyser.ts   orchestre le tout et émet un événement par chapitre
```

Types actuels (`parse.ts`) :

```ts
export type FileMap = Map<string, string>;
export type Message = { sender: string; ts: number; content?: string; aDesMedias: boolean; estSupprime: boolean };
export type Conversation = { dossier: string; titre: string; participants: string[]; messages: Message[] };
```

Où va la mémoire, pour un export de 2,4 Go avec ~490 conversations :

| Étape | Ce qui est en mémoire | Ordre de grandeur |
|---|---|---|
| après `construireFileMap` | le texte de tous les `message_N.json` | 300 Mo à 1,5 Go |
| pendant `chargerConversations` | le texte **plus** les objets parsés (les deux coexistent) | ×2 |
| pendant les chapitres | les `Conversation[]` avec `content` complet | 150 à 700 Mo |

Le pic est à la deuxième ligne. C'est lui qui tue l'onglet.

## 3. Ce qui consomme `content`, chapitre par chapitre

Pour pouvoir jeter le texte des messages, il faut savoir qui en a besoin
(`lib/wrapped/chapitres.ts`) :

| Chapitre | Utilise `content` pour | Ce qu'il lui faut vraiment |
|---|---|---|
| 01 cercle réel | non | `sender` seulement |
| 02 groupes | compter des insultes par conversation (`compteInsultes`) | un **compteur d'insultes par conversation** |
| 03 follow-back | non (fichiers followers/following) | rien |
| 04 tes mots | tokeniser tous **tes** messages (`tokeniser`, `MOTS_VIDES`) | un **compteur global de mots** (Map mot → n) |
| 05 records | `apercu(m)` sur quelques messages précis | un aperçu **court** (≤ 140 caractères) de chaque message |
| 06 premier/dernier | `apercu(m)` sur deux messages | idem |
| 07 profil | `content.length` de tes messages | la **longueur** de chaque message de toi |

Conclusion : aucun chapitre n'a besoin du texte complet après le parsing. Tout peut être
réduit au moment où le JSON est lu, puis le texte jeté.

## 4. Le plan, étape par étape

Fais les étapes dans l'ordre. Chaque étape laisse le projet fonctionnel (`npm run lint`
passe, `npm run analyse` donne les mêmes chiffres). Ne saute pas à l'étape 3 sans avoir
fait la 2.

### Étape 1 — Mesurer avant de toucher

Sans mesure, on ne saura pas si ça a marché.

1. Ajoute au Worker (`app/wrapped/analyse.worker.ts`), temporairement, un relevé de
   `performance.memory?.usedJSHeapSize` (Chrome uniquement) après chaque étape, envoyé par
   `postMessage` sous un type d'événement à part (`{ type: 'mesure', etape, octets }`) que
   `page.tsx` ignore. Retire-le à la fin.
2. Sur ordinateur, avec le plus gros export réel disponible (voir `README.md` : les vrais
   ZIP sont hors du dépôt et ne doivent jamais y entrer), note le pic. Écris-le dans ce
   document, section 7.
3. En Node, le même relevé s'obtient avec `process.memoryUsage().heapUsed` autour des
   appels de `scripts/analyse.mts`. Utilise `fs.openAsBlob()` (Node 20+) pour donner à
   zip.js un `Blob` sans lire le fichier entier.

### Étape 2 — Consommer chaque fichier au fil de la lecture (supprime le problème n°1)

Objectif : `construireFileMap` ne construit plus de `Map` de textes. Elle **appelle un
consommateur** pour chaque entrée `.json`, qui parse tout de suite et ne garde que le
nécessaire. Le texte d'un fichier est libéré dès la fin de l'itération.

Dans `zip.ts`, remplace la signature par :

```ts
export type Consommateur = (chemin: string, texte: string) => void;
export async function lireZips(fichiers: File[], consommer: Consommateur): Promise<void>;
```

Le corps reste le même (même `ZipReader`, même filtre `.json`, même `normaliserChemin`,
mêmes erreurs `ErreurLectureZip` / `ErreurExportHtml` / `ErreurExportVide`), mais la ligne
`map.set(...)` devient `consommer(normaliserChemin(entree.filename), texte)`. Pour
`ErreurExportVide`, compte les entrées `.json` vues au lieu de tester `map.size`.

Dans `parse.ts`, remplace `chargerConversations(fileMap)` et `chargerRelations(fileMap)`
par un **accumulateur** :

```ts
export class Accumulateur {
  private parDossier = new Map<string, { titre: string; participants: string[]; messages: Message[] }>();
  private followers = new Set<string>();
  private following = new Set<string>();

  /** Appelé pour chaque .json du ZIP, dans un ordre quelconque. */
  ingerer(chemin: string, texte: string): void { /* voir ci-dessous */ }

  /** Une fois tous les ZIP lus. */
  terminer(): { conversations: Conversation[]; followers: Set<string>; following: Set<string> };
}
```

`ingerer` reprend la logique actuelle :

- si le chemin matche `RE_MESSAGE_INBOX` : `JSON.parse(texte)`, puis pousser les messages
  dans l'entrée du dossier (créée si absente), avec le même filtrage `estContenuSysteme`,
  le même `decodeMojibake`, le même calcul de `aDesMedias` / `estSupprime`. Le titre et
  les participants sont écrasés à chaque fichier, comme aujourd'hui.
- si le chemin matche un des deux motifs de `chargerRelations` : même extraction des noms.
- sinon : ignorer.

Point d'attention : aujourd'hui les `message_N.json` d'une même conversation sont
**triés par N avant** d'être fusionnés. Dans le ZIP ils arrivent dans un ordre quelconque.
Ce n'est pas un problème : les messages sont de toute façon **triés par `ts`** à la fin
(`messages.sort((a, b) => a.ts - b.ts)`), fais ce tri dans `terminer()`. Le titre et les
participants sont identiques d'un fichier à l'autre, l'ordre n'a pas d'importance.

Dans `analyser.ts` :

```ts
const acc = new Accumulateur();
await lireZips(fichiers, (chemin, texte) => acc.ingerer(chemin, texte));
const { conversations, followers, following } = acc.terminer();
```

Le reste (détection de `soi`, les sept chapitres, les événements) ne bouge pas.
`scripts/analyse.mts` a **sa propre copie** du parsing et des sept calculs (c'est de là
qu'ils ont été portés dans `lib/wrapped/`) et lit le disque au lieu d'un ZIP : ne le
modifie pas, il reste le témoin des résultats attendus.

À la fin de cette étape, le pic passe de « tout le texte + tout le parsé » à « le texte
d'**un** fichier + tout le parsé ». C'est déjà la moitié du problème.

### Étape 3 — Ne garder que ce dont les chapitres ont besoin (supprime le problème n°2)

Objectif : `Message.content` disparaît. À sa place, ce que §3 a identifié.

1. Dans `parse.ts`, change le type :

   ```ts
   export type Message = {
     sender: number;        // index dans `participants` de la conversation (voir 3.)
     ts: number;
     apercu: string;        // ≤ 140 caractères, calculé par `apercu()` de format.ts au moment du parse
     longueur: number;      // content.length, 0 s'il n'y a pas de texte
     aDesMedias: boolean;
     estSupprime: boolean;
   };
   ```

   et ajoute à `Conversation` deux agrégats calculés pendant `ingerer` :

   ```ts
   insultes: number;                    // somme de compteInsultes(content) sur tous les messages
   motsDeToi?: Map<string, number>;     // voir 2.
   ```

   `compteInsultes` et sa liste `MOTS_INSULTES` déménagent de `chapitres.ts` vers
   `decode.ts` (ou un nouveau `lexique.ts`) pour être appelables depuis le parse.

2. **Le compteur de mots (chapitre 04) a une difficulté** : il ne compte que les messages
   de `soi`, et `soi` n'est connu qu'après avoir tout lu (`detecterSoi` = le participant
   présent dans le plus de conversations). Deux solutions, choisis la première :

   - **(a) Compter par expéditeur.** Pendant `ingerer`, tenir un
     `Map<sender, Map<mot, n>>` global. Après `terminer()` et `detecterSoi`, garder
     seulement l'entrée de `soi`, jeter le reste. Coût : un dictionnaire par expéditeur ;
     dans un export normal, seules quelques dizaines de personnes écrivent beaucoup, ça
     reste petit (quelques Mo). C'est simple et exact.
   - (b) Deviner `soi` avant : l'export contient `personal_information/personal_information.json`
     avec le nom du compte. Plus fragile (fichier absent si la catégorie n'a pas été cochée)
     et le nom peut différer du `sender_name`. À éviter.

3. **Interner les expéditeurs.** Remplacer `sender: string` par un index dans
   `participants` divise par dix la mémoire des messages (une chaîne par message → un
   entier). Ajoute une aide `nomExpediteur(conv, m)` et remplace chaque comparaison
   `m.sender === soi` dans `chapitres.ts` par `nomExpediteur(c, m) === soi` (ou, mieux,
   calcule une fois par conversation l'index de `soi` et compare des entiers). Attention :
   un message peut venir de quelqu'un qui n'est plus dans `participants` (parti du groupe) ;
   dans ce cas, ajoute-le à la liste au moment du parse.

4. Adapte `chapitres.ts` :
   - `chapitre02` : `insultes = c.insultes` au lieu de la boucle `reduce` sur `content`.
   - `chapitre04` : lit le dictionnaire de `soi` produit en 2., trie, `slice(0, 10)`.
   - `chapitre05`, `chapitre06` : `m.apercu` au lieu de `apercu(m)`.
   - `chapitre07` : `m.longueur` au lieu de `m.content.length`, en ignorant les 0.
   - `format.ts` : `apercu()` prend désormais le contenu brut et les deux booléens, pas un
     `Message` ; il est appelé depuis `ingerer`.

5. Vérifie avec `scripts/analyse.mts` que les sept chapitres donnent **exactement** les
   mêmes résultats qu'à l'étape 0 (garde une sortie de référence dans un fichier hors
   dépôt avant de commencer). Toute différence est un bug de cette étape, pas une
   « amélioration ».

### Étape 4 — Laisser respirer

Le Worker enchaîne aujourd'hui `respirer()` (un `setTimeout(0)`) entre les chapitres. Après
l'étape 2, ajoute un `await respirer()` tous les N fichiers ingérés (par exemple 25) : ça
laisse le ramasse-miettes libérer le texte du fichier précédent, et ça permet d'émettre un
vrai événement de progression `{ type: 'etape', etape: 'lecture_zip', fait, total }` si
l'interface veut un jour l'afficher (`onProgress` existe déjà dans `zip.ts`, inutilisé).

### Étape 5 — Ce qu'on ne fait pas

- Pas de `structuredClone` ni de transfert des conversations vers le fil principal : elles
  restent dans le Worker, seuls les résultats des chapitres (petits) sont `postMessage`.
  C'est déjà le cas, ne le change pas.
- Pas de compression maison, pas de WebAssembly, pas de SharedArrayBuffer : inutile ici,
  le gain vient de ne pas garder ce dont on n'a pas besoin.
- Pas de « mode allégé » qui sauterait des chapitres sur mobile. Le dossier est le même
  partout.

## 5. Pièges connus

- `entree.getData(new TextWriter())` renvoie le texte **entier** d'une entrée. Un
  `message_1.json` peut faire 50 à 100 Mo pour une conversation très longue : c'est
  acceptable (un seul à la fois), mais c'est le plancher du pic mémoire. Ne cherche pas à
  streamer le JSON lui-même, ce serait beaucoup de complexité pour peu de gain.
- Les exports sont parfois **découpés en plusieurs ZIP** (part 1, part 2…). Une même
  conversation peut avoir `message_1.json` dans un ZIP et `message_2.json` dans un autre.
  L'accumulateur par dossier gère ça naturellement, à condition de ne rien conclure avant
  `terminer()`.
- Certains ZIP enveloppent tout dans un dossier au nom du compte. `normaliserChemin`
  s'en occupe déjà : passe toujours par lui.
- `decodeMojibake` est obligatoire sur chaque chaîne lue (les exports Instagram encodent
  l'UTF-8 en Latin-1). Ne l'oublie pas sur les nouveaux champs.
- Les messages système (« Vous avez réagi… », « started an audio call ») sont filtrés
  **avant** d'entrer dans les listes. Garde ce filtre au même endroit, sinon les mots du
  chapitre 04 se polluent.

## 6. Comment tester, sans lire les messages de personne

1. **Témoin** : avant de commencer, lance `npm run analyse` sur `data/` (l'export
   décompressé, hors dépôt) et sauvegarde la sortie complète dans un fichier hors dépôt.
   Après chaque étape, relance et compare (`diff`). Zéro différence attendue.
2. **Mémoire en Node** : un petit script (hors dépôt, ou dans `scripts/` sans données)
   qui ouvre le plus gros ZIP avec `fs.openAsBlob()`, appelle `analyser()` avec un
   `emettre` qui ne fait rien, et imprime `process.memoryUsage().heapUsed` au max.
   Objectif : pic < 400 Mo pour un ZIP de 2,4 Go (mesure de référence à l'étape 1 : le
   texte des JSON de cet export pèse ~250 Mo).
3. **Navigateur, ordinateur** : `npm run dev`, dépose le ZIP de 2,4 Go, onglet
   Performance → Memory de Chrome. Vérifie aussi que l'onglet Réseau reste vide.
4. **Navigateur, téléphone** : c'est le seul vrai test. Sur un iPhone (Safari) et un
   Android milieu de gamme (Chrome), avec le vrai export, via `next dev` accessible sur le
   réseau local (`http://<ip-du-pc>:3000`). Le dossier doit s'afficher sans rechargement
   de page ni écran blanc. Note le modèle et le résultat en §7.
5. **Non-régression fonctionnelle** : un ZIP corrompu, un export HTML et un export sans
   messages doivent toujours afficher leur message d'erreur et laisser la zone de dépôt
   en place (ces trois cas sont gérés dans `zip.ts` et `analyser.ts`).

## 7. Relevés (à remplir)

| Date | Étape | Machine / navigateur | ZIP | Pic mémoire | Résultat |
|---|---|---|---|---|---|
| | 0 (avant) | | 2,4 Go | | |
| | 2 | | | | |
| | 3 | | | | |
| | 3 | iPhone, Safari | | | |
| | 3 | Android, Chrome | | | |

## 8. Critères d'acceptation

- [ ] `npm run lint` passe.
- [ ] `npm run analyse` donne une sortie identique au témoin, chapitre par chapitre.
- [ ] Pic mémoire en Node < 400 Mo sur le ZIP de 2,4 Go.
- [ ] Le dossier s'affiche sur un iPhone avec le vrai export, sans plantage.
- [ ] L'onglet Réseau reste vide pendant toute l'analyse.
- [ ] Aucun fichier de `app/`, `components/`, `lib/wrapped/mapper.ts` modifié.
- [ ] Le relevé temporaire de mémoire a été retiré du Worker.
