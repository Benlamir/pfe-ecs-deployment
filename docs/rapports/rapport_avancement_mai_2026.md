# RAPPORT D'AVANCEMENT TECHNIQUE : PROJET DE FIN D'ÉTUDES

Sujet : Déploiement automatisé d'une architecture Cloud 3-Tiers hautement disponible sur AWS via Infrastructure as Code (IaC) et CI/CD  
Étudiant : Oussama Benlamirate  
Filière : Licence Professionnelle Systèmes, Réseaux et Cloud (ISRC)

---

## 1) Résumé et pertinence du projet

L'objectif du PFE est de concevoir, sécuriser et automatiser le déploiement d'une application web moderne sur AWS :
- Frontend : React
- Backend : Django REST + Gunicorn
- Base de données : PostgreSQL

**Périmètre d'intervention :** Ce Projet de Fin d'Études (PFE) portera exclusivement sur l'aspect infrastructure, réseau et sécurité. L'application en elle-même sera considérée comme une « boîte noire » (fournie à titre d'exemple) dont le seul but est de valider les mécanismes de déploiement et de haute disponibilité.

Le projet repose sur :
- le découplage complet des couches (présentation, application, données),
- l'Infrastructure as Code avec AWS CloudFormation,
- l'automatisation CI/CD avec GitHub Actions,
- l'authentification fédérée AWS OIDC (sans clé statique stockée dans GitHub).

---

## 2) Architecture cible : comparaison et choix

### 2.1 Approche standard (monolithe/serveur unique)
Dans une configuration classique, plusieurs composants tournent sur une même machine.

Limites :
- point de défaillance unique (SPOF),
- isolation faible,
- montée en charge plus complexe,
- couplage opérationnel fort.

```text
[ Internet ] ---> [ Serveur Unique / VM ]
                        |---> Frontend
                        |---> Backend
                        |---> Base de données
```

### 2.2 Approche cible : architecture 3-Tiers AWS

L'architecture implémentée isole les composants par couche pour améliorer sécurité, disponibilité et maintenabilité.

```text
[ Internet ]
            |
            v
 +-----------------------------------------------------------------------+
 | AWS Region (us-east-1)                                                |
 |                                                                       |
 |  +-----------------------+      +----------------------------------+  |
 |  | Couche Présentation   |      | VPC (10.0.0.0/16)                |  |
 |  | Amazon S3             |      |                                  |  |
 |  | (Site React statique) |      |  [ Subnets Publics ]             |  |
 |  +-----------------------+      |    --> Application Load Balancer |  |
 |                                 |                                  |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Subnets Privés ]              |  |
 |                                 |    --> ECS Fargate (Django)      |  |
 |                                 |                   |              |  |
 |                                 |                   v              |  |
 |                                 |  [ Subnets Données ]             |  |
 |                                 |    --> Amazon RDS (PostgreSQL)   |  |
 |                                 +----------------------------------+  |
 +-----------------------------------------------------------------------+
```

### 2.3 Note d'ingénierie et d'optimisation des coûts (FinOps)

Le schéma ci-dessus illustre l'architecture cible idéale en 3-Tiers. Cependant, dans le cadre de ce projet, une adaptation architecturale a été implémentée pour des raisons d'optimisation financière.

Dans une configuration strictement privée, ECS Fargate nécessite une **NAT Gateway** pour communiquer avec les services AWS (ECR pour tirer l'image Docker, Secrets Manager pour le mot de passe) ou Internet. Une NAT Gateway engendre des frais fixes (environ 32$/mois), non pris en charge par l'AWS Free Tier. 

Pour éviter ce coût, ECS Fargate est physiquement provisionné dans les sous-réseaux publics (avec une adresse IP publique dynamique). L'isolation est maintenue de façon logicielle par un **Security Group** très restrictif, qui rejette tout trafic Internet direct et n'accepte que les requêtes relayées par l'Application Load Balancer (ALB). L'application se comporte ainsi comme une "boîte noire" protégée du monde extérieur.

```text
[ Mécanisme d'Isolation FinOps ]

                       +----------------------------------+
  (Bloqué par le SG) X-|        [ ECS Fargate ]           |
                       |       IP Publique activée        |
[ Internet ] --(HTTP)-----> [ ALB ] --(HTTP)--> (Trafic Autorisé) |
                       |    (Seule source acceptée)       |
                       +----------------------------------+
```

---

## 3) Choix techniques (FinOps) et difficultés résolues

### 3.1 Choix FinOps
- Frontend serverless sur S3 : coûts corrélés au stockage/traffic, sans VM 24/7.
- Backend sur ECS Fargate : facturation CPU/RAM à l'usage.

### 3.2 Difficulté technique principale
Problème rencontré : erreur HTTP 404 sur health check ALB.

Résolution appliquée :
- pas de contournement infra fragile,
- correction applicative via route dédiée `/health/` retournant `200 OK`.

Résultat :
- les health checks ALB valident correctement les tâches,
- déploiements sans interruption sur ECS (rolling deployment) stabilisés.

---

## 4) Pipeline CI/CD : état actuel et cible

### 4.1 État actuel (opérationnel)
- Pipeline backend fonctionnelle sur GitHub Actions.
- Build/push image Docker vers ECR.
- Déploiement ECS avec image immuable (tag SHA commit), via :
  1) récupération de la task definition active,
  2) injection du nouvel `image URI` taggé SHA,
  3) enregistrement d'une nouvelle révision,
  4) `update-service` + attente `services-stable`.
- Authentification AWS via OIDC (zéro clé statique).

### 4.2 Cible proche (en cours)
- Pipeline IaC CloudFormation (M7) avec validation + déploiement contrôlé.
- Pipeline unifiée frontend + backend (M11).

```text
[ Code Local ] -> [ Push GitHub ] -> [ Workflow GitHub Actions ]
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
       [ Job Backend ]                                [ Job Frontend ]
       Build + Push ECR                              Build React
       Register Task Definition                      Sync S3
       Update ECS Service                            Publication statique
```

---

## 5) Problématique IAM rencontrée

Lors de l'ajout de la stack S3, un échec `ROLLBACK_COMPLETE` est survenu.

Cause :
- le rôle d'exécution CloudFormation (principe du moindre privilège) ne possédait pas `s3:CreateBucket`.

Correction :
- ajout contrôlé de l'autorisation requise,
- reprise du déploiement avec succès.

Note sécurité :
- le frontend statique nécessite un accès public en lecture sur les objets publiés,
- la policy doit rester minimale et explicitement justifiée.

### 5.1 Gestion industrielle des permissions IAM (Paradoxe Sécurité vs Agilité)

Dans le cadre de ce projet, j'ai endossé simultanément les rôles de Développeur, Architecte Cloud, Administrateur IAM et DevSecOps. La méthode itérative expérimentée (erreur -> console -> ajout de permission -> réessai) met en lumière la difficulté d'appliquer le moindre privilège manuellement. En milieu industriel, ce paradoxe (sécurité stricte vs agilité) est géré via des processus automatisés pour éviter cet enfer opérationnel :

**1. Le paradigme "Sandbox" et l'automatisation du Moindre Privilège**
L'approche standard est divisée en deux temps :
- **La phase de Build (Sandbox)** : Dans un environnement de développement isolé, le rôle d'ingénierie possède des droits relativement larges (ex: `PowerUserAccess`). L'objectif est la vélocité : construire l'infrastructure sans blocages constants.
- **La phase de Profilage** : Une fois le déploiement réussi, des outils natifs comme AWS IAM Access Analyzer analysent les logs d'activité (AWS CloudTrail). Ils génèrent automatiquement une politique IAM stricte ne contenant que les actions exactes réellement appelées. C'est cette politique sur mesure qui est déployée en Production.

**2. Les "Permission Boundaries" (Frontières de permissions)**
Pour donner de l'autonomie tout en contrôlant la limite des dégâts (Blast Radius), les administrateurs utilisent des *Permission Boundaries*. On donne au rôle de déploiement la permission globale de créer des ressources, mais avec une barrière stricte : *"Ce rôle peut faire ce qu'il veut, SAUF créer de nouveaux utilisateurs IAM, ou déployer en dehors de la région us-east-1"*.

**3. L'IaC pour l'IAM et les revues asynchrones**
Personne ne clique dans la console AWS pour ajouter une permission. L'IAM est écrit sous forme de code (Terraform, CloudFormation). L'ajout d'une permission (ex: `secretsmanager:GetSecretValue`) se fait via une "Pull Request" (PR) asynchrone, approuvée par un ingénieur de sécurité, puis appliquée automatiquement par le pipeline CI/CD.

**4. L'accès persistant et le Just-In-Time (JIT)**
Pour éviter les failles critiques liées aux accès persistants (Credential Leaks) :
- **Pour les Humains (JIT Access)** : Authentification via AWS IAM Identity Center (SSO), assomption d'un rôle temporaire avec MFA, avec expiration automatique (1 à 8 heures).
- **Pour les Machines** : Implémentation de la fédération OIDC (comme réalisé avec GitHub Actions dans ce projet). Le pipeline demande un jeton temporaire qui s'autodétruit après le déploiement, éliminant tout stockage de clés statiques.

**5. Implémentation de ce modèle dans notre contexte (Compte Unique)**
Ne disposant que d'un seul compte AWS (au lieu d'un compte Sandbox et d'un compte Production distincts), j'ai simulé cette ségrégation industrielle via l'IAM :
- **Mon profil CLI local (`pfe-deployer` / `CloudFormationRole`) = Mon compte Sandbox virtuel.** Il dispose de droits élargis (type Administration) pour me permettre d'itérer, de tester les fichiers `.yml` en quelques secondes et de valider les concepts d'architecture sans friction opérationnelle.
- **Mon rôle OIDC (`GitHubActionsDeployRole`) = Mon environnement de Production.** Il est ultra-verrouillé en *Moindre Privilège*. C'est mon filet de sécurité. Il prouve de manière irréfutable que l'infrastructure cible est inviolable, même si mon code GitHub venait à être compromis.

*Bilan d'apprentissage* : Bien que douloureuse, l'application manuelle du moindre privilège est une méthode formatrice redoutable, forçant la mémorisation de l'anatomie exacte des appels API d'AWS.

---

## 6) État d'avancement par phases

### Phase 1 — Fondations Infrastructure [VALIDÉE]
- M1 à M5 : IAM, VPC/Subnets, ECR, ECS Fargate, ALB.

### Phase 2 — Automatisation DevOps [VALIDÉE]
- M6 [FAIT] : CI/CD backend GitHub Actions + OIDC + déploiement ECS immuable (SHA).
- M7 [FAIT] : pipeline IaC CloudFormation (validation + déploiement contrôlé).

### Phase 2.5 — Intégration 3-Tiers [VALIDÉE]
- M8 [FAIT] : RDS PostgreSQL provisionné en zone privée avec Cross-Stack References (`!ImportValue`).
- M9 [FAIT] : backend Django/Gunicorn relié à RDS.
- M10 [FAIT] : frontend React hébergé sur S3.
- M11 [FAIT] : pipeline unifiée frontend + backend.

### Phase 3 — Observabilité & Sécurité avancée [VALIDÉE]
- M12 [FAIT] : monitoring CloudWatch (Alarmes CPU/RAM/5XX) + alerting SNS.
- M13 [FAIT] : gestion des secrets DB via AWS Secrets Manager.

### Phase 4 — Production [ANNULÉE - DÉCISION FINOPS]
- M14 [ANNULÉ] : HTTPS + DNS (ACM, Route 53). Décision prise de ne pas engager de frais supplémentaires pour l'achat d'un nom de domaine à des fins purement académiques. L'infrastructure est fonctionnelle et accessible via le DNS fourni par l'ALB.

---

## 7) Bilan Final du Projet

L'infrastructure AWS de ce PFE est désormais **complète et entièrement fonctionnelle**.
Les principaux accomplissements sont :
1. **L'Automatisation CI/CD unifiée** : Déploiement sans friction du Frontend (S3) et Backend (ECS) via GitHub Actions.
2. **La Sécurité au plus haut niveau** : Implémentation du fédérateur OIDC, du principe de moindre privilège via IAM, et intégration transparente d'AWS Secrets Manager pour sécuriser les identifiants de base de données.
3. **L'Observabilité Proactive** : La pile CloudWatch et SNS est opérationnelle, garantissant une notification immédiate de l'administrateur en cas de dégradation des performances.
4. **La Maîtrise des Coûts (FinOps)** : Le script `destroy-infra.sh` garantit un environnement effaçable à volonté. De plus, la décision d'annuler M14 (Achat de nom de domaine) démontre une réflexion pragmatique sur l'optimisation budgétaire.

---

## 8) Conclusion

Ce projet s'achève sur un succès total. Il dépasse la simple mise en ligne d'une application pour démontrer l'élaboration d'une **architecture Cloud industrialisée, traçable, scalable et sécurisée**. Les fondations techniques sont robustes, la chaîne de déploiement est fluide, et l'ensemble reflète une maîtrise professionnelle des concepts AWS avancés. L'infrastructure est prête pour une démonstration académique ou une évolution vers un contexte d'entreprise réel.
