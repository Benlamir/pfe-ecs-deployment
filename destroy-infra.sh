#!/bin/bash

# Arrêt immédiat en cas d'erreur
set -e

PROFILE="pfe-deployer"

echo "=========================================="
echo "🧹 Début de la destruction de l'infrastructure"
echo "=========================================="

# 1. Destruction du Calcul (ECS) en premier
echo "[1/2] Suppression de pfe-ecs-stack..."
aws cloudformation delete-stack --stack-name pfe-ecs-stack --profile $PROFILE

echo "⏳ Attente de la destruction complète d'ECS (Connection Draining en cours)..."
aws cloudformation wait stack-delete-complete --stack-name pfe-ecs-stack --profile $PROFILE
echo "✅ ECS détruit avec succès."

# 2. Destruction du Routage (ALB)
echo "[2/2] Suppression de pfe-alb-stack..."
aws cloudformation delete-stack --stack-name pfe-alb-stack --profile $PROFILE

echo "⏳ Attente de la destruction complète de l'ALB..."
aws cloudformation wait stack-delete-complete --stack-name pfe-alb-stack --profile $PROFILE
echo "✅ ALB détruit avec succès."

echo "=========================================="
echo "💰 Environnement nettoyé. Coûts stoppés."