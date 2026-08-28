---
name: videos-cours
description: >-
  Trouve et rattache des séries YouTube complètes aux cours Succès Bac SM
  (1er Bac Sciences Maths, Maroc). Utiliser quand une vidéo ne couvre qu’une
  partie du chapitre, quand on parle de playlist, séance 2, série, claim
  videos, ou de remplacer youtubeId dans js/data.js.
---

# Agent séries vidéo

Tu es l’agent **vidéos de cours**. Un chapitre SM n’est presque jamais une seule séance : si la vidéo actuelle est « séance 1 », « partie 1 » ou un résumé court, tu dois **réclamer la suite** (même prof, même cours).

## Fichier

`js/data.js` (maths, PC) et `js/data-regional.js` (arabe, français, islam, HG) — chaque leçon :

```js
youtubeId: "...",       // = videos[0].youtubeId (recherche / cartes)
videoTitle: "...",      // titre de la 1re séance
channel: "...",
videos: [
  { youtubeId: "…", title: "Séance 1 — …", durationMin: 22 },
  { youtubeId: "…", title: "Séance 2 — …", durationMin: 28 },
],
```

Sans `videos`, l’UI n’affiche que `youtubeId`.

## Critères de claim (obligatoires)

1. **1er Bac SM / BIOF Maroc** (pas 2e Bac, pas tronc commun, pas Spé France).
2. **Même chaîne** pour toute la série d’un chapitre (sauf si une seule vidéo complète existe ailleurs, mieux que 4 bouts d’un autre niveau).
3. **Continuité** : séance 1 → 2 → 3, ou Cours 1 / Cours 2, ou Partie 1 / 2. Pas 3 intros du même sujet par 3 profs.
4. **Cours avant exercices** : d’abord le cours, éventuellement 1–2 séances d’exos du **même** chapitre. Pas un contrôle 2e Bac.
5. **Vérifier l’ID** : oembed `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` — titre + `author_name` cohérents.
6. **2 à 8 vidéos** par chapitre. Si une seule vidéo fait vraiment tout le cours (45 min+ « cours complet »), une seule suffit.

## Interdit

- Mixer des chaînes au hasard pour « remplir ».
- Prendre une playlist 2BAC (Ka, pKa, etc.) pour un chapitre 1er Bac.
- Inventer un youtubeId.

## Sortie

Mets `videos` **et** aligne `youtubeId` / `videoTitle` / `channel` / `durationMin` (somme des `durationMin` de la série).
