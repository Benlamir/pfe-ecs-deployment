# RUNBOOK

## CI/CD backend deploy verification

Prechecks
1. Ensure GitHub Secrets exist:
   - AWS_REGION
   - AWS_ROLE_ARN
2. Ensure OIDC trust policy allows this repo/branch.
3. Ensure ECS cluster/service names match workflow env values.

Trigger deploy
- Automatic: push to main with changes under app/**, Dockerfile, or .github/workflows/**
- Manual: GitHub Actions `workflow_dispatch`

Expected workflow behavior
1. Checkout code
2. Assume AWS role via OIDC
3. Login to ECR
4. Build and push image tagged with github.sha
5. Register new ECS task definition revision with SHA image
6. Update ECS service to new task definition
7. Wait until `services-stable`

Post-deploy checks (AWS CLI)
1. Get active task definition:
   aws ecs describe-services --cluster pfe-cluster --services pfe-app-service --query 'services[0].taskDefinition' --output text
2. Confirm running task image tag:
   - describe task definition and verify container image includes commit SHA
3. Check service events for rollout errors:
   aws ecs describe-services --cluster pfe-cluster --services pfe-app-service --query 'services[0].events[0:10]'

Failure patterns
- AccessDenied on role assumption: fix OIDC trust policy and repo condition.
- ECS service not stable: inspect service events + task logs in CloudWatch.
- Wrong container updated: adjust workflow logic to target container by name (not index).

Security operations
- If secret was ever committed, rotate immediately.
- Keep secret-bearing scripts local/untracked.
