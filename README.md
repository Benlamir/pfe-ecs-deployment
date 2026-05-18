# PFE : Déploiement automatisé d'une architecture Cloud 3-Tiers sur AWS

Ce dépôt contient le code source et l'Infrastructure as Code (IaC) d'un Projet de Fin d'Études (Licence Professionnelle ISRC). L'objectif est de concevoir, sécuriser et automatiser le déploiement d'une application web moderne sur Amazon Web Services (AWS).

## 🚀 Technologies

* **Frontend :** React (Hébergement statique Serverless sur Amazon S3)
* **Backend :** Django Rest Framework & Gunicorn (Conteneurs sur Amazon ECS Fargate)
* **Base de données :** PostgreSQL (Amazon RDS)
* **Infrastructure as Code (IaC) :** AWS CloudFormation
* **CI/CD :** GitHub Actions

## 🏗️ Architecture 3-Tiers

L'application est découpée en trois couches distinctes pour maximiser la sécurité, la scalabilité et la haute disponibilité :
1. **Présentation :** Application React accessible au public.
2. **Application :** API Django isolée dans des sous-réseaux privés, gérée par un Application Load Balancer (ALB).
3. **Données :** Base de données relationnelle sécurisée et isolée de l'accès public.

## ⚙️ Automatisation (DevOps)

- **Provisionnement :** L'infrastructure complète (VPC, ALB, RDS, ECS, S3) est provisionnée de manière automatisée via des templates CloudFormation.
- **Déploiement :** Les pipelines GitHub Actions automatisent le build des images Docker, l'envoi vers Amazon ECR, et le déploiement *Zero-Downtime* sur ECS via authentification OIDC.
