# Exposed — Blueprint complet

> *You might see some things. We show them.*
> Instagram Wrapped, 100 % dans le navigateur. Aucun DM ne quitte la machine de l'utilisateur.

Décisions actées : traitement **100 % client**, stack **Next.js + TypeScript**, identité **sombre sur tout le site**, monétisation **tip jar en priorité, sponsor direct ensuite, AdSense en dernier**. Objectif affiché : **50 €/mois**.

---

## 0. Sommaire

1. Analyse du projet & faisabilité web (révélation par révélation)
2. Architecture technique
3. Pseudo-code complet
4. Rebranding « sans IA » — diagnostic, direction, et emploi des skills
5. Monétisation
6. Pages à faire (arborescence complète)
7. Tests et calibration sans lire les messages de personne
8. Checklists : sécurité, juridique, performance, SEO
9. Roadmap de lancement

---

## 1. Analyse & faisabilité

### 1.1 La source de données : l'export Instagram

L'utilisateur va sur *Paramètres → Centre de comptes → Tes informations et autorisations → Télécharger tes informations*, choisit **JSON** (pas HTML), période « Depuis le début » ou personnalisée, et reçoit un ou plusieurs ZIP (par mail, sous 48 h max, souvent quelques minutes).

Fichiers utiles dans le ZIP (structure 2024-2026, sujette à variations mineures) :

| Chemin | Contenu | Révélations |
|---|---|---|
| `your_instagram_activity/messages/inbox/<thread_slug>/message_1.json` (+ `message_2.json`…) | Threads DM. `participants[]`, `messages[]` (`sender_name`, `timestamp_ms`, `content`, `reactions`, `share`, `photos`…) | 1, 2, 4, 5, 6, 7, 8 |
| `connections/followers_and_following/followers_1.json` | Abonnés (`string_list_data[0].value` = username, `timestamp`) | 3 |
| `connections/followers_and_following/following.json` | Abonnements | 3 |
| `connections/followers_and_following/close_friends.json` | Liste amis proches | 1 (twist) |
| `personal_information/personal_information.json` | Ton username, ta photo | Cover |
| `your_instagram_activity/messages/inbox/<thread>/photos/` | Médias envoyés (pas les photos de profil des autres) | — |

**Pièges connus à gérer dans le parseur :**

- **Mojibake** : les strings sont encodées en UTF-8 puis ré-encodées façon latin-1 (`"Ã©"` au lieu de `"é"`, emojis cassés). Fix : `new TextDecoder('utf-8').decode(Uint8Array.from(str, c => c.charCodeAt(0)))`.
- **Threads découpés** : `message_1.json`, `message_2.json`… à fusionner et trier par `timestamp_ms`.
- **Ordre inversé** : les messages sont du plus récent au plus ancien.
- **Messages système** : « X a réagi… », « X a envoyé une pièce jointe », « Liked a message » → à filtrer par regex avant l'analyse lexicale.
- **Comptes supprimés** : `sender_name` = `"Instagram User"` / `"Utilisateur Instagram"`.
- **Pas de photo de profil des contacts** dans l'export → initiales obligatoires (c'était prévu, on confirme).
- **Pas de données « vu / lu »** → « Lurker » = ratio de participation faible, pas « lit sans répondre » au sens strict.
- **Handle vs nom** : les threads contiennent des *display names*, pas des usernames. Le croisement avec `close_friends.json` (usernames) pour le twist de la Révélation 1 n'est pas fiable à 100 % → mapping heuristique nom ≈ username + avertissement discret si ambigu.
- **Taille** : un export « tout » d'un gros utilisateur = 200 Mo – 2 Go de ZIP (médias). On ne lit que les `.json` du ZIP en streaming, on ne décompresse jamais les médias.

### 1.2 Verdict par révélation

| # | Révélation | Faisable en web pur ? | Note |
|---|---|---|---|
| Intro | Cover + choix période + animation déchiffrement | ✅ | Trivial. Le handle vient de `personal_information.json`, pas besoin de le saisir. |
| 1 | Cercle réel (score de proximité, top 10, twist close friends) | ✅ | Twist ≈ 90 % fiable (cf. mapping nom/username). |
| 2 | Groupes (participation, statut Moteur/Lurker/Coordinateur) | ✅ | Groupe = `participants.length >= 3`. |
| 3 | Qui ne te follow pas back (public vs privé) | ⚠️ Partiel | Le diff follow/followers est trivial. **Public vs privé n'est pas dans l'export.** Proxy : un compte que tu suis, qui ne te suit pas, et avec qui tu n'as **aucun DM** = probablement un créateur / célébrité. On parle de « comptes lointains » vs « comptes proches », pas « publics/privés ». |
| 4 | Vocabulaire, bigrammes, ratio positif/négatif | ✅ | Lexique FR/EN hardcodé (~600 mots). Tout tient en mémoire. |
| 5 | Inside jokes (6 filtres) | ✅ | Le « dictionnaire FR/EN basique » = filtre de Bloom (~120 Ko) chargé à la demande. |
| 6 | 5 records | ✅ | Le « silence le plus long » ne considère que les threads avec ≥ 20 messages, sinon c'est du bruit. |
| 7 | Premier & dernier message | ✅ | Émotionnellement le plus fort, techniquement le plus simple. |
| 8 | Profil relationnel 4 axes → type | ✅ | 16 combinaisons (2⁴) ; 10 « nommées » + fallback composé. |
| Outro | Cartes 1080×1920 PNG | ✅ | `html-to-image` sur un DOM caché. iOS Safari : ouvrir l'image dans un nouvel onglet + « appui long ». |

**Conclusion : tout est faisable en web pur, sans backend.** Le seul compromis est la Révélation 3 (public/privé → proche/lointain).

---

## 2. Architecture

```
exposed/
├─ app/
│  ├─ (marketing)/page.tsx          # landing SEO, statique
│  ├─ (marketing)/faq/
│  ├─ (marketing)/confidentialite/
│  ├─ (marketing)/mentions-legales/
│  ├─ wrapped/page.tsx              # l'application (client component, noindex)
│  └─ layout.tsx
├─ lib/
│  ├─ parse/     zip-reader.ts, instagram-schema.ts, mojibake.ts, normalize.ts
│  ├─ analyze/   circle.ts, groups.ts, follow.ts, vocabulary.ts, inside-jokes.ts,
│  │             records.ts, first-last.ts, profile.ts
│  ├─ lexicon/   stopwords.fr.ts, stopwords.en.ts, sentiment.ts, dictionary.bloom.bin
│  ├─ worker/    analysis.worker.ts   # orchestre parse + analyze hors du thread UI
│  └─ export/    card-renderer.tsx, story-templates.tsx
├─ components/   Cover, Reveal[1-8], ShareCard, AdGate, TipJar…
└─ public/
```

Principes :

1. **Web Worker** obligatoire : le parsing d'un ZIP de 500 Mo bloque l'UI sinon. Le worker reçoit le `File`, streame les entrées `.json` (`zip.js` ou `fflate` en streaming), renvoie des `progress` puis un `Report` sérialisable.
2. **Aucune donnée ne sort** : pas de `fetch` avec du contenu utilisateur, pas de `localStorage` des messages. Seul le `Report` (agrégats) vit en mémoire ; option « sauvegarder mon rapport » en IndexedDB **chiffré** avec passphrase.
3. **Export statique** (`output: 'export'`) → Vercel / Cloudflare Pages / Netlify gratuit. Pas de route API. Si un jour tu veux du serveur, ce sera pour le paiement uniquement.
4. **Périmètre temporel** : sélection de la période côté client, toutes les stats sont recalculées sur le sous-ensemble (< 1 s une fois parsé).

---

## 3. Pseudo-code

Style TypeScript-ish. Tout ce qui est `// ≈` est une heuristique à ajuster à l'usage.

### 3.1 Modèle de données

```ts
type Message = {
  threadId: string
  sender: string          // display name
  ts: number              // ms epoch
  text: string | null     // null si média / réaction / système
  kind: 'text' | 'media' | 'share' | 'system'
  len: number             // text.length ou 0
}

type Thread = {
  id: string
  title: string
  participants: string[]  // display names, incluant moi
  isGroup: boolean        // participants.length >= 3
  messages: Message[]     // triés ASC par ts
}

type Dataset = {
  me: { username: string, displayName: string, avatarBlob?: Blob }
  threads: Thread[]
  followers: Set<string>  // usernames
  following: Set<string>
  closeFriends: Set<string>
  period: { from: number, to: number }
}

type Report = {
  cover, circle, groups, notFollowingBack, vocabulary,
  insideJokes, records, firstLast, profile
}
```

### 3.2 Lecture du ZIP (worker)

```
onmessage({ file, period }):
  reader = ZipReader(BlobReader(file))            // zip.js, streaming
  entries = await reader.getEntries()

  guard entries.length < 50_000                    // anti zip-bomb
  guard sum(entry.uncompressedSize where .json) < 1.5 GB

  dataset = emptyDataset()

  for entry in entries:
    if not entry.filename.endsWith('.json'): continue   // on ignore TOUS les médias
    raw = await entry.getData(TextWriter())
    json = JSON.parse(raw)

    match entry.filename:
      /messages\/inbox\/([^/]+)\/message_\d+\.json$/  → mergeThread(dataset, slug, json)
      /followers_\d+\.json$/                          → dataset.followers ∪= usernames(json)
      /following\.json$/                              → dataset.following ∪= usernames(json.relationships_following)
      /close_friends\.json$/                          → dataset.closeFriends ∪= usernames(json.relationships_close_friends)
      /personal_information\.json$/                   → dataset.me = extractMe(json)

    postMessage({ type: 'progress', done: i, total: entries.length })

  for thread in dataset.threads:
    thread.messages.sort(by ts ASC)
    thread.isGroup = thread.participants.length >= 3

  dataset = clipToPeriod(dataset, period)
  report = analyze(dataset)
  postMessage({ type: 'done', report })
```

```
mergeThread(dataset, slug, json):
  t = dataset.threads[slug] ?? new Thread(slug, fix(json.title), json.participants.map(p => fix(p.name)))
  for m in json.messages:
    text = m.content ? fix(m.content) : null
    kind = classify(m, text)
    if kind == 'system': continue
    t.messages.push({ threadId: slug, sender: fix(m.sender_name), ts: m.timestamp_ms, text, kind, len: text?.length ?? 0 })

fix(s):  // mojibake
  try: return new TextDecoder('utf-8').decode(Uint8Array.from(s, c => c.charCodeAt(0)))
  catch: return s

classify(m, text):
  if m.photos || m.videos || m.audio_files → 'media'
  if m.share → 'share'
  if text matches SYSTEM_PATTERNS → 'system'
     // ≈ /^(Liked a message|.* a réagi .*|.* sent an attachment|.* a envoyé une pièce jointe)$/i
  if text → 'text'
  else → 'system'
```

### 3.3 Révélation 1 — Cercle réel

```
circle(ds):
  for thread in ds.threads where !thread.isGroup:
    other = participants - me
    msgs = thread.messages
    sent = count(msgs where sender == me)
    recv = count(msgs where sender != me)
    if sent + recv < 10: continue

    // initiations : premier message après un silence >= 12 h
    initiated = 0; total = 0
    for i in msgs:
      if i == 0 || msgs[i].ts - msgs[i-1].ts > 12h:
        total++; if msgs[i].sender == me: initiated++

    // fréquence : jours distincts actifs / jours de la période
    activeDays = |distinct(dayOf(m.ts))|
    freq = activeDays / periodDays

    // score de proximité (≈)
    score = log(1 + sent + recv) * 1.0
          + balance(sent, recv) * 0.5        // 1 si 50/50, 0 si à sens unique
          + freq * 3.0
    push { other, sent, recv, initiatedRatio: initiated/total, activeDays, score }

  top = sortDesc(score).slice(0, 10)

  // twist close friends
  for p in top.slice(0, 5):
    username = resolveUsername(p.other, ds)
    p.notInCloseFriends = username && !ds.closeFriends.has(username)
    p.uncertain = !username

  return { top, notInCloseFriends: top.filter(p => p.notInCloseFriends) }

resolveUsername(name, ds):
  // ≈ normalise (minuscules, sans accents, sans espaces/points/underscores)
  //   et cherche une égalité ou un préfixe dans following ∪ followers
```

### 3.4 Révélation 2 — Groupes

```
groups(ds):
  for t in ds.threads where t.isGroup:
    total = t.messages.length; if total < 20: continue
    mine = t.messages.filter(sender == me)
    ratio = mine.length / total
    shortRatio = count(mine where len < 25) / max(1, mine.length)
    expected = 1 / t.participants.length
    lastMine = max(mine.ts) ?? null
    daysSilent = lastMine ? (ds.period.to - lastMine) / 1d : Infinity

    status =
      ratio > expected * 1.5 && shortRatio > 0.6 → 'Coordinateur'
      ratio > expected * 1.5                     → 'Moteur'
      ratio < expected * 0.4                     → 'Lurker'
      else                                       → 'Régulier'

    push { title: t.title, participants: t.participants.length, total, ratio, status, daysSilent }

  return {
    list: sortDesc(total),
    ghosted: list.filter(g => g.daysSilent > 30).length,
    mostActiveIn: argmax(ratio)
  }
```

### 3.5 Révélation 3 — Not following back

```
notFollowingBack(ds):
  dmContacts = usernamesOf(all non-group thread participants)   // via resolveUsername
  notBack = ds.following − ds.followers
  return {
    close:   notBack ∩ dmContacts,        // "tu leur parles, ils ne te suivent pas"
    distant: notBack − dmContacts,        // créateurs, célébrités, inconnus
    fans:    ds.followers − ds.following  // bonus : ceux qui te suivent sans retour
  }
```

### 3.6 Révélation 4 — Vocabulaire

```
vocabulary(ds):
  tokens = []
  for m in myTextMessages(ds):
    words = tokenize(m.text)   // minuscules, sans ponctuation, garde apostrophes internes, sans URL/@/#
    tokens.push(...words)

  words = tokens.filter(w => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
  topWords = topN(countBy(words), 20)

  bigrams  = topN(countBy(ngrams(tokens, 2).filter(notOnlyStopwords)), 10)
  trigrams = topN(countBy(ngrams(tokens, 3).filter(notOnlyStopwords)), 5)

  pos = count(tokens ∈ LEX_POSITIVE), neg = count(tokens ∈ LEX_NEGATIVE)
  positivity = pos / max(1, pos + neg)

  emojis = topN(countBy(extractEmojis(all my texts)), 5)
  return { topWords, bigrams, trigrams, positivity, emojis, totalWords: tokens.length }
```

### 3.7 Révélation 5 — Inside jokes

```
insideJokes(ds):
  // Passe 1 : fréquence de chaque terme par thread et par sender
  termStats = Map<term, { threads: Set<threadId>, byThread: Map<threadId, { me, them, firstTs }> }>

  for t in ds.threads where !t.isGroup:
    for m in t.messages where kind == 'text':
      for term in candidates(m.text):     // mots ≥ 4 chars + bigrammes, minuscules, lettres répétées réduites
        if EXTENDED_STOPWORDS.has(term): continue
        s = termStats.get(term); s.threads.add(t.id)
        b = s.byThread.get(t.id); b[m.sender == me ? 'me' : 'them']++; b.firstTs = min(b.firstTs, m.ts)

  // Passe 2 : filtres
  result = Map<threadId, Joke[]>
  for (term, s) in termStats:
    if s.threads.size > 2: continue                        // exclusivité inter-conversations
    for (threadId, b) in s.byThread:
      if b.me < 1 || b.them < 1: continue                  // répétition miroir
      if b.me + b.them < 5: continue                       // seuil
      invented = !DICTIONARY.has(term) && !DICTIONARY.has(singular(term))
      score = (b.me + b.them) * (invented ? 2 : 1) * (isBigram(term) ? 1.5 : 1)
      result[threadId].push({ term, count: b.me + b.them, firstTs: b.firstTs, invented, score })

  for threadId in result:
    result[threadId] = sortDesc(score).slice(0, 3)

  return topThreads(result, 8)   // les 8 conversations avec les meilleurs scores cumulés
```

Dictionnaire : générer hors-ligne un filtre de Bloom depuis une liste FR + EN (≈ 100 k formes fléchies, source `hunspell`), faux positifs 1 %, ~120 Ko. Un faux positif = « mot considéré comme réel » → l'inside joke est juste moins boostée, jamais perdue.

### 3.8 Révélation 6 — Records

```
records(ds):
  dm = ds.threads.filter(!isGroup)

  // 1. Journée la plus intense
  intenseDay = argmax over (thread, day) of count(messages ce jour)

  // 2. Message le plus long (envoyé par moi)
  longest = argmax(len) over myTextMessages ; preview = firstWords(text, 3)

  // 3. Silence le plus long (threads ≥ 20 messages, gap entre deux messages consécutifs)
  for t in dm where t.messages.length >= 20:
    for i in 1..n: gap = msgs[i].ts - msgs[i-1].ts
  silence = argmax(gap) → { other, from, to, days, resumed: to < ds.period.to }

  // 4. Réponse la plus rapide (mes réponses à eux, gap < 24 h, ≥ 10 échantillons)
  for t in dm: delays = [ gap where sender[i]==me && sender[i-1]!=me && gap < 24h ]
    if delays.length >= 10: typical = median(delays)     // médiane : robuste aux outliers
  fastest = argmin(typical)

  // 5. Message le plus tardif (00:00–05:59 heure locale, le plus proche de 05:59)
  latest = argmax(minutesSinceMidnight where hour < 6) over myTextMessages

  return { intenseDay, longest, silence, fastest, latest }
```

### 3.9 Révélation 7 — Premier / dernier

```
firstLast(ds):
  mine = myTextMessages(ds).sort(ts)
  return { first: { ts, to: otherOf(thread), text }, last: { ... } }
  // si period == 'all' : « Ton premier DM Instagram, il y a X ans. »
```

### 3.10 Révélation 8 — Profil relationnel

```
profile(ds, circle):
  initiator    = mean(circle.all.initiatedRatio) > 0.5                  // Initiateur | Répondeur
  concentrated = share of my messages to top 5 contacts > 0.6           // Concentré | Expansif
  fast         = medianReplyDelayAllThreads < 15 min                    // Rapide | Posé
  vocal        = meanMyMessageLength > 60 chars                         // Vocal | Sobre

  key = `${initiator?'I':'R'}${concentrated?'C':'E'}${fast?'F':'P'}${vocal?'V':'S'}`
  TYPES = {
    ICFV: { name: 'Le Pilier',            line: 'Tu lances, tu réponds vite, tu écris long — à une poignée de gens. Ils le savent.' },
    ICPS: { name: 'Le Fidèle discret',    line: '…' },
    IEFS: { name: 'Le Connecteur',        line: '…' },
    RCFV: { name: 'Le Confident',         line: '…' },
    RCPS: { name: 'Le Silencieux choisi', line: '…' },
    REFV: { name: "L'Ouvert",             line: '…' },
    …   // 10 nommés
  }
  return TYPES[key] ?? fallback(key)   // compose la phrase à partir des 4 axes
```

### 3.11 Export de cartes

```
ShareCard(reveal, variant):
  // DOM caché 1080×1920, fonts auto-hébergées (sinon html-to-image rate les glyphes)
  node = <StoryTemplate reveal={reveal} variant={variant} watermark anonymize={user.anonymize} />
  png = await toPng(node, { pixelRatio: 1, width: 1080, height: 1920, cacheBust: true })

  if isIOS: openInNewTab(png)   // l'utilisateur fait "enregistrer l'image"
  else: downloadBlob(png, `exposed-${reveal.id}.png`)
```

### 3.12 Gate publicitaire (cf. §5)

```
ExportFlow(cards):
  if user.hasTipped || session.adWatchedAt > now - 30 min:
    renderAll(cards)
  else:
    show(AdGate)           // « Cet export est offert par un sponsor — 15 s » + « Passer — 2 € »
    await adCompleted()    // rewarded ad callback OU timer sponsor auto-hébergé OU retour Stripe
    session.adWatchedAt = now
    renderAll(cards)
```

---

## 4. Rebranding sans IA

### 4.1 Diagnostic de la maquette actuelle (`exposed_dark_branding.html`)

Passée au crible des 61 détecteurs Impeccable + des principes Taste, la maquette coche presque tous les « AI tells » :

| Tell | Où | Pourquoi ça fait IA |
|---|---|---|
| **Dégradé Instagram officiel** (`#833AB4 → #FCCC63`) + glyphe Instagram | Logo, barre, swatches, avatar | 1) Marque de Meta → risque juridique réel pour un produit monétisé. 2) Premier réflexe de tout générateur. |
| **Gradient text** sur « posed » et « Révélation #1 » | Logo, cartes | Cliché n°1 des landings générées. |
| **Glow blobs radiaux** flottants | Cover | Cliché n°2. |
| **Pill partout** (`border-radius: 100px`) | Logo, badge, pill | Forme par défaut, aucune intention. |
| **Micro-labels uppercase espacés** à 10 px `#444` | Partout | Contraste WCAG insuffisant + esthétique « dashboard SaaS ». |
| **Inter** | Tout | Police par défaut de l'IA. Rien de faux, rien de signé. |
| **Cartes dans des cartes** (`.reveal-card` > `.card-grid` > `.root`) | Révélations | « Nested cards », détecté par Impeccable. |
| Dark `#0A0A0A` + bordures `0.5px #1E1E1E` | Tout | Le « Vercel dark » générique. |

À garder : le nom, la tagline, la logique éditoriale « dossier / révélations », la carte de partage lisible, la sobriété du fond sombre.

### 4.2 Direction : « le dossier qu'on t'ouvre »

Le concept est déjà dans `informations.txt` : *ambiance dossier secret*. On le pousse jusqu'au bout — pas un dashboard, un **document**.

**Références mentales** : couverture de rapport d'enquête, papier photocopié, tampons « CONFIDENTIEL », mono de machine à écrire mélangée à une grotesque très large pour les chiffres. Le ton : sec, factuel, un peu provocateur. Exposed ne « célèbre » pas tes stats comme Spotify Wrapped, il **les constate**.

**Palette** (finie, sans dégradé) :

| Rôle | Hex | Usage |
|---|---|---|
| Fond | `#0B0B0C` | **Tout le site**, accueil compris. Noir légèrement chaud, pas `#000`. |
| Papier | `#F3EFE6` | Surface **rare** : cartes de partage, citations de messages, tampon de couverture. Jamais un fond de page. |
| Encre | `#141414` | Texte sur papier. |
| Signal | `#E8442A` | **Une seule** couleur d'accent : rouge tampon. Chiffres clés, soulignements, « CONFIDENTIEL ». |
| Trait | `#2A2A2C` | Bordures 1 px pleines, jamais 0.5 px. (`#D9D3C6` uniquement sur papier.) |
| Sourdine | `#8A8A8E` | Métadonnées. Ratio ≥ 4.5:1 sur le noir. |

**Sombre partout, y compris l'accueil.** Le fond `#0B0B0C` ne change jamais, d'un bout à l'autre du site. Ce qu'on emprunte à Mobbin, ce n'est pas le blanc, c'est **la discipline** : une seule colonne, des marges énormes et constantes, aucune décoration, des bordures 1 px au lieu d'ombres, et une échelle typographique courte tenue partout. Le blanc de Mobbin n'est qu'un support — ce qui donne l'impression premium, c'est le vide et la constance. Ça se transpose intégralement en noir.

Conséquence directe sur la palette : le **papier** `#F3EFE6` n'est plus un terrain, c'est **la surface rare**. Il n'apparaît que sur les cartes de partage, les citations de messages et le tampon de couverture. Une carte claire sur fond noir, employée trois fois sur tout le site, frappe infiniment plus fort qu'une page entière en papier. C'est la même logique que le rouge signal : sa force vient de sa rareté.

Le corollaire à ne pas rater : sur fond noir, **le contenu doit fournir toute la couleur**. Les captures de cartes de révélation sur l'accueil sont les seuls éléments colorés de la page. S'il n'y a rien à montrer sur un écran, cet écran doit être noir et typographique, pas rempli d'effets pour compenser.

**Typographie** (deux familles, pas trois) :

- **Display** : *Bricolage Grotesque* 800 (ou *Fraunces* **non italique**) pour les titres de révélation et les gros chiffres.
- **Mono** : *JetBrains Mono* ou *Geist Mono* pour dates, handles, compteurs, tampons. Elle porte tout le côté « fichier ».
- Chiffres records en display à 96–160 px, `font-variant-numeric: tabular-nums`, `letter-spacing: -0.03em`.

**Logo** : wordmark seul, `exposed` en bas de casse mono, le `o` remplacé par un rond plein rouge (l'œil, le point « REC », le tampon). Pas d'icône, aucun emprunt à Instagram.

**Système** :

- Layout **une colonne**, max 640 px, scroll vertical par révélation. Pas de grille de cartes.
- Chaque révélation = une « page » du dossier : numéro mono en haut à gauche (`01 / 08`), titre display, sous-titre, données, un tampon rouge rotaté de −6° avec le verdict (« CONFIRMÉ », « GHOSTÉ », « PAS CLOSE FRIEND »).
- Bordures pleines, coins **4 px** max ou 0. Zéro pill.
- Une seule ombre autorisée : le papier sur le noir (`0 24px 48px -24px rgb(0 0 0 / .6)`).
- Micro-copie en français direct : « Tu lui parles plus qu'à tes close friends. Il n'y est pas. » Point. Pas d'emoji dans l'UI.

**Motion** (principes Emil Kowalski appliqués ici) :

- Durées : 100–160 ms retour d’appui, 150–250 ms micro-interactions. **Dans l’application, rien ne dépasse 300 ms** (règle du barème Emil Kowalski). Seul l’accueil, qui est du marketing explicatif, monte à 400–600 ms. Le déchiffrement est la seule exception assumée.
- Trois courbes, selon le rôle : `--ease-out: cubic-bezier(.23,1,.32,1)` pour toute entrée ou sortie, `--ease-drawer: cubic-bezier(.32,.72,0,1)` pour la carte épinglée et les surfaces qui glissent, `ease` pour les survols, `linear` pour les compteurs seulement. **Jamais `ease-in` sur de l’interface** : ça retarde l’instant que l’œil regarde.
- Animer `transform` et `opacity` uniquement. Pas de `height`, pas de `filter: blur()` animé sur mobile.
- **Déchiffrement** (intro) : le texte de la cover apparaît en caractères mono aléatoires qui se figent lettre par lettre en ~1.2 s, puis le tampon « OUVERT » claque (scale 1.4 → 1, 180 ms, ease-out) avec un léger `translateY` du papier. *La* signature motion, une seule fois.
- Chiffres : compteur 0 → valeur en 600 ms, ease-out, `tabular-nums` (pas de jitter).
- Entrée et sortie **asymétriques** : le geste délibéré est lent (appui 160 ms), la réponse du système est immédiate.
- **La fréquence décide.** Ce qui est vu des dizaines de fois par jour ne s’anime pas : bouton *Recommencer*, sélection de période, changement d’onglet — instantanés. Ce qui est vu une fois par rapport a droit à sa mise en scène.
- Tout état de survol passe derrière `@media (hover: hover) and (pointer: fine)`.
- Ce que l’utilisateur peut **toucher** utilise un ressort (`{ duration: 0.5, bounce: 0.2 }`), seul mécanisme interruptible qui conserve la vélocité. Le reste garde des durées fixes.
- `prefers-reduced-motion` : tout devient fondu 150 ms.
- Rien qui pulse en boucle, rien qui flotte.

**La distinction qui compte : mouvement piloté vs mouvement autonome.** La règle « rien qui flotte » interdit le mouvement *autonome* — la lueur qui respire, le carrousel qui défile tout seul, la pastille qui clignote. Elle n'interdit pas le mouvement **piloté par le scroll**, où l'utilisateur est la source du mouvement et le contrôle image par image. C'est exactement cette différence qui sépare une page qui « fait Apple » d'une page qui fait sapin de Noël. Sur l'accueil, le mouvement lié au scroll est non seulement autorisé, il est **la raison pour laquelle la page paraît chère** (cf. 6.3). Dans l'application, il reste minimal : on ne distrait pas quelqu'un qui lit ses propres données.

### 4.3 Comment utiliser les skills, concrètement

Les deux premiers sont **déjà installés** dans le projet, sous `.agents/skills/` — 25 skills au total, dont `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`, `redesign-existing-projects`, `emil-design-eng`, `animate`, `review-animations`, `find-animation-opportunities`, `apple-design`, `animation-vocabulary`.

```bash
npx skills add Leonxlnx/taste-skill
```
```bash
npx skills add emilkowalski/skill
```

Impeccable reste à installer et ne peut pas l'être en session non interactive :

```bash
/plugin marketplace add pbakaus/impeccable
```

Workflow, dans cet ordre :

1. **Écrire `PRODUCT.md` et `DESIGN.md`** à la racine (Impeccable les lit ; Taste s'en sert comme brief). Contenu : la section 4.2, mot pour mot, plus *mode utilisateur = Experience*, *audience = 16–30 ans FR/EN*, *mood = enquête, sec, premium*, *interdits = dégradés, glow, pills, emojis, Inter, italique serif*. Modèle en Annexe B.
2. **Taste** à la génération de chaque composant : « infère la direction depuis DESIGN.md, ne propose pas de template ». Son check « dark mode parity » ne s'applique pas : Exposed est **dark-only**, c'est un choix, documenté dans DESIGN.md.
3. **emil-design-eng / `animate`** sur deux terrains distincts. Sur l'accueil : la chorégraphie de scroll de 6.3, sept mouvements, en lui donnant explicitement la contrainte « piloté par le scroll, jamais autonome, jamais d'animation en sortie ». Dans l'application : trois moments seulement — déchiffrement, transition entre révélations, apparition du tampon. Passer `review-animations` après chaque implémentation, et `find-animation-opportunities` une seule fois, **en lui demandant surtout ce qu'il ne faut PAS animer**.
4. **Impeccable** en fin de chaque page : `/typeset` (hiérarchie), `/distill` (retirer), `/audit` (contraste, tells), `/polish` en dernier. `npx impeccable detect src/` dans la CI pour bloquer une PR qui réintroduit un dégradé.
5. **Règle humaine** : chaque écran doit avoir *un* élément qu'un générateur n'aurait pas fait (le tampon, le `o` rouge, la carte papier sur noir, la phrase sèche). S'il n'y est pas, l'écran n'est pas fini.

### 4.4 Vérification de la direction par les skills

Direction confrontée aux règles réelles de `apple-design`, `review-animations` (et son barème `STANDARDS.md`), `high-end-visual-design`. Voici ce qui tient, ce qui ne tenait pas, et les arbitrages.

**Ce que les skills confirment.** La courbe `cubic-bezier(0.32, 0.72, 0, 1)` que j'avais proposée est exactement la courbe « drawer iOS » recommandée par le barème d'Emil Kowalski. L'interdiction d'animer autre chose que `transform` et `opacity` est unanime. L'interdiction des écouteurs `scroll` en JavaScript au profit d'`IntersectionObserver` est explicite. L'interdiction d'Inter est littérale dans `high-end-visual-design`. Le `backdrop-filter` réservé aux éléments fixes ou collants, jamais sur du contenu qui défile, est une règle de performance formelle. Et la carte qui démarre à `scale(0.9)` respecte la règle « jamais `scale(0)`, toujours entre 0.9 et 0.97 ».

**Cinq corrections à apporter.**

| Ce que j'avais écrit | Ce que disent les skills | Correction |
|---|---|---|
| Transitions à 400–600 ms | Toute animation d'interface reste **sous 300 ms**. Seul le marketing peut dépasser. | L'accueil garde 400–600 ms, c'est du marketing explicatif. **Dans l'application, tout redescend sous 300 ms**, y compris les transitions entre révélations. |
| Une seule courbe pour tout | Trois courbes selon le rôle : entrée/sortie, déplacement, survol | `--ease-out: cubic-bezier(.23,1,.32,1)` pour les entrées, `--ease-drawer: cubic-bezier(.32,.72,0,1)` pour la carte épinglée, `ease` pour les survols. |
| Rotation de la carte à −8° | Les archétypes en cascade tiennent en −2° à 3°, et toute rotation saute sous 768 px | **−3°**, et zéro rotation en dessous de 768 px : elle crée des conflits de zone tactile. |
| Durées fixes partout | Tout ce que l'utilisateur peut toucher doit utiliser un **ressort**, seul mécanisme interruptible et sensible à la vélocité | Le carrousel glissable au doigt passe en ressort `{ duration: 0.5, bounce: 0.2 }`. Le reste, non tactile, garde des durées. |
| Rien sur le survol | Le survol doit être conditionné à `@media (hover: hover) and (pointer: fine)` | À ajouter systématiquement, sinon les états de survol se collent aux tapotements sur mobile. |

**Trois règles que je n'avais pas et qui sont importantes.**

- **La fréquence décide.** Une action répétée des dizaines de fois par jour ne s'anime pas, ou à peine. Dans Exposed, ça vise le bouton *Recommencer* et la sélection de période : instantanés, sans transition. Le déchiffrement, lui, est vu une fois par rapport, il a donc droit à sa mise en scène.
- **Entrée et sortie ne sont pas symétriques.** Le geste délibéré est lent, la réponse du système est immédiate. Un appui sur un bouton se comprime en 160 ms et se relâche plus vite.
- **Jamais d'`ease-in` sur de l'interface.** Ça retarde précisément l'instant que l'œil regarde. C'est un motif de rejet automatique en revue.

**Un conflit réel entre les skills, à arbitrer.** `high-end-visual-design` réclame des boutons en pilule intégrale, des badges arrondis avant les titres, des révélations au scroll de 800 ms avec un flou, et bannit les bordures 1 px grises. `review-animations` bloque les animations longues et le flou coûteux, et `apple-design` proscrit le flou sur du contenu qui défile. Ces deux-là ne peuvent pas être satisfaits en même temps.

**Arbitrage : la craft d'Emil Kowalski et d'Apple l'emporte, et le concept d'Exposed passe avant les deux.** Un dossier d'enquête n'a pas de pilules ni de badges arrondis — il a des angles droits et des bordures franches. Les pilules restent interdites, les bordures 1 px pleines restent la signature, et les révélations au scroll restent à 400 ms sans flou. Le seul emprunt retenu à `high-end-visual-design` est l'aération : des sections à `py-24` minimum, ce qui va dans le sens de la direction Mobbin.

C'est le point le plus utile de cet exercice : **une skill de design n'est pas une autorité, c'est un avis.** Deux d'entre elles se contredisent frontalement ici. Ce qui tranche, c'est le concept écrit dans `DESIGN.md`. Sans ce document, l'agent suit la dernière skill lue et le branding part à la dérive.

---

## 5. Monétisation

Contrainte : l'usage principal (import → rapport complet) reste **gratuit et sans pub intrusive**. On monétise **l'export** et la **gratitude**.

Objectif réaliste affiché : **50 €/mois**. Ça change tout — inutile de bâtir une régie publicitaire. Le classement par effort/rendement est donc : **tip jar d'abord**, **sponsor direct ensuite**, **AdSense en dernier**.

### 5.1 Le tip jar (levier principal — c'est lui qui atteint les 50 €)

Ko-fi ou Stripe Payment Link, 10 minutes de mise en place, aucun backend, aucune donnée bancaire chez toi. Ko-fi ne prélève rien sur le don en formule gratuite (seuls les frais du processeur s'appliquent) ; Stripe prend ~1.5 % + 0.25 €.

**Ce qui fait la conversion, ce n'est pas la plateforme, c'est l'emplacement et la phrase.** Trois placements, pas un de plus :

1. **Juste après la Révélation 8**, au pic émotionnel, quand l'utilisateur vient de lire qui il est. Carte papier, pas de bouton criard :
   > *Exposed n'a ni compte, ni serveur, ni tracking. Tes messages ne sont jamais sortis de ton téléphone.*
   > *Si ça t'a fait quelque chose : 3 €.*
2. **Sur l'écran d'export réussi**, une ligne discrète sous les cartes téléchargées.
3. **Footer de la landing**, une ligne mono, jamais un pop-up.

Montants : 3 € / 5 € / libre. Trois options, pas six. Et surtout : **jamais d'écran qui bloque**. Le tip jar qui n'interrompt rien convertit mieux que celui qui supplie.

À 2 000 rapports terminés par mois et 1 % de conversion à 3,50 € de moyenne, ça fait 70 €. Ton objectif est atteint par ce seul canal, sans une seule pub.

### 5.2 Sponsor direct (le plus premium, le plus rentable à petite échelle)

Un interstitiel de 15 s que **tu** contrôles, à l'export : ton HTML, ta typo, le visuel du sponsor, un lien. Zéro script tiers, zéro cookie, zéro CMP, aucune dégradation du branding.

Réalité du prix à ton échelle : une marque paie **50 à 150 €/mois** pour un emplacement vu par quelques milliers de personnes de 16-30 ans. Ne le vends pas avant d'avoir **30 jours de statistiques réelles**. Ensuite : une page média d'une seule feuille (audience, volume d'exports, capture de l'emplacement, prix), et des messages directs à des marques dont l'audience est exactement la tienne — applications de rencontre, marques de vêtements, festivals, éditeurs d'applications, écoles. Le taux de réponse est faible, le ticket est petit, mais c'est du revenu récurrent et propre.

**En attendant un sponsor, l'emplacement n'est pas vide** : il affiche ton propre message.
> *Exposed est gratuit et le restera. Cet export t'est offert.*
> *Tu peux soutenir le projet →*

C'est ce même écran qui porte le tip jar, ce qui règle le problème du placement.

### 5.3 Google AdSense — la réponse honnête à ta question

**Est-ce facile ?** Le code, oui : cinq minutes. Le reste, non.

Ton compte AdSense existant vient de YouTube. Depuis la scission d'« AdSense pour YouTube », un compte lié à une chaîne n'autorise pas toujours l'ajout d'un site : à vérifier dans ton compte, section *Sites*. Si l'option manque, il faut finaliser une inscription AdSense complète. Ensuite, **le site est examiné séparément de la chaîne** : Google veut du contenu original, une navigation réelle, des pages légales et de la politique de confidentialité en place, et un peu d'ancienneté. Compter de quelques jours à plusieurs semaines, avec des refus fréquents pour « contenu insuffisant » sur un site qui n'est qu'un outil. C'est précisément pour ça que la FAQ, le guide d'export et les pages de types comptent : ce sont eux qui rendent le site approuvable.

Les trois frictions réelles :

- **CMP certifié TCF v2.2 obligatoire** pour le trafic européen. Celui de Google est gratuit mais c'est une bannière de consentement à intégrer, à styler, et à respecter. C'est le vrai coût.
- **`ads.txt`** à la racine, sinon le remplissage s'effondre.
- **Seuil de paiement à 70 €**. À ton volume, sur une seule unité en bas de page d'accueil, tu générerais quelques euros par mois. **Tu risques d'attendre un an avant de toucher un virement.**

**Verdict** : l'unité AdSense native en bas de l'accueil ne coûte rien à garder, mais ne compte pas dessus pour les 50 €. Mets-la en place **après** le lancement, quand le site a du contenu et de l'ancienneté — et sache que si tu refuses la bannière de consentement, tu refuses AdSense. Les deux vont ensemble.

**Les « rewarded ads » web (Ad Placement API)** : je te les déconseille. C'est un produit pensé pour les jeux HTML5, l'accès est validé au cas par cas, et un outil comme Exposed passe mal. Le sponsor auto-hébergé fait le même geste, mieux, sans dépendance.

### 5.4 Option « passer la pub » — attention à un piège technique

Proposer « Passer — 2 € » via un lien de paiement Stripe est tentant, mais il y a un problème de conception à connaître avant de le construire : **le rapport vit uniquement en mémoire**. Rediriger vers Stripe détruit l'onglet, donc le rapport, donc l'utilisateur perd tout et paie pour rien.

La solution : ouvrir Stripe dans un **nouvel onglet**, garder l'onglet de l'application vivant, et écouter le retour via un `BroadcastChannel` ou un drapeau `localStorage` écrit par la page de succès. Aucune donnée sensible ne transite.

À faire seulement en P2, après le lancement. Ça ne vaut pas le risque de casser le parcours principal.

### 5.5 Ce que ça donne, honnêtement

Deux scénarios. Le premier est celui d'un lancement modeste — c'est celui sur lequel tu dois raisonner.

| Source | Petit mois (2 000 rapports) | Bon mois (15 000 rapports) |
|---|---|---|
| Tip jar (1 %, 3,50 € moyen) | **70 €** | **525 €** |
| Sponsor direct | 0 € (pas encore vendu) | 100 € |
| AdSense accueil (1 € pour 1 000 visites) | 4 € | 30 € |
| **Total** | **~75 €** | **~650 €** |

Coûts en face : domaine ~15 €/an, hébergement 0 €, Stripe/Ko-fi prélevés à la transaction. **Ton objectif de 50 €/mois tient uniquement avec le tip jar.** Tout le reste est du bonus, et le trafic de ce type de produit arrive par pics, pas en flux régulier : un bon mois de janvier peut valoir six mois de printemps.

La conséquence pratique : **ne construis pas de tuyauterie publicitaire avant le lancement.** Un lien Ko-fi bien placé et une page de dons, c'est tout ce dont tu as besoin le jour J.

### 5.6 Croissance intégrée au produit

- Chaque carte exportée porte le watermark `exposed.app` + QR discret → acquisition gratuite par les stories.
- Cartes « défi » : « Montre ton type relationnel » → l'ami veut le sien.
- Pages publiques `/type/le-pilier` (rien d'identifiant) pour le SEO et le partage.

---

## 6. Pages à faire

### 6.1 Navigation

Trois onglets dans l'en-tête, comme décidé. Tout le reste vit dans le pied de page.

```
en-tête :   exposed(logo)          Accueil   Wrapped   FAQ            [Soutenir]
pied :      Guide d'export · Les 10 types · Confidentialité · Mentions légales · CGU · Contact
            Exposed n'est pas affilié à Instagram ni à Meta.
```

L'en-tête est sur le même noir que la page, avec une bordure 1 px qui n'apparaît qu'au défilement. Le bouton *Soutenir* est un lien texte discret, pas un bouton plein. Sur mobile, l'en-tête tombe à : logo + les trois onglets, sans menu hamburger — trois entrées ne méritent pas un tiroir.

**Pourquoi il y a plus de pages que d'onglets** : les pages du pied ne sont pas de la navigation, ce sont des pages d'atterrissage. Elles existent pour deux raisons précises — Google a besoin de contenu réel pour ranker et pour approuver AdSense (cf. 5.3), et elles reçoivent le trafic de recherche que l'accueil ne capte pas. Un visiteur ne les cherche jamais dans le menu.

### 6.2 Tableau de bord des pages

| Route | Type | Indexée | Priorité | Objectif |
|---|---|---|---|---|
| `/` | Accueil | ✅ | **P0** | Convaincre en 5 secondes, envoyer vers `/wrapped` |
| `/wrapped` | Application | ❌ `noindex` | **P0** | Le produit. Import → rapport → export |
| `/faq` | Contenu | ✅ | **P0** | Lever les objections, nourrir le SEO et AdSense |
| `/confidentialite` | Légal | ✅ | **P0** | Argument de vente autant que page légale |
| `/mentions-legales` | Légal | ✅ | **P0** | Obligation LCEN |
| `/cgu` | Légal | ✅ | **P0** | Limite ta responsabilité sur les stats |
| `/guide-export-instagram` | SEO | ✅ | **P1** | Capter « comment télécharger ses données Instagram » |
| `/type/<slug>` × 10 | SEO | ✅ | **P1** | Longue traîne + partage social |
| `/soutenir` | Transactionnel | ✅ | **P1** | Page de dons, cible du bouton *Soutenir* |
| `/merci` | Transactionnel | ❌ | **P1** | Retour de paiement Ko-fi/Stripe |
| `/en/*` | Miroir | ✅ | **P2** | Le marché anglophone est 20× plus grand |
| `/404` | Système | ❌ | **P2** | Ne pas perdre le visiteur |

Douze routes au lancement en comptant les légales, dont **trois seulement sont visibles dans le menu**.

### 6.3 `/` — Accueil

La discipline Mobbin sur fond noir : une seule colonne large, des marges énormes, aucune décoration **statique** — la couleur vient uniquement des captures du produit. Pas de dégradé de fond, pas d'illustration abstraite, pas de blob, pas de lueur.

Mais l'immobilité n'est pas l'objectif. Ce qui rend ces pages désirables, chez Mobbin comme chez Apple, c'est que **le contenu réagit au scroll** : les éléments arrivent, les maquettes se déplacent, le texte se révèle ligne par ligne, les chiffres montent. La page est calme quand on ne la touche pas et vivante quand on la parcourt. C'est la distinction posée en 4.2 : le mouvement est **piloté**, jamais autonome.

*(Note : mobbin.com renvoie un 403 aux robots, je n'ai pas pu inspecter la page moi-même. Je m'appuie sur ta description.)*

#### Le vrai travail de cette page

Mobbin sert de référence **visuelle** — le calme, l'aération, la typographie, le mouvement au scroll. Sa structure de page, elle, ne s'applique pas : c'est un catalogue par abonnement avec des logos clients et des témoignages de designers. Exposed n'a rien de tout ça et ne doit pas faire semblant d'en avoir. L'anatomie ci-dessous découle du problème d'Exposed, pas du leur.

Ce problème est particulier et il faut le regarder en face : **tu ne demandes pas un clic, tu demandes une corvée.** Le visiteur doit aller dans les réglages d'Instagram, lancer un export, puis **attendre jusqu'à 48 heures**, et enfin revenir. Aucun autre produit de type Wrapped ne demande ça. Toute la page doit être construite autour de cet obstacle, sinon elle convertit à zéro quelle que soit sa beauté.

#### Anatomie de la page

| # | Section | Ce qu'elle fait |
|---|---|---|
| 1 | **En-tête** | Collant, noir translucide (`backdrop-filter`), sans bordure : un dégradé de masque là où le contenu passe dessous. Logo à gauche, les 3 onglets, *Soutenir* en lien texte. |
| 2 | **Hero** | H1 sur deux lignes max : *« Ce que tes DMs disent de toi. »* Sous-titre d'une phrase. Un bouton plein blanc, texte noir : *Ouvrir mon dossier* — le seul élément blanc plein de la page. Dessous, en mono : *Aucun envoi. Tout reste dans ton navigateur.* |
| 3 | **Le dossier s'ouvre** | Une carte papier épinglée en `position: sticky` qui se redresse et grandit au fil du scroll, avec le texte qui s'échange à côté. C'est le moment de bravoure de la page. |
| 4 | **Les révélations** | Les 8 cartes réelles défilant horizontalement au rythme du scroll vertical. C'est la section qui vend, parce qu'elle montre le produit au lieu de le décrire. |
| 5 | **Confidentialité** | *« Ouvre l'onglet Réseau de ton navigateur pendant l'analyse. Tu ne verras aucune requête. »* Ton seul argument que personne ne peut copier. Un tiers d'écran, minimum. |
| 6 | **Le chemin** | **La section décisive.** Les trois étapes, avec le délai Instagram annoncé franchement — voir ci-dessous. |
| 7 | **Les 10 types** | Les types relationnels en flux typographique, chacun lié à sa page. Du référencement qui ressemble à du design, et un aperçu de la conclusion du rapport. |
| 8 | **Appel final** | Plein écran, le titre et le bouton seuls sur le noir. |
| 9 | **Pied de page** | Multi-colonnes. L'unité AdSense native se glisse juste au-dessus, le jour où elle arrive. |

Neuf sections, pas de bandeau de logos, pas de témoignages, pas de compteur d'utilisateurs. Un produit qui n'a pas encore d'utilisateurs et ne prétend pas en avoir inspire plus confiance qu'un produit qui bluffe. Quand tu auras de vraies captures de cartes partagées en story, avec l'accord des personnes, elles remplaceront avantageusement n'importe quelle rangée de logos.

#### La section « chemin » — traiter le délai de 48 h

C'est là que se joue la conversion. Trois principes :

1. **Annonce le délai, ne le cache pas.** *« Instagram met de quelques minutes à 48 heures à préparer ton fichier. C'est leur délai, pas le nôtre. »* Une personne prévenue revient ; une personne surprise abandonne et se sent piégée.
2. **Donne le moyen de revenir.** Un bouton *Me le rappeler* qui télécharge un fichier `.ics` généré dans le navigateur, avec un rappel à 24 h et le lien du site. Zéro adresse e-mail, zéro compte, zéro serveur — c'est exactement la promesse du produit appliquée à son propre marketing.
3. **Rends la corvée petite.** Les instructions exactes, pas une paraphrase : le chemin dans les réglages, **le format JSON et pas HTML**, la période. Trois captures d'écran suffisent. Le détail du guide vit sur `/guide-export-instagram`, mais l'essentiel doit tenir ici.

#### Chorégraphie du scroll

Sept mouvements, pas un de plus. Chacun a un rôle, aucun n'est décoratif.

| Moment | Mouvement | Réglage |
|---|---|---|
| Titre du hero | Révélation ligne par ligne, chaque ligne masquée par un cadre qui remonte | 3 lignes, décalage 60 ms, 500 ms, `cubic-bezier(.32,.72,0,1)` |
| Chiffres du bandeau | Comptent de 0 à leur valeur en entrant dans l'écran | 700 ms, `tabular-nums`, une seule fois |
| Carte « dossier » | Épinglée pendant ~1,5 écran, passe de −3° et 0.9 à 0° et 1 au fil du scroll | Piloté image par image. **Aucune rotation sous 768 px** : conflits de zone tactile. |
| Texte à côté de la carte | Trois phrases qui s'échangent selon la progression | Fondu croisé 300 ms |
| Carrousel des 8 cartes | Translation horizontale liée à la progression verticale de la section | ~40 % de largeur d'écran par écran scrollé |
| Sections de contenu | Entrée en `translateY(16px)` + opacité | 400 ms, décalage 80 ms, **une seule fois, jamais en sortie** |
| Nuage de types | Chaque type apparaît en cascade | 40 ms de décalage, opacité seule |

Trois règles qui font la différence entre « Apple » et « site qui bouge trop » :

1. **Jamais d'animation à la sortie de l'écran.** Un élément qui disparaît quand on remonte donne le mal de mer. Une entrée, une seule fois, définitive.
2. **Amplitude minuscule.** 16 px de translation, pas 80. 3 degrés de rotation, pas 30. Chez Apple, ce qui impressionne, c’est la précision, pas l’ampleur. Et jamais `scale(0)` : rien n’apparaît à partir de rien, on démarre à 0.9.
3. **La page doit rester lisible sans aucun mouvement.** Si on désactive le JavaScript ou qu'on force `prefers-reduced-motion`, tout est visible immédiatement, à sa place. Le mouvement est une couche par-dessus une page qui fonctionne déjà.

#### Comment l'implémenter

- **Animations pilotées par le scroll en CSS** (`animation-timeline: view()` et `scroll()`, avec `animation-range`) pour tout ce qui est entrée de section et cascade. Zéro JavaScript, exécuté sur le fil de composition, donc fluide même sur un téléphone modeste. Le support navigateur n'est pas universel — traite-les en **amélioration progressive** : sans elles, le contenu est simplement visible, ce qui est le comportement voulu de toute façon.
- **`position: sticky`** pour l'épinglage de la carte dossier et du carrousel. C'est du CSS natif, ça ne nécessite aucune bibliothèque de scroll, et ça ne casse jamais.
- **`IntersectionObserver`** en repli pour les révélations à l'entrée, avec une classe posée une seule fois.
- **Motion (ex-Framer Motion)** `useScroll` + `useTransform` uniquement pour la carte épinglée et le carrousel, si le CSS ne suffit pas. Rien de plus lourd : pas de bibliothèque de scroll fluide, pas de scroll détourné. **Ne jamais confisquer le scroll de l'utilisateur** — c'est le défaut le plus détesté de ce genre de page.
- **Aucun écouteur `scroll` en JavaScript** qui écrirait des styles. C'est la garantie de perdre des images sur mobile.
- Le carrousel reste **glissable au doigt** en plus d'être lié au scroll, avec `scroll-snap`. Sur mobile, la liaison au scroll vertical se désactive au profit du glissement horizontal simple.
- Budget : au maximum **trois éléments animés simultanément** à l'écran. Au-delà, ça rame et ça se voit.

### 6.4 `/wrapped` — l'application

Une seule route, six états internes, aucune URL par étape (le rapport ne survit pas à un rechargement, autant ne pas mentir avec des adresses partageables). Même fond que le reste du site : il n'y a pas de bascule de thème, donc **c'est la mise en page qui doit signaler qu'on est entré dans le dossier** — la colonne se resserre à 640 px, l'en-tête de navigation disparaît, le compteur `01 / 08` le remplace.

| État | Écran | Détail |
|---|---|---|
| 0 · Accueil | « Tu as ton fichier ? » | Deux issues : *Oui, je le dépose* / *Pas encore* → renvoie vers `/guide-export-instagram`. Case « J'ai 15 ans ou plus ». |
| 1 · Dépôt | Zone de glisser-déposer | Accepte le `.zip`. Vérifie la signature du fichier avant de lancer le worker. Message d'erreur clair si c'est l'export HTML au lieu du JSON — c'est **l'erreur la plus fréquente**, elle mérite son propre écran. |
| 2 · Analyse | Déchiffrement | Progression réelle (entrées traitées / total), pas une barre décorative. C'est ici que vit l'animation signature. |
| 3 · Période | Choix de la fenêtre | 1 mois · 6 mois · 1 an · Tout. Recalcul instantané, données déjà en mémoire. |
| 4 · Rapport | 8 révélations | Défilement vertical, une révélation par écran. Barre de progression `01 / 08` fixe. Le tip jar apparaît après la 8ᵉ. |
| 5 · Export | Choix des cartes | Sélection des révélations à partager, bascule d'anonymisation, écran sponsor, génération, téléchargement. |

Règles absolues sur cette route : **aucun script tiers**, aucune balise AdSense, aucun outil de mesure, aucune écriture disque des messages. Un bouton *Recommencer* qui termine le worker et vide la mémoire.

### 6.5 `/faq` — FAQ

Douze questions, une par objection réelle. Balisage `FAQPage` de Schema.org, chaque question avec son ancre. C'est la page qui fait le double travail : rassurer les hésitants et donner à Google le contenu qu'il réclame.

Les questions à couvrir : *Est-ce que vous voyez mes messages ? · Où vont mes données ? · Comment je récupère mon fichier Instagram ? · Combien de temps Instagram met à l'envoyer ? · Pourquoi il faut choisir JSON et pas HTML ? · Mon fichier fait 800 Mo, ça va marcher ? · Est-ce que ça marche sur téléphone ? · Pourquoi je ne vois pas les photos de profil de mes contacts ? · Comment vous savez qui ne me suit pas en retour ? · Est-ce que c'est affilié à Instagram ? · C'est vraiment gratuit ? · Comment vous gagnez de l'argent ?*

Cette dernière question, réponds-y franchement. Un produit qui explique son modèle économique inspire davantage confiance qu'un produit qui prétend n'en avoir aucun.

**La preuve technique vit ici, pas sur l'accueil.** « Ouvre l'onglet Réseau de ton navigateur » ne parle qu'aux développeurs, et sur la page d'accueil ça inquiète plus que ça ne rassure. L'accueil dit simplement que les messages ne quittent pas la machine. La FAQ, elle, peut détailler, en commençant par l'image avant la manipulation :

> **Comment je peux en être sûr ?**
> Ton fichier est ouvert directement par ton navigateur, comme une photo que tu regardes sans la publier. Il n'y a pas de site à qui l'envoyer : Exposed n'a aucun serveur qui stocke quoi que ce soit.
>
> Si tu veux le vérifier toi-même : appuie sur F12 pendant l'analyse et ouvre l'onglet « Réseau ». Il liste tout ce que la page envoie ou reçoit. Pendant que ton rapport se calcule, il reste vide.

### 6.6 Pages légales

- **`/confidentialite`** — écris-la comme un argument, pas comme un contrat. Une première partie en français simple : *ce que nous ne collectons pas*. Une seconde partie technique qui explique le traitement local, pour les sceptiques. Une troisième, honnête, sur ce que tu traites réellement : dons, consentement publicitaire, mesure d'audience éventuelle.
- **`/mentions-legales`** — éditeur, hébergeur (Vercel Inc. et son adresse), directeur de publication, contact.
- **`/cgu`** — usage personnel, aucune garantie d'exactitude des statistiques, âge minimum 15 ans, propriété du contenu généré, désaffiliation Meta.

Ces trois pages ne sont pas optionnelles : sans elles, pas d'AdSense, et pas de conformité.

### 6.7 Pages SEO

- **`/guide-export-instagram`** — le guide pas à pas avec des captures de l'interface Instagram. Balisage `HowTo`. C'est la page qui va chercher le trafic le plus qualifié, parce que quelqu'un qui cherche à exporter ses données Instagram est à une étape de ton produit. Personne ne le fait bien en français.
- **`/type/<slug>`** × 10 — une page par type relationnel (`/type/le-pilier`, `/type/le-confident`…). Description du type, ce qu'il révèle, image de partage dédiée. Rien d'identifiant, aucune donnée. Ce sont des pages de partage autant que des pages de référencement : quelqu'un qui poste sa carte peut lier son type.

### 6.8 Pages transactionnelles

- **`/soutenir`** — pourquoi le projet est gratuit, ce que le don finance, les trois montants. Sobre.
- **`/merci`** — après paiement. Si tu implémentes le « passer la pub » (5.4), c'est cette page qui écrit le drapeau lu par l'onglet de l'application.

### 6.9 Ordre de construction

Ne construis pas les douze pages avant de lancer. L'ordre qui limite le risque :

1. `/wrapped` seule, sans design final, testée sur de vrais exports d'amis.
2. `/` + les trois pages légales. C'est le minimum publiable.
3. `/faq` + `/guide-export-instagram`, avant de demander l'examen AdSense.
4. `/type/*`, `/soutenir`, puis la version anglaise.

---

## 7. Tests et calibration sans lire les messages de personne

Le problème est réel : les seuils des révélations 1, 5 et 8 ne se règlent que sur des données variées, et personne ne va te confier ses DMs. Demander « je pourrai lire tes messages » est une phrase qu'on ne peut pas prononcer, et c'est très bien ainsi — si tu la prononçais, tu contredirais la promesse même du produit.

### 7.1 Le principe : la question ne se pose jamais

Tu n'as pas besoin de leurs messages. Tu as besoin de **savoir si les calculs produisent quelque chose de juste** sur leurs messages. C'est complètement différent, et ça se mesure sans lire une seule ligne.

La demande à formuler n'est donc pas « prête-moi ton export ». C'est : *« Fais tourner le site sur ton fichier. Tout se passe chez toi, je ne vois rien. Ensuite dis-moi ce qui était faux. »* Cette phrase-là, elle passe.

### 7.2 Ton propre export couvre l'essentiel

Ne bloque pas sur les amis. Un export « depuis le début » d'un compte actif contient des dizaines de conversations, des groupes, des années d'historique, des périodes creuses et des pics. C'est largement assez pour construire le parseur, écrire les huit révélations et dégrossir tous les seuils.

Les amis servent uniquement aux cas que ton propre compte ne contient pas : un compte anglophone, un compte très peu actif, un compte à dominante de groupes, un compte avec beaucoup de messages vocaux. Quatre profils, pas cinq exports complets.

### 7.3 Le mode diagnostic — ton idée de logs, faite correctement

Une URL `?diag=1` qui, à la fin de l'analyse, propose un bouton **« Télécharger le diagnostic »**. Le fichier produit est un JSON minuscule, **sans un seul mot de conversation**, que ton ami peut ouvrir et lire entièrement avant de décider s'il te l'envoie.

**Le piège, et il est fatal.** Si ce diagnostic contient le moindre fragment de contenu — un mot compté, un prénom, un identifiant, une date assez précise pour identifier un échange — alors : la promesse « rien ne sort de ton navigateur » devient un mensonge, tu deviens responsable de traitement au sens du RGPD pour des données de tiers qui n'ont rien consenti, et un seul internaute qui inspecte le fichier peut détruire le produit publiquement. Il n'y a pas de demi-mesure ici. **Le diagnostic doit être vide de contenu par construction, pas par filtrage.**

| Autorisé dans le diagnostic | Interdit, sans exception |
|---|---|
| Nombres de threads, de groupes, de messages | Tout texte de message, même tronqué |
| Distributions : médiane et quartiles des tailles de threads | Tout mot compté, tout n-gramme |
| Compteurs par révélation : combien de résultats sortis, combien de vides | Tout nom, prénom, identifiant, initiales |
| Booléens : chaque fichier attendu était-il présent | Toute date précise (garder le mois, ou juste des durées) |
| Durées de traitement, taille du ZIP, nombre d'entrées | Tout hachage de contenu — un hash reste une donnée personnelle |
| Langue détectée, part de messages non textuels | Toute photo, tout média |
| Codes d'erreur du parseur | Toute trace d'exécution brute |

```
buildDiagnostic(dataset, report):
  return {
    schema: '1',
    zip:      { sizeMB, entries, jsonEntries, parseMs },
    files:    { messages: bool, followers: bool, following: bool, closeFriends: bool, personalInfo: bool },
    volume:   { threads, groups, messages, mediaShare, spanDays },
    threads:  { p50Size, p90Size, maxSize },          // distributions, jamais la liste
    reveals:  { circle: n, groups: n, notBack: n, vocab: n, jokes: n, records: n, profile: typeKey },
    empties:  [ 'jokes', 'groups' ],                   // les révélations sorties vides
    errors:   [ 'E_SYSTEM_MSG_UNKNOWN_PATTERN' ],      // codes, jamais de texte
    lang:     'fr'
  }
```

Trois règles de mise en œuvre :

- **Rien d'automatique.** Aucun envoi réseau, jamais. Le fichier est téléchargé, l'ami l'envoie lui-même par le canal qu'il veut. De la télémétrie automatique, même anonyme, exigerait un consentement et changerait la nature juridique du site.
- **Affiche-le avant de le donner.** L'écran montre le contenu du diagnostic en clair, lisible, avant le téléchargement. C'est ce qui transforme « fais-moi confiance » en « vérifie ».
- **`?diag=1` reste actif en production.** C'est un outil de support, pas une porte dérobée : il ne fait que réafficher des agrégats déjà calculés dans le navigateur.

### 7.4 Le générateur de jeux de test synthétiques

Indispensable, indépendamment des amis. Un script Node qui fabrique de faux exports au format Instagram exact, avec des paramètres : nombre de threads, volume, langue, part de groupes, présence de mojibake, threads découpés en plusieurs fichiers, messages système, comptes supprimés, fuseaux horaires.

Il sert à deux choses que le réel ne peut pas faire : des tests **déterministes** en intégration continue, et la reproduction d'un cas limite qu'un ami a signalé sans avoir à lui redemander quoi que ce soit. Chaque code d'erreur remonté par un diagnostic doit devenir un jeu de test synthétique.

### 7.5 Ce que le diagnostic ne remplace pas

Il te dit que la révélation 5 a sorti trois résultats. Il ne te dit pas que ces trois résultats étaient `mdrrr`, `okok` et le prénom du chat. Cette partie-là, seul un humain peut te la donner, et elle ne coûte rien : cinq questions, en une fois, après qu'il a vu son rapport.

1. Une révélation t'a-t-elle paru fausse ou vide ? Laquelle ?
2. Les inside jokes détectées étaient-elles de vraies blagues internes, ou des tics de langage ?
3. Le top 10 du cercle correspond-il à tes vraies relations proches ?
4. Le type relationnel final te ressemble-t-il ?
5. Quelle carte aurais-tu partagée, et laquelle jamais ?

La cinquième est la plus précieuse : elle te dit quelles révélations méritent d'exister et lesquelles sont à couper. Note les réponses, elles valent plus que le diagnostic.

---

## 8. Checklists

### 8.1 Sécurité

Même sans serveur, le site manipule des données ultra-sensibles **dans le navigateur**. Le risque = exfiltration par une dépendance ou un script tiers.

- [ ] **CSP stricte** : `default-src 'self'; script-src 'self' <ads/stripe explicites>; connect-src 'self' <ads/stripe>; img-src 'self' blob: data:; worker-src 'self'; frame-src <ads/stripe>`. Pas d'`unsafe-inline` sur les scripts (nonces Next).
- [ ] **Isoler `/wrapped`** : la page app ne charge **aucun** script tiers (ni AdSense, ni analytics). Les pubs vivent sur la landing et sur la page d'export, dans une **iframe sandboxée** ou une route séparée qui ne reçoit que le PNG final.
- [ ] Le Worker n'a pas accès au réseau extérieur (`connect-src 'self'` s'applique aux workers).
- [ ] **Zéro persistance par défaut** : pas de `localStorage`/IndexedDB des messages. Option « garder mon rapport » = agrégats uniquement, chiffrés (WebCrypto AES-GCM, clé dérivée d'une passphrase).
- [ ] **Anti zip-bomb** : limite nombre d'entrées, taille décompressée cumulée, taille par JSON (> 200 Mo → refus propre). Timeout worker 120 s.
- [ ] **XSS via contenu de messages** : tout texte rendu via React (échappé) ; jamais de `dangerouslySetInnerHTML`, y compris dans les templates de cartes.
- [ ] **Dépendances** : `npm audit` en CI, lockfile committé, dependabot. Vérifier que `html-to-image` / `zip.js` n'embarquent pas de télémétrie.
- [ ] **SRI** sur tout script externe autorisé.
- [ ] Headers : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictive, `Cross-Origin-Opener-Policy`.
- [ ] Pas de Sentry sur `/wrapped` (un stack trace peut contenir un fragment de message). Si monitoring : codes d'erreur seulement.
- [ ] **Mode diagnostic** (7.3) : vide de contenu **par construction**, affiché en clair avant téléchargement, jamais envoyé automatiquement. Un test automatisé doit échouer si le diagnostic contient une chaîne provenant d'un message.
- [ ] **Preuve publique** : bouton « Vérifie toi-même » → ouvre l'onglet Réseau, importe, constate zéro requête. C'est un argument marketing.
- [ ] Analytics : rien, ou Plausible/Umami sans cookie, jamais sur `/wrapped`.
- [ ] Nettoyage mémoire : `URL.revokeObjectURL`, `worker.terminate()`, `dataset = null` au « Recommencer ».

### 8.2 Juridique (France / UE)

- [ ] **Marque** : retirer tout usage du logo, du glyphe et du dégradé Instagram. Footer : « Exposed n'est pas affilié à Instagram ni à Meta. Instagram est une marque de Meta Platforms, Inc. » Ne pas nommer le produit « Instagram Wrapped » (OK en usage descriptif dans le texte SEO).
- [ ] **RGPD, données DMs** : traitement local → tu n'es **pas** responsable de traitement pour les messages (pas de collecte). L'écrire noir sur blanc dans la politique de confidentialité, avec la description technique. Ça couvre aussi les données des **tiers** présents dans les DMs — tu ne les vois jamais.
- [ ] **RGPD, ce que tu traites vraiment** : cookies/identifiants publicitaires (AdSense), Stripe (email, paiement), analytics éventuels. Pour ceux-là tu es responsable : registre des traitements (une page), finalités, durées, base légale.
- [ ] **Consentement pub** : Google exige un **CMP certifié TCF v2.2** pour l'UE (son « Privacy & messaging » gratuit convient). Bannière conforme CNIL : « Refuser » aussi visible qu'« Accepter », pas de pré-cochage ; sans consentement → pub non personnalisée.
- [ ] **Mentions légales** (LCEN) : éditeur (nom ; pour un particulier, le nom + coordonnées de l'hébergeur suffisent), hébergeur (Vercel Inc., adresse), directeur de publication, contact.
- [ ] **CGU courtes** : usage personnel, pas de garantie sur l'exactitude des stats, âge ≥ 15 ans (majorité numérique FR) — écran d'import : « Tu dois avoir 15 ans ou plus ».
- [ ] **Statut** : dès le premier euro, **micro-entrepreneur** (URSSAF, gratuit, 10 min) ; activité libérale non réglementée. Franchise de TVA. Déclaration de CA mensuelle/trimestrielle. Stripe et Ko-fi demandent un statut pour les virements réguliers.
- [ ] **Facturation sponsors** : « TVA non applicable, art. 293 B du CGI ».
- [ ] **Contenu des cartes exportées** : c'est l'utilisateur qui publie le nom d'un tiers (« 2 847 messages à @marie ») — son choix, mais ajouter un rappel « Tu partages des infos sur d'autres personnes » et une **anonymisation en un clic** (initiales / flou).
- [ ] **Droit à l'image** : ne jamais afficher la photo de profil de tiers, même si un jour l'export la fournit.
- [ ] **Accessibilité** : pas d'obligation pour un particulier, mais WCAG AA sur les contrastes est gratuit et fait partie du premium.

### 8.3 Performance

- [ ] Web Worker pour parse + analyse ; UI à 60 fps, barre de progression réelle.
- [ ] Lecture ZIP **streaming**, uniquement les `.json`, jamais les médias.
- [ ] Parsing JSON thread par thread ; libérer `raw` après parse.
- [ ] Budget : landing < 100 Ko JS gzip, app < 250 Ko hors dictionnaire ; Bloom en `import()` dynamique après l'import du ZIP.
- [ ] Fonts auto-hébergées, `font-display: swap`, subset latin, `preload` des 2 fichiers.
- [ ] Zéro layout shift : hauteurs réservées pour les compteurs (`tabular-nums` + `min-width`).
- [ ] Animations `transform`/`opacity` uniquement ; `will-change` posé juste avant, retiré après.
- [ ] **Scroll de l'accueil** : aucun écouteur `scroll` en JS qui écrit des styles. Animations liées au scroll en CSS (`animation-timeline`) ou via `IntersectionObserver`, jamais en boucle de rendu manuelle.
- [ ] Trois éléments animés simultanément au maximum. Vérifier au ralentisseur CPU ×4 que le défilement tient 60 images par seconde sur la page d'accueil.
- [ ] Le scroll natif n'est jamais détourné : pas de scroll fluide artificiel, pas de section qui capture la molette.
- [ ] Page entièrement lisible avec JavaScript désactivé et avec `prefers-reduced-motion` forcé. À tester réellement, pas à supposer.
- [ ] Export PNG en `requestIdleCallback`, une carte à la fois, état de chargement ; `pixelRatio: 1`.
- [ ] Test avec un export de 1 Go sur Android milieu de gamme (throttling CPU ×4). Objectif : rapport < 20 s.
- [ ] Lighthouse landing ≥ 95 partout ; LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- [ ] Cache immutable sur assets hashés, `stale-while-revalidate` sur le HTML.

### 8.4 SEO

- [ ] Construire les pages listées en **section 6**, dans l'ordre donné en 6.9. Le SEO ne se rattrape pas après coup, il se décide dans l'arborescence.
- [ ] Le **guide d'export** (`/guide-export-instagram`) est la page la plus rentable du site : captures pas à pas, balisage `HowTo`, personne ne le fait bien en français.
- [ ] Bilingue FR/EN dès le début (`/en/…`), `hreflang`. Le marché EN est 20× plus gros.
- [ ] `title` ≤ 60 car., `meta description` ≤ 155, un H1 par page, H2/H3 réels.
- [ ] **Open Graph / Twitter cards** : image OG par page via `@vercel/og` dans le style « dossier ». C'est ce qui s'affiche au partage du lien.
- [ ] Schema.org `WebApplication` (+ `FAQPage`, `HowTo` sur le guide d'export).
- [ ] `/wrapped` en `noindex`, sitemap.xml + robots.txt propres.
- [ ] Pages `/type/<slug>` (10 types relationnels) : contenu unique, partageable, indexable — longue traîne gratuite.
- [ ] Page « Confidentialité » qui **explique techniquement** le zéro-serveur : contenu de confiance qui ranke sur « est-ce que X est sûr ».
- [ ] Mobile-first : 80 % du trafic viendra de stories/TikTok sur téléphone.
- [ ] Backlinks : article dev.to « J'ai construit un Wrapped Instagram sans serveur », Show HN (le côté privacy plaît), Product Hunt.
- [ ] Domaine : `exposed.app` / `getexposed.io` / `exposed.fr`. Aucun domaine contenant « instagram ».

---

## 9. Roadmap

| Semaine | Livrable |
|---|---|
| 1 | Générateur de jeux de test synthétiques (7.4), puis parseur ZIP + worker. Révélations 7, 1, 6 sur UI brute, validées sur **ton** export. |
| 2 | `DESIGN.md` + `PRODUCT.md`, install des 3 skills, cover + déchiffrement + template « page de dossier ». |
| 3 | Révélations 2, 3, 4, 5, 8. Lexiques. Bloom. Mode diagnostic `?diag=1` (7.3), puis 3-4 amis font tourner le site chez eux et répondent aux 5 questions de 7.5. |
| 4 | Export des cartes + écran sponsor (ton propre message au début) + lien Ko-fi. Accueil + 3 pages légales. |
| 5 | Impeccable `/audit` + `/polish`, perf Android, test export 1 Go, mise en ligne. |
| 6 | Lancement : 3 stories/TikTok scénarisés (« ce que j'ai découvert »), Show HN, Product Hunt. |
| 7+ | FAQ + guide d'export, puis demande d'examen AdSense avec le CMP. Pages de types, version EN. Démarchage sponsor avec 30 jours de stats. |

---

### Annexe A — Lexiques à constituer

- `STOPWORDS_FR` (~200) + `STOPWORDS_EN` (~180) : articles, pronoms, auxiliaires, prépositions, adverbes vides.
- `EXTENDED_STOPWORDS` (~500) : argot chat FR/EN — `mdr, ptdr, lol, lmao, jsp, jpp, wsh, wesh, ouais, nan, bah, genre, grave, trop, chaud, frr, frérot, bg, stp, svp, ok, okok, oui, non, hein, bref, enfin, du coup, tu sais, en vrai, en fait, c'est vrai, je sais, ah bon, ah ouais, mais oui, mais non…`. Réduire les lettres répétées (`lmaooo` → `lmao`) avant lookup.
- `LEX_POSITIVE` / `LEX_NEGATIVE` (~300 chacun, FR+EN), pondération 1, négation non gérée (assumé : « stat fun »).
- Dictionnaire FR/EN → filtre de Bloom généré par script Node depuis `hunspell` fr/en.

### Annexe B — `DESIGN.md` minimal (à copier)

```md
# Exposed — DESIGN.md
Mode: Experience. Audience: 16–30, FR/EN, mobile-first.
Concept: un dossier confidentiel qu'on t'ouvre. Ton sec, factuel, provocateur.
Sombre partout, accueil compris. De Mobbin on garde la discipline (une colonne, marges énormes, zéro décoration, bordures 1px au lieu d'ombres), pas le fond blanc. Le papier #F3EFE6 est une surface rare: cartes de partage, citations, tampon. Jamais un fond de page. Le contenu fournit toute la couleur.
Couleurs: bg #0B0B0C, papier #F3EFE6, encre #141414, signal #E8442A, trait #2A2A2C/#D9D3C6, muted #8A8A8E.
Typo: display Bricolage Grotesque 800 (ou Fraunces non-italique) ; mono JetBrains Mono. Deux familles max.
Formes: coins 0–4px. Bordures 1px pleines. Une seule ombre (papier sur noir).
Motion: app < 300ms partout (100-160ms appui, 150-250ms micro). Accueil marketing 400-600ms autorisé. transform/opacity only. Reduced-motion respecté.
Courbes: --ease-out cubic-bezier(.23,1,.32,1) entrées/sorties ; --ease-drawer cubic-bezier(.32,.72,0,1) surfaces qui glissent ; ease survols ; linear compteurs. JAMAIS ease-in sur de l’UI.
Jamais scale(0) -> démarrer à 0.9. Entrée/sortie asymétriques. Survol derrière @media (hover:hover) and (pointer:fine). Ressort {duration:.5,bounce:.2} pour ce qui est tactile.
Fréquence: ce qui est vu des dizaines de fois par jour ne s’anime pas (Recommencer, sélection de période, onglets).
Mouvement PILOTÉ par le scroll autorisé et souhaité sur l’accueil (sticky, animation-timeline, carrousel lié au scroll). Mouvement AUTONOME interdit partout (boucle, pulsation, défilement automatique). Jamais d’animation en sortie d’écran. Amplitude max 16px / 3deg (aucune rotation sous 768px). Max 3 éléments animés à la fois. Le scroll natif n’est jamais détourné.
Preuve sociale: pas de faux logos clients, pas de faux témoignages, pas de compteur inventé.
Interdits: dégradés, glow, pills, emojis dans l'UI, Inter, italique serif, cartes imbriquées, éléments qui pulsent, labels < 12px, texte sous 4.5:1.
Mobile: sous 768px aucune rotation ni chevauchement, une colonne. Sections py-24 minimum. min-h-100dvh, jamais h-screen (saut de viewport iOS).
Signature obligatoire par écran: tampon rouge rotaté, ou le "o" rouge, ou la carte papier.
```

## Addendum du 3 septembre 2026, contenu des chapitres

Decisions prises pendant la mise en place de l'accueil, a reprendre quand on
codera l'analyse.

### Chapitre 01, ton cercle reel

On montre les dix personnes a qui tu parles le plus. **Les photos de profil ne
sont pas dans l'export Instagram** : l'archive contient tes medias a toi, pas
les avatars de tes contacts, et aller les chercher voudrait dire appeler
Instagram depuis la page, donc envoyer les identifiants de tes contacts a un
tiers. C'est exclu. On affiche le pseudo, et au besoin une pastille aux
initiales, coloree par le jeton de la revelation.

### Chapitre 02, tes groupes

Le comptage seul ne dit rien. Ce qu'on veut sortir d'une conversation de
groupe :

- **La nature du groupe**, devinee par le vocabulaire et le rythme : classe,
  soiree, vacances, famille.
- **Le climat** : proportion de rires (mdr, ptdr, emoji de rire), de disputes
  (majuscules, ponctuation multiple, silences longs apres un pic).
- **Ton role dedans** : bavard, discret, celui qui lance, celui qui repond
  toujours en dernier, celui qui ne repond jamais.

Tout se calcule sur des comptages et des seuils, comme le reste. A calibrer
avec le mode `?diag=1` quand un vrai export sera disponible.

### Chapitre 04, ce que tu dis vraiment

Pas de pourcentage. Un pourcentage de lexique positif ne veut rien dire pour
personne. On sort **des mots** : le mot qui te distingue, celui que tu ecris
plus qu'un mot courant, et la formule que tu es seul a employer.

### Chapitre 06, tes cinq records

Les cinq sont nommes sur l'affiche : le plus tardif, le plus long, le plus
rapide, le plus bavard, et le plus attendu.

### Chapitre 07, premier et dernier

Deux valeurs de meme poids, jamais un chiffre geant et une phrase en petit :
l'oeil devait lire deux informations dans deux typographies differentes. Le
composant `Affiche` a une variante `paire` pour ca.
