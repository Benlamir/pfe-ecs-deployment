# RAPPORT D'AVANCEMENT TECHNIQUE : PROJET DE FIN D'ÉTUDES

**Sujet :** Déploiement automatisé d'une architecture Cloud 3-Tiers hautement disponible sur AWS via Infrastructure as Code (IaC) et CI/CD  
**Étudiant :** Oussama Benlamirate  
**Filière :** Licence Professionnelle Systèmes, Réseaux et Cloud (ISRC)  

---

## 1. Résumé et pertinence du projet

L'objectif de ce PFE est de concevoir, sécuriser et automatiser le déploiement d'une application web moderne (React en Frontend, API Django/Gunicorn en Backend, PostgreSQL en Base de données) sur Amazon Web Services (AWS). Le projet repose sur le découplage complet des composants et l'automatisation intégrale via l'Infrastructure as Code (IaC) avec AWS CloudFormation, éliminant toute configuration manuelle en production.

Ce projet valide ma transition vers l'ingénierie Cloud. Il met en pratique les concepts avancés de l'architecture AWS (VPC, IAM, ECS Fargate, S3) pour concevoir une infrastructure scalable, résiliente et conforme aux standards de l'industrie (certification AWS SAA).

---

## 2. Architecture AWS vs Conteneur Standard

### Approche standard (Monolithe)
Dans une configuration classique, l'ensemble de la pile applicative tourne souvent sur un serveur unique.
* **Limites :** Point de défaillance unique (SPOF), ressources partagées, scalabilité complexe.

```text
[ Internet ] ---> [ Serveur Unique / VM ]
                        |---> Conteneur Frontend (React)
                        |---> Conteneur Backend (Django)
                        |---> Conteneur Database (PostgreSQL)
```

### Approche cible : Architecture 3-Tiers AWS

L'architecture implémentée isole les composants dans des couches distinctes pour maximiser la sécurité et la disponibilité.

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
 |  | (Hébergement Statique |      |  [ Sous-réseaux Publics ]        |  |
 |  |  React Web)           |      |    --> Application Load Balancer |  |
 |  +-----------------------+      |                                  |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Sous-réseaux Privés ]         |  |
 |                                 |    --> AWS ECS Fargate           |  |
 |                                 |        (Conteneurs Django)       |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Sous-réseaux Données ]        |  |
 |                                 |    --> Amazon RDS (PostgreSQL)   |  |
 |                                 +----------------------------------+  |
 +-----------------------------------------------------------------------+
```

### 3. Choix techniques (FinOps) et résolution de difficultés

Une attention stricte a été portée à la consommation des ressources Cloud (FinOps) :

* **Frontend Serverless :** Utilisation d'Amazon S3 (paiement au stockage) au lieu d'une instance EC2 24h/24 pour héberger l'application React.

* **Calcul Élastique :** AWS ECS Fargate provisionne les ressources CPU/RAM à la seconde, uniquement lorsque les conteneurs backend tournent.

**Difficultés rencontrées et résolution :**
Face à une erreur HTTP 404 renvoyée par le Load Balancer (ALB) lors de ses tests de santé, l'infrastructure n'a pas été modifiée. Une approche "Dev" a été privilégiée : une route dédiée /health/ a été codée dans l'API Django pour répondre explicitement au statut 200 OK. L'ALB valide désormais la viabilité des conteneurs, permettant des déploiements sans interruption (Zero-Downtime Deployment  ).

### 4. Diagramme de la pipeline CI/CD

Le workflow d'intégration et de déploiement continus automatise le passage du code local vers l'infrastructure AWS.

[ Code Local ] ---> [ Push GitHub ] ---> [ Workflow CI/CD (GitHub Actions) ]
                                                   |
        +------------------------------------------+------------------------------------------+
        | (Branche Backend)                                                                   | (Branche Frontend)
        v                                                                                     v
[ Docker Build & Push (Amazon ECR) ]                                                   [ npm run build ]
        |                                                                                     |
        v                                                                                     v
[ AWS ECS update-service ]                                                             [ aws s3 sync ]
        |                                                                                     |
        v                                                                                     v
[ Déploiement Zero-Downtime ]                                                          [ Site web à jour (URL S3) ]

### 5. Explication de la pipeline et problématiques IAM

La pipeline est modulaire et orchestrée via des stacks CloudFormation indépendantes (vpc.yml, rds.yml, alb.yml, s3.yml).

Problématique IAM résolue :
L'implémentation de la stack S3 a initialement échoué en ROLLBACK_COMPLETE. Le rôle d'exécution de CloudFormation, configuré selon le principe du moindre privilège, ne possédait pas l'action s3:CreateBucket. L'autorisation a été attachée dynamiquement via l'AWS CLI, permettant la création sécurisée du bucket et l'ouverture de l'accès public en lecture (s3:GetObject) pour le frontend.

### 6. Roadmap Globale et État d'Avancement

#### Phase 1 : Fondations de l'Infrastructure (Validée ✅)
M1 à M5 : Sécurité IAM, Réseau (VPC/Subnets), Conteneurisation (ECR), Calcul Serverless (ECS Fargate) et Distribution (ALB).

#### Phase 2 : Architecture 3-Tiers & Intégration (Validée ✅)
M8 (Couche Données) : Provisionnement RDS PostgreSQL géré et isolé.
M9 (Backend) : Déploiement Django/Gunicorn sur ECS, couplé à RDS via l'injection de variables d'environnement.

M10 (Frontend) : Hébergement React sur S3 avec configuration des Bucket Policies.

#### Phase 3 : Automatisation Globale CI/CD (En cours ⏳ - Focus actuel)
M6 & M11 : Pipeline automatisée via GitHub Actions. Un git push déclenche la compilation et le déploiement, avec authentification sécurisée (Zéro clé en dur) via AWS OIDC (OpenID Connect).

M7 : Pipeline IaC pour un déploiement 100% automatisé de l'infrastructure CloudFormation.

#### Phase 4 : Observabilité, Sécurité Avancée & Production (À venir 📅)
M12 à M14 : Monitoring CloudWatch (Alarmes CPU/RAM), injection sécurisée de secrets (AWS Secrets Manager) et distribution globale du frontend en HTTPS via Amazon CloudFront.