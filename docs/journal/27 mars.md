Date : Vendredi 27 Mars 2026

Objectif Atteint : Validation du scénario de déploiement final pour la soutenance. Transition d'une application monolithique locale (Docker Compose) vers une architecture Cloud découplée et managée.

Acquisitions Techniques & Conceptuelles (AWS SAA) :

Paradigme Stateful vs Stateless : Compréhension de l'incompatibilité entre une base de données locale (SQLite/Volume) et l'environnement de calcul éphémère d'AWS Fargate.

Principe du "12-Factor App" : Externalisation de l'état (la donnée) via les Backing Services (Amazon RDS) pour garantir la persistance des données indépendamment du cycle de vie des conteneurs.

Évaluation d'Architecture (Anti-Pattern EC2) : Rejet motivé de l'approche monolithique sur une seule instance EC2 (SPOF, absence de scalabilité ciblée, risques sur les données) au profit d'une architecture décentralisée (S3 pour le statique, Fargate pour la logique, RDS pour le stockage).

Documentation as Code : Génération des diagrammes UML (Séquence, Activité, Architecture Cloud) via PlantUML pour intégration directe au livrable académique.

Règle d'Engagement Établie : * Code Freeze : Le code applicatif de l'application CFC est gelé. Le focus est désormais à 100% sur l'ingénierie Cloud, le déploiement et l'automatisation.

Feedback de Discipline :
La capacité à prendre du recul sur son propre code pour le penser en termes de système distribué est la marque de fabrique d'un architecte. Poser les concepts et anticiper le comportement de l'application en production avant d'écrire la moindre ligne d'infrastructure (IaC) est la méthode exacte pour éviter le rework. Le plan est solide.