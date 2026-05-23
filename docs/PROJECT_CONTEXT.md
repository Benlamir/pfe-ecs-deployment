# PROJECT_CONTEXT

Project: pfe-ecs-deployment
Repository root: /workspace
Primary cloud: AWS

## Scope
Automated deployment of a 3-tier web architecture on AWS for PFE.
- Frontend: React on S3 (static hosting)
- Backend: Django DRF + Gunicorn on ECS Fargate
- Database: PostgreSQL on RDS
- IaC: CloudFormation templates under infrastructure/
- CI/CD: GitHub Actions

## Current deployment model
- Docker image is built and pushed to ECR from GitHub Actions.
- ECS deployment uses immutable image tag (github.sha) by creating a new task definition revision and updating the ECS service.
- `latest` is still pushed only as convenience/debug tag; production rollout is SHA-pinned.

## Key paths
- CI/CD workflow: .github/workflows/deploy.yml
- Infra templates: infrastructure/*.yml
- Infra scripts: deploy-infra.sh, destroy-infra.sh
- Documentation: docs/

## Security conventions
- Never keep secrets in tracked files.
- `deploy-infra.sh` is ignored in Git due to sensitive values.
- Use OIDC role assumption in GitHub Actions (`AWS_ROLE_ARN`).

## Working conventions
- Any deployment logic change must update:
  1) .github/workflows/deploy.yml
  2) docs/DECISIONS.md
  3) docs/RUNBOOK.md (commands and verification)

## Session startup protocol
1. Read docs/PROJECT_CONTEXT.md
2. Read docs/NEXT_STEPS.md
3. Run git status + last commits
4. Execute the top pending item in NEXT_STEPS
