# Backend UNJED-BENIN — API Flask

API du site vitrine : auth admin, publications (annonces / documents / images / vidéos),
abonnés newsletter, adhésions, messages de contact.

## Démarrage local

```bash
cd backend
cp .env.example .env   # puis renseigne SECRET_KEY, ADMIN_* …
pip install -r requirements.txt
set COOKIE_SECURE=0    # Windows / http local (session Lax au lieu de None+Secure)
python -c "from app import app; app.run(port=5000, debug=True)"
```

Tester : `http://127.0.0.1:5000/api/health` → `{"status":"ok", ...}`.
Le frontend local utilise `?api=http://127.0.0.1:5000` ou la détection auto
(`assets/js/config.js` pointe vers le port 5000 sur localhost).

## Variables d'environnement

Voir `.env.example`. Minimum en production (Render / PythonAnywhere) :

| Nom | Obligatoire | Rôle |
|---|---|---|
| `SECRET_KEY` | oui | sessions Flask (générer : `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `ADMIN_USERNAME` + `ADMIN_PASSWORD` | oui (1er déploiement) | admin créé au démarrage, jamais en dur dans le code |
| `DATABASE_URL` | non (sqlite sinon) | ex. Postgres Render |
| `EXTRA_ORIGINS` | non | domaines frontend en plus, séparés par des virgules |
| `MAIL_*` | non | SMTP (sinon les emails sont juste journalisés, sans erreur) |
| `COOKIE_SECURE` | non (`1` défaut) | mettre `0` en local http |

## Comptes admin

- Au démarrage : créés depuis `ADMIN_USERNAME` / `ADMIN_PASSWORD` (aucun mot de passe en dur).
- Ensuite : `python seed_admins.py` (saisie clavier, hash en base, jamais en clair).

## Endpoints

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| GET | `/api/health` | non | sonde |
| GET | `/api/config` | non | petite config publique |
| POST | `/api/admin/login` | non (limité 15/15min/IP) | ouvre la session |
| POST | `/api/admin/logout` | non | ferme la session |
| GET | `/api/admin/me` | session | admin courant |
| GET | `/api/posts?visibility=public` | non | contenu public (site) |
| GET/POST | `/api/posts` | admin pour POST | gérer le contenu |
| DELETE | `/api/posts/<id>` | admin | supprimer (+fichier) |
| GET | `/api/posts/download/<id>` | non si public* | téléchargement PDF |
| POST | `/api/subscribe` | non (limité) | newsletter |
| POST | `/api/adhesion` | non (limité) | demande d'adhésion + notif admin |
| POST | `/api/contact` | non (limité) | message contact |
| GET | `/api/admin/subscribers` | admin | liste abonnés |
| GET | `/api/admin/members` | admin | demandes d'adhésion |
| GET | `/api/admin/messages` | admin | messages contact |

\* `download` vérifie l'existence du fichier ; le filtrage public/membres se fait via `/api/posts`.

## Déploiement Render (recommandé)

`render.yaml` à la racine du repo crée le service `unjedbenin-api`
(`rootDir: backend-unjed/backend`, gunicorn 2 workers).
Renseigner dans le dashboard : `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
`DATABASE_URL` (optionnel), `MAIL_*` (optionnel), `EXTRA_ORIGINS` (si domaine custom).

## Déploiement PythonAnywhere (alternatif, plan gratuit)

1. Compte Beginner → dossier `unjed-backend` (upload ou `git clone`).
2. `pip install --user -r requirements.txt`, `python3 seed_admins.py`.
3. Web app Flask → WSGI : `from app import app as application`.
4. Env vars : au minimum `SECRET_KEY` (+ `ADMIN_*` au premier démarrage).
5. **Reload**. Tester `/api/health` puis `administration.html`.
6. Rappel : le plan gratuit se désactive après ~1 mois sans connexion au compte.

## Sécurité (durcie v1.2 — vérifiée par 24 tests automatisés)

- Aucun secret en dur (admin bootstrap via env, avertissement si `SECRET_KEY` absente).
- Sessions admin limitées à **12 h** (`PERMANENT_SESSION_LIFETIME`), cookies `HttpOnly`
  (`SameSite=None+Secure` en HTTPS, `Lax` en local via `COOKIE_SECURE=0`).
- **Anti-CSRF à 2 niveaux** (obligatoire avec `SameSite=None`) :
  `application/json` exigé sur login/subscribe/adhesion/contact (415 sinon —
  un `<form>` tiers ne peut pas poser ce Content-Type sans preflight bloqué par la CORS
  allowlist) + vérification `Origin`/`Referer` sur les actions authentifiées (403 sinon).
- Rate limiting **Flask-Limiter** (login 15/15min, subscribe 20/h, adhesion/contact 10/h,
  429 JSON) ; `RATELIMIT_STORAGE_URI` (Redis) pour le multi-instances.
- Validation : regex email/téléphone, longueurs max, JSON ≤ 100 Ko, `external_url`
  restreinte à `http(s)` (anti XSS stockée), honeypot serveur (`company` → faux succès).
- Uploads : extensions allowlist, noms UUID, `secure_filename` conservé, 50 Mo max.
- Headers : `nosniff`, `SAMEORIGIN`, `Referrer-Policy`, masquage `Server`.
- SQL 100 % ORM paramétré (aucune requête brute) ; `actualites.html` sans `innerHTML` API.

## ⚠️ Actions opérateur restantes (hors code)

1. **Mot de passe fuité dans l'historique git** (commit `0223d09`, `Unjedbenin@2025@`) :
   le changer IMMÉDIATEMENT via `seed_admins.py` sur le serveur (lisez-le comme compromis).
   Optionnel : purger l'historique (`git filter-repo`) si le dépôt devient public.
2. **Persistance** : sur Render gratuit, SQLite + `static/uploads` sont **effacés à chaque
   redéploiement**. Passer à Postgres (`DATABASE_URL`, bloc prêt dans `render.yaml`) et
   prévoir un stockage objet/disque persistant pour les uploads.
3. **Web3Forms** : clé publique par design, mais restreindre le domaine autorisé dans le
   dashboard Web3Forms + surveiller le quota.
4. **Mots de passe admin** : 12 caractères min. recommandés (`seed_admins.py` exige 6) ;
   activer les mots de passe d'application Gmail (jamais le mot de passe normal).
5. **Sauvegardes** : exporter régulièrement la base (`sqlite3 unjed.db .dump` ou dump
   Postgres) + `static/uploads`.

## Plus tard : paiement adhésion (FedaPay / Kkiapay)

Emplacement réservé dans `app.py` (`/api/adhesion/initier` + webhook).
Le frontend (`adhesion.html`) affiche déjà le tarif et prévient que le paiement
en ligne arrive — l'équipe finalise aujourd'hui via WhatsApp.
