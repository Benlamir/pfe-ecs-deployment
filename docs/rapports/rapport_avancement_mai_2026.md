# RAPPORT D'AVANCEMENT TECHNIQUE : PROJET DE FIN D'ÉTUDES

Sujet : Déploiement automatisé d'une architecture Cloud 3-Tiers hautement disponible sur AWS via Infrastructure as Code (IaC) et CI/CD  
Étudiant : Oussama Benlamirate  
Filière : Licence Professionnelle Systèmes, Réseaux et Cloud (ISRC)

---

## 1) Résumé et pertinence du projet

L'objectif du PFE est de concevoir, sécuriser et automatiser le déploiement d'une application web moderne sur AWS :
- Frontend : React
- Backend : Django REST + Gunicorn
- Base de données : PostgreSQL

Le projet repose sur :
- le découplage complet des couches (présentation, application, données),
- l'Infrastructure as Code avec AWS CloudFormation,
- l'automatisation CI/CD avec GitHub Actions,
- l'authentification fédérée AWS OIDC (sans clé statique stockée dans GitHub).

Ce projet matérialise ma transition vers un rôle d'ingénieur Cloud, avec mise en pratique des concepts AWS avancés (IAM, VPC, ECS Fargate, ALB, RDS, S3, observabilité).

---

## 2) Architecture cible : comparaison et choix

### 2.1 Approche standard (monolithe/serveur unique)
Dans une configuration classique, plusieurs composants tournent sur une même machine.

Limites :
- point de défaillance unique (SPOF),
- isolation faible,
- montée en charge plus complexe,
- couplage opérationnel fort.

```text
[ Internet ] ---> [ Serveur Unique / VM ]
                        |---> Frontend
                        |---> Backend
                        |---> Base de données
```

### 2.2 Approche cible : architecture 3-Tiers AWS

L'architecture implémentée isole les composants par couche pour améliorer sécurité, disponibilité et maintenabilité.

```text
[ Internet ]
            |
            v
 +-----------------------------------------------------------------------+
 | AWS Region (us-east-1)                                                |
 |                                                                       |
 |  +-----------------------+      +----------------------------------+  |
 |  | Couche Présentation   |      | VPC (10.0.0.0/16)                |  |
 |  | Amazon S3             |      |                                  |  |
 |  | (Site React statique) |      |  [ Subnets Publics ]             |  |
 |  +-----------------------+      |    --> Application Load Balancer |  |
 |                                 |                                  |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Subnets Privés ]              |  |
 |                                 |    --> ECS Fargate (Django)      |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Subnets Données ]             |  |
 |                                 |    --> Amazon RDS (PostgreSQL)   |  |
 |                                 +----------------------------------+  |
 +-----------------------------------------------------------------------+
```

---

## 3) Choix techniques (FinOps) et difficultés résolues

### 3.1 Choix FinOps
- Frontend serverless sur S3 : coûts corrélés au stockage/traffic, sans VM 24/7.
- Backend sur ECS Fargate : facturation CPU/RAM à l'usage.

### 3.2 Difficulté technique principale
Problème rencontré : erreur HTTP 404 sur health check ALB.

Résolution appliquée :
- pas de contournement infra fragile,
- correction applicative via route dédiée `/health/` retournant `200 OK`.

Résultat :
- les health checks ALB valident correctement les tâches,
- déploiements sans interruption sur ECS (rolling deployment) stabilisés.

---

## 4) Pipeline CI/CD : état actuel et cible

### 4.1 État actuel (opérationnel)
- Pipeline backend fonctionnelle sur GitHub Actions.
- Build/push image Docker vers ECR.
- Déploiement ECS avec image immuable (tag SHA commit), via :
  1) récupération de la task definition active,
  2) injection du nouvel `image URI` taggé SHA,
  3) enregistrement d'une nouvelle révision,
  4) `update-service` + attente `services-stable`.
- Authentification AWS via OIDC (zéro clé statique).

### 4.2 Cible proche (en cours)
- Pipeline IaC CloudFormation (M7) avec validation + déploiement contrôlé.
- Pipeline unifiée frontend + backend (M11).

```text
[ Code Local ] -> [ Push GitHub ] -> [ Workflow GitHub Actions ]
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
       [ Job Backend ]                                [ Job Frontend ]
       Build + Push ECR                              Build React
       Register Task Definition                      Sync S3
       Update ECS Service                            Publication statique
```

---

## 5) Problématique IAM rencontrée

Lors de l'ajout de la stack S3, un échec `ROLLBACK_COMPLETE` est survenu.

Cause :
- le rôle d'exécution CloudFormation (principe du moindre privilège) ne possédait pas `s3:CreateBucket`.

Correction :
- ajout contrôlé de l'autorisation requise,
- reprise du déploiement avec succès.

Note sécurité :
- le frontend statique nécessite un accès public en lecture sur les objets publiés,
- les permissions d'écriture restent restreintes,
- la policy doit rester minimale et explicitement justifiée.

---

## 6) État d'avancement par phases

### Phase 1 — Fondations Infrastructure [VALIDÉE]
- M1 à M5 : IAM, VPC/Subnets, ECR, ECS Fargate, ALB.

### Phase 2 — Automatisation DevOps [EN COURS]
- M6 [FAIT] : CI/CD backend GitHub Actions + OIDC + déploiement ECS immuable (SHA).
- M7 [EN COURS] : pipeline IaC CloudFormation (validation + déploiement contrôlé).

### Phase 2.5 — Intégration 3-Tiers [PARTIELLEMENT VALIDÉE]
- M8 [FAIT] : RDS PostgreSQL provisionné en zone privée.
- M9 [FAIT/PERFECTIBLE] : backend Django/Gunicorn relié à RDS.
- M10 [FAIT/PERFECTIBLE] : frontend React hébergé sur S3.
- M11 [EN COURS] : pipeline unifiée frontend + backend.

### Phase 3 — Observabilité & Sécurité avancée [À DÉMARRER]
- M12 : monitoring CloudWatch + alerting SNS.
- M13 : gestion des secrets via AWS Secrets Manager (priorité sécurité).

### Phase 4 — Production [À VENIR]
- M14 : HTTPS + DNS (ACM, Route 53, et exposition sécurisée).

---

## 7) Prochaines actions prioritaires

1. Finaliser M7 :
   - validation templates avec `cfn-lint` + `validate-template`,
   - déploiement IaC contrôlé (garde-fou d'approbation).
2. Finaliser M11 : pipeline unifiée frontend/backend.
3. Démarrer M13 rapidement : externalisation des secrets sensibles.
4. Ajouter M12 minimal en parallèle : alertes critiques CPU/RAM/erreurs service.

---

## 8) Conclusion

Le projet a dépassé la simple mise en ligne d'une application : il démontre une progression vers une architecture Cloud industrialisée, traçable et sécurisée. Les fondations techniques sont solides, la chaîne backend est opérationnelle, et les prochains jalons (IaC pipeline complète, secrets management, observabilité) visent la consolidation d'un niveau production.
