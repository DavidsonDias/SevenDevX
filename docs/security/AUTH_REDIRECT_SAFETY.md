# Post-authentication redirect guard

The public /auth page previously passed the untrusted redirect query parameter directly to navigate in three success paths: existing authenticated session, password login and signup with session. Router6 remains subject to GHSA-wrjc-x8rr-h8h6, including external navigation through ambiguous backslash paths.

All three destinations now pass through safeAuthRedirect. It accepts only root-relative internal paths, rejects protocol-relative paths, backslashes, controls, malformed encoding, excessive length and excessive nested encoding. Decoding is bounded to five validation passes; the original safe path/query/hash is returned so normal escaped internal destinations are preserved. Invalid destinations fall back to /. No session, MFA, credential or role behavior changes.

Tests cover valid internal paths, query/hash, accents/spaces, external schemes, protocol-relative URLs, raw/encoded backslashes, nested encodings, controls, malformed input and generated separator variants. This is an application-level mitigation for these three sinks; it does not remove package advisories or prove every link/navigation in the app safe.

The separate SSR hydration constructor advisory explicitly excludes declarative mode. Source uses BrowserRouter in src/app/Router.tsx. Build dependency parser/glob warnings also remain; do not silently accept them as harmless or perform a Tailwind4/Router7 migration only to clear npm output.

Primary references:
- https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6
- https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg
