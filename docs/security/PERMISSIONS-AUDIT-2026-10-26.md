# SevenOS — Operational permission audit

Date: 2026-10-26. Scope: the SevenDevX production project and its checked-in frontend/backend, not other repositories or provider accounts.

## Findings and corrections

The restored database contained intentional service-only boundaries and several missing grants for existing browser operations. A table missing INSERT/UPDATE/DELETE is not automatically defective: callers, column privileges and RLS were reviewed before each grant.

Restored operations under existing administrative RLS:

- Attachment metadata removal, following the separately restored INSERT permission.
- Automation creation/edit/removal and run-history insertion.
- Manual currency-rate insertion and site-page version insertion.
- Citation monitor reading/configuration and manual citation lifecycle.
- WhatsApp inbox/history reads and `unread_count` updates only.
- Webhook operational columns, configured-field insertion, active-state updates and removal. Signing keys and custom headers remain unavailable to the browser.
- DLQ `replayed_at` updates and removal; no replay was dispatched during this audit.
- Backup-history removal for the existing confirmed admin action. No backup was removed during this work; backup creation and restoration remain server operations.
- Guarded role-management RPC execution. Direct writes to `user_roles` remain denied; the last-effective-admin trigger and native MFA guard were preserved.

Owner-only push subscription grants now support registration, refresh and unsubscribe. Signed-in public visitors can read the same published projects as anonymous visitors, without gaining draft access. Existing referral intake is append-only with column-scoped INSERT; visitors cannot read or modify referral history.

The public diagnostic previously attempted an unavailable email-lookup RPC and INSERT RETURNING on private CRM rows. A bounded, consent-validated atomic intake now stores the contact/diagnostic and returns only a boolean. It does not expose contact IDs or allow visitors to enumerate CRM data. Duplicate intake is throttled per email; this is not a substitute for global anti-abuse controls.

## Preserved boundaries

No RLS was disabled; no blanket grants were used. OAuth tokens, legacy MFA secrets, audit writes, quotas, scheduler dispatch, internal schemas and provider credentials remain server-only. Public bucket settings were not changed. Existing data, keys, user sessions and backups were preserved. The browser webhook debugger describes server-side signing instead of loading a signing key.

## Evidence

- The database inventory found RLS enabled on every public base table. Service-role reads were available across those tables.
- Database role tests inserted/updated/read/deleted synthetic operational records inside a transaction, then rolled everything back. They cover admin operations, owner-only push, refusal of role elevation, private webhook columns, signed-in published/draft isolation and public diagnostic validation.
- No synthetic users or contacts remained after rollback. Tests did not send messages, dispatch webhooks, invoke paid AI or remove Storage files.
- 47 deployed Edge Functions were ACTIVE. Three local legacy MFA functions are intentionally absent following migration to native MFA. 27 unauthenticated requests to administrative handlers were rejected with 401; this is an authentication-boundary test, not functional verification of every function. Backup/restore handlers were inventoried without exercising their operations.
- Public Storage-object access remains governed by the existing bucket-specific policies. No real upload/removal or backup restoration was performed as part of these database tests.
- Frontend source tests guard explicit webhook columns, server-side signing and atomic public intake. Typecheck, production build and the eligible local regression suite were run.

The detailed, private evidence and pre-change ACL snapshot are stored locally under `evidence/permissions-2026-10-26/` and are not committed. SQL rollback fixtures are committed for reproducibility. Migration filenames match the versions applied by Supabase.

## Limits

This closes the confirmed permission mismatches above. It does not certify every business scenario, physical mobile/PWA behavior, external-provider entitlement, delivery of notifications or successful paid generation. Existing provider authorization and credit requirements remain applicable. An operator should validate a representative real file upload and ordinary daily workflows.
