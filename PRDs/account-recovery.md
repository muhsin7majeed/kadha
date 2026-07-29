# PRD: Anonymous Account Recovery

## 1. Overview

Kadha users should be able to reset a forgotten password without providing an email address, phone number, legal identity, or other recovery contact.

Kadha will issue each user a high-entropy recovery code. The user is responsible for storing this code somewhere outside Kadha. Possession of the username and recovery code authorizes the user to set a new password.

This feature preserves Kadha's contact-free, pseudonymous account model. It does not introduce administrator-assisted recovery or identity verification.

If a user loses both their password and recovery code, their account cannot be recovered through the product or support.

## 2. Problem

Kadha currently authenticates users with a username and password but has no password reset mechanism. Because accounts have no email address or phone number, Kadha cannot deliver a conventional password-reset link or one-time code.

Users who forget their password permanently lose access to their tracked media, collections, friendships, and settings even though the data still exists on the instance.

The recovery design must improve account resilience without:

- collecting personal contact information;
- weakening the existing authentication model;
- giving instance administrators a product-level account takeover mechanism;
- storing a plaintext recovery credential;
- introducing security questions or identity-based support recovery.

## 3. Goals

- Let new users save an account recovery code during registration.
- Let existing authenticated users create their first recovery code.
- Let authenticated users replace a lost, exposed, or old recovery code.
- Let a logged-out user reset their password with their username and recovery code.
- Keep recovery codes secret, high-entropy, single-use credentials.
- Invalidate all existing sessions after password recovery.
- Preserve the existing username-and-password login flow.
- Avoid collecting an email address, phone number, or legal identity.
- Make the consequences of losing both credentials unmistakably clear.
- Record successful recovery-related security events without recording secrets.

## 4. Non-Goals

The initial implementation will not include:

- email, SMS, voice, or postal recovery;
- security questions;
- administrator-initiated password resets;
- support-assisted identity verification;
- trusted-contact or social recovery;
- passkeys or passwordless authentication;
- recovery through public profile information or friendship history;
- recovery-code reminders sent through an external channel;
- automatic deletion of an inaccessible account;
- restoration of deleted accounts or deleted data;
- end-to-end encryption or data-encryption-key recovery;
- multiple simultaneously valid recovery codes;
- a recovery-code reveal function;
- third-party CAPTCHA services.

Passkeys may be considered later as an additional anonymous authenticator, but they do not remove the need for an offline recovery method when every registered device is lost.

## 5. Terminology

### Recovery Code

A long-lived, randomly generated secret issued by Kadha and stored by the user. It can be used once to reset the account password.

The product should call this an **account recovery code**, not a reset token. "Reset token" commonly implies a short-lived credential delivered on demand, while this credential remains valid until it is used or replaced.

### Recovery Kit

A downloadable, printable text document containing:

- Kadha instance name;
- Kadha instance URL;
- username;
- recovery code;
- generation date;
- storage and safety instructions.

### Replace

Generate a new recovery code and immediately invalidate the previous code.

### Recover Account

Verify a username and recovery code, set a new password, invalidate existing sessions, and issue a replacement recovery code.

This does not restore deleted data and should not be labeled "restore account."

## 6. Core Product Decisions

### 6.1 Recovery remains user-controlled

Kadha cannot establish the real-world identity of an anonymous account holder. Product support and instance administrators must not be offered an account recovery control.

Possession of either of these is the only supported way to regain or retain access:

- the current password; or
- the current recovery code.

### 6.2 The recovery code is shown only once

The plaintext recovery code is shown:

- immediately after it is generated during registration;
- immediately after an authenticated user creates or replaces it; and
- immediately after a successful password recovery, when its replacement is issued.

After the user leaves that screen, Kadha cannot show the same code again.

Settings may show whether a code is configured and when it was generated, but must not reveal it. The only available action is to replace it.

### 6.3 The server stores only a hash

The database must never store the plaintext recovery code or a reversibly encrypted copy.

Only a one-way hash or keyed digest suitable for verifying the high-entropy generated value may be stored. Recovery codes must never appear in logs, analytics, activity metadata, URLs, or error reports.

### 6.4 Recovery codes are single-use

A successful recovery immediately invalidates the submitted code and issues a new one.

The old code must not succeed in a second request, including two recovery requests submitted concurrently.

### 6.5 Recovery codes do not expire automatically

The code remains valid until it is:

- used successfully;
- replaced by the authenticated user; or
- invalidated because the account is deleted.

This is an offline recovery credential rather than a short-lived code delivered through a side channel. Arbitrary expiration would create account loss without providing the user another recovery path.

### 6.6 Recovery revokes all sessions

A successful password reset must invalidate all access and refresh tokens issued before the recovery.

The user must log in normally with the new password after saving the replacement recovery code. Recovery must not automatically create an authenticated session.

## 7. User Stories

### New User

As a new user, I want to save a recovery code when I create my account so I can reset my password without giving Kadha contact information.

As a new user, I want clear instructions about where to store the code and what happens if I lose it.

### Existing User

As an existing user, I want to create a recovery code from Settings so my older account gains recovery protection.

As an authenticated user, I want to replace my recovery code if I lose or expose my saved copy.

As an authenticated user, I want the old recovery code to stop working as soon as I replace it.

### Locked-Out User

As a user who forgot my password, I want to enter my username and recovery code and choose a new password.

As a recovered user, I want a replacement recovery code because the code I used is no longer valid.

### Privacy-Conscious User

As a privacy-conscious user, I want account recovery without providing an email address, phone number, or legal identity.

## 8. Recovery Code Requirements

### Entropy and generation

- Generate codes with a cryptographically secure random number generator.
- Use at least 128 bits of random entropy.
- Do not derive a code from the username, password, user ID, timestamp, UUID, or other predictable account data.
- Do not use a JWT as the saved recovery code.

### Display format

The code should be readable, copyable, downloadable, and practical to enter manually.

A format using 128 random bits encoded as 32 uppercase hexadecimal characters is acceptable and requires no new encoding dependency:

```text
KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF
```

Presentation rules:

- `KADHA-` is a recognizable prefix and does not contribute entropy.
- Hyphens separate groups for readability and do not contribute entropy.
- Input comparison ignores ASCII letter case, spaces, and hyphens.
- Any other unexpected character makes the code invalid.
- The normalized secret must contain exactly the expected number and type of characters.

The exact encoding may change during implementation if it preserves at least 128 bits of entropy and equivalent usability without adding a production dependency.

### Storage

Recommended user storage options:

- a password manager;
- a printed copy stored with important documents;
- an encrypted file or secure offline drive.

The UI should warn users not to:

- save the only copy inside Kadha;
- share it with anyone;
- post it in a support request;
- store it in an untrusted note, screenshot service, or chat.

## 9. Registration Experience

Registration keeps its existing username, password, password confirmation, and watch-region fields.

After account creation succeeds:

1. Kadha establishes the existing authenticated session.
2. The API returns the newly generated recovery code once.
3. The client shows a dedicated recovery-code step before navigating into the app.
4. The user can copy, download, or print the recovery kit.
5. The user acknowledges that Kadha cannot recover the account if both the password and code are lost.
6. The user continues to the intended authenticated destination.

Suggested primary copy:

```text
Save your account recovery code
```

Suggested supporting copy:

```text
This code is the only way to reset your password. Kadha cannot recover your
account if you lose both your password and this code.
```

Suggested actions:

- `Copy code`
- `Download recovery kit`
- `Print`
- `I saved my recovery code`

The application must not persist the plaintext code in local storage, session storage, IndexedDB, the query cache, or another client-side store after the onboarding step ends.

If the user closes the page before saving the code, they can create a replacement later from Settings while they still know their password.

## 10. Existing-User Enrollment

Existing users have no recovery code after the database migration.

Settings should show:

```text
Account recovery
Not configured
```

An authenticated user can select:

```text
Create recovery code
```

The user must re-enter their current password before a code is generated. After successful reauthentication, Kadha generates the code, stores its hash, and shows the plaintext value once.

The app may show a dismissible prompt encouraging existing users to configure recovery. It must not block normal use.

## 11. Settings Experience

For an account with a recovery code, Settings should show:

```text
Account recovery
Recovery code configured
Created July 29, 2026
```

Available action:

```text
Replace recovery code
```

Replacement flow:

1. Explain that the previous code will immediately stop working.
2. Require the current password.
3. Generate and persist the replacement atomically.
4. Show the new code once.
5. Offer copy, download, and print actions.
6. Require an acknowledgment before closing the result step.

Settings must not include:

- `Show recovery code`;
- `Reveal recovery code`;
- a masked code that can be expanded;
- a recovery-code hint containing secret characters;
- an action that generates a replacement without reauthentication.

If the user is authenticated but has forgotten their password, the active session alone is not sufficient to create or replace a recovery code. This prevents a stolen session from becoming permanent account control.

## 12. Forgot-Password Experience

Add a `Forgot password?` link to the login page.

The recovery page should contain:

- username;
- recovery code;
- new password;
- confirm new password;
- submit action.

Suggested heading:

```text
Recover your account
```

Suggested supporting copy:

```text
Enter the recovery code you saved when you created or secured this account.
Without that code, Kadha cannot reset your password.
```

The recovery code should be submitted in a POST request body. It must never be placed in a URL path, query string, or fragment.

For an unknown username, an account without a configured recovery code, or an incorrect code, return the same response status and user-facing error:

```text
Invalid username or recovery code.
```

Do not disclose whether:

- the username exists;
- a recovery code is configured;
- the code format was valid after normalization;
- the code was previously used;
- the account was deleted.

### Successful recovery

After successful recovery:

1. The old password no longer works.
2. The submitted recovery code no longer works.
3. All sessions created before recovery are invalid.
4. A new recovery code is issued and displayed once.
5. The user saves the replacement code.
6. The user returns to the normal login page.
7. The user logs in with the new password.

Suggested success copy:

```text
Your password has been reset and your previous sessions were signed out.
Save this new recovery code before returning to login.
```

## 13. API Requirements

Route names may be adjusted to match existing conventions, but the required capabilities are:

```http
POST /api/auth/recover
POST /api/auth/recovery-code
POST /api/auth/recovery-code/replace
GET  /api/auth/recovery-code/status
```

### Register

The existing registration response adds a plaintext recovery code:

```ts
interface RegisterResponse {
  message: string;
  accessToken: string;
  userId: string;
  recoveryCode: string;
}
```

The plaintext value is returned only in the response that created it.

### Recovery status

Authenticated response:

```ts
interface RecoveryCodeStatusResponse {
  configured: boolean;
  createdAt: string | null;
}
```

The response must not include the code, its hash, a reversible encrypted value, or secret-derived characters.

### Create or replace

Authenticated request:

```ts
interface ReplaceRecoveryCodeRequest {
  currentPassword: string;
}
```

Successful response:

```ts
interface ReplaceRecoveryCodeResponse {
  recoveryCode: string;
  createdAt: string;
}
```

The same operation may handle first-time creation and replacement if the UI and activity event can distinguish them.

### Recover

Unauthenticated request:

```ts
interface RecoverAccountRequest {
  username: string;
  recoveryCode: string;
  newPassword: string;
}
```

Password confirmation remains a client form concern. The server validates `newPassword` using the same password schema used for registration and normal password changes.

Successful response:

```ts
interface RecoverAccountResponse {
  message: string;
  recoveryCode: string;
}
```

The recovery response must not include an access token, refresh token, or authenticated user object.

## 14. Data Model

Add nullable recovery fields for backward compatibility and a session version for token revocation:

```prisma
model User {
  // Existing fields

  recoveryCodeHash     String?
  recoveryCodeIssuedAt DateTime?
  sessionVersion       Int       @default(0)
}
```

The migration must:

- preserve all existing users and data;
- set `recoveryCodeHash` and `recoveryCodeIssuedAt` to `null` for existing users;
- set `sessionVersion` to `0` for existing users;
- not generate inaccessible recovery codes for existing users.

Do not add a plaintext or encrypted recovery-code column.

A separate recovery credential table is not required for one active code per user. If future requirements introduce multiple codes, credential history, or additional authenticator types, the model can be moved to a dedicated authentication credential table.

## 15. Server Architecture

Keep the implementation in the existing auth feature:

```text
server/src/features/auth/
  auth.routes.ts
  auth.controller.ts
  auth.service.ts
  auth.schema.ts
  auth.types.ts
  recovery-code.ts
```

Responsibilities:

- controllers handle request and response behavior;
- schemas validate and normalize request fields;
- the auth service coordinates password updates, recovery-code rotation, activity creation, and session invalidation;
- a focused recovery-code utility handles secure generation, normalization, hashing, and constant-time comparison where applicable.

Business logic, cryptographic handling, and Prisma calls must not be implemented in controllers.

## 16. Atomicity and Concurrency

Recovery-code verification, password replacement, recovery-code rotation, session-version increment, and the successful recovery activity event must behave as one logical transaction.

The implementation must protect against concurrent reuse:

1. Two requests submit the same valid recovery code.
2. At most one request succeeds.
3. The other request receives the generic invalid-credential response.

Replacing a code from Settings must also update the stored hash and issued date atomically so there is no interval where both old and new codes work.

If the transaction fails, the old password and old recovery code must remain valid and no new plaintext code should be presented as active.

## 17. Session Invalidation

Kadha currently uses stateless access and refresh JWTs. Updating the password in the database does not, by itself, invalidate tokens already issued to the user.

Add `sessionVersion` to access-token and refresh-token claims:

```ts
interface AuthTokenPayload {
  userId: string;
  username: string;
  sessionVersion: number;
}
```

Required behavior:

- Registration and login issue tokens with the current database version.
- Refresh verifies the signed token and compares its version with the current user record.
- Protected requests verify that the access-token version matches the current user record.
- Password recovery increments `sessionVersion`.
- Every token carrying an older version is rejected.
- The recovery response clears the refresh-token cookie for the current browser.

For a backward-compatible rollout, a token without `sessionVersion` may be interpreted as version `0`. This keeps existing sessions working for accounts still at version `0`, while incrementing the version during recovery invalidates those legacy tokens.

Password recovery should revoke all sessions automatically rather than asking the user, because a forgotten password may indicate credential compromise.

## 18. Password Requirements

The new password must:

- use the same shared server-side schema as registration and any future password-change flow;
- be entered twice in the client;
- be stored with the project's approved password hashing algorithm;
- never be included in logs or activity metadata;
- not be compared with or derived from the recovery code.

Password-policy modernization is related security work but should remain independently reviewable. The recovery feature must not introduce a weaker password policy than registration.

## 19. Rate Limiting and Abuse Protection

Recovery attempts must be throttled by:

- normalized account identifier; and
- source IP or equivalent trusted client address.

Requirements:

- Use progressive delays or bounded retry windows.
- Do not permanently lock the account based only on failed recovery attempts.
- Do not let one attacker trivially deny recovery to a known username.
- Return generic errors after throttling.
- Do not echo submitted secrets in validation errors.
- Keep limits configurable for self-hosted instances where practical.
- Do not add a third-party CAPTCHA that leaks client data.

The implementation may use existing infrastructure or a small project-owned limiter. Adding a new production dependency requires separate approval under the repository working agreement.

Normal login should receive appropriate brute-force protection as separate or shared authentication hardening, but login-rate-limiting scope must not delay safe recovery verification.

## 20. Security Activity and Audit Behavior

Add successful user activity types such as:

```text
RECOVERY_CODE_CREATED
RECOVERY_CODE_REPLACED
PASSWORD_RESET_WITH_RECOVERY_CODE
```

Activity metadata may include a human-readable title or timestamp but must never include:

- the recovery code;
- the recovery-code hash;
- the old or new password;
- access or refresh tokens;
- partial secret values.

Failed recovery attempts should not create user-visible activity rows because an attacker could flood the timeline. They may be counted in bounded security logs or metrics if secrets and sensitive request bodies are excluded.

Because Kadha has no independent contact channel, an in-app activity event is not equivalent to an external recovery notification. This limitation is an accepted consequence of the contact-free account model and should be documented in the privacy/security documentation.

## 21. Frontend Architecture

Suggested placement:

```text
client/src/pages/auth/recover-account.tsx
client/src/features/auth/api/use-recover-account.ts
client/src/features/auth/components/recovery-code-display.tsx
client/src/features/auth/components/recovery-kit-actions.tsx
client/src/features/auth/recovery-code.types.ts
client/src/features/settings/components/account-recovery-section.tsx
```

Route declaration:

```text
/auth/recover
```

Add it to the public auth route group and lazy-load the route-level screen when practical.

Before creating shared dialogs or secret-display components, reuse or extend existing project components where they cover the required behavior.

All controls must:

- use theme-aware Chakra styling;
- use intentional button color palettes;
- use semantic responsive text styles;
- remain keyboard accessible;
- have accessible labels;
- work on narrow mobile screens;
- preserve readable code grouping and horizontal wrapping.

Do not keep the recovery code in a long-lived global state atom or React Query cache. The component that receives the plaintext code should own it only for the lifetime of the one-time display step.

## 22. Recovery Kit Requirements

The recovery kit should be generated client-side from the one-time API response so the server does not need to store or re-fetch the plaintext code.

Suggested text format:

```text
Kadha Account Recovery Kit

Instance: https://kadha.example
Username: example-user
Generated: 2026-07-29

Recovery code:
KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF

Keep this code private. Anyone with your username and this code can reset
your password and take control of your account.

Kadha cannot recover your account if you lose both your password and this
recovery code.
```

The initial version should use a plain text download. PDF generation is unnecessary unless it can be done without a new production dependency and materially improves printing.

Use the configured public app URL in the kit so users with accounts on multiple self-hosted instances can identify the correct instance.

## 23. Privacy and Policy Requirements

Update the relevant product copy and documentation to explain:

- Kadha does not require an email address or phone number for recovery.
- A hashed recovery-code verifier and its issue date are stored with the account.
- The plaintext code is shown only to the user.
- Anyone possessing the recovery code can reset the password.
- Kadha support cannot recover an account without the code.
- Instance operators retain the technical capabilities that come with server and database control; the recovery feature is not end-to-end encryption.

Avoid claiming that contact-free authentication alone makes a user fully anonymous. The feature preserves pseudonymous signup and avoids collecting a recovery address, but network and server metadata are separate privacy considerations.

## 24. Failure and Edge Cases

### User loses only the recovery code

If the user knows their password, they can sign in and replace the code from Settings after reauthentication.

### User forgets only the password

They can use the saved recovery code to set a new password.

### User is still signed in but forgot the password and lost the code

The active session must not be sufficient to replace the recovery code. The user should export their data while access remains and create a new account if necessary.

### User loses both password and recovery code

The account is unrecoverable through Kadha. Support and administrators must not attempt identity-based exceptions.

### Recovery code is exposed

An authenticated user who still knows their password can immediately replace it. The old code stops working.

### API succeeds but the replacement-code screen is closed

The new password is already valid. The user can log in with it and replace the unseen recovery code from Settings after entering that password.

### Existing account has no recovery code

The public recovery endpoint returns the same generic failure used for an incorrect code. The user must sign in normally before configuring recovery.

### Instance database is restored from an old backup

A database rollback may restore an older password hash, recovery-code hash, or session version. Self-hosting documentation should make clear that authentication state is restored along with all other database state. Operators should secure and manage backups as sensitive credentials.

## 25. Testing Requirements

### Server tests

- Registration generates a recovery code using the required format and entropy source.
- Registration stores a hash and never stores the plaintext code.
- Registration returns the plaintext code once.
- Existing users with a null recovery hash continue to log in.
- An authenticated user can create their first code with the correct password.
- An incorrect current password cannot create or replace a code.
- Replacing a code invalidates the old code.
- Recovery succeeds with a correctly normalized code.
- Recovery fails for an incorrect code.
- Recovery fails for an unknown username with the same public response.
- Recovery fails generically when no code is configured.
- A used code cannot be reused.
- Concurrent submissions of one valid code allow at most one success.
- Successful recovery changes the password hash.
- The old password fails after recovery.
- The new password works through normal login.
- Successful recovery returns a replacement code but no auth tokens.
- The replacement code works for a later recovery.
- Recovery increments `sessionVersion`.
- Access and refresh tokens from before recovery are rejected.
- Tokens issued after normal login use the current version.
- Recovery clears the current refresh cookie.
- Recovery activity contains no secret data.
- Rate limits apply to repeated failures by account and IP.
- Validation, application errors, and request logging never expose secrets.

### Client tests

- Login shows a `Forgot password?` link.
- Registration shows the one-time recovery step before navigation.
- Copy and download actions use the received code.
- The recovery code is removed from client state when the step ends.
- Existing users see the correct configured or not-configured state.
- Settings never renders the stored code.
- Creating and replacing a code requires the current password.
- Replacement warns that the old code will stop working.
- Recovery validates password confirmation.
- Generic API failures do not reveal account existence.
- Successful recovery shows the replacement code and a login action.
- Recovery does not set an access token or authenticated query state.
- Recovery screens are keyboard accessible and usable at mobile widths.

## 26. Documentation and Changelog

When implemented:

- Add the user-visible feature under `## Unreleased` in `CHANGELOG.md`.
- Sync the in-app changelog.
- Update the Privacy Policy.
- Update the Terms or account-responsibility copy if necessary.
- Replace the login-page beta message saying no password reset is available.
- Document the recovery kit and unrecoverable-account policy in the README or user documentation.
- Mention any one-time session compatibility behavior in operator-facing release notes.

## 27. Rollout

Recommended rollout order:

1. Add the nullable recovery fields and `sessionVersion`.
2. Add token-version validation without disrupting version-0 sessions.
3. Add secure recovery-code generation and hashing.
4. Issue codes during new registration.
5. Add existing-user enrollment and replacement in Settings.
6. Add the public recovery endpoint and page.
7. Add rate limits, activity events, security tests, and privacy copy.
8. Verify old tokens are rejected after recovery.
9. Update the changelog and generated in-app changelog.

The public forgot-password link should not be enabled until session invalidation, single-use rotation, generic errors, and rate limiting are all working.

## 28. Acceptance Criteria

- New accounts receive a high-entropy recovery code during registration.
- The plaintext recovery code is shown only in the response that generates it.
- The database stores only a one-way verifier for the code.
- New users can copy, download, or print a recovery kit.
- Existing users can create a recovery code after entering their password.
- Settings shows recovery status and issue date but never reveals the code.
- Authenticated users can replace a code after reauthentication.
- Replacing a code immediately invalidates the previous code.
- A logged-out user can reset their password with username and recovery code.
- Recovery uses the same password validation policy as registration.
- A successful recovery invalidates the submitted code and issues a replacement.
- A successful recovery invalidates all previous access and refresh tokens.
- Recovery never automatically logs the user in.
- Unknown accounts, unconfigured accounts, and incorrect codes receive the same public error.
- Recovery attempts are rate-limited without enabling permanent account lockout.
- Recovery codes, hashes, and passwords never appear in logs, URLs, activity metadata, or admin responses.
- Existing users and existing sessions remain compatible with the migration until an account's session version changes.
- The UI clearly states that losing both the password and recovery code makes the account unrecoverable.
- No email address, phone number, security question, or legal identity is collected.
- No administrator or support password-reset action is introduced.

## 29. Security References

- [NIST SP 800-63B: Account Recovery](https://pages.nist.gov/800-63-4/sp800-63b.html#account-recovery)
- [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Mozilla Account Recovery Keys](https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys)
- [Proton Recovery Phrase](https://proton.me/support/recovery-phrase)
- [CryptPad User Account Recovery Limitations](https://docs.cryptpad.org/en/user_guide/user_account.html)
