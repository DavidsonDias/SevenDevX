# Remote session revocation — migration audit

Production admin_revoke_session only updates public.admin_sessions.revoked_at. The browser has no enforcement consumer of that marker. Neither that RPC nor direct marker updates establish logout in Supabase Auth.

The three administrative screens now disable the four unsupported remote logout controls and explain the limitation. Handlers also fail closed without writes if invoked programmatically. This is a reversible safety correction, not implementation of native revocation. Existing audit/session records, Auth configuration and sessions are preserved.

Before enabling these controls, implement and validate server-authorized native revocation with exact target/session ownership, current admin/MFA checks and truthful partial/unknown outcomes. Validate with disposable isolated users, including refresh failure and sensitive database access. An already issued JWT can remain cryptographically valid until expiry; do not claim universal immediate invalidation. Never use privileged direct Auth schema mutations as a shortcut.

Owner login, password reset, MFA, last-admin protection and unrelated workflows remain unchanged. No real sessions were terminated in this correction.
