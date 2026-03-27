[DATE] : 19 Mars 2026
Projet : PFE - Architecture Cloud AWS (Milestone 3)

🎯 Objectifs atteints :

Provisionnement ECR (IaC) : Création d'un registre privé Amazon Elastic Container Registry (pfe-app-repo) via CloudFormation, avec scan de vulnérabilités activé.

Déploiement de l'Artefact : Authentification réussie du démon Docker local vers AWS et push des 9 couches (layers) de l'image pfe-app-v1 vers le Cloud.Projet : PFE - Architecture Cloud AWS (Milestone 3)


🔧 Problèmes techniques surmontés :

Ajustement strict des rôles IAM : Résolution d'erreurs 403 (AccessDenied/Forbidden) en appliquant une élévation de privilèges incrémentale sur le rôle de déploiement. Ajout chirurgical des droits d'authentification (ecr:GetAuthorizationToken), d'upload de couches (ecr:PutImage, etc.) et de lecture de manifestes (ecr:BatchGetImage) sans compromettre la politique de sécurité globale.