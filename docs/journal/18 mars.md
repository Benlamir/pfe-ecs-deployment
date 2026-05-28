[DATE] : 18 Mars 2026
Projet : PFE - Architecture Cloud AWS (Milestone 1 & 2)

🎯 Objectifs atteints :

Payload Applicatif validé : Conteneur Docker (pfe-app-v1) testé et verrouillé en local. Code source versionné et poussé sur GitHub.

Fondation Réseau (IaC) déployée : Création d'un VPC (10.0.0.0/16) avec 2 sous-réseaux publics, une Internet Gateway et les tables de routage associées via AWS CloudFormation.

Architecture Low-Cost assumée : Choix d'un design 100% public (sans NAT Gateway) compensé par une sécurité logique stricte via Security Groups pour maintenir un budget nul.

🔧 Problèmes techniques surmontés :

DNS Linux : Contournement d'une panne de résolution DNS locale (curl: (6) Could not resolve host) via la modification de /etc/resolv.conf (8.8.8.8) pour finaliser l'installation de l'AWS CLI v2.

Sécurité IAM / IAM AssumeRole : Configuration avancée de l'AWS CLI pour assumer dynamiquement un rôle d'administration (CloudFormationRole) avec injection obligatoire d'un jeton MFA. Résolution des erreurs d'AccessDenied en modifiant la Trust Policy du rôle.

Configuration Régionale CLI : Résolution de l'erreur NoRegion liée à l'usurpation de profil en forçant la région us-east-1 dans la configuration locale.

⏭️ Prochaine étape (Milestone 3) :

Provisionnement du registre Amazon ECR via CloudFormation et push de l'image Docker locale vers le Cloud.