<div align="center">

# UNJED-BÉNIN — Site web institutionnel

**Union Nationale des Jeunes Engagés pour le Développement du Bénin**

*Engageons la jeunesse pour un Bénin meilleur.*

[🔗 Voir la démo en ligne](https://sedod.github.io/unjedbenin/)

</div>

---

## Description

Site vitrine institutionnel de l'**UNJED-BÉNIN** (organisation apolitique et laïque) :
histoire, vision, mission, valeurs, organigramme, 5 piliers d'action
(Éducation & Formation, Leadership & Citoyenneté, Insertion & Solidarité,
Culture & Environnement), actualités dynamiques, adhésion en ligne, contact,
multimédia, jeu éducatif, administration.

## Fonctionnalités

- **Accueil** : hero slider, mot du Président, domaines d'action, actualités, partenaires.
- **Présentation** : histoire, vision, mission, valeurs, organigramme + Bureau Exécutif.
- **Projets & activités** : 5 piliers + chiffres d'impact.
- **Actualités** : contenu dynamique depuis l'API (`GET /api/posts?visibility=public`).
- **Adhésion** : formulaire réel → `POST /api/adhesion` (repli Web3Forms si backend en veille).
- **Contact** : formulaire réel → `POST /api/contact` (repli Web3Forms).
- **Multimédia** : galerie/vidéos dynamiques depuis l'API.
- **Administration** : login session, CRUD publications, abonnés / adhésions / messages.
- ** transverse** : FR/EN, thème sombre, cookies, reveal au scroll, newsletter.

## Structure (architecture v2026)

```text
unjedbenin/                        # frontend statique (GitHub Pages, URLs stables à la racine)
├── index.html … contact.html      # 13 pages (dont 404.html)
├── assets/
│   ├── css/styles.css             # design system + couches correctives v1.1→v1.3 en fin de fichier
│   └── js/
│       ├── config.js              # point de vérité (API_BASE, clés storage)
│       ├── api-client.js          # fetch partagé (JSON/FormData, timeout)
│       ├── components.js          # header / footer / cookies / newsletter (utilise UNJED.*)
│       └── script.js              # thème, i18n FR/EN (+HTML riche), slider, formulaires réels
├── public/images/                 # médias statiques
├── backend/                       # API Flask (app.py, models.py, emailer.py, seed_admins.py)
├── robots.txt / sitemap.xml / site.webmanifest
├── render.yaml                    # déploiement Render en 1 clic (rootDir: backend)
├── SECURITY.md / CONTRIBUTING.md  # politique sécurité + conventions (commentaires en français)
├── .editorconfig / .gitattributes / .gitignore
├── .github/workflows/ci.yml       # CI : compile Python, syntaxe JS, garde-fous secrets
└── README.md
```

Ordre des scripts sur chaque page (important) :
`assets/js/config.js` → `assets/js/api-client.js` → `assets/js/components.js` → `assets/js/script.js`.
Les pages spécifiques (`actualites`, `multimedia`, `administration`) utilisent
`window.UNJED.apiBase()` — plus aucune URL backend en dur éparpillée,
surchageable en local via `?api=http://127.0.0.1:5000`.

## Audit — ce qui a été corrigé

**Critique (sécurité / fonctionnel)**
- Mot de passe admin en dur dans `app.py` → supprimé, bootstrap via `ADMIN_USERNAME`/`ADMIN_PASSWORD`.
- CORS bloquait le vrai domaine (`sedod.github.io` absent) → ajouté + `EXTRA_ORIGINS`.
- `multimedia.html` : `if (API_BASE.indexOf("unjedbenin") !== -1) return;` désactivait
  **toujours** le contenu dynamique → supprimé, chargement réel depuis l'API.
- `actualites.html` : `innerHTML` avec données API (XSS) → reconstruction DOM en `textContent`.
- `administration.html` : `className = "card.reveal"` (classe inexistante) → `"card reveal"`.
- `script.js` : formulaires « démo » qui jetaient les données (Web3Forms jamais appelé
  à cause du `preventDefault`) → envoi réel backend + repli Web3Forms.
- Hero `data-fr-html`/`data-en-html` jamais traduit → `applyLang` gère désormais les 2.
- `Member.profile` `NOT NULL` sans défaut → nullable (500 évité).
- `original_filename` jamais stocké → `secure_filename` + téléchargement nommé.
- `emailer.py` lisait les env à l'import (config figée) → lecture à chaque envoi + timeout SMTP.

**CSS (styles.css ~2300 lignes, 2 design systems fusionnés)**
- Variables fantômes (`--card-bg`, `--nav-bg`, `--green-mid`, `--gray-900`, …) → définies
  dans la couche corrective (fini les fonds transparents / ombres absentes).
- `.btn-outline` défini 2× (dont une version blanche invisible sur fond clair) → version
  claire par défaut + `.btn-outline-light` pour le hero.
- `.hero` : `margin-top:70px` + `body padding-top:76px` + `100vh` → double décalage supprimé,
  hauteur `clamp(480px, 82vh, 760px)`.
- `.cookie-banner` défini 2× (carte vs bandeau pleine largeur) → unifié en carte flottante.
- `.reveal` : `script.js` ajoute `.in`, l'ancien CSS attendait `.visible` → les 2 acceptées.
- Couche « CORRECTIFS AUDIT 2026 » en fin de fichier : skip-link, `:focus-visible`,
  contraste jaune AA (`--yellow-dark`), boutons désactivés, responsive formulaires.

**UI / UX**
- Slider : pastilles sans label, 3s sans pause, ignore `prefers-reduced-motion`
  → labels ARIA, 5s, pause au survol, respect du mode réduit, `Echap` ferme le menu mobile.
- Images sous la ligne de flottaison en `loading="lazy"` + `decoding="async"`,
  hero en `preload` ; anti-FOUC thème via script inline dans `<head>`.
- SEO : `canonical`, Open Graph/Twitter, `sitemap.xml`, `robots.txt` (admin exclu),
  `site.webmanifest`, `lang` synchronisé avec la langue choisie.
- Backend : validation email/téléphone + longueurs, anti-abus par IP,
  `GET /api/config`, `/api/health` versionné, endpoints admin
  `/api/admin/members` + `/api/admin/messages`.

**Dette restante (assumée, pas bloquante)**
- `styles.css` mériterait une fusion complète des 2 systèmes (~−800 lignes) — la couche
  corrective garantit déjà un rendu cohérent sans risque de régression.
- Header/footer injectés en JS (SEO partiel) — atténué par sitemap + contenu `<main>` statique.
- Pas de tests automatisés ; vérifié : `py_compile` backend + `node --check` des 4 JS.

## Lancer en local

Frontend : ouvrir `index.html` (ou Live Server port 5500).
Backend : voir `backend-unjed/backend/README.md`
(`COOKIE_SECURE=0`, `?api=http://127.0.0.1:5000` côté frontend).

## Déploiement

- Frontend : GitHub Pages (branche principale).
- Backend : Render via `render.yaml` (vars : `SECRET_KEY`, `ADMIN_*`, `DATABASE_URL`, `MAIL_*`).
  Alternative documentée : PythonAnywhere (voir README backend).

## Auteur

**DOUNON Sèdonou Théophile** — Développeur web, étudiant en Statistiques Appliquées à l'ENSPD (Université de Parakou).
- GitHub : [@SEDOD](https://github.com/SEDOD)

---
*Audit + refonte v1.1 — octobre 2026 : architecture `assets/js` centralisée, backend durci, UI/UX corrigée, SEO de base.*
*Correctifs v1.2–v1.4 : cookies opaques persistants, hero/pages internes, menu mobile+desktop, compteurs impact, navigation à sous-menus (L'Union / Nos Actions) + CTA « Devenir membre », newsletter actualités câblée, cartes news blindées.*
