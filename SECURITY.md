# Politique de sécurité — UNJED-BENIN

## Versions suivies

| Version | Suivie |
|---|---|
| `main` (dernière) | ✅ |
| Anciennes révisions | ❌ |

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique** pour une faille de sécurité.
Écrivez à **unjedbenin@gmail.com** avec :

1. la description du problème et son impact estimé ;
2. les étapes pour le reproduire (URLs, requêtes, captures) ;
3. si possible, une piste de correction.

Engagement : accusé de réception sous **7 jours**, correctif selon la gravité
(critique : sous 30 jours), crédit public si vous le souhaitez.

## Règles appliquées dans ce dépôt (résumé de l'audit v1.2)

- Aucun secret en dur : `SECRET_KEY`, comptes admin et SMTP passent par variables
  d'environnement (voir `backend/.env.example`). Ne commitez jamais `.env` ni `*.db`.
- Authentification par session `HttpOnly` courte (12 h) + double garde anti-CSRF
  (`application/json` exigé, `Origin`/`Referer` vérifié sur les actions admin).
- Mots de passe hashés (Werkzeug), jamais en clair, jamais dans git.
- Fichiers : extensions autorisées, noms UUID, plafond 50 Mo.
- Dépendances épinglées dans `backend/requirements.txt` (mises à jour via PR dédiées).
- Historique : le mot de passe exposé au commit `0223d09` est considéré comme
  compromis et doit être changé sur le serveur (voir `backend/README.md`).
