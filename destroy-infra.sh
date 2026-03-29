#!/bin/bash
set -e

PROFILE="pfe-deployer"

echo "=========================================="
echo "🧹 Début de la destruction de l'infrastructure"
echo "=========================================="

# 1. Destruction du Calcul (ECS)
echo "[1/3] Suppression de pfe-ecs-stack..."
aws cloudformation delete-stack --stack-name pfe-ecs-stack --profile $PROFILE
aws cloudformation wait stack-delete-complete --stack-name pfe-ecs-stack --profile $PROFILE
echo "✅ ECS détruit."

# 2. Destruction des Données (RDS)
echo "[2/3] Suppression de pfe-rds-stack (Environ 3 à 5 minutes)..."
aws cloudformation delete-stack --stack-name pfe-rds-stack --profile $PROFILE
aws cloudformation wait stack-delete-complete --stack-name pfe-rds-stack --profile $PROFILE
echo "✅ RDS détruit."

# 3. Destruction du Routage (ALB)
echo "[3/3] Suppression de pfe-alb-stack..."
aws cloudformation delete-stack --stack-name pfe-alb-stack --profile $PROFILE
aws cloudformation wait stack-delete-complete --stack-name pfe-alb-stack --profile $PROFILE
echo "✅ ALB détruit."

echo "=========================================="
echo "💰 Environnement totalement nettoyé."