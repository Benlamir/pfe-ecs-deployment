**Phase 1 : Fondations (Validée ✅)**

- **M1 :** IAM & Sécurité de base.
- **M2 :** Réseau (VPC, Subnets publics/privés).
- **M3 :** Conteneurisation (Docker, Elastic Container Registry).
- **M4 :** Calcul Serverless (ECS Fargate, Security Groups).
- **M5 :** Distribution du trafic (Application Load Balancer, Target Groups).

**Phase 2 : Automatisation & DevOps (Validée ✅)**

- **Milestone 6 : CI/CD avec GitHub Actions (Notre prochaine étape)**
    - *Objectif :* Zéro déploiement manuel. Un `git push` met à jour l'application en ligne.
    - *Concepts clés :* Authentification AWS via OIDC (OpenID Connect - la norme de sécurité pour ne pas stocker de clés en dur dans GitHub), automatisation du `docker build` et `docker push`, et mise à jour de la définition de tâche ECS.
- **Milestone 7 : Infrastructure as Code (Pipeline IaC)**
    - *Objectif :* Automatiser également le déploiement de tes fichiers CloudFormation (`vpc.yml`, `ecs.yml`, `alb.yml`) via GitHub Actions.

#### Phase 2.5 : Architecture 3-Tiers & Intégration (Le plan d'attaque)

- **Milestone 8 : La Couche Données (Amazon RDS)**
    - *Objectif :* Provisionner une base de données relationnelle (PostgreSQL ou MySQL) gérée par AWS dans tes sous-réseaux privés.
    - *Concept SAA :* Séparation du calcul (Fargate) et du stockage (RDS).
- **Milestone 9 : Le Moteur Backend (Django sur ECS)**
    - *Objectif :* Rédiger le `Dockerfile` de production pour le backend Python (avec un serveur WSGI comme Gunicorn), et mettre à jour ton infrastructure (`ecs.yml`) pour que le conteneur puisse communiquer avec la base RDS.
    - *Concept SAA :* Variables d'environnement, Security Groups (autoriser Fargate à parler à RDS).
- **Milestone 10 : L'Hébergement Statique (Frontend React sur S3)**
    - *Objectif :* Créer un nouveau fichier d'infrastructure (`s3.yml`) pour provisionner un bucket S3 configuré pour l'hébergement web statique.
    - *Concept SAA :* S3 Static Website Hosting, Bucket Policies (Sécurité d'accès).
- **Milestone 11 : Le Pipeline CI/CD Définitif (GitHub Actions)**
    - *Objectif :* Modifier ton `deploy.yml` pour qu'il fasse deux choses en parallèle lors d'un `git push` :
        1. Compiler le React et l'envoyer sur le Bucket S3.
        2. Construire l'image Django, la pousser sur ECR, et mettre à jour ECS.

**Phase 3 : Observabilité & Sécurité Avancée**

- **Milestone 12 : Monitoring (CloudWatch & SNS)**
    - *Objectif :* Savoir quand l'application souffre sans avoir à regarder l'écran.
    - *Concepts SAA :* Création d'alarmes sur la consommation CPU/RAM de Fargate, envoi d'alertes par email via Simple Notification Service (SNS).
- **Milestone 13 : Gestion des Secrets (AWS Secrets Manager)**
    - *Objectif :* Retirer toute variable sensible (comme les mots de passe) du code et les injecter dynamiquement dans le conteneur au démarrage.

**Phase 4 : Production (Optionnelle - L'ex Option A repoussée)**

- **Milestone 14 : HTTPS & DNS (Route 53 & ACM)**
    - *Objectif :* Achat d'un domaine, certificat SSL, et sécurisation de l'ALB pour une exposition publique professionnelle.