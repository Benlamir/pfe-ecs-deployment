# NEXT_STEPS

Legend: [PENDING] [IN_PROGRESS] [DONE]

## Immediate
- [PENDING] Harden deploy workflow container targeting
  - Replace `.containerDefinitions[0].image` with container-name based replacement to avoid wrong container updates in multi-container task definitions.
  - Acceptance: workflow updates the intended app container deterministically.

- [PENDING] Add frontend deployment pipeline stage
  - Build React app and sync artifacts to S3 bucket.
  - Acceptance: one pipeline run deploys backend (ECS) + frontend (S3).

- [PENDING] Add deployment observability gates
  - Emit rollout summary (task definition ARN, image URI, service events on failure).
  - Acceptance: failed runs provide actionable logs without manual deep dive.

## Security
- [PENDING] Rotate DB credentials if historical exposure confirmed
  - Acceptance: new credentials active; old credentials revoked.

## Infrastructure/IaC
- [PENDING] Add/validate IaC pipeline for CloudFormation updates
  - Acceptance: controlled IaC rollout workflow exists with review safeguards.

## Session handoff template (must update before closing session)
- LAST_DONE:
- NEXT_ACTION:
- BLOCKERS:
- FILES_TOUCHED:
- VERIFY_COMMANDS:
