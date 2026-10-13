PHASE 1 — PROJECT AUDIT, SAFE CLEANUP, BUG FIXES & PERFORMANCE OPTIMIZATION

1. Project Context

You are working on the existing Asira educational and scientific research training platform.

The platform is nearly complete after several rounds of development and modifications. We are transitioning from development to production readiness.

The application uses Firebase as its backend infrastructure. You must inspect the actual repository to identify the frameworks, Firebase products, libraries, and architectural patterns currently in use.

Potential Firebase services may include:

- Firebase Authentication.
- Cloud Firestore.
- Cloud Functions.
- Firebase Cloud Messaging.
- Firebase Storage.
- Firebase App Check.
- Firebase Hosting, if currently configured.

These are examples, not assumptions. Only work with services that are actually used or configured in the existing project.

The project may contain development-only data, temporary implementations, redundant network requests, unused code, and frontend errors that need to be addressed before production deployment.

2. Primary Objective

Audit, clean, stabilize, and optimize the EXISTING project without rebuilding it from scratch.

The objective is to produce a cleaner, more stable, more efficient, and production-ready codebase while preserving all existing functionality.

You are authorized to inspect and modify project files as needed to achieve this phase.

However, all modifications must be incremental, evidence-based, testable, and reversible.

Do not redesign the entire application or introduce a new architecture unless a specific, demonstrated problem requires it.

Do not begin the comprehensive cybersecurity penetration-testing phase or production deployment phase. Those belong to subsequent phases.

You may fix obvious security-sensitive coding mistakes encountered during this phase, but document them and preserve the full security audit for Phase 2.

---

3. NON-NEGOTIABLE SAFETY RULES

Rule 1: Inspect before modifying

Before changing files, understand the existing architecture and identify the code paths involved.

Do not modify a file merely because its name appears unnecessary.

Trace imports, references, routes, dependencies, dynamic loading, background operations, Firebase triggers, and other indirect uses before removing anything.

Rule 2: Preserve existing functionality

Do not remove, replace, or simplify working features merely to reduce code size.

Preserve the current UI, branding, navigation, supported languages, roles, permissions, workflows, and business logic unless a specific bug requires a correction.

Avoid unrelated UI redesigns.

Rule 3: Protect Firebase production data

Treat existing Firebase production data as valuable and potentially irreplaceable.

Do not:

- Delete Firestore collections or documents.
- Delete real user accounts.
- Delete real student records, grades, exams, submissions, certificates, or course data.
- Reset Firebase Authentication.
- Clear Firebase Storage.
- Deploy modified Cloud Functions or Firebase Rules to production.
- Run destructive migrations.
- Modify production configuration in ways that could disrupt the application.

You may inspect configuration and code, run safe read-only diagnostics where authorized, and create tests using isolated test data.

Development data cleanup must not become a database deletion operation.

If a data migration or deletion appears necessary, document it and leave it for explicit approval.

Rule 4: Protect secrets

Never print, expose, or commit:

- Firebase Admin SDK private keys.
- Service account credentials.
- Private API keys.
- Authentication tokens.
- Session cookies.
- Sensitive environment variable values.
- Real user data.

Firebase web configuration is not automatically a secret. Nevertheless, never assume that its presence makes database access safe. Access control must be enforced by appropriate backend authorization, Firestore Rules, Storage Rules, and other applicable controls.

Rule 5: Establish a rollback path

Before substantial modifications:

1. Inspect the Git working tree.
2. Preserve existing user changes.
3. Record the current branch and commit, if available.
4. Identify uncommitted changes.
5. Create a checkpoint or a dedicated working branch when appropriate and safe.
6. Do not overwrite, discard, or reset existing user work.

If the repository contains uncommitted changes, do not blindly stash, reset, or overwrite them.

Rule 6: No fabricated test results

Never report a test as passed unless it was actually executed and its result was checked.

Clearly distinguish:

- Passed.
- Failed.
- Blocked.
- Not executed.
- Not applicable.

If a command cannot run because of missing dependencies, permissions, credentials, or infrastructure, report the exact limitation.

Rule 7: No blind dependency upgrades

Do not upgrade all dependencies indiscriminately.

Inspect compatibility and necessity before changing package versions.

Avoid introducing new libraries when the existing stack can solve the problem safely.

---

4. TASK A — FULL PROJECT INVENTORY

Begin by inspecting the complete repository.

Identify:

1. Frontend framework and version.
2. Backend architecture.
3. Programming languages.
4. Package managers and lockfiles.
5. Firebase services actually used.
6. Authentication implementation.
7. Firestore data-access layer.
8. Cloud Functions, if present.
9. Firebase Storage usage.
10. FCM and notification implementation, if present.
11. State management and caching mechanisms.
12. Routing and navigation.
13. Existing automated tests.
14. Build, lint, and type-check commands.
15. Environment configuration.
16. Git and deployment configuration.
17. Development-only tools and scripts.

Inspect the relevant files, including those that exist in the repository:

- "package.json" and its lockfile.
- "firebase.json".
- ".firebaserc".
- Firestore Rules and indexes.
- Storage Rules.
- Cloud Functions source code.
- Firebase initialization files.
- Authentication and authorization modules.
- Environment examples.
- ".gitignore".
- Build configuration.
- Test configuration.
- CI workflows.
- README and deployment documentation.

If the project uses a framework other than Next.js or React, adapt the inspection to its actual architecture.

Do not assume that every listed file exists.

Deliverable

Create a concise internal audit report identifying the actual architecture, critical modules, and available verification tools.

Record findings in a suitable project document only if doing so fits the repository's existing documentation conventions.

---

5. TASK B — IDENTIFY AND REMOVE DEVELOPMENT-ONLY CODE

Find code and resources that were introduced for development, demonstration, testing, or temporary implementation.

Examples include:

- Mock users and mock courses.
- Hardcoded sample student records.
- Fake exam results and grades.
- Demo dashboard statistics.
- Placeholder content presented as real data.
- Temporary authentication bypasses.
- Debug-only routes and components.
- Development-only buttons and menus.
- Temporary API responses.
- Simulated notification results.
- Fake loading delays.
- Development-only feature flags.
- Unused experimental implementations.
- Debug logs containing sensitive information.
- Obsolete TODO/FIXME implementations.

For each candidate:

1. Identify the file and code location.
2. Trace where it is referenced.
3. Determine whether it is still required.
4. Check whether any active workflow depends on it.
5. Determine whether it can be safely removed or must be replaced.
6. Make the smallest appropriate change.
7. Run the relevant tests.

Critical requirement

If a feature currently depends on mock data because its real backend integration is incomplete, do not simply remove the mock and leave the feature broken.

Instead:

- Determine whether the intended Firebase integration already exists.
- If it exists, correct the integration and connect the feature to the actual data source.
- If it does not exist, document the incomplete feature.
- Do not invent backend behavior or silently redesign the feature.
- Do not represent fake data as verified real data.

If completing the integration requires a substantial feature implementation outside this phase, preserve the existing functionality safely and report the limitation.

Test accounts and sample data

Remove development-only test fixtures from the codebase where appropriate.

Do not automatically delete accounts or records from Firebase.

If test accounts exist in a production Firebase project, report them separately for controlled review.

---

6. TASK C — UNUSED FILES, COMPONENTS, AND DEPENDENCIES

Identify potentially unused:

- Files.
- Components.
- Pages.
- Routes.
- Hooks.
- Services.
- Utilities.
- Models.
- Types.
- Stylesheets.
- Assets.
- Scripts.
- Packages.

Use static analysis and reference searches where possible.

Before deleting a candidate, verify whether it is referenced by:

- Dynamic imports.
- Routing configuration.
- Reflection or runtime registration.
- Framework conventions.
- Firebase Functions discovery.
- Build scripts.
- Tests.
- Configuration files.
- Generated code.
- Asset paths.
- External integrations.

Remove only items for which there is sufficient evidence that they are unnecessary.

For dependencies:

1. Identify unused direct dependencies.
2. Check indirect dependencies and peer dependencies.
3. Inspect package scripts and build tools.
4. Remove only confirmed unnecessary packages.
5. Update the lockfile using the project's existing package manager.
6. Reinstall or validate dependencies as appropriate.
7. Run the build and tests afterward.

Do not delete files simply because they have no direct import.

Deliverable

Provide a list of removed items and the evidence supporting each removal.

Also document candidates that could not be safely classified.

---

7. TASK D — FIX EXISTING ERRORS

Inspect the application for existing runtime, compile-time, rendering, and functional errors.

Check:

- Browser Console errors.
- Build failures.
- TypeScript or other type-checking errors.
- Lint failures.
- Broken routes.
- Missing components.
- Invalid imports.
- Unhandled exceptions.
- Failed network requests.
- Firebase permission errors.
- Authentication state errors.
- Failed form submissions.
- Broken loading and error states.
- Incorrect empty states.
- Incorrect redirects.
- Broken links and buttons.
- Mobile layout regressions.
- Unhandled asynchronous operations.
- Missing cleanup for listeners and subscriptions.

Prioritize errors that prevent essential workflows from working.

Fix the root cause rather than hiding error messages.

Do not silence warnings globally, disable lint rules indiscriminately, or suppress errors merely to achieve a passing build.

For each significant fix, document:

- The original symptom.
- The underlying cause.
- The file modified.
- The correction applied.
- The verification performed.

---

8. TASK E — FIREBASE-SPECIFIC REVIEW

Inspect Firebase usage and correct clear implementation mistakes that belong to this phase.

E.1. Firebase Initialization

Check whether Firebase is initialized correctly.

Look for:

- Duplicate initialization.
- Multiple Firebase app instances when unnecessary.
- Repeated creation of service clients.
- Incorrect environment-specific configuration.
- Improper initialization order.
- Client/server initialization confusion.
- Incorrect use of Firebase Admin SDK in browser code.
- Unnecessary reinitialization during component rendering.

Preserve legitimate multiple-app configurations when required.

E.2. Firestore Request Efficiency

Investigate the reported excessive network requests.

Inspect:

- Duplicate document reads.
- Repeated queries on page navigation.
- Repeated reads caused by component rendering.
- Queries triggered by unstable dependencies.
- Listeners created repeatedly.
- Missing listener cleanup.
- Unnecessary realtime subscriptions.
- Re-fetching unchanged data.
- Loading entire collections unnecessarily.
- Missing pagination.
- Over-fetching fields or related records where avoidable.
- Repeated reads of the same user profile.
- Repeated role and permission lookups.
- Query patterns that could result in expensive reads.
- Unbounded queries.
- Retry loops.
- Polling that could be replaced by a more suitable mechanism.

Do not replace realtime listeners with one-time reads indiscriminately. Some existing features may require realtime updates.

Where caching or request deduplication is appropriate, use the project's existing state-management or data-fetching mechanisms where possible.

Consider React Strict Mode before concluding that duplicate development requests indicate a production bug. Confirm the actual cause rather than disabling Strict Mode.

E.3. Firebase Authentication

Inspect:

- Repeated authentication-state subscriptions.
- Missing subscription cleanup.
- Unnecessary profile re-fetching.
- Redirect loops.
- Incorrect loading states.
- Race conditions during login or logout.
- Stale user state.
- Repeated calls to fetch user information.

Do not weaken authentication checks to improve performance.

E.4. Cloud Functions

If Cloud Functions are used, inspect:

- Duplicate function invocations.
- Functions triggering themselves unintentionally.
- Firestore triggers causing recursive writes.
- Repeated writes producing additional trigger executions.
- Scheduled tasks that perform unnecessary work.
- Excessive fan-out.
- Missing idempotency.
- Unbounded processing.
- Retry behavior.
- Expensive operations performed for every document.
- Duplicate notification delivery.
- Missing filtering before expensive processing.

Do not deploy modified functions to production in this phase.

If deployment or emulator testing is needed, document the prerequisites and use an isolated test environment.

E.5. Firebase Storage

If Storage is used, inspect:

- Repeated downloads.
- Unnecessary uploads.
- Duplicate uploads.
- Repeated URL generation.
- Large assets loaded without need.
- Unnecessary file metadata requests.

Do not delete stored files.

E.6. Firestore Indexes and Query Design

Inspect existing queries and indexes.

Identify missing-index errors, inefficient query patterns, and potential indexing improvements.

Do not create arbitrary indexes without checking the actual queries and project conventions.

Do not apply changes to production Firebase configuration without authorization.

E.7. Firebase App Check and Security Boundaries

Record the current implementation state of App Check and relevant Firebase security controls.

You may correct obvious unsafe client-side patterns if the fix is within scope.

Do not enable enforcement blindly because it could block legitimate users or integrations.

The full security audit, including systematic authorization testing and penetration testing, is reserved for Phase 2.

---

9. TASK F — MEASURE AND REDUCE EXCESSIVE REQUESTS

Do not optimize based on assumptions alone.

Establish a baseline before making performance changes.

Select representative workflows based on the actual application, including:

- Login and dashboard loading.
- Course listing and course details.
- Student progress.
- Exam listing and exam submission.
- Teacher grading.
- Administrative pages.
- Certificate-related workflows.

Use browser DevTools, available instrumentation, automated tests, Firebase Emulator Suite, or other appropriate tools.

Measure, where possible:

1. Number of network requests per workflow.
2. Repeated requests to the same endpoint or document.
3. Firestore reads and writes.
4. Request duration.
5. Page loading and interaction performance.
6. Failed requests.
7. Unnecessary realtime subscriptions.
8. Duplicate function invocations.

Record the conditions under which the measurements were taken.

Distinguish:

- Application requests.
- Requests generated by development tooling.
- Authentication and token-refresh requests.
- Legitimate realtime traffic.
- Actual unnecessary requests.

After applying fixes, repeat the same measurements under comparable conditions.

Do not claim an exact percentage improvement without before-and-after measurements.

Do not optimize by weakening data isolation, skipping required validation, or caching sensitive data across users.

---

10. TASK G — USER EXPERIENCE AND FUNCTIONAL REGRESSION

Verify that cleanup and bug fixes do not break the existing product.

Inspect the current application and its actual role definitions before selecting the test matrix.

Where supported by the existing application, test:

Student

- Login and logout.
- Dashboard.
- Course access.
- Learning materials.
- Exam start and submission.
- Results and grades.
- Progress tracking.
- Certificate access.

Instructor / Teacher

- Assigned courses.
- Student submissions.
- Practical grading.
- Grade review.
- Relevant teaching tools.

Reviewer

- Review-related pages and permitted actions.

Admin

- User management.
- Course management.
- Exam management.
- Student progress.
- Certificate administration.
- Other existing administrative workflows.

Super Admin

- Existing privileged administrative operations.

Do not assume every role or feature exists exactly as listed. Match the actual application.

Check for regressions in:

- Arabic and English interfaces.
- Right-to-left layout.
- Mobile responsiveness.
- Navigation.
- Loading indicators.
- Empty states.
- Error handling.
- Form validation.

Use existing automated tests where available.

If automated coverage is insufficient, add targeted tests for the most important workflows without replacing the existing test framework.

Never use real student credentials in automated tests.

---

11. TASK H — CODE QUALITY AND MAINTAINABILITY

Improve code quality where it directly addresses a demonstrated problem.

Consider:

- Duplicate logic.
- Dead code.
- Oversized components.
- Repeated database queries.
- Poor error handling.
- Inconsistent typing.
- Unnecessary complexity.
- Incorrect asynchronous cleanup.
- Missing input validation.
- Unsafe assumptions about Firebase responses.
- Fragile environment configuration.

Prefer small, localized changes.

Do not perform broad refactoring solely for stylistic reasons.

Do not change database schemas, collection names, document structures, authentication providers, or business logic without a clear compatibility analysis.

If a structural change is necessary, preserve backward compatibility and document migration requirements.

---

12. TASK I — REQUIRED VALIDATION

After the modifications, run the available checks appropriate to the actual project.

Examples include:

- Dependency installation or integrity checks.
- Lint.
- Type checking.
- Unit tests.
- Integration tests.
- Existing end-to-end tests.
- Build.
- Relevant Firebase Emulator Suite tests.
- Targeted browser testing.
- Performance measurements.

Use the project's actual scripts and framework.

Do not assume that commands such as "npm run build", "npm run lint", or "npm test" exist. Inspect the package scripts first.

If a command fails:

1. Determine whether the failure is pre-existing or introduced by your changes.
2. Investigate the cause.
3. Fix issues introduced by your changes.
4. Rerun the relevant checks.
5. Record unresolved pre-existing problems separately.

If the environment cannot support a required test, state the exact limitation and provide a reproducible procedure for running it later.

Regression requirements

At minimum:

- The application must build successfully if the environment supports the build.
- Existing critical workflows must continue to work.
- No new critical errors should be introduced.
- Firebase integration must remain functional.
- Authentication and authorization checks must not be weakened.
- No real production data may be deleted or modified by this phase.

---

13. REQUIRED FINAL REPORT

When the phase is complete, produce a concise but compreh