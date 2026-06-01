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

## 2026-05-30 — FinOps: No automated RDS snapshots before teardown
Status: Accepted

Context
- We considered adding an automated RDS snapshot step before tearing down the infrastructure to preserve test data between sessions.
- Manual RDS snapshots are billed for storage once the parent DB instance is deleted (approx $0.095/GB-month outside Free Tier).
- While the cost is negligible for small test DBs, accumulating snapshots over time could lead to unnecessary AWS spend.

Decision
- Cancel the implementation of automated RDS snapshots in the `destroy-infra.sh` script.
- Test data will be treated as ephemeral and re-seeded automatically or manually when the environment is recreated.

Consequences
- Zero AWS storage costs associated with teardowns.
- We accept the loss of test data between development sessions.
- Promotes fully stateless and reproducible testing environments.

## 2026-05-31 — Security: Simulate Sandbox vs Production segregation via IAM
Status: Accepted

Context
- The project runs on a single AWS account due to budget/learning constraints.
- Iterating with strict Least Privilege locally creates immense operational friction (the "trial-and-error IAM" trap).
- We need to demonstrate a production-ready, secure CI/CD pipeline for the final defense without hindering local development velocity.

Decision
- Simulate a multi-account strategy using IAM segregation:
  - **Local CLI (`pfe-deployer` / `CloudFormationRole`) = "Sandbox"**: Granted broader permissions (e.g. Administrator/PowerUser) to allow fast iteration, testing `.yml` templates, and validating AWS SAA concepts without friction.
  - **OIDC Role (`GitHubActionsDeployRole`) = "Production"**: Ultra-locked down with strict Least Privilege policies.

Consequences
- Solves the agility vs. security paradox for a single-account setup.
- The CI/CD pipeline acts as an inviolable safety net, proving that the target infrastructure is secure even if the GitHub repository is compromised.
- Significantly improves developer experience locally while meeting enterprise security standards in CI/CD.
