---
name: infos-itar
description: >-
  Aligne les cours régionaux Succès Bac SM (arabe, français, éduc. islamique,
  HG) sur l’الإطار المرجعي للامتحان الجهوي 1er Bac SM/EX Maroc. Utiliser
  quand on parle d’إطار مرجعي, الجهوي, manques de cours, programme officiel,
  unités du régional, ou agent infos.
---

# Agent infos — الإطار المرجعي

Tu es l’agent **infos**. Ton job : chaque leçon régionale du site correspond à une **unité officielle** du régional 1er Bac (Sciences Maths / Sciences Expérimentales), avec vidéo 1er Bac Maroc et conclusion bilingue. Pas de chapitre 2e Bac, pas de cadre « مسلك اللغة العربية » pour l’HG.

## Fichiers

- `js/data-regional.js` — leçons `ar` / `fr` / `islam` / `hg`
- `js/data.js` — `subjects[]` (leads, search)
- Liste officielle des unités : [reference.md](reference.md)

Après une leçon ajoutée ou corrigée : suivre aussi `.cursor/skills/videos-cours/SKILL.md` et `.cursor/skills/conclusion-qualite/SKILL.md`.

## Cadres à utiliser (MEN)

| Matière | Cadre | Pas celui-ci |
|---|---|---|
| Arabe | الشعب العلمية والتقنية | Cadre lettres / أصيل |
| Français | جميع الشعب والمسالك | — |
| Islam | جميع الشعب | Programme 2e Bac (خطبة الوداع, اجتهاد…) |
| HG | علوم تجريبية + علوم رياضية (+ éco / sciences religieuses) | مسلك اللغة العربية |

Sources de vérité : PDF MEN / mémorandums 034–038 (MAJ annuelle). Relais utiles : mostajad.com, taalimpress, extraits CNE. Si un site mélange 1er et 2e Bac, **croiser** avec les titres YouTube « أولى باك » et [reference.md](reference.md).

## Workflow

1. Lire [reference.md](reference.md) et lister les `id` déjà dans `data-regional.js`.
2. Marquer **trou** = unité officielle sans leçon, ou leçon hors cadre.
3. Pour chaque trou : chercher une série YouTube **1er Bac Maroc**, même chaîne, oembed obligatoire (jamais d’ID inventé).
4. Une unité = **une** leçon. Sourate Yusuf = une leçon (série de séances), pas six micro-cours.
5. Rédiger `basics` / `conclusion` / `basicsAr` / `conclusionAr` / `formula` (qualité conclusions).
6. Semestre : S1 / S2 selon le programme habituel SM (histoire S1 monde/Maroc XIXe ; géo S2 = USA / UE / Chine).
7. `branch` parmi les libellés déjà dans `js/app.js` (`nass`, `lugha`, `taabir`, `oeuvre`, `langue`, `production`, `aqida`, `usra`, `iqtida`, `qist`, `hikma`, `quran`, `histoire`, `geo`). Ajouter le libellé dans `app.js` si tu crées une branche.

## Interdit

- Coller un cours 2e Bac (Ka, خطبة الوداع, النظر والتفكر « 2 باك », تكسير البنية 2BAC) sur le régional 1er Bac.
- Utiliser le cadre HG **مسلك اللغة العربية**.
- Inventer un youtubeId.
- Six leçons Yusuf alors qu’une série suffit.
- Remplir avec trois profs différents pour le même chapitre.

## Sortie

Chaque leçon nouvelle ou corrigée dans `data-regional.js`, IDs oembed OK, conclusions FR+AR. Mettre à jour le lead de la matière dans `js/data.js` si le nombre ou le périmètre des cours a changé.
