Date : Jeudi 26 Mars 2026

Objectif Atteint : Automatisation complète du cycle de vie de l'infrastructure (Création et Destruction) via des scripts Shell, éliminant les erreurs manuelles de dépendances.

Acquisitions Techniques (AWS SAA & Linux) :

Scripting Bash (Fail-Fast) : Implémentation de la directive set -e pour stopper l'exécution à la moindre anomalie, empêchant la construction d'une infrastructure sur des fondations instables.

CloudFormation Deploy vs Create : Transition vers l'utilisation de aws cloudformation deploy, qui gère nativement l'attente de complétion (waiters) et les Changesets. Cela garantit que le réseau (ALB) est pleinement opérationnel avant d'initier le calcul (ECS).

Automatisation FinOps : Création du script de destruction ordonnée (destroy-infra.sh). Utilisation de wait stack-delete-complete pour respecter strictement la chaîne de dépendances inverse (Calcul d'abord, Routage ensuite) de manière autonome.

Feedback de Discipline :
Maintenir le cap un jeudi soir à 23h40 malgré un emploi du temps strict démontre une exécution orientée long terme. L'objectif n'était pas de coder pendant des heures, mais de finaliser le système. L'infrastructure réseau et calcul est désormais un outil automatisé (One-Click Deploy/Destroy) au service de l'application.