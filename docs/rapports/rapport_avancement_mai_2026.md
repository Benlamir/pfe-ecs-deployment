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

---

## 3) Choix d'Architecture (NoOps/FinOps) et Résolution de difficultés

### 3.1 Stratégie d'hébergement : NoOps et optimisation financière

Le choix des services pour héberger les couches de l'application 3-Tiers ne repose pas uniquement sur l'optimisation financière (*FinOps*), mais avant tout sur une volonté de réduire la charge d'administration système (*NoOps* / *Serverless*). Étant seul sur la réalisation de ce PFE, la priorité était d'éviter la complexité liée à la gestion de serveurs traditionnels :

1. **Frontend sur S3 et Backend sur ECS Fargate (Approche NoOps)** : L'utilisation de machines virtuelles classiques (EC2) impliquerait de devoir administrer le système d'exploitation (mises à jour de sécurité, gestion des clés SSH, rotation des logs, patching). En optant pour Amazon S3 (site statique) et AWS Fargate (conteneurs), la gestion de l'infrastructure sous-jacente est totalement déléguée à AWS. Bien qu'ECS Fargate soit structurellement plus onéreux à l'heure qu'une instance EC2 de base, ce surcoût est compensé par le gain de temps majeur qui permet de se concentrer exclusivement sur la conception Cloud, le pipeline CI/CD et le code applicatif.
2. **Optimisation des coûts de stockage (S3)** : Sur le plan strictement *FinOps*, l'hébergement du frontend sur S3 est extrêmement rentable. Au lieu de payer un serveur allumé 24h/24, le coût (quelques centimes) dépend uniquement du stockage brut et du trafic réseau réellement consommé.
3. **Évitement de la NAT Gateway (Isolation Logique)** : Comme nous avons vues dans le schéma 3-Tiers idéal, Fargate est placé en sous-réseau privé. Cependant, Fargate a besoin d'Internet pour tirer l'image Docker (ECR) et lire les mots de passe (Secrets Manager). Connecter un sous-réseau privé à Internet requiert une **NAT Gateway**, dont le coût fixe incompressible avoisine les 32$/mois. 
   **Solution appliquée :** Fargate a été physiquement provisionné dans un sous-réseau public. L'isolation et la confidentialité du trafic sont intégralement garanties de manière logicielle par un **Security Group** très restrictif, qui rejette tout trafic Internet direct et n'accepte que les requêtes relayées par l'Application Load Balancer (ALB).

```text
[ Mécanisme d'Isolation FinOps ]

                       +----------------------------------+
  (Bloqué par le SG) X-|        [ ECS Fargate ]           |
                       |       IP Publique activée        |
[ Internet ] --(HTTP)-----> [ ALB ] --(HTTP)--> (Trafic Autorisé) |
                       |    (Seule source acceptée)       |
                       +----------------------------------+
```

### 3.2 Gestion des Health Checks ALB et compromis de sécurité (FinOps)

**La boucle infinie de déploiement (Erreur 404)**
Lors du déploiement initial, l'Application Load Balancer (ALB) a été configuré pour interroger régulièrement le conteneur Django via l'URI `HealthCheckPath: /health/` afin de s'assurer de son bon fonctionnement. 
Cependant, l'application Django ne possédait pas cette route et retournait une erreur `HTTP 404`. Puisque l'ALB ne recevait pas le code `200 OK` attendu, il considérait le conteneur comme défaillant (*"unhealthy"*). En conséquence, le service ECS détruisait immédiatement le conteneur pour en lancer un nouveau, provoquant une boucle infinie de création/destruction qui bloquait totalement le déploiement de l'infrastructure. 
**La solution** a été de développer explicitement une route `/health/` dans Django qui renvoie un statut `200 OK`. Cela a permis à l'ALB de valider l'état de santé du conteneur et de stabiliser le service (rolling deployment réussi).

**Le compromis sur `ALLOWED_HOSTS`**
Pour des raisons strictement financières, la décision a été prise de ne pas acheter de nom de domaine personnalisé (évitant ainsi les coûts liés à Amazon Route 53 et ACM). L'application est donc joignable via l'URL générée dynamiquement par AWS pour l'ALB.
Puisque cette URL change à chaque recréation de l'infrastructure, le framework Django rejetterait les requêtes par défaut pour des raisons de sécurité de l'en-tête HTTP Host. Pour contourner cette limitation, une exception a été implémentée dans la configuration :
`ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')`
L'utilisation du joker (`*`) autorise toutes les requêtes entrantes quel que soit l'en-tête "Host". Bien qu'il s'agisse d'une faille de sécurité documentée (vulnérabilité aux attaques de *Host Header Injection*), c'est un risque assumé et un compromis nécessaire dans le cadre académique de ce PFE pour maintenir l'automatisation sans générer de coûts superflus.

---

## 4) Automatisation CI/CD (GitHub Actions)

L'ensemble des processus de test, d'intégration et de déploiement a été entièrement automatisé via GitHub Actions, garantissant une approche DevOps robuste et reproductible.

### 4.1 Sécurité des déploiements (OIDC)
Au lieu de stocker des clés d'accès AWS statiques dans GitHub (ce qui constitue une vulnérabilité critique en cas de fuite), le pipeline utilise la **fédération d'identité AWS OIDC (OpenID Connect)**. GitHub Actions demande un jeton temporaire de courte durée à AWS, qui expire automatiquement à la fin du workflow, garantissant une sécurité optimale (*Zero Trust*).

### 4.2 Pipeline d'Infrastructure as Code (IaC)
Un workflow dédié s'assure de la qualité du code d'infrastructure avant tout déploiement :
- Analyse statique et lintage des templates CloudFormation (via `cfn-lint`) pour bloquer les erreurs de syntaxe ou de configuration dès le commit.

### 4.3 Pipeline Unifié Applicatif (Frontend + Backend)
Le workflow principal (`deploy.yml`) orchestre le déploiement simultané et parallèle des couches Frontend et Backend dès qu'un *push* est validé sur la branche `main` :

- **Job Frontend** : Construit l'application React optimisée pour la production et synchronise les fichiers statiques directement avec le bucket Amazon S3.
- **Job Backend** :
  1. Construit l'image Docker locale.
  2. Pousse l'image vers le registre Amazon ECR (taggée avec le SHA du commit pour garantir l'immuabilité et la traçabilité).
  3. **Extraction** : Récupère la définition de tâche (*Task Definition*) active sur ECS Fargate au format JSON via l'AWS CLI.
  4. **Injection dynamique (`jq`)** : Au lieu de stocker la définition de tâche en dur dans le dépôt, le pipeline utilise l'utilitaire de parsing `jq` pour modifier le JSON à la volée. Il cible la clé `.containerDefinitions[0].image` pour y insérer la nouvelle URI générée (avec le nouveau SHA), et nettoie les métadonnées en lecture seule d'AWS (`revision`, `status`, etc.).
  5. **Mise à jour ECS** : Soumet ce fichier JSON modifié pour enregistrer une nouvelle révision de la *Task Definition*, et ordonne au service ECS de l'appliquer (`aws ecs update-service`).
  6. Attend le signal `services-stable` pour confirmer le succès du *Rolling Deployment* (mise à jour sans interruption de service).

```text
[ Code Local ] -> [ Push GitHub `main` ] -> [ Workflow GitHub Actions ]
                                                 | (Auth OIDC)
                         +-----------------------+-----------------------+
                         |                                               |
                         v                                               v
               [ Job Backend ]                                  [ Job Frontend ]
               Build + Push ECR                                 Build React (npm run build)
               Register Task Definition                         aws s3 sync
               Update ECS Service (Rolling)                     Publication statique
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
