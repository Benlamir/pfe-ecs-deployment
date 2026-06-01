#!/bin/bash
set -e

PROFILE="pfe-deployer"

echo "=========================================="
echo "🧹 Début de la destruction de l'infrastructure"
echo "=========================================="

# 0. Destruction du Monitoring
echo "[0/4] Suppression de pfe-monitoring-stack..."
aws cloudformation delete-stack --stack-name pfe-monitoring-stack --profile $PROFILE || true
aws cloudformation wait stack-delete-complete --stack-name pfe-monitoring-stack --profile $PROFILE || true
echo "✅ Monitoring détruit."

# 1. Destruction du Calcul (ECS)
echo "[1/4] Suppression de pfe-ecs-stack..."
aws cloudformation delete-stack --stack-name pfe-ecs-stack --profile $PROFILE || true
aws cloudformation wait stack-delete-complete --stack-name pfe-ecs-stack --profile $PROFILE || true
echo "✅ ECS détruit."

# 2. Destruction des Données (RDS)
echo "[2/4] Suppression de pfe-rds-stack (Environ 3 à 5 minutes)..."
aws cloudformation delete-stack --stack-name pfe-rds-stack --profile $PROFILE || true
aws cloudformation wait stack-delete-complete --stack-name pfe-rds-stack --profile $PROFILE || true
echo "✅ RDS détruit."

# 3. Destruction du Routage (ALB)
echo "[3/4] Suppression de pfe-alb-stack..."
aws cloudformation delete-stack --stack-name pfe-alb-stack --profile $PROFILE || true
aws cloudformation wait stack-delete-complete --stack-name pfe-alb-stack --profile $PROFILE || true
echo "✅ ALB détruit."

echo "=========================================="
echo "💰 Environnement totalement nettoyé."