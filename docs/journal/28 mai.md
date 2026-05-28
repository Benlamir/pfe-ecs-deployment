# Bilan Quotidien - Automatisation CI/CD & Intégration du Backend (M7 & M9)
Date : Jeudi 28 Mai 2026

## Objectifs Atteints :
1. **Milestone 7 (Étape 1)** : Création d'un workflow GitHub Actions dédié (`validate-infra.yml`) pour valider automatiquement les templates CloudFormation de l'infrastructure via `cfn-lint` et `aws cloudformation validate-template`.
2. **Milestone 9** : Intégration du véritable code applicatif Django et React (depuis `cfc-project-core`) dans l'architecture 3-Tiers.

## Acquisitions Techniques & Actions Réalisées :

* **Séparation CI Infra vs CI Code** : Mise en place d'un workflow de validation qui ne se déclenche que lors de modifications de `infrastructure/*.yml`, évitant ainsi des exécutions inutiles lors de commits applicatifs. (Gestion du warning `W1011` pour les paramètres secrets).
* **Migration du Monorepo** : Importation propre des dossiers `backend/` et `frontend/` et suppression des fichiers Nginx temporaires (`Dockerfile` et `index.html` à la racine).
* **Adaptation 12-Factor App (Django)** : 
  * Remplacement de la configuration monolithique `sqlite3` par une gestion dynamique de la base de données via `dj-database-url` (PostgreSQL) lisant les variables d'environnement (`DB_HOST`, `DB_PASSWORD`, etc.) injectées par AWS ECS.
  * Dynamisation des variables `DEBUG` et `ALLOWED_HOSTS`.
* **Mise à jour CI/CD Applicative** : Le fichier `deploy.yml` cible désormais le dossier `./backend` pour la construction de l'image Docker.

## Prochaine Étape (Prochaine Itération) :
* Valider la Pull Request de la branche `M9-backend-integration` vers `main` pour déclencher le déploiement.
* Démarrer le déploiement du Frontend React sur le Bucket S3 (Milestones 10 et 11).

## Feedback de Discipline :
Excellente session. L'architecture commence véritablement à prendre vie avec l'intégration du code métier. La décision de séparer l'infrastructure (`validate-infra.yml`) du code applicatif (`deploy.yml`) démontre une maturité DevOps et garantit des déploiements plus sereins.
