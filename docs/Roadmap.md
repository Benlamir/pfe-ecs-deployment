# Roadmap d'exécution — PFE AWS 3-Tiers

Objectif global: déployer et opérer une architecture 3-tiers AWS (React + Django + RDS) avec IaC, CI/CD, sécurité et observabilité de niveau production.

Légende: [DONE] [IN_PROGRESS] [PENDING]

## Phase 1 — Fondations [DONE]

- [DONE] M1 — IAM & sécurité de base
- [DONE] M2 — Réseau (VPC, subnets publics/privés)
- [DONE] M3 — Conteneurisation (Docker, ECR)
- [DONE] M4 — Calcul serverless (ECS Fargate, Security Groups)
- [DONE] M5 — Distribution du trafic (ALB, Target Groups)

## Phase 2 — Automatisation DevOps [DONE]

- [DONE] M6 — CI/CD backend avec GitHub Actions + OIDC + déploiement ECS
  - Objectif: zéro déploiement manuel backend.
  - Critères d'acceptation:
    1) Un push sur main déclenche build/push ECR.
    2) Le déploiement ECS référence une image immuable (tag SHA).
    3) Le workflow attend `services-stable` sans erreur.

- [DONE] M7 — Pipeline IaC (CloudFormation)
  - Objectif: automatiser le déploiement des stacks (`network.yml`, `alb.yml`, `ecs.yml`, `rds.yml`, `s3.yml`).
  - Critères d'acceptation:
    1) Validation CloudFormation en CI.
    2) Déploiement par environnement avec garde-fous (review/approval).
    3) Changements d'infra traçables et rollbackables.

## Phase 2.5 — Intégration 3-Tiers [IN_PROGRESS]

- [DONE] M8 — Couche données (Amazon RDS)
  - Objectif: provisionner PostgreSQL managé dans subnets privés.
  - Critères d'acceptation:
    1) Instance RDS privée accessible uniquement depuis SG applicatif.
    2) Connexion applicative validée depuis ECS.
    3) Sauvegarde automatique activée.

- [DONE] M9 — Backend Django sur ECS avec RDS
  - Objectif: exécuter Django/Gunicorn en production avec variables d'environnement propres.
  - Critères d'acceptation:
    1) API répond derrière ALB.
    2) Migrations DB exécutables sans intervention manuelle ad hoc.
    3) Healthcheck applicatif stable.

- [DONE] M10 — Frontend React sur S3
  - Objectif: héberger le frontend en statique sur S3.
  - Critères d'acceptation:
    1) Build React publié sur bucket S3 cible.
    2) Politique d'accès bucket conforme au mode d'exposition choisi.
    3) Frontend joignable et fonctionnel.

- [DONE] M11 — Pipeline CI/CD unifié (frontend + backend)
  - Objectif: sur un push, déployer frontend (S3) et backend (ECS/ECR).
  - Critères d'acceptation:
    1) Jobs parallèles frontend/backend.
    2) Échec d'un job = statut global en échec.
    3) Traçabilité des versions déployées (SHA commit).

## Phase 3 — Sécurité & Observabilité avancées [PENDING]

- [PENDING] M12 — Monitoring (CloudWatch + SNS)
  - Objectif: alerter proactivement sur l'état du service.
  - Critères d'acceptation:
    1) Alarmes CPU/RAM ECS définies.
    2) Notifications SNS opérationnelles.
    3) Procédure de triage documentée.

- [PENDING] M13 — Gestion des secrets (AWS Secrets Manager)
  - Objectif: retirer les secrets du code/scripts versionnés.
  - Critères d'acceptation:
    1) Identifiants DB stockés dans Secrets Manager.
    2) Injection runtime des secrets dans ECS.
    3) Rotation et révocation documentées.

Note d'ordre d'exécution recommandé:
- M13 doit démarrer dès que possible avant exposition plus large en production.
- Un socle minimal M12 (logs/alertes critiques) doit démarrer en parallèle de M11.

## Phase 4 — Production [PENDING]

- [PENDING] M14 — HTTPS & DNS (Route 53 + ACM)
  - Objectif: exposition publique propre via domaine et TLS.
  - Critères d'acceptation:
    1) Certificat ACM validé et attaché à l'ALB.
    2) Enregistrements Route 53 corrects.
    3) Accès HTTPS fonctionnel bout-en-bout.

## Prochaine action concrète

1) Déployer le code applicatif : Importer le code source de l'application Django (Backend) dans ce dépôt et mettre à jour le `Dockerfile` (M9).
2) Importer et compiler le code source de l'application React (Frontend) pour le déployer sur S3 (M10).
