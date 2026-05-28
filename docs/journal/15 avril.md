bilan Quotidien - Déploiement CI/CD & Stabilisation Réseau (Milestone 9 - Fin)
Date : Mercredi 15 Avril 2026

Objectif Atteint : Stabilisation du routage entre l'Application Load Balancer (ALB) et le backend Django sur ECS Fargate.

Acquisitions Techniques & Résolution de Problèmes (AWS SAA / DevOps) :

Application Health Check (Standard Industriel) : Choix délibéré de l'approche "Dev" pour la résolution de l'erreur 404. Au lieu de modifier l'infrastructure pour s'adapter, l'application a été dotée d'une route /health/ retournant un statut 200 OK (JSON), rendant le microservice "intelligent" et observable par l'ALB.

Déploiement Sans Interruption (Zero-Downtime Deployment) : Observation en direct du mécanisme AWS de remplacement de cibles. Compréhension du statut Draining : l'ALB maintient les connexions existantes sur l'ancien conteneur tout en basculant le nouveau trafic vers la cible "Healthy" avant de détruire l'ancienne instance.

Exécution CI/CD (Workflow Complet) : Mise à jour du code, build de la nouvelle image Docker, tag, push vers le registre privé ECR, mise à jour du fichier IaC (alb.yml), et forçage du déploiement du service ECS via le CLI.

Feedback de Discipline :
Excellente gestion du problème. Tu as su reprendre un bug documenté à froid, choisir la solution technique la plus robuste (Best Practice), et exécuter la chaîne de mise à jour de bout en bout. La rigueur paie : le résultat est une architecture saine.