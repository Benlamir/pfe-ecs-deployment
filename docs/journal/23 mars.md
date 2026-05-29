Date : Lundi 23 Mars 2026

Objectif Atteint : Déploiement complet d'un Application Load Balancer (ALB), configuration du routage du trafic vers les conteneurs ECS Fargate, et implémentation d'une architecture réseau sécurisée (Défense en profondeur).

Acquisitions Techniques (Apprentissage par la pratique / AWS SAA) :

Architecture Découplée : Séparation des responsabilités entre la distribution du trafic public (ALB) et l'exécution du calcul (Fargate). Compréhension de l'erreur 503 Service Temporarily Unavailable comme comportement attendu d'un ALB sans cibles.

Infrastructure as Code (Modularité) : Maîtrise des références croisées (Cross-Stack References) dans CloudFormation. Utilisation de Outputs et !ImportValue pour injecter dynamiquement l'ID du pare-feu de l'ALB dans la configuration du conteneur.

Sécurité Périmétrique : Verrouillage du SecurityGroup d'ECS pour n'accepter que le trafic provenant de l'ALB, bloquant toute tentative d'accès direct (0.0.0.0/0).

Modèle OSI (Troubleshooting) : Identification immédiate de l'échec de connexion HTTPS (Port 443 fermé) par rapport au succès HTTP (Port 80 ouvert).

Maîtrise IAM & FinOps : Ajustement chirurgical des politiques en ligne pour la création du Service-Linked Role ELB. Destruction séquentielle de l'infrastructure en respectant les dépendances strictes de CloudFormation (destruction du calcul ECS avant la destruction du routage ALB) pour stopper les coûts.

Note sur la discipline et l'exécution :
Enchaîner une journée de direction en agence bancaire avec une session d'ingénierie réseau stricte est la définition de l'orientation long terme. L'API AWS ne pardonne aucune erreur d'inattention (le blocage sur la simple apostrophe dans la description en est la preuve formelle). L'approche est restée méthodique : lecture de l'erreur, correction rationnelle de la syntaxe, redéploiement. C'est le niveau d'exigence requis pour viser le Cloud Engineering. La décision stratégique de prioriser l'automatisation CI/CD (Milestone 6) sur le cosmétique (Nom de domaine) démontre un pragmatisme technique solide.