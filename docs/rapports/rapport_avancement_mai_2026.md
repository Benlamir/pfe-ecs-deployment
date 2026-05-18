RAPPORT D'AVANCEMENT TECHNIQUE : PROJET DE FIN D'ÉTUDES
Sujet : Déploiement automatisé d'une architecture Cloud 3-Tiers hautement disponible sur AWS via Infrastructure as Code (IaC) et CI/CD
Étudiant : Oussama Benlamirate

Filière : Licence Professionnelle Systèmes, Réseaux et Cloud (ISRC)

1. Résumé sur l'idée du PFE et pertinence personnelle
L'idée du projet
L'objectif de ce PFE est de concevoir, sécuriser et automatiser le déploiement d'une application web moderne (Single Page Application React en Frontend, API Django/Gunicorn en Backend, PostgreSQL en Base de données) sur l'infrastructure cloud d'Amazon Web Services (AWS). Le projet repose sur le découplage complet des composants et l'automatisation intégrale via l'Infrastructure as Code (IaC) avec AWS CloudFormation, éliminant toute configuration manuelle en production.

Pertinence personnelle
Ce projet représente l'aboutissement de mon parcours académique en Licence Pro ISRC et matérialise mon pivot stratégique vers l'ingénierie Cloud. Ayant validé la certification AWS Certified Cloud Practitioner (CCP) et visant l'implémentation des standards de la certification AWS Solutions Architect - Associate (SAA), ce PFE me permet d'appliquer concrètement des concepts avancés : isolation réseau (VPC/Subnets), gestion fine des identités et des accès (IAM), conteneurisation (Docker/ECS Fargate) et gestion du stockage objet sécurisé (S3). C'est la validation par la pratique de ma capacité à concevoir des architectures cloud scalables, résilientes et conformes aux exigences industrielles.

2. Diagramme de l'architecture AWS vs Conteneur Docker standard
Approche standard : Conteneur unique / Monolithe sur VM
Dans une configuration classique non-cloud, l'ensemble de la pile applicative tourne souvent sur une seule machine virtuelle ou un serveur unique via un fichier docker-compose.

[ Internet ] ---> [ Serveur Unique / VM (ex: Émulateur local ou VPS) ]
                        |---> Conteneur Frontend (React/Nginx)
                        |---> Conteneur Backend (Django/Gunicorn)
                        |---> Conteneur Database (PostgreSQL)
Limites : Point de défaillance unique (SPOF), pas de scalabilité élastique native, ressources partagées (CPU/RAM/Stockage), risques de sécurité élevés si le serveur est compromis.

Approche cible : Architecture 3-Tiers découplée sur AWS
L'architecture implémentée pour ce PFE fragmente les responsabilités et isole les composants dans des couches distinctes pour maximiser la sécurité et la disponibilité.

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
 |  +-----------------------+      |         (ALB - Point d'entrée)   |  |
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
3. Environnement, difficultés rencontrées et choix techniques pour optimiser les coûts
Environnement de développement
Le projet est développé sous un environnement Linux (Manjaro) en utilisant Docker pour la conteneurisation locale, GitHub pour le contrôle de version, et AWS CLI / CloudFormation pour le provisionnement distant.

Choix techniques pour l'optimisation des coûts (FinOps)
Une attention stricte a été portée à la consommation des ressources Cloud afin d'éviter le gaspillage budgétaire, tout en respectant les bonnes pratiques d'architecture :

Serverless pour le Frontend (S3) : Au lieu de louer une instance EC2 (calcul virtuel) 24h/24 pour servir les fichiers statiques de React, le choix s'est porté sur Amazon S3 Static Website Hosting. Le coût est indexé uniquement sur le stockage réel (quelques centimes par mois) et le routage des erreurs est configuré pour déléguer la logique au routeur interne de React (index.html).

Calcul Élastique (ECS Fargate) : Utilisation du mode Fargate au lieu d'instances EC2 gérées pour le cluster de conteneurs. AWS facture à la seconde exacte de CPU et de mémoire consommée par le conteneur Django, évitant de payer pour de la capacité de calcul inactive.

Dimensionnement RDS : La base de données PostgreSQL managée est provisionnée sur un type d'instance minimal de test, isolée dans des sous-réseaux dédiés, assurant la sécurité sans surcoût de haute disponibilité Multi-AZ inutile en phase de développement.

Difficultés rencontrées et résolution
Problématique du Health Check ALB (Erreur HTTP 404) : Lors du premier couplage entre l'Application Load Balancer et ECS Fargate, l'ALB marquait systématiquement les conteneurs comme Unhealthy. L'ALB effectue ses tests de santé par défaut sur la racine (/), tandis que l'API Django renvoyait une erreur 404 sur ce chemin (aucune vue mappée).

Résolution : Refus de modifier l'infrastructure pour masquer le problème. Implémentation d'une approche de développement propre : création d'une route dédiée /health/ dans le code Django renvoyant un statut 200 OK au format JSON, et mise à jour de la propriété HealthCheckPath dans le script CloudFormation de l'ALB (alb.yml). Les conteneurs passent désormais au vert (Healthy) instantanément.

4. Diagramme de la pipeline CI/CD
Le workflow d'intégration et de déploiement continus automatise le passage du code local vers l'infrastructure AWS de production sans intervention humaine.

 [ Code Local ] ---> [ Push GitHub ] ---> [ Workflow CI/CD (GitHub Actions) ]
                                                   |
        +------------------------------------------+------------------------------------------+
        | (Branche Backend)                                                                   | (Branche Frontend)
        v                                                                                     v
[ Docker Build & Tag ]                                                                 [ npm run build ]
        |                                                                                     |
        v                                                                                     v
[ Push Image vers Amazon ECR ]                                                         [ aws s3 sync ]
        |                                                                                     |
        v                                                                                     v
[ AWS ECS update-service --force-new-deployment ]                                      [ Fichiers à la racine S3 ]
        |                                                                                     |
        v                                                                                     v
[ Déploiement Zero-Downtime (Draining de l'ancien conteneur) ]                         [ Site web à jour (URL S3) ]
5. Explication de la pipeline, état d'avancement et difficultés IAM
Explication de la pipeline et état d'avancement
La pipeline est modulaire. Les composants d'infrastructure de base sont entièrement packagés via 4 stacks CloudFormation distinctes et exécutés par un script orchestrateur (deploy-infra.sh) : Network/VPC, RDS, ALB/ECS, et S3.

À ce jour, l'infrastructure globale est opérationnelle à 100%. Les fichiers compilés de React sont synchronisés à la racine du bucket S3 public, et le cluster ECS Fargate fait tourner l'image Django mise à jour, interconnectée de manière sécurisée avec la base RDS PostgreSQL via les variables d'environnement injectées dynamiquement (!ImportValue). Le déploiement s'exécute en mode Zero-Downtime : l'ALB draine l'ancien conteneur uniquement lorsque le nouveau est validé sain.

Difficultés rencontrées avec les permissions et rôles IAM
Problématique de l'Immutabilité et des Droits S3 (Erreur 403 / Access Denied) : L'implémentation de la stack S3 a initialement échoué, plaçant CloudFormation en état de blocage ROLLBACK_COMPLETE. L'analyse des journaux d'événements a révélé que le rôle IAM utilisé par CloudFormation (CloudFormationRole) fonctionnait sous le principe du moindre privilège et ne possédait pas l'action s3:CreateBucket ni les droits de modification des Bucket Policies requis pour ouvrir l'accès public au frontend.

Résolution : Isolation chirurgicale du problème de sécurité. Utilisation d'AWS CLI pour attacher la politique standard d'accès à l'écriture S3 au rôle d'exécution, suppression de la stack corrompue pour nettoyer l'état CloudFormation, et relancement de l'orchestrateur. L'autorisation est maintenant effective et sécurisée, permettant la création automatique et fluide du bucket S3 lors des phases de build.