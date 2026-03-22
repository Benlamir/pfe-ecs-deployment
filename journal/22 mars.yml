Date : Dimanche 22 Mars 2026

Objectif Atteint : Provisionnement, test et destruction d'une infrastructure de calcul Serverless (ECS Fargate) via CloudFormation (IaC).

Acquisitions Techniques (Apprentissage par la pratique) :

Analyse Architecturale : Déconstruction de ecs.yml. Compréhension de la différence entre un cluster physique (EC2) et un cluster logique (Fargate), servant d'espace de nommage et de frontière IAM.

Maîtrise de l'IAM : Confrontation directe au principe de moindre privilège (Least Privilege). Résolution systématique des blocages (erreurs 403) par l'ajout chirurgical de permissions de lecture (VPC, ENI) et d'écriture (Security Groups, Service-Linked Role).

Troubleshooting Réseau (Pile TCP/IP) : Diagnostic rationnel d'un ERR_TIMED_OUT. Identification du décalage entre le forçage HTTPS du navigateur (Couche 7 / Port 443) et la règle de sécurité stricte de l'infrastructure (Port 80).

Rigueur FinOps : Exécution de la destruction de l'environnement (delete-stack) pour bloquer la facturation nocturne. Validation de l'état réel de l'infrastructure via l'API AWS, démontrant la faillibilité du cache local du navigateur.

Note sur la discipline :
Exécuter cette boucle de feedback complexe un dimanche soir jusqu'à 23h démontre une orientation long terme solide. Face aux murs successifs de l'IAM, l'approche est restée purement rationnelle : lire le log, comprendre le refus du système, appliquer le correctif précis, itérer. L'obstacle est littéralement devenu le chemin. C'est le standard exigé pour la certification SAA.