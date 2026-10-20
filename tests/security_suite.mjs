// ===================================================
// ASIRA Research Learning Platform - Automated Security Test Suite
// Phase 3 Independent Verification & Regression Tests
// ===================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Terminal colors
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${green('✓ PASS')}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ${red('✗ FAIL')}: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log(bold(cyan('\n======================================================')));
console.log(bold(cyan('  ASIRA Security & Production Readiness Test Suite   ')));
console.log(bold(cyan('======================================================\n')));

// -----------------------------------------------------------------------------
// 1. Client Security Utilities Tests (sanitizeUrl, sanitizeInput, isTrustedStorageUrl)
// -----------------------------------------------------------------------------
console.log(bold('--- 1. Testing URL Sanitization & XSS Protections ---'));

import { 
  sanitizeUrl, 
  sanitizeInput, 
  isTrustedStorageUrl, 
  sanitizeExamForStudent 
} from '../src/utils/security.ts';

// Test 1.1: Malicious javascript: protocol blocked
assert(
  sanitizeUrl('javascript:alert(1)') === '#',
  'sanitizeUrl blocks javascript:alert(1) payload'
);

// Test 1.2: Obfuscated javascript: payload blocked
assert(
  sanitizeUrl('   JaVaScRiPt:document.cookie   ') === '#',
  'sanitizeUrl blocks mixed-case and whitespace-padded javascript:'
);

// Test 1.3: Data URI HTML payload blocked
assert(
  sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==') === '#',
  'sanitizeUrl blocks data:text/html URIs'
);

// Test 1.4: VBScript protocol blocked
assert(
  sanitizeUrl('vbscript:msgbox(1)') === '#',
  'sanitizeUrl blocks vbscript: protocol'
);

// Test 1.5: Valid HTTPS DOI links allowed
assert(
  sanitizeUrl('https://doi.org/10.1016/j.jclinepi.2025.10.001') === 'https://doi.org/10.1016/j.jclinepi.2025.10.001',
  'sanitizeUrl allows legitimate HTTPS DOI links'
);

// Test 1.6: Valid PubMed HTTPS links allowed
assert(
  sanitizeUrl('https://pubmed.ncbi.nlm.nih.gov/38291024/') === 'https://pubmed.ncbi.nlm.nih.gov/38291024/',
  'sanitizeUrl allows legitimate HTTPS PubMed links'
);

// Test 1.7: Valid Google Drive HTTPS links allowed
assert(
  sanitizeUrl('https://drive.google.com/file/d/sampleSignedCertificate/view') === 'https://drive.google.com/file/d/sampleSignedCertificate/view',
  'sanitizeUrl allows legitimate Google Drive HTTPS links'
);

// Test 1.8: Null, undefined, empty inputs handled safely
assert(sanitizeUrl(null) === '#', 'sanitizeUrl handles null safely');
assert(sanitizeUrl(undefined) === '#', 'sanitizeUrl handles undefined safely');
assert(sanitizeUrl('') === '#', 'sanitizeUrl handles empty string safely');

// -----------------------------------------------------------------------------
// 2. Testing Trusted Storage Domain Verification
// -----------------------------------------------------------------------------
console.log(bold('\n--- 2. Testing Cloud Storage & Drive Domain Verification ---'));

// Test 2.1: Valid drive.google.com
assert(
  isTrustedStorageUrl('https://drive.google.com/open?id=123456789') === true,
  'isTrustedStorageUrl validates genuine Google Drive domain'
);

// Test 2.2: Valid docs.google.com
assert(
  isTrustedStorageUrl('https://docs.google.com/document/d/123/edit') === true,
  'isTrustedStorageUrl validates genuine Google Docs domain'
);

// Test 2.3: Valid Firebase Storage
assert(
  isTrustedStorageUrl('https://firebasestorage.googleapis.com/v0/b/asira.appspot.com/o/file.pdf') === true,
  'isTrustedStorageUrl validates genuine Firebase Storage domain'
);

// Test 2.4: Spoofed/Subdomain takeover attempts blocked
assert(
  isTrustedStorageUrl('https://drive.google.com.attacker.com/evil.pdf') === false,
  'isTrustedStorageUrl blocks domain spoofing (drive.google.com.attacker.com)'
);

// Test 2.5: Unencrypted HTTP blocked
assert(
  isTrustedStorageUrl('http://drive.google.com/file') === false,
  'isTrustedStorageUrl rejects unencrypted HTTP'
);

// -----------------------------------------------------------------------------
// 3. Testing Exam Answer Key Stripping
// -----------------------------------------------------------------------------
console.log(bold('\n--- 3. Testing Exam Answer Key Confidentiality ---'));

const rawExam = {
  id: 'exam-1',
  title: 'اختبار تجريبي',
  questions: [
    { id: 'q1', text: 'ما هو المعيار الذهبي؟', options: ['A', 'B'], correctIndex: 0, correctOpt: 'A', points: 10 },
    { id: 'q2', text: 'ما هو بروتوكول PRISMA؟', options: ['A', 'B'], correctIndex: 1, correctOption: 'B', points: 10 },
  ],
};

const sanitized = sanitizeExamForStudent(rawExam);

assert(
  sanitized.questions[0].correctIndex === undefined &&
  sanitized.questions[0].correctOpt === undefined &&
  sanitized.questions[1].correctOption === undefined,
  'sanitizeExamForStudent strips all correctIndex/correctOption/correctOpt fields'
);

assert(
  sanitized.questions[0].text === 'ما هو المعيار الذهبي؟' &&
  sanitized.questions[0].points === 10,
  'sanitizeExamForStudent preserves student-visible question text and point values'
);

// -----------------------------------------------------------------------------
// 4. Testing Input Sanitization
// -----------------------------------------------------------------------------
console.log(bold('\n--- 4. Testing Input Sanitization & Boundary Limits ---'));

assert(
  sanitizeInput('   نص تجريبي آمن   ') === 'نص تجريبي آمن',
  'sanitizeInput trims surrounding whitespace'
);

const longInput = 'A'.repeat(2000);
assert(
  sanitizeInput(longInput, 500).length === 500,
  'sanitizeInput strictly enforces maximum length limit'
);

// -----------------------------------------------------------------------------
// 5. Testing Firestore Security Rules Invariants
// -----------------------------------------------------------------------------
console.log(bold('\n--- 5. Testing Firestore Security Rules Authorization Invariants ---'));

const rulesPath = path.join(rootDir, 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

// Test 5.1: Users privacy protection
assert(
  !rulesContent.includes('match /users/{uid} {\n      // الطالب يقرأ ملفه الشخصي، والمدير والمدرس يقرؤون لأغراض أكاديمية\n      allow read: if isSignedIn();'),
  'Users collection does NOT allow public read to all authenticated users'
);

assert(
  rulesContent.includes('allow read: if isOwner(uid) || isAdmin() || isInstructor();'),
  'Users collection enforces strict owner/admin/instructor read boundary'
);

// Test 5.2: Attempts score tampering protection
assert(
  rulesContent.includes("!('calculatedScore' in request.resource.data)") &&
  rulesContent.includes("!('officialGrade' in request.resource.data)") &&
  rulesContent.includes("!('score' in request.resource.data)"),
  'Exam attempts rule forbids client score/grade injection on create'
);

// Test 5.3: Official grades protection
assert(
  /match\s+\/officialGrades\/\{gradeDoc\}\s*\{\s*allow\s+read:\s*if[^;]+;\s*allow\s+write:\s*if\s*isAdmin\(\)\s*\|\|\s*isCourseInstructor\(courseId\);/m.test(rulesContent),
  'Official grades collection is strictly writeable ONLY by admin or course instructor'
);

// Test 5.4: Practical grades protection
assert(
  /match\s+\/practicalGrades\/\{practicalDoc\}\s*\{\s*allow\s+read:\s*if[^;]+;\s*allow\s+write:\s*if\s*isAdmin\(\)\s*\|\|\s*isCourseInstructor\(courseId\);/m.test(rulesContent),
  'Practical grades collection is strictly writeable ONLY by admin or course instructor'
);

// Test 5.5: Answer Key Isolation
assert(
  /match\s+\/answerKey\/\{secretDoc=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s*isAdmin\(\)\s*\|\|\s*isCourseInstructor\(courseId\);/m.test(rulesContent),
  'Answer keys path is isolated from student access'
);

// Test 5.6: Audit log identity verification
assert(
  rulesContent.includes('request.resource.data.actorUid == request.auth.uid') &&
  rulesContent.includes("(request.resource.data.actorRole != 'admin' || isAdmin())"),
  'Audit log rule enforces caller actorUid and authentic actorRole'
);

// Test 5.7: Catch-all deny rule
assert(
  /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s*false;\s*\}/m.test(rulesContent),
  'Firestore rules enforce default-deny catch-all rule'
);

// -----------------------------------------------------------------------------
// 6. Testing Academic Certificate Eligibility & Code Verification Logic
// -----------------------------------------------------------------------------
console.log(bold('\n--- 6. Testing Certificate Eligibility & Verification Rules ---'));

// Read certificate service code to verify security invariants
const certServicePath = path.join(rootDir, 'src/services/certificateService.ts');
const certServiceContent = fs.readFileSync(certServicePath, 'utf8');

assert(
  !certServiceContent.includes("if (verificationCode.toUpperCase().startsWith('ASIRA-')) {\n    return {\n      valid: true"),
  'verifyCertificateByCode does NOT blindly accept any ASIRA-* prefix'
);

assert(
  certServiceContent.includes("where('status', '==', 'issued')"),
  'verifyCertificateByCode verifies certificate has status: issued in Firestore'
);

assert(
  certServiceContent.includes("where('verificationCode', '==', code)"),
  'verifyCertificateByCode performs exact verificationCode matching'
);

// -----------------------------------------------------------------------------
// 7. Testing HTTP Security Meta Headers in index.html
// -----------------------------------------------------------------------------
console.log(bold('\n--- 7. Testing Security Headers in index.html ---'));

const indexHtmlPath = path.join(rootDir, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

assert(
  indexHtmlContent.includes('<meta http-equiv="X-Content-Type-Options" content="nosniff" />'),
  'index.html includes X-Content-Type-Options: nosniff meta header'
);

assert(
  indexHtmlContent.includes('<meta name="referrer" content="strict-origin-when-cross-origin" />'),
  'index.html includes Referrer-Policy: strict-origin-when-cross-origin meta header'
);

// -----------------------------------------------------------------------------
// 8. Testing Hosting Security Configuration (vercel.json)
// -----------------------------------------------------------------------------
console.log(bold('\n--- 8. Testing Vercel Deployment & HTTP Security Headers ---'));

const vercelJsonPath = path.join(rootDir, 'vercel.json');
const vercelContent = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

assert(
  Array.isArray(vercelContent.rewrites) && vercelContent.rewrites.some(r => r.source === '/(.*)' && r.destination === '/'),
  'vercel.json configures SPA routing catch-all rewrite rule'
);

const vercelHeaders = vercelContent.headers?.[0]?.headers || [];
const getHeader = (key) => vercelHeaders.find(h => h.key.toLowerCase() === key.toLowerCase())?.value;

assert(
  getHeader('X-Content-Type-Options') === 'nosniff',
  'vercel.json enforces X-Content-Type-Options: nosniff'
);

assert(
  getHeader('X-Frame-Options') === 'DENY',
  'vercel.json enforces X-Frame-Options: DENY (clickjacking protection)'
);

assert(
  getHeader('Referrer-Policy') === 'strict-origin-when-cross-origin',
  'vercel.json enforces Referrer-Policy: strict-origin-when-cross-origin'
);

assert(
  getHeader('Content-Security-Policy')?.includes("frame-ancestors 'none'"),
  'vercel.json CSP includes frame-ancestors none'
);

assert(
  getHeader('Permissions-Policy')?.includes('camera=()'),
  'vercel.json enforces restricted Permissions-Policy'
);

// -----------------------------------------------------------------------------
// 9. Testing Advanced URL Spoofing & Edge Cases
// -----------------------------------------------------------------------------
console.log(bold('\n--- 9. Testing Advanced URL Spoofing & Parser Edge Cases ---'));

assert(
  isTrustedStorageUrl('https://drive.google.com@attacker.com/evil.pdf') === false,
  'isTrustedStorageUrl blocks userinfo auth URL spoofing (drive.google.com@attacker.com)'
);

assert(
  isTrustedStorageUrl('https://docs.google.com.phishing.io/doc') === false,
  'isTrustedStorageUrl blocks multi-subdomain phishing'
);

assert(
  isTrustedStorageUrl('not-a-valid-url') === false,
  'isTrustedStorageUrl safely handles non-URL strings without throwing'
);

// -----------------------------------------------------------------------------
// 10. Testing Prototype Pollution Resistance
// -----------------------------------------------------------------------------
console.log(bold('\n--- 10. Testing Prototype Pollution Resistance ---'));

const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}, "questions": []}');
const sanitizedMalicious = sanitizeExamForStudent(maliciousPayload);

assert(
  Object.prototype.polluted === undefined,
  'sanitizeExamForStudent does not pollute Object prototype'
);

// -----------------------------------------------------------------------------
// Summary Report
// -----------------------------------------------------------------------------
console.log(bold(cyan('\n======================================================')));
console.log(bold(`  Total Tests Run : ${totalTests}`));
console.log(bold(`  Passed Tests    : ${green(passedTests)}`));
console.log(bold(`  Failed Tests    : ${failedTests > 0 ? red(failedTests) : '0'}`));
console.log(bold(cyan('======================================================\n')));

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
