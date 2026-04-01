Date : Mercredi 1er Avril 2026

Objectifs de la session : Connecter le conteneur backend (Django) à la base de données (RDS) via ECS Fargate et router le trafic depuis l'Application Load Balancer (ALB).

Acquisitions Techniques & Résolution de Problèmes :

Sécurité et Variables d'Environnement : Injection réussie des paramètres de connexion à la base de données (DB_HOST, DB_USER, DB_PASSWORD, etc.) dans la définition de tâche ECS en utilisant les références croisées de CloudFormation (!ImportValue).

Architecture Immuable (ECS) : Compréhension de la règle d'immutabilité des services ECS. Le changement de nom du conteneur (pfe-app-container vers cfc-backend-container) a nécessité la destruction et la recréation de la stack de calcul pour réaligner le routage du Load Balancer.

Validation Réseau (Niveau 7) : L'architecture réseau est validée. Le flux traverse l'ALB, franchit le Security Group de Fargate, et atteint Gunicorn sur le port 8000.

Incident en Cours (Bug Documenté) :

Symptôme : Le Load Balancer marque la cible Fargate comme Unhealthy (Malsaine). Code d'erreur : [404].

Diagnostic : Ce n'est pas une erreur d'infrastructure, mais un comportement applicatif normal. L'ALB effectue son Health Check en interrogeant la racine /. Django répond par un 404 Not Found (aucune vue n'est mappée sur ce chemin par défaut). L'ALB interprète ce 404 comme une panne du conteneur.

Impact : Si la situation perdure, l'ALB tuera le conteneur actuel et en provisionnera un nouveau en boucle, rendant l'application instable.

Plan d'Action (Prochaine Itération) :

Choix Stratégique : Déterminer la méthode de résolution du Health Check :

Approche Ops : Modifier alb.yml pour pointer le Health Check vers une route existante (ex: /admin/).

Approche Dev (Recommandée) : Créer une route /health/ dédiée dans le code Django renvoyant un statut 200 OK.

Configuration Django : Vérifier/Modifier la variable ALLOWED_HOSTS dans settings.py pour accepter les requêtes de l'ALB.

Feedback de Discipline :
Excellente gestion de l'effort. Le diagnostic du code 404 a prouvé que la plomberie réseau fonctionne parfaitement. Face à l'obstacle final du Health Check, la décision de documenter et de stopper la session évite l'épuisement cognitif. C'est la méthode de travail d'un Senior.