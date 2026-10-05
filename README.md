<div align="center">

# UNJED-BÉNIN — Site web institutionnel

**Union Nationale des Jeunes Engagés pour le Développement du Bénin**

*Engageons la jeunesse pour un Bénin meilleur.*

[🔗 Site officiel](https://sedod.github.io/unjedbenin/) · [🔗 Démo de la branche `eucher/refonte-professionnelle`](https://t0b0i7.github.io/unjedbenin/)

</div>

---

## Description

Site vitrine institutionnel de l'**UNJED-BÉNIN** (organisation apolitique et laïque) :
histoire, vision, mission, valeurs, organigramme, 5 piliers d'action
(Éducation & Formation, Leadership & Citoyenneté, Insertion & Solidarité,
Culture & Environnement), actualités dynamiques, adhésion en ligne, contact,
multimédia, jeu éducatif, administration.

## Fonctionnalités

- **Accueil** : hero slider, mot du Président, domaines d'action, compteurs animés,
  actualités, partenaires premium, contact.
- **Présentation** : histoire, vision, mission, valeurs, organigramme + Bureau Exécutif.
- **Projets & activités** : 5 piliers + chiffres d'impact animés au scroll.
- **Actualités** : contenu dynamique depuis l'API (`GET /api/posts?visibility=public`),
  newsletter câblée au backend.
- **Adhésion** : formulaire réel → `POST /api/adhesion` (repli Web3Forms si backend en veille).
- **Contact** : formulaire réel → `POST /api/contact` (repli Web3Forms).
- **Multimédia** : galerie/vidéos dynamiques depuis l'API.
- **Administration** : login session, CRUD publications, abonnés / adhésions / messages.
- **Transverse** : FR/EN, thème sombre, cookies persistants, reveal au scroll, newsletter.

## Structure (architecture v2026)

```text
unjedbenin/                        # frontend statique (GitHub Pages, URLs stables à la racine)
├── index.html … contact.html      # 13 pages (dont 404.html)
├── assets/
│   ├── css/styles.css             # design system + couches correctives v1.1→v1.8 en fin de fichier
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
surchageable en local via `?api=http://127.0.0.1:5000` (schéma `http(s)` imposé).

## Journal détaillé des travaux (branche `eucher/refonte-professionnelle`)

### 1. Audit initial et architecture (v1.1)

- **Backend** : mot de passe admin en dur supprimé (bootstrap via `ADMIN_USERNAME` /
  `ADMIN_PASSWORD`) ; CORS corrigé (`sedod.github.io` manquant, ajout de `EXTRA_ORIGINS`) ;
  `Member.profile` rendu nullable ; `original_filename` stocké via `secure_filename` ;
  `emailer.py` relit les variables d'environnement à chaque envoi + timeout SMTP 15 s ;
  nouveaux endpoints `/api/contact`, `/api/admin/members`, `/api/admin/messages`,
  `/api/health` versionné, `/api/config` public.
- **Bugs fonctionnels** : `multimedia.html` contenait `if (API_BASE.indexOf("unjedbenin") !== -1) return;`
  qui désactivait *toujours* le contenu dynamique → supprimé ; `actualites.html`
  construisait du `innerHTML` avec les données API (faille XSS) → reconstruction DOM en
  `textContent` ; `administration.html` utilisait `className = "card.reveal"` (classe
  inexistante) → `"card reveal"` ; formulaires « démo » qui jetaient les données
  (`preventDefault` sans envoi) → envoi réel backend + repli Web3Forms ; traduction du
  titre hero (`data-fr-html`/`data-en-html`) ignorée → gérée par `applyLang`.
- **Nouvelle architecture frontend** : `assets/js/config.js` (URL backend centrale) et
  `assets/js/api-client.js` (fetch partagé) ; `components.js`/`script.js`/`styles.css`
  rangés sous `assets/` ; `backend-unjed/backend/` aplati en `backend/`
  (historique git conservé par `git mv`, `render.yaml` et docs mis à jour).
- **CSS** : variables fantômes définies (`--card-bg`, `--nav-bg`, `--green-mid`, …),
  `.btn-outline` dédoublé → version claire + `.btn-outline-light` pour le hero,
  double décalage hero/pages internes supprimé, bannière cookies unifiée en carte
  flottante, `.reveal.in` et `.reveal.visible` acceptés, `:focus-visible`, skip-link,
  contraste jaune AA, boutons désactivés visibles.
- **UI/UX** : slider labellisé ARIA, 5 s, pause au survol, `prefers-reduced-motion`,
  `Echap` ferme le menu ; `lazy`+`async` sous la ligne de flottaison, `preload` du hero,
  anti-FOUC thème ; SEO (`canonical`, Open Graph/Twitter, `sitemap.xml`, `robots.txt`,
  `site.webmanifest`, `404.html`, `lang` synchronisé).

### 2. Cookies, responsive et standards ONG (v1.2)

- Bannière 100 % opaque (`z-index: 9999`), choix **persistant** accepté/refusé
  (`localStorage`), lien « En savoir plus » vers la politique de confidentialité,
  focus sur « Accepter », `Echap` = simple report, `role="dialog"` + `aria-live`.
- Bouton « Refuser » adouci (contour au lieu du rouge agressif).
- Pastilles du slider en zone tactile 44 px ; `overflow-wrap` footer/contacts ;
  feuille d'impression (dossiers ONG) ; `autocomplete`/`inputmode` + honeypot
  silencieux sur les formulaires ; `theme-color` + manifeste + `id="contenu"`
  généralisés aux 13 pages ; liens footer vers Statuts et Confidentialité.

### 3. Hero, pages internes, hamburger, architecture (v1.3)

- **Hero invisible** : `.hero-slides` et `.hero-content` tous deux en absolu avec parent
  à hauteur auto → slides à hauteur 0. Corrigé : slides absolus plein cadre, contenu
  repassé en flux normal (c'est lui qui donne la hauteur), fond dégradé de repli.
- **Pages internes trop basses** : `body padding-top` + `.page-hero margin-top` cumulés
  (~146 px de vide) → un seul offset.
- **Hamburger inatteignable** : à 360–390 px le header débordait et poussait les boutons
  hors écran → header compacté, délégation d'événements + `MutationObserver`
  (insensible à l'ordre d'injection), overlay, lien actif robuste aux query/hash.

### 4. Navigation à sous-menus + newsletter + cartes news (v1.4)

- 8 liens tassés → **Accueil · L'Union ▾ · Nos Actions ▾ · Adhésion · Partenariats · Contact**
  (L'Union : Présentation, Organigramme, Statuts ; Nos Actions : Projets, Actualités,
  Multimédia, Jeu éducatif) + bouton vert **« Devenir membre »** dans le header et le drawer.
- Desktop : survol + focus clavier + clic tactile, chevron rotatif, `aria-expanded`,
  `Echap`/clic extérieur referment, parent surligné si enfant actif, pont anti-trou de survol.
- Mobile : accordéons dans le drawer. Traduction FR/EN complète.
- Newsletter des actualités : la classe `newsletter-input` n'existait dans aucun CSS
  (champ brut, semblant rogné) → style pilule + **câblage réel** (le formulaire n'était
  relié à rien : ni backend ni Web3Forms) vers `/api/subscribe` avec repli Web3Forms.
- Cartes news blindées : fond placeholder, `min-height`, titres insusceptibles d'être
  rognés, masquage gracieux des images cassées.

### 5. Compteurs d'impact animés

- Section « Notre impact » (`projets.html`) : défilement 0 → valeur (1 000+, 50+, 12, 40+),
  easing `easeOutExpo` ~1,8 s, déclenché une fois à 40 % de visibilité, séparateur
  français, chiffres tabulaires, `prefers-reduced-motion` et sans-JS affichent la valeur finale.

### 6. Section Partenaires premium (v1.5)

- 4 pastilles de texte → cartes avec icônes SVG (monument, chapeau, cœur, globe),
  description courte, halo doré, sous-titre et CTA « Devenir partenaire → ».
- Cascade d'entrée (90 ms), survol : soulèvement via la propriété `translate`
  (sans conflit avec l'animation d'entrée), pastille verte + rotation, barre
  d'accent vert→or, flèche du CTA qui glisse.

### 7. Header pleine largeur (v1.6)

- Header sorti du container 1180 px → logo au coin gauche, actions au coin droit.
- Lien actif en pastille, soulignement animé au survol, repli resserré sur laptop.

### 8. Mobile premium (v1.7)

- Bouton hero « Devenir membre » en blanc lumineux + boutons pleine largeur, voile
  de slider renforcé, titre équilibré.
- Drawer : fond massif réaffirmé, tête avec mini-logo + bouton ✕ dédié, filets de
  séparation, actif en pastille, CTA détaché.

### 9. Drawer lumineux + ouverture en cascade (v1.8)

- **Cause du fond sombre** : le panneau vit *dans* le header (`z-index: 1000`) alors que
  l'overlay était à `1001` — le voile recouvrait le menu lui-même. Corrigé (voile à 999).
- Voile clair flouté (blanc dépoli / noir doux en sombre), ombre portée, glissé avec
  courbe de ressort subtile, entrées en cascade (50 ms), `aria` et `Echap` conservés.

### 10. Images manquantes de la galerie (correctif)

- Audit automatisé de **toutes** les références d'images du site : seules
  `solidarite.png` et `culture.png` (`multimedia.html`, galerie + miniatures vidéo)
  n'existaient pas — les fichiers sont en `.jpeg`. Corrigé (4 occurrences).

### 11. Audit de sécurité + backend (v1.2, 24/24 tests automatisés)

- **Anti-CSRF à 2 niveaux** (requis par `SameSite=None`) : `application/json` exigé
  (415 sinon) + `Origin`/`Referer` vérifié sur les actions admin (403 sinon).
- **Flask-Limiter** (login 15/15 min, subscribe 20/h, adhésion/contact 10/h, 429 JSON),
  sessions admin **12 h**, JSON ≤ 100 Ko, `external_url` restreinte à `http(s)`
  (anti XSS stockée), honeypot **serveur**, plafonds de longueurs.
- Uploads : allowlist, noms UUID, 50 Mo max ; headers `nosniff`/`SAMEORIGIN`/`Referrer-Policy`.
- SQL 100 % ORM ; dépendances épinglées et testées (Flask 3.1.3, Werkzeug 3.1.9,
  Flask-Cors 6.0.5, Flask-Limiter 4.1.1, `psycopg2-binary` pour Postgres).
- Frontend : `?api=` restreint à `http(s)`.
- Détails et procédure : `backend/README.md`, `SECURITY.md`.

## Lancer en local

Frontend : servir la racine (`python -m http.server` ou Live Server) et ouvrir `index.html`.
Backend : voir `backend/README.md` (`COOKIE_SECURE=0`, `?api=http://127.0.0.1:5000` côté frontend).

## Déploiement

- Frontend : GitHub Pages. Démo de cette branche : https://t0b0i7.github.io/unjedbenin/
  (fork, source = `eucher/refonte-professionnelle`, site officiel sur `main` intact).
- Backend : Render via `render.yaml` (vars : `SECRET_KEY`, `ADMIN_*`, `DATABASE_URL`, `MAIL_*`).
  Alternative documentée : PythonAnywhere (voir README backend).

## Mise en production — conseils de sécurité (checklist)

À appliquer **dans l'ordre**, avant d'ouvrir le site au public :

1. **Secrets**
   - [ ] Générer une vraie `SECRET_KEY` (`python -c "import secrets; print(secrets.token_hex(32))"`),
     une par environnement (jamais la même en local et en prod).
   - [ ] **Changer immédiatement** le mot de passe exposé au commit `0223d09`
     (`seed_admins.py` sur le serveur) — le considérer comme compromis. Si le dépôt
     devient public, purger l'historique (`git filter-repo`) puis rotation totale.
   - [ ] Ne jamais commiter `.env` ni `*.db` (la CI le vérifie à chaque push).
   - [ ] Mots de passe admin : 12 caractères minimum, uniques, stockés en gestionnaire.
2. **Base de données et fichiers**
   - [ ] Quitter SQLite : passer à **Postgres** (`DATABASE_URL`, bloc prêt dans `render.yaml`).
     Sur Render gratuit, SQLite et `static/uploads` sont **effacés à chaque redéploiement**.
   - [ ] Prévoir un stockage persistant pour les uploads (disque Render ou stockage objet S3).
   - [ ] Mettre en place des **sauvegardes** : dump régulier de la base + copie des uploads,
     testées par une restauration annuelle.
3. **Serveur et HTTPS**
   - [ ] Forcer HTTPS partout (Render le fournit ; vérifier `COOKIE_SECURE=1` en prod).
   - [ ] Laisser `DEBUG` désactivé (gunicorn sans `--reload`, comme dans `render.yaml`).
   - [ ] Restreindre `EXTRA_ORIGINS` au strict nécessaire ; retirer les origines de test.
4. **Comptes et accès**
   - [ ] Un compte admin **par personne** (traçabilité), jamais de compte partagé ;
     révoquer les accès des partants sans délai.
   - [ ] Principe du moindre privilège sur le dashboard Render/GitHub (pas d'admin inutile).
   - [ ] Double authentification activée sur GitHub, Render et Gmail (mots de passe
     d'application pour le SMTP, jamais le mot de passe normal).
5. **Services tiers**
   - [ ] Web3Forms : clé publique par design → restreindre le **domaine autorisé** dans
     le dashboard et surveiller le quota/spam.
   - [ ] Surveiller les quotas Render (mise en veille = backend lent au premier appel ;
     le frontend gère déjà ce cas avec messages + replis).
6. **Maintien en condition**
   - [ ] Mettre à jour les dépendances (`pip-audit` / Dependabot) et tester avant chaque montée.
   - [ ] Relire les logs d'accès après tout pic de trafic ; seuils d'alerte sur les 429/403.
   - [ ] Sauvegarder aussi le dépôt git (miroir) et documenter la procédure de restauration.
7. **Données personnelles (adhérents, contacts, abonnés)**
   - [ ] Ne collecter que le nécessaire, informer via la politique de confidentialité,
     honorer suppressions et exports sur demande.
   - [ ] Ne jamais exporter les emails vers des outils non autorisés ; chiffrer les
     sauvegardes contenant des données personnelles.
8. **En cas d'incident**
   - [ ] Isoler (rotation `SECRET_KEY` + mots de passe admin = déconnexion générale),
     qualifier via les logs, corriger, communiquer aux personnes concernées si des
     données ont fuité. Procédure de signalement : `SECURITY.md`.

## Auteur

**DOUNON Sèdonou Théophile** — Développeur web, étudiant en Statistiques Appliquées à l'ENSPD (Université de Parakou).
- GitHub : [@SEDOD](https://github.com/SEDOD)

---
*Travaux : audit initial + refonte v1.1, correctifs v1.2→v1.8, audit sécurité/backend v1.2 (24/24 tests), architecture `assets/`+`backend/`, docs et CI — branche `eucher/refonte-professionnelle`, octobre 2026.*
