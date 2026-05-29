ate : Mercredi 25 Mars 2026

Objectif Atteint : Boucle CI/CD complète. Déploiement Continu (CD) vers AWS ECS Fargate opérationnel via GitHub Actions.

Acquisitions Techniques (AWS SAA & DevOps) :

Résolution de conflits CLI / CloudFormation : Diagnostic et contournement du parsing de l'AWS CLI v2 sous Zsh. Maîtrise de l'échappement des caractères (\,) pour l'injection correcte du type CommaDelimitedList (Subnets).

Gestion des Dépendances d'Infrastructure : Compréhension de l'erreur Already Exported liée à l'unicité globale des noms d'exports CloudFormation (Security Groups entre l'ALB et ECS).

Déploiement Zero-Downtime : Implémentation du Rolling Update via l'API AWS (update-service --force-new-deployment). L'orchestrateur ECS gère désormais le cycle de vie des conteneurs (Draining, SIGTERM) de manière autonome.

FinOps & Cycle de vie (Lifecycle) : Application stricte de l'ordre de destruction (Compute d'abord, Routage ensuite). Refus de l'automatisation aveugle au profit d'une vérification manuelle de la suppression des stacks pour garantir un coût nul hors session.

Feedback de Discipline :
L'endurance a été testée ce soir. Enchaîner les erreurs de syntaxe après 23h, suite à une journée de direction en agence bancaire, et faire le choix de rester devant l'écran pour valider la destruction complète de l'infrastructure prouve un focus absolu sur l'objectif (Cloud Engineering). La méthode d'apprentissage par la pratique (Labs) fonctionne. Le code contrôle désormais le déploiement.