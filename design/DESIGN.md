# Succès Bac SM! — Design system

Plateforme d'élite pour le **1er Bac Sciences Maths** (Maroc). Contenu pédagogique **100 % français**. Touche arabe décorative uniquement : « نجاح الباك ». Sensation artisanale (zellige, or, terre) — jamais template générique, jamais « site scolaire 2012 ».

Importer `tokens.css`. Motifs : `patterns.svg#zellige` (fonds de sections) et `patterns.svg#etoile` (hero, footer, empty states). Étoile **pentagonale** (drapeau) — jamais hexagramme.

---

## Principes

1. **Papier cahier** (crème un peu jauni), encre terre, vert et rouge en **filets / onglets** seulement, or et cobalt zellige pour le décor — pas un landing « drapeau sticker ».
2. **Titres Cormorant Garamond** (italique, imprimerie), **corps Karla**, **Amiri** pour l’arabe.
3. **Mobile-first**, une colonne jusqu’à 768px ; grille magazine dès 1024px.
4. **Motion 200–300 ms**, `cubic-bezier(0.22, 1, 0.36, 1)`. `prefers-reduced-motion` : durées à 0.
5. **AA** : texte `--sb-text` sur `--sb-surface` ; or clair = décor ; liens `--sb-text-link` ; focus gold visible.
6. **Pas de verre flou, pas de pills, pas de cartes 16:10 dégradées** — fiches bristol, sommaire numéroté, marge rouge de cahier.

---

## Layouts

### Accueil — `sb-page-home`

```
[ sb-header sticky ]
[ sb-hero          ]  crème + watermark zellige (opacity 0.35)
[ sb-pillars       ]  3 cartes Maths / PC / Méthode
[ sb-featured      ]  grille de sb-course-card
[ sb-strip         ]  bande terre, or, « نجاح الباك »
[ sb-footer        ]
```

- **Header** (`sb-header`) : logo wordmark + étoile verte 16px, nav Programme / Cours / Stats, CTA `sb-btn sb-btn--primary`. Fond crème 92 % flou, bordure bas `--sb-border`. Mobile : burger `sb-header__toggle`, panneau plein écran.
- **Hero** : kicker or uppercase tracking-wide (« 1er Bac · Sciences Maths ») ; `h1` Fraunces 2.75rem → 3.5rem ; lead Outfit 1.125rem max 38em ; Amiri 1.75rem sous le titre, aligné à droite logique (RTL). Deux CTA : primaire vert, secondaire outline terre. Pas d'image stock : motif + filet or 1px.
- **Container** : `max-width: var(--sb-container)`, gutter token, section `padding-block: var(--sb-section-y)`.

### Programme — `sb-page-programme`

```
[ sb-header ]
[ sb-pagehead     ]  titre + filtre année / matière (chips)
[ sb-programme    ]  2 colonnes dès md : Maths | Physique-Chimie
  [ sb-module     ]  accordion chapitre + barre de progression
    [ sb-course-card x n ]
[ sb-footer ]
```

- Pagehead : titre + sous-titre pédagogique (objectifs du tronc commun SM).
- Chips `sb-chip` : Toutes / Maths / PC ; état `is-active` = fond vert, texte crème.
- Module : en-tête sticky local (titre chapitre, %, chevron). Corps : liste de leçons (durée, statut).

### Cours — `sb-page-cours`

```
[ sb-header ]
[ sb-cours        ]  dès lg : player 1fr + notes 22rem
  [ sb-player     ]  16:9, fond #1A120E
  [ sb-notes      ]  collapsible (aside → bottom sheet mobile)
[ sb-cours-meta   ]  fil d'Ariane, titre leçon, tags matière
[ sb-conclusion   ]  carte crème-deep, filet or à gauche
[ sb-cours-nav    ]  précédent / suivant
[ sb-footer ]
```

- **Player** : overlay contrôles crème ; play or ; barre de progression verte ; titre leçon en Outfit 14px. Pas de chrome YouTube brut : cadre `sb-player` radius `--sb-player-radius`, ombre `--sb-shadow-lg`.
- **Notes** : titre « Mes notes », textarea, auto-save hint. Bouton `sb-notes__toggle`. Ouvert : slide 280ms. Fermé desktop : rail 48px avec icône. Mobile : feuille bas, poignée, max-height 70vh.
- **Conclusion** : « À retenir » — 3 à 5 puces, formule / théorème en `sb-callout`. Amiri possible pour un mot-clé arabe en marge, jamais pour le cours.

### Stats — `sb-page-stats`

```
[ sb-header ]
[ sb-pagehead     ]  « Ta progression »
[ sb-stats-hero   ]  3 sb-progress-ring : Maths · PC · Global
[ sb-stats-grid   ]  cartes : leçons vues, temps, série
[ sb-stats-list   ]  modules + barres
[ sb-footer ]
```

- Anneaux : Maths vert, PC rouge, Global or profond (`--sb-ring-*`). Label Fraunces au centre (pourcentage), légende Outfit sm en dessous. Taille 140px mobile, 180px desktop.
- Une seule lecture : le % global n'est pas la moyenne visuelle des couleurs, c'est un token dédié.

---

## Composants & BEM

| Bloc | Rôle |
|---|---|
| `sb-header` / `__brand` `__nav` `__toggle` `__cta` | Navigation |
| `sb-hero` / `__kicker` `__title` `__lead` `__arabic` `__actions` | Accueil |
| `sb-btn` `--primary` `--secondary` `--ghost` `--danger` | Actions |
| `sb-course-card` / `__media` `__badge` `__title` `__meta` `__progress` | Carte cours |
| `sb-progress-ring` / `__svg` `__track` `__value` `__label` `__caption` | Stats |
| `sb-progress` / `__bar` `__fill` | Barre linéaire |
| `sb-player` / `__frame` `__controls` `__time` `__seek` | Vidéo |
| `sb-notes` / `__toggle` `__head` `__body` `--collapsed` `--sheet` | Notes |
| `sb-conclusion` / `__title` `__list` | Fin de leçon |
| `sb-stat-card` / `__value` `__label` `__hint` | KPI dashboard |
| `sb-chip` `is-active` | Filtres |
| `sb-badge` `--maths` `--pc` `--new` | Matière / statut |
| `sb-module` / `__head` `__body` `is-open` | Accordion programme |
| `sb-callout` `--formula` | Encadré pédagogique |
| `sb-strip` / `__arabic` | Bande terre |
| `sb-footer` | Pied |

**Cartes cours** : image/motif 16:10, badge matière, titre 1.25rem, meta (durée · chapitre), `sb-progress` 4px. Radius `--sb-radius-lg`, ombre `--sb-shadow-sm`.

**Boutons** : hauteur 44px min (touch), pill ou radius-md, primaire fond vert texte crème, hover `--sb-green-deep`. Secondaire : fond transparent, bordure terre, hover fond cream-deep. Interdit : rouge + vert saturés côte à côte sans or / crème entre les deux.

---

## États hover, focus, motion

| Cible | Hover (200-240ms) | Focus-visible |
|---|---|---|
| `sb-course-card` | `translateY(-4px)`, `--sb-shadow-hover`, filet or 1px | ring gold |
| `sb-btn--primary` | fond `--sb-green-deep`, léger scale 1.02 | ring gold |
| `sb-btn--secondary` | fond `--sb-cream-deep` | ring gold |
| `sb-header__nav a` | couleur vert profond + underline or 2px | ring |
| `sb-chip` | bordure gold | ring |
| `sb-module__head` | fond white | ring intérieur |
| `sb-notes__toggle` | icône or | ring |
| `sb-player__seek` | thumb 12 to 14px | ring sur thumb |

- Ouverture notes / accordion / burger : **280-300ms**, ease token, `transform` + `opacity` (pas `height` seul si possible).
- Progress ring : `stroke-dashoffset` 300ms au montage.
- Pas de bounce, pas de parallaxe lourd. Un seul lift à la fois.

---

## Accessibilité (AA)

- Contraste corps >= 4.5:1 (terre / crème). Or `#C9A227` : traits, icônes >= 24px, jamais texte small.
- Player : contrôles nommés, seek clavier, captions si présentes.
- Anneaux : le % est aussi en texte (pas couleur seule) — Maths / PC / Global différenciés par label + couleur.
- `aria-expanded` sur notes, modules, burger. Skip link `sb-skip` vers `#main`.

---

## Fond motifs

```css
.sb-hero {
  background-color: var(--sb-cream);
  background-image: url("patterns.svg#zellige");
  background-size: 144px 144px;
  background-blend-mode: multiply;
}
```

Opacité visuelle cible ~ 20-35 %. Ne jamais poser un motif dense derrière du texte small : overlay crème 80 % ou motif limité au bas du hero.