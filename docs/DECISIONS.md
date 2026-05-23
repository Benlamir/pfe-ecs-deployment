# DECISIONS (ADR-lite)

## 2026-05-23 — Deploy ECS using immutable image tags (github.sha)
Status: Accepted

Context
- Previous flow effectively relied on mutable `latest` during service rollout.
- This weakens traceability and rollback confidence.

Decision
- Build and push image tagged with commit SHA.
- Resolve current ECS task definition, inject SHA image URI, register new revision.
- Update ECS service with the new revision and wait for stability.

Consequences
- Deterministic deployments and easier incident analysis.
- Rollbacks can target known task definition revisions.
- Slightly more workflow complexity (task definition render/register step).

## 2026-05-23 — Stop tracking deploy-infra.sh
Status: Accepted

Context
- Script contains DB password/sensitive values.

Decision
- Add `deploy-infra.sh` to .gitignore.
- Remove file from Git tracking index.

Consequences
- Reduces risk of future secret leaks via commits.
- Does not clean historical exposures; credential rotation still required.
