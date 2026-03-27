#!/bin/bash

# Variables strictes pour stopper le script à la moindre erreur
set -e

PROFILE="pfe-deployer"
VPC_ID="vpc-0c21f619264ee8f3b"
SUBNETS="subnet-0458ba68ae979317e,subnet-0a8e479cbbbca6314"

echo "=========================================="
echo "🚀 Lancement du déploiement de l'infrastructure"
echo "=========================================="

# 1. Déploiement du Routage (ALB)
echo "[1/2] Déploiement de pfe-alb-stack..."
aws cloudformation deploy \
  --template-file infrastructure/alb.yml \
  --stack-name pfe-alb-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS \
  --profile $PROFILE

echo "✅ ALB déployé avec succès."

# 2. Déploiement du Calcul (ECS)
echo "[2/2] Déploiement de pfe-ecs-stack..."
aws cloudformation deploy \
  --template-file infrastructure/ecs.yml \
  --stack-name pfe-ecs-stack \
  --parameter-overrides VpcId=$VPC_ID SubnetIds=$SUBNETS \
  --capabilities CAPABILITY_IAM \
  --profile $PROFILE

echo "✅ ECS déployé avec succès."
echo "=========================================="
echo "🎯 Infrastructure Cloud opérationnelle."