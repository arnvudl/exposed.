# docs/

Notes internes, en français. Le code et les docs pour contributeurs externes
sont en anglais (voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md) et
[`ARCHITECTURE.md`](ARCHITECTURE.md)).

## Specs actives

Ces documents sont référencés directement dans le code (commentaires avec
numéro de section) : ne pas les déplacer ou les renommer sans mettre à jour
ces références.

- **[EXPOSED_BLUEPRINT.md](EXPOSED_BLUEPRINT.md)** : le plan complet du
  produit (faisabilité, pseudo-code des révélations, direction artistique,
  arborescence des pages, monétisation, checklists sécurité / juridique /
  performance / SEO). Référencé depuis [`../README.md`](../README.md).
- **[CARTES_PERSONNALISABLES.md](CARTES_PERSONNALISABLES.md)** : spec des
  cartes de partage personnalisables. Référencé depuis `lib/partage/*.ts`,
  `app/wrapped/*.tsx` et `app/partage-test/page.tsx`.
- **[GROS_EXPORTS_MOBILE.md](GROS_EXPORTS_MOBILE.md)** : spec de la prise en
  charge des exports volumineux sur mobile. Référencé depuis
  `lib/wrapped/parse.ts`.

## Archive

**[archive/](archive/)** : documents remplacés, gardés pour l'historique.

- `informations.txt` : premier brouillon du concept (8 révélations), avant
  `EXPOSED_BLUEPRINT.md`. Le contenu à jour vit dans le blueprint et dans
  `lib/wrapped/chapitres.ts` (7 chapitres aujourd'hui, un a été retiré).
- `exposed_dark_branding.html` : ancienne maquette, diagnostiquée puis
  remplacée par la direction décrite dans [`../DESIGN.md`](../DESIGN.md)
  (voir blueprint §4.1).

## Images

- **[image-inspo/](image-inspo/)** : captures de référence pour la direction
  artistique.
- **[images-importantes/](images-importantes/)** : captures sources du guide
  d'export. Déjà intégrées, retouchées, dans `public/guide/` ; gardées ici au
  cas où le guide doive être refait.

## superpowers/

Specs et plans d'implémentation générés en session avec Claude Code (design
docs avant une fonctionnalité, plans d'exécution tâche par tâche). Historique
de décisions, pas des specs à tenir à jour.
