# Native MFA migration — staged, not production-ready

Replace legacy public.user_mfa/Edge enroll/verify/disable with Supabase Auth TOTP. Enrollment QR is a local data URI, never sent to a third-party QR service. Invalid OTP and AAL1 unenrollment are rejected. Native MFA does not provide legacy backup codes.

Validated: TypeScript, production build, five mocked SDK behavior tests. These are not end-to-end MFA tests.

Release blockers: implement and verify opt-in AAL2 enforcement in RLS/RPCs and privileged Edge Functions; ensure MFA challenge renders before a role denial when has_role becomes AAL-aware; repair global MFA count in SecurityAdmin; test enroll, next-login challenge, recovery and unenroll in preview. Do not merge or promote before these checks. Do not auto-enroll current users or remove backups/legacy table.
