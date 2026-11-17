PHASE 2: COMPREHENSIVE SECURITY AUDIT, PENETRATION TESTING, AND REMEDIATION

1. PROJECT CONTEXT

You are working on the existing ASIRA Research Learning Platform.

Phase 1 has been completed according to the provided completion report.

The reported technology stack is:

- React 19.
- TypeScript 5.7.
- Vite 6.
- Firebase 11.
- Firebase Authentication.
- Cloud Firestore.
- Firestore Security Rules in "firestore.rules".
- Role-based access for students, instructors, and administrators.
- Educational workflows involving courses, exams, grades, assignments, submissions, and certificates.

These details come from the Phase 1 report. Verify them against the current repository before proceeding.

The Phase 1 report also identifies two major security priorities:

1. Preventing students from manipulating grades or bypassing assessment restrictions.
2. Ensuring that exam-answer validation and certificate issuance rely on trusted server-side logic where required.

Your task is to perform a rigorous security assessment of the EXISTING application, implement safe and necessary fixes, and verify those fixes through repeatable tests.

Do not rebuild the application.

Do not assume that a successful build, TypeScript check, or previous functional test proves that the application is secure.

2. PRIMARY OBJECTIVES

The objectives of Phase 2 are to:

1. Audit authentication and session handling.
2. Audit authorization and role enforcement.
3. Test Firestore Security Rules against unauthorized operations.
4. Verify that users cannot access or modify other users' private data.
5. Protect exam questions, answer keys, submissions, and grades.
6. Verify the integrity of certificates and course-completion records.
7. Inspect Firebase Storage security if Storage is used.
8. Review Cloud Functions and other trusted backend code if present.
9. Identify exposed secrets and sensitive information.
10. Check for common web application vulnerabilities.
11. Audit dependency vulnerabilities.
12. Run controlled security tests.
13. Fix confirmed vulnerabilities within the scope of this phase.
14. Rerun tests to verify that fixes work and existing features remain functional.
15. Produce an evidence-based security report.

The objective is to establish a defensible security posture, not to claim that every possible vulnerability has been eliminated.

---

3. NON-NEGOTIABLE SAFETY REQUIREMENTS

3.1 Protect real users and production data

Do not conduct destructive tests against production data.

Do not:

- Delete real user accounts.
- Modify real grades or exam submissions.
- Delete Firestore collections.
- Reset Authentication.
- Delete files from production Storage.
- Publish modified Firestore Rules without explicit authorization.
- Deploy Cloud Functions to production.
- Run destructive load tests against production.
- Change live user roles to facilitate testing.
- Trigger mass notifications.
- Execute uncontrolled scripts against the live application.

Use the Firebase Emulator Suite or a separate isolated Firebase test project whenever possible.

If an isolated environment cannot be established, perform read-only analysis and clearly identify the tests that remain blocked.

3.2 Preserve the existing project

- Keep the existing architecture.
- Make minimal, targeted changes.
- Preserve legitimate functionality.
- Do not weaken authentication or authorization to make tests pass.
- Do not disable security checks to resolve test failures.
- Do not remove features as a substitute for fixing vulnerabilities.
- Do not introduce unnecessary dependencies.
- Do not change production schemas without documenting the migration requirements.

3.3 Establish a rollback point

Inspect the Git working tree before making changes.

Preserve all existing user changes.

Create an appropriate checkpoint or working branch if possible without overwriting existing work.

Review all changes before finishing.

3.4 Evidence-based findings

Every reported vulnerability must include:

- Affected file or resource.
- Vulnerability category.
- Severity and rationale.
- Preconditions for exploitation.
- Reproducible test or evidence.
- Potential impact.
- Fix applied, if any.
- Retest result.

Distinguish between:

- Confirmed vulnerabilities.
- Potential vulnerabilities requiring further verification.
- Informational findings.
- False positives.

Do not report an attack as successful unless the test actually demonstrated the issue.

Do not claim a vulnerability is fixed merely because code was modified.

3.5 Testing authorization

Perform security tests only against the project and Firebase environments you are authorized to assess.

Keep testing isolated and controlled.

---

4. TASK A — SECURITY ARCHITECTURE DISCOVERY

Before making security changes, inspect the actual repository.

Identify:

- Firebase initialization.
- Authentication providers.
- User profile storage.
- Role assignment and role resolution.
- Firestore collection and subcollection structure.
- Firestore Security Rules.
- Firestore indexes.
- Firebase Storage Rules, if applicable.
- Cloud Functions, if applicable.
- Client-side database services.
- Assessment and exam services.
- Certificate services.
- Backup and restore services.
- Audit-log services.
- Admin and instructor operations.
- Environment variables and configuration.
- Existing security tests.
- Deployment configuration.

Pay special attention to:

- "firestore.rules"
- "src/services/firebaseConfig.ts"
- "src/services/assessmentService.ts"
- "src/services/certificateService.ts"
- "src/services/auditService.ts"
- "src/services/backupService.ts"
- "src/components/lms/StudentDashboard.tsx"
- "src/components/lms/InstructorDashboard.tsx"
- "src/components/lms/AdminDashboard.tsx"

These are starting points identified by the Phase 1 report, not an exhaustive or guaranteed list. Inspect the current implementation and trace dependencies.

Document the actual trust boundaries between the browser, Firebase Authentication, Firestore Rules, Cloud Functions, and any other backend components.

Do not assume that hiding an interface element or checking a role in React provides backend security.

---

5. TASK B — FIRESTORE SECURITY RULES AUDIT

Perform a line-by-line security review of the existing "firestore.rules".

For every collection and subcollection, identify:

1. Who can read documents?
2. Who can create documents?
3. Who can update documents?
4. Who can delete documents?
5. Which fields can each role modify?
6. How is document ownership established?
7. How are administrator privileges established?
8. Are role checks based on a trusted source?
9. Are related document references validated?
10. Can users bypass restrictions by changing document IDs or request fields?

Inspect the following common failure patterns:

- Public or overly broad reads.
- Unrestricted writes.
- Broad wildcard matches.
- Missing ownership checks.
- Incorrect use of "request.auth".
- Trusting user-supplied role fields.
- Allowing users to modify their own role.
- Allowing clients to assign themselves administrator privileges.
- Weak update validation.
- Missing field restrictions.
- Missing type validation.
- Unexpected fields being accepted.
- Incorrect use of existing document data.
- Incorrect validation of document ownership.
- Inconsistent protection between parent and child documents.
- Rules that accidentally grant access through overlapping match statements.
- Privileged operations available to ordinary authenticated users.

For every rule, determine the actual effect of its conditions.

Do not assume that a rule is secure because it contains a role check.

Required field-level authorization

Where appropriate, restrict updates to explicitly permitted fields.

For example, a student may be permitted to update their own limited profile fields, but should not be able to modify:

- Their role.
- Their authoritative grade.
- Their assessment status.
- Their certificate verification status.
- Their instructor assignments.
- Administrative flags.

Use the actual data model rather than copying these examples blindly.

Ensure that "create", "update", and "delete" operations are independently reviewed.

Emulator testing

Create or extend Firestore Rules tests using the Firebase Emulator Suite and the project's existing test tooling.

Where feasible, use authenticated test contexts representing each role.

Test both permitted and denied operations.

Examples:

- Unauthenticated user reads a protected student record: must be denied.
- Student reads their own permitted profile: should be allowed.
- Student reads another student's private record: must be denied.
- Student changes their own role to admin: must be denied.
- Student changes their own authoritative grade: must be denied.
- Student submits an answer through an authorized workflow: behavior must match the intended design.
- Student modifies another student's submission: must be denied.
- Instructor accesses an authorized course: should be allowed.
- Instructor accesses an unrelated restricted course: must be denied.
- Instructor modifies administrative settings: must be denied.
- Ordinary user performs a privileged administrative operation: must be denied.
- Unauthorized user deletes a protected record: must be denied.

Adapt the tests to the actual schema and business rules.

Do not weaken legitimate access simply to make a test pass.

If the application has no isolated test environment, do not run these tests against production.

---

6. TASK C — AUTHENTICATION AND ROLE ESCALATION

Review Firebase Authentication and role handling.

Determine:

- How authenticated users obtain roles.
- Whether roles are stored in Firestore, custom claims, or another trusted mechanism.
- Who can assign and modify roles.
- Whether client-side state can override the authoritative role.
- Whether privileged operations verify roles on the server.
- Whether logout clears sensitive client state.
- Whether account changes and authentication-state changes are handled correctly.
- Whether protected routes rely only on frontend checks.
- Whether administrative routes and operations have independent backend authorization.

Test whether an ordinary user can:

1. Modify their local role state.
2. Change a profile document to claim elevated privileges.
3. Send modified API or Firestore requests.
4. Access restricted pages directly.
5. Call privileged operations without the appropriate role.
6. Reuse stale role information after a role change.

Client-side route guards may improve UX but must not be the only security boundary.

If custom claims are used, verify that only trusted administrative code can assign them.

If roles are stored in Firestore, ensure that ordinary clients cannot grant themselves privileges.

Do not introduce custom claims or redesign role storage unless necessary and compatible with the current architecture.

---

7. TASK D — EXAM, ANSWER KEY, AND GRADE INTEGRITY

This is one of the highest-priority tasks.

Inspect the full assessment workflow, from exam creation to question delivery, submission, grading, result publication, and audit logging.

Determine where each sensitive operation actually occurs.

D.1. Exam-answer confidentiality

Verify whether correct answers are delivered to the browser before the student submits an assessment.

Inspect:

- Firestore document structures.
- Queries used to retrieve exam questions.
- Objects passed into frontend components.
- Cached state.
- Browser-visible responses.
- Client-side models.
- Publicly accessible documents.

If answer keys are stored in documents that students can read, investigate whether this exposes them even if the UI hides the answers.

Separate answer keys from student-readable exam content when necessary.

Enforce the separation through actual access controls, not just frontend filtering.

D.2. Grade manipulation

Determine whether students can modify their grades by:

- Updating their own Firestore documents.
- Editing submission documents.
- Changing request fields.
- Calling client-side service functions with manipulated parameters.
- Replaying requests.
- Modifying local state.
- Reusing another student's identifiers.

The authoritative grade must not be accepted from an untrusted client.

Where server-side grading is required, implement it through an appropriate trusted backend mechanism compatible with the existing architecture.

If Cloud Functions are already used, assess whether they can safely support the existing workflow.

If no trusted backend exists, determine the smallest compatible implementation that provides the required security.

Do not automatically deploy new functions.

D.3. Submission integrity

Verify:

- The authenticated user is the owner of the submission.
- The submission belongs to the correct exam and course.
- The exam is available according to the intended rules.
- The submitted answer structure is valid.
- Unauthorized fields are rejected.
- The same submission cannot produce duplicate grading side effects.
- Repeated requests do not create inconsistent results.
- The student cannot submit a grade as if it were an answer.
- Submission status transitions are validated.
- Time limits and attempt limits are enforced by trusted logic when required.

D.4. Attempt limits and timing

Inspect how the application enforces:

- Maximum attempts.
- Exam availability windows.
- Start and submission times.
- Late submissions.
- Retakes.
- Submission finalization.

Client-side timers alone cannot establish trustworthy timing.

Implement server-side enforcement where required by the intended assessment rules.

Avoid breaking legitimate accommodations or instructor-authorized retakes.

D.5. Practical grading

Verify that only authorized instructors or administrators can assign or modify practical grades.

Check:

- Course assignment.
- Instructor authorization.
- Student and submission identity.
- Permitted grade ranges.
- Grade changes.
- Audit logging.
- Protection against direct client writes.

Test whether students can directly alter practical-grade fields.

D.6. Audit logs

Review academic audit logging.

Determine whether ordinary clients can forge, delete, or modify audit records.

Ensure sensitive audit entries cannot be manipulated by unauthorized users.

Where appropriate, create audit records through trusted backend operations.

Do not claim that a client-generated audit event is independently trustworthy.

---

8. TASK E — CERTIFICATES AND COURSE COMPLETION

Inspect certificate creation, storage, retrieval, and verification.

Verify:

- Who can issue certificates.
- Whether a student can issue a certificate to themselves.
- Whether a student can modify certificate status.
- Whether course completion is verified using trusted data.
- Whether a certificate can be generated without satisfying completion requirements.
- Whether certificate IDs can be manipulated.
- Whether certificate ownership is checked.
- Whether a user can change another user's certificate.
- Whether verification reveals only intended public information.
- Whether duplicate issuance is prevented.
- Whether revoked certificates remain verifiable as revoked.

Do not trust a client-supplied claim that a course has been completed.

Use authoritative enrollment, assessment, and completion records.

If a secure server-side certificate issuance mechanism is missing, implement or propose the smallest compatible solution.

Preserve existing certificate designs and public verification workflows.

Do not expose private student information on public verification pages.

---

9. TASK F — FIREBASE STORAGE SECURITY

If Firebase Storage is used, inspect the Storage Rules and upload workflows.

Review:

- Who can upload files.
- Who can download files.
- File ownership.
- Course and assignment permissions.
- File size limits.
- Permitted content types.
- Unauthorized overwrites.
- Path manipulation.
- Public access.
- Sensitive document exposure.
- Deletion permissions.

If uploads are part of the application, determine whether client-provided MIME types and file extensions are being treated as sufficient proof of file safety.

Test the intended upload permissions in an isolated environment.

Do not delete existing files.

If Storage is not used, explicitly record that this task is not applicable.

---

10. TASK G — CLOUD FUNCTIONS AND TRUSTED BACKEND

If Cloud Functions or other trusted backend services exist, inspect them.

Review:

- Authentication checks.
- Role authorization.
- Input validation.
- Ownership verification.
- Data integrity.
- Secret handling.
- Error messages.
- Resource consumption.
- Rate limiting where appropriate.
- Idempotency.
- Duplicate event processing.
- Recursive Firestore triggers.
- Privileged database operations.
- Scheduled functions.
- Notification abuse.
- Untrusted user-controlled identifiers.

Check whether Admin SDK operations bypass Firestore Security Rules and whether the function itself enforces the required authorization.

Admin SDK access must not be treated as automatically safe.

If sensitive exam grading or certificate issuance currently occurs entirely in the client, document the exposure and implement a compatible server-side boundary where feasible.

Do not deploy any modified functions to production.

Provide deployment instructions for a later authorized release.

---

11. TASK H — CLIENT-SIDE SECURITY AND WEB VULNERABILITIES

Inspect the frontend and any APIs for applicable vulnerabilities.

XSS

Review rendering of:

- User-generated research content.
- Comments or forum posts.
- Course descriptions.
- Profile fields.
- Imported data.
- Rich text or HTML content.
- URLs supplied by users.

Determine whether untrusted content can execute as HTML or JavaScript.

Use appropriate output encoding and safe rendering patterns.

Do not introduce unsafe HTML rendering as a quick fix.

Injection

Inspect database queries and backend operations for unsafe construction of queries or commands.

Firebase Firestore does not use SQL queries, but that does not eliminate all injection risks in the application.

Check for unsafe dynamic query construction, command execution, and other injection-prone operations where relevant.

CSRF and session handling

Determine the actual authentication mechanism.

If authentication relies on Firebase client SDK bearer tokens, assess the applicable risks rather than assuming cookie-based CSRF protections are relevant.

If server-managed cookies or other cookie-authenticated endpoints exist, inspect their CSRF defenses and cookie settings.

Redirects and navigation

Check user-controlled redirect URLs and navigation parameters for open redirect risks.

Security headers

Inspect the current deployment configuration and applicable HTTP security headers, including:

- Content-Security-Policy.
- X-Content-Type-Options.
- Referrer-Policy.
- Frame protection through CSP "frame-ancestors" or appropriate alternatives.
- Strict-Transport-Security where applicable to the HTTPS production domain.
- Permissions-Policy where appropriate.

Do not blindly apply a restrictive Content-Security-Policy that breaks Firebase Authentication or required resources.

Test changes in a preview or local environment.

Sensitive data exposure

Inspect:

- Browser bundles.
- Source maps.
- Console output.
- Error messages.
- Local storage.
- Session storage.
- Publicly exposed configuration.
- Accidentally bundled service-account credentials.
- API responses.
- Debug endpoints.

Firebase web configuration is not itself a substitute for access control and is not automatically a private credential.

Never expose Firebase Admin credentials or other server secrets to the browser.

Do not print actual secret values in the report.

---

12. TASK I — RATE LIMITING AND ABUSE RESISTANCE

Assess whether sensitive operations can be abused through excessive requests.

Review:

- Authentication-related endpoints.
- Password-reset flows.
- Exam submission.
- Repeated gr