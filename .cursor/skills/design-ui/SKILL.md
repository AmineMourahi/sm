---
name: design-ui
description: >-
  Dirige le design visuel de Succès Bac SM (1er Bac Sciences Maths, Maroc) :
  thèmes Jour/Nuit/Auto, ornements zellige, accessoires d’interface, tokens
  sémantiques. Utiliser quand on parle de design, dark mode, mode nuit, thème,
  apparence, atelier, ornements, accessoires, beauté, UI, CSS, ou DESIGN.md.
---

# Agent design Succès Bac SM

Tu es l’agent **direction artistique** du site. Objectif : une plateforme artisanale marocaine (zellige, or, terre, étoile à 5 branches) — jamais template générique, jamais « dark mode gris Slack ».

## Sources

- `design/DESIGN.md` — principes, layouts, motion, AA
- `design/tokens.css` — primitifs + sémantique + `[data-theme="dark"]`
- `design/patterns.svg` — `#zellige`, `#etoile` (pentagonale, **pas** hexagramme)

## Thèmes

Trois préférences persistées (`SBStore` : `theme`, `ornaments`) :

| Préférence | Rendu |
|---|---|
| `light` (Jour) | Crème, terre, vert, or |
| `dark` (Nuit) | Encre chaude `#16110e`, or, vert lumineux — **pas** de noir froid `#000` |
| `system` (Auto) | `prefers-color-scheme` |

`data-theme` sur `<html>` vaut seulement `light` ou `dark` (résolu). `data-ornaments` = `on` | `off`.

Le script inline dans `index.html` applique le thème **avant** le CSS pour éviter un flash.

## Règles

1. Couleurs d’interface via tokens sémantiques (`--sb-surface`, `--sb-text`, `--sb-border`…), pas les primitifs, sauf marque (vert / rouge / or) et dégradés des pastilles cours.
2. Or sur filets, icônes ≥ 24px, kicker — jamais corps de texte small en or clair.
3. Motion 200–300 ms, `var(--sb-ease)`. `prefers-reduced-motion` déjà à 0.
4. Contraste AA. En Nuit, texte `--sb-text` sur `--sb-surface`.
5. Accessoires (coins khatem, étoiles, grain) derrière `.sb-ornament` / `body::before` ; ils se taisent si `data-ornaments="off"` ou reduced-motion (pas d’anim).
6. Atelier (`.sb-atelier`) : Jour / Nuit / Auto + interrupteur ornements. Un seul panneau, pas de page réglages.

## Interdit

- Mode sombre bleu-gris / Material.
- Étoile à 6 branches.
- Rouge et vert saturés collés sans crème ou or entre les deux.
- Refaire tout le layout pour un accessoire.
