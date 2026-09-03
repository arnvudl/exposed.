# Exposed.

> You might see some things. We show them.

Un Wrapped pour tes DMs Instagram, qui tourne **entièrement dans ton navigateur**.
Tu déposes l'export de tes données Instagram, tu lis ton rapport, tu partages ce que tu veux.
Aucun message ne quitte ta machine — pas de compte, pas de serveur, pas de tracking.

## État

Pré-développement. Le plan complet vit dans **[docs/EXPOSED_BLUEPRINT.md](docs/EXPOSED_BLUEPRINT.md)** :
faisabilité, pseudo-code des 8 révélations, direction artistique, arborescence des pages,
monétisation, et les checklists sécurité / juridique / performance / SEO.

## Principes non négociables

1. **Zéro serveur pour les données.** Le parsing et l'analyse tournent dans un Web Worker, côté client.
2. **Zéro script tiers sur `/wrapped`.** Ni pub, ni analytics, ni monitoring sur la page qui touche aux messages.
3. **Vérifiable.** N'importe qui peut ouvrir l'onglet Réseau pendant l'analyse et constater qu'il ne se passe rien.

## Stack visée

Next.js · TypeScript · export statique.

## Skills de design

Le projet s'appuie sur des skills tierces, non versionnées ici (voir `skills-lock.json`) :

```bash
npx skills add Leonxlnx/taste-skill
```
```bash
npx skills add emilkowalski/skill
```

---

Exposed n'est pas affilié à Instagram ni à Meta. Instagram est une marque de Meta Platforms, Inc.
