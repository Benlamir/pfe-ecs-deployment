#!/bin/bash
set -e

PROFILE="pfe-deployer"
VPC_ID="vpc-0c21f619264ee8f3b"
SUBNETS="subnet-0458ba68ae979317e,subnet-0a8e479cbbbca6314"
VPC_CIDR="10.0.0.0/16"
DB_PASSWORD="CfcSuperSecretDBPassword2026"

echo "=========================================="
echo "🚀 Lancement du déploiement de l'infrastructure"
echo "=========================================="

# 1. Déploiement du Routage (ALB)
echo "[1/4] Déploiement de pfe-alb-stack..."
aws cloudformation deploy \
  --template-file infrastructure/alb.yml \
  --stack-name pfe-alb-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS \
  --profile $PROFILE
echo "✅ ALB déployé."

# 2. Déploiement des Données (RDS)
echo "[2/4] Déploiement de pfe-rds-stack (Cela prend entre 5 et 10 minutes)..."
aws cloudformation deploy \
  --template-file infrastructure/rds.yml \
  --stack-name pfe-rds-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS VpcCidr=$VPC_CIDR DBPassword=$DB_PASSWORD \
  --profile $PROFILE
echo "✅ RDS (Base de données) déployé."

# 3. Déploiement du Calcul (ECS)
echo "[3/4] Déploiement de pfe-ecs-stack..."
aws cloudformation deploy \
  --template-file infrastructure/ecs.yml \
  --stack-name pfe-ecs-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS DBPassword=$DB_PASSWORD \
  --capabilities CAPABILITY_IAM \
  --profile $PROFILE
echo "✅ ECS déployé."

echo "=========================================="
echo "🎯 Infrastructure Cloud 3-Tiers opérationnelle."

# ... (tes 3 premières stacks restent identiques) ...

# 4. Déploiement du Frontend (S3)
echo "[4/4] Déploiement de pfe-s3-stack..."
aws cloudformation deploy \
  --template-file infrastructure/s3.yml \
  --stack-name pfe-s3-stack \
  --profile $PROFILE

echo "✅ S3 (Frontend) déployé."
echo "=========================================="
echo "🎯 Récupération de l'URL du site web..."
aws cloudformation describe-stacks \
  --stack-name pfe-s3-stack \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text \
  --profile $PROFILE