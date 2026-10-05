# Contribuer — UNJED-BENIN

## Environnement

- Frontend : site statique, aucune compilation. Servez la racine
  (`python -m http.server` ou Live Server) et ouvrez `index.html`.
- Backend : `cd backend`, `cp .env.example .env`, `pip install -r requirements.txt`,
  `python app.py` (voir `backend/README.md`).

## Conventions

- **Langue du code** : commentaires et messages en **français** (le site est bilingue
  FR/EN via les attributs `data-en`, jamais de texte en dur sans équivalent).
- **Styles** : 2 espaces (HTML/CSS/JS), 4 espaces (Python), fins de ligne LF
  (voir `.editorconfig` — votre éditeur les applique automatiquement).
- **CSS** : ne dupliquez pas — la couche corrective en fin de `assets/css/styles.css`
  (v1.1 → v1.6) surcharge les anciens systèmes ; toute rustine s'y ajoute datée.
- **JS** : un seul écouteur délégué par famille d'événements (voir `assets/js/script.js`),
  pas d'`innerHTML` avec des données API (utiliser `textContent`).
- **Backend** : toute route publique POST exige `application/json` (garde anti-CSRF),
  toute action admin exige session + origine vérifiée ; validez bornes et formats.

## Workflow

1. Créez une branche depuis `main` : `eucher/<sujet-court>` ou `fix/<sujet-court>`.
2. Une PR = un sujet, description courte + captures si visuel.
3. La CI doit être verte (compilation Python, syntaxe JS, aucun secret commité).
4. Jamais de commit direct sur `main` pour les changements sensibles (backend, auth).
