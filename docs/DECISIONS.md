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

## 2026-05-23 — M7 validation gate uses both cfn-lint and validate-template
Status: Accepted

Context
- `aws cloudformation validate-template` checks parser-level validity but misses many semantic/style issues.
- cfn-lint catches richer CloudFormation issues earlier in CI.

Decision
- In M7 validation job, run both:
  1) `cfn-lint`
  2) `aws cloudformation validate-template`

Consequences
- Better shift-left detection and fewer deploy-time failures.
- Slightly longer CI runtime and lint maintenance overhead.

## 2026-05-23 — M7 deploy trigger model: automatic + manual fallback
Status: Accepted

Context
- Need continuous flow with control.

Decision
- Keep both trigger paths:
  - Automatic deploy path from `main` behind approval gate.
  - Manual `workflow_dispatch` for controlled reruns/recovery.

Consequences
- Strong control and traceability without sacrificing velocity.

## 2026-05-23 — M7 environment scope: single environment first
Status: Accepted

Context
- Minimize complexity during first IaC pipeline rollout.

Decision
- Implement M7 for one environment first.
- Expand to multi-environment only after stable baseline.

Consequences
- Faster implementation and simpler debugging.
- Multi-env controls deferred to next iteration.

## 2026-05-23 — Cost-control rule: run destroy-infra.sh before ending sessions
Status: Accepted

Context
- Avoid unnecessary AWS spend between work sessions.

Decision
- End-of-session operational rule: execute `destroy-infra.sh` (when infra was provisioned during the session).

Consequences
- Reduced idle cloud cost.
- Requires disciplined teardown/recreate workflow.
