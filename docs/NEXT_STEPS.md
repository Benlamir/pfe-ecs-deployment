# NEXT_STEPS

Legend: [PENDING] [IN_PROGRESS] [DONE]

## Current phase alignment
- Phase: 2 — Automatisation DevOps
- Milestone focus: M7 (Pipeline IaC CloudFormation)

## Immediate (execution order)
- [DONE] M7 — Add/validate IaC pipeline for CloudFormation updates (single environment v1)
  - Scope:
    - Validate templates in CI (`network.yml`, `alb.yml`, `ecs.yml`, `rds.yml`, `s3.yml`).
    - Validation uses BOTH `cfn-lint` and `aws cloudformation validate-template`.
    - Add controlled deploy workflow with BOTH triggers:
      1) auto on `main` behind approval gate
      2) manual `workflow_dispatch` fallback
    - Ensure traceability and rollback path.
  - Acceptance:
    1) [DONE] CI validation job runs on PR/push and fails on invalid templates/lint errors.
    2) [DONE] Deploy job is gated (manual approval or protected environment).
    3) [DONE] Stack updates are logged and reproducible.

- [PENDING] Harden deploy workflow container targeting
  - Replace `.containerDefinitions[0].image` with container-name based replacement.
  - Acceptance: workflow updates the intended app container deterministically.

- [PENDING] Add deployment observability gates
  - Emit rollout summary (task definition ARN, image URI, service events on failure).
  - Acceptance: failed runs provide actionable logs without manual deep dive.

- [PENDING] Add frontend deployment pipeline stage (M10/M11 prep)
  - Build React app and sync artifacts to S3 bucket.
  - Acceptance: one pipeline run can deploy backend (ECS) + frontend (S3).

## Security
- [PENDING] M13 bootstrap — move DB credentials to Secrets Manager
  - Acceptance:
    1) Secret created and referenced by ECS task runtime.
    2) No DB credential in tracked files/scripts.

- [PENDING] Rotate DB credentials if historical exposure confirmed
  - Acceptance: new credentials active; old credentials revoked.

## Done recently
- [DONE] M8 — Transition to Cross-Stack References (`!ImportValue`) across all CFN templates (`network.yml`, `alb.yml`, `ecs.yml`, `rds.yml`).
- [DONE] Secrets Manager/GitHub Secrets integration for `DB_PASSWORD` passed to RDS and ECS dynamically.
- [DONE] Fixed ECS dependency on RDS in GitHub Actions workflow to resolve deployment sequence.
- [DONE] Deploy workflow moved to immutable SHA-based ECS rollout.
- [DONE] `deploy-infra.sh` ignored and removed from Git tracking.
- [DONE] Roadmap normalized with statuses + acceptance criteria.

## Session handoff template (must update before closing session)
- LAST_DONE: 
  1. Completed Phase 3 (M10/M11) - Frontend React S3 Deployment pipeline.
  2. Dynamically injected API Gateway/ALB URL into Vite build process.
- NEXT_ACTION: Ajouter une configuration/script pour générer un Snapshot RDS avant le teardown de l'infrastructure (pour éviter la perte de données). Puis enchaîner sur M12 (Monitoring) ou finaliser M13.
- BLOCKERS: None. Session en pause.
- FILES_TOUCHED: `docs/Roadmap.md`, `frontend/src/services/api.ts`, `.github/workflows/deploy.yml`
- VERIFY_COMMANDS: N/A.
