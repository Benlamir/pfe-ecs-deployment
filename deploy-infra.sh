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
echo "[1/3] Déploiement de pfe-alb-stack..."
aws cloudformation deploy \
  --template-file infrastructure/alb.yml \
  --stack-name pfe-alb-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS \
  --profile $PROFILE
echo "✅ ALB déployé."

# 2. Déploiement des Données (RDS)
echo "[2/3] Déploiement de pfe-rds-stack (Cela prend entre 5 et 10 minutes)..."
aws cloudformation deploy \
  --template-file infrastructure/rds.yml \
  --stack-name pfe-rds-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS VpcCidr=$VPC_CIDR DBPassword=$DB_PASSWORD \
  --profile $PROFILE
echo "✅ RDS (Base de données) déployé."

# 3. Déploiement du Calcul (ECS)
echo "[3/3] Déploiement de pfe-ecs-stack..."
aws cloudformation deploy \
  --template-file infrastructure/ecs.yml \
  --stack-name pfe-ecs-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS \
  --capabilities CAPABILITY_IAM \
  --profile $PROFILE
echo "✅ ECS déployé."

echo "=========================================="
echo "🎯 Infrastructure Cloud 3-Tiers opérationnelle."