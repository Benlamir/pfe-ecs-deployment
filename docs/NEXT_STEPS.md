# NEXT_STEPS

Legend: [PENDING] [IN_PROGRESS] [DONE]

## Current phase alignment
- Phase: 2 — Automatisation DevOps
- Milestone focus: M7 (Pipeline IaC CloudFormation)

## Immediate (execution order)
- [IN_PROGRESS] M7 — Add/validate IaC pipeline for CloudFormation updates (single environment v1)
  - Scope:
    - Validate templates in CI (`network.yml`, `alb.yml`, `ecs.yml`, `rds.yml`, `s3.yml`).
    - Validation uses BOTH `cfn-lint` and `aws cloudformation validate-template`.
    - Add controlled deploy workflow with BOTH triggers:
      1) auto on `main` behind approval gate
      2) manual `workflow_dispatch` fallback
    - Ensure traceability and rollback path.
  - Acceptance:
    1) CI validation job runs on PR/push and fails on invalid templates/lint errors.
    2) Deploy job is gated (manual approval or protected environment).
    3) Stack updates are logged and reproducible.

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
- [DONE] Deploy workflow moved to immutable SHA-based ECS rollout.
- [DONE] `deploy-infra.sh` ignored and removed from Git tracking.
- [DONE] Roadmap normalized with statuses + acceptance criteria.

## Session handoff template (must update before closing session)
- LAST_DONE: M7 planning locked; decisions documented; roadmap/next-steps aligned; working branch feat/m7-iac-pipeline active.
- NEXT_ACTION: Implement M7 Step 1 (stack inventory + dependency order) and create IaC workflow skeleton.
- BLOCKERS: Container cannot access host SSH keys (host handles push/pull/merge).
- FILES_TOUCHED: docs/DECISIONS.md, docs/NEXT_STEPS.md, docs/RUNBOOK.md, docs/Roadmap.md.
- VERIFY_COMMANDS: git status --short ; git log --oneline -n 5 ; confirm branch = feat/m7-iac-pipeline
