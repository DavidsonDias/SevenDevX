# Native MFA migration

Legacy MFA shared its TOTP secret with a third-party QR service and did not issue AAL2 sessions. Enrollment and verification now use native Supabase Auth, and the QR is a local data URI. Verified-factor removal requires AAL2; no legacy backup codes are advertised.

Migration 20261011234707 enforces opt-in MFA in has_role for authenticated callers with verified factors. Existing accounts without factors keep their prior role-based access. Signed AAL2 restores role access. Trusted server contexts remain supported. The admin-only admin_mfa_count RPC returns only a count, never factor secrets. Anonymous EXECUTE is revoked. RLS/RPCs using has_role and Edge Functions calling it with the user JWT inherit this guard. Owner-only policies and service-role endpoints require separate coverage review; this change does not claim universal MFA enforcement.

Applied and tested in the target Supabase project: rollback-only assertions for no-factor admin, verified-factor AAL1 denial, AAL2 authorization, nonadmin rejection and anonymous grants. A second rollback-only test using SET LOCAL ROLE authenticated confirmed attachments RLS returns zero rows at AAL1 and restores the baseline at AAL2. Synthetic factor metadata was rolled back; zero verified factors remain. No real enrollment was performed.

Frontend challenge precedes the role-denied message. AuthContext invalidates stale role results after session changes. SecurityAdmin uses native count and reports unavailable instead of silently claiming zero on errors.

TypeScript, production build and five mocked SDK tests pass. Remaining release verification: authenticated preview, user-completed authenticator enrollment, next-login challenge, account recovery procedure and unenrollment. Never auto-enroll user accounts. Keep the legacy table, backups and previous deployment for rollback. This remains a draft until end-to-end verification.
