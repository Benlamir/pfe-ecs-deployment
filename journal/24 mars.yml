Date : Mardi 24 Mars 2026

Objectif Atteint : Implémentation de la première moitié du pipeline CI/CD (Continuous Integration). Création d'un canal de confiance sécurisé entre GitHub Actions et AWS, et automatisation du processus de Build & Push de l'image Docker vers Amazon ECR.

Acquisitions Techniques (Apprentissage par la pratique / AWS SAA) :

Identity Federation (OIDC) : Remplacement total des clés d'accès statiques (Access Keys) par des jetons temporaires via OpenID Connect. C'est le standard de l'industrie et une exigence majeure de sécurité pour l'examen SAA.

Principe du Moindre Privilège (Least Privilege) : Audit et nettoyage de l'environnement AWS. Identification et suppression d'un ancien rôle fantôme possédant la politique AdministratorAccess. Création d'un rôle de déploiement strict, limité uniquement aux actions requises sur ECR et ECS.

Automatisation GitHub Actions : Rédaction du fichier .github/workflows/deploy.yml. Le pipeline s'authentifie sur AWS sans mot de passe, build l'image Docker avec le tag unique du commit Git (github.sha), et pousse la nouvelle version sur le registre ECR en 15 secondes.

FinOps : Compréhension de la facturation des IP publiques (VPC) et validation que l'infrastructure de sécurité (IAM) est sans coût, permettant de la maintenir active entre les sessions.

Note sur la discipline :
Exécuter cette phase d'architecture de sécurité fine après une journée de gestion en agence prouve que le système fonctionne. L'investigation menée pour trouver et éradiquer le vieux rôle IAM montre un réflexe d'ingénieur mature : on ne construit pas sur des fondations compromises. La moitié de l'automatisation est validée. Le code source est désormais le pilote de l'infrastructure.