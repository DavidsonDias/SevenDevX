# Dependency security audit — 2026-10-16

Baseline: production commit 58aae6373416d6cb7de6c6f39e8129112deebebe. Updates were prepared in a separate clean checkout using existing package.json ranges; package.json is semantically unchanged. No major-version migration, override, force update, lifecycle install script, business-code change or database mutation.

25 locked versions changed, including DOMPurify 3.4.3→3.4.17, React Router 6.30.1→6.30.6, @remix-run/router 1.23.0→1.23.4, ws 8.19.0→8.22.0, PostCSS 8.5.6→8.5.30, fflate, lodash, nanoid and targeted glob/parser dependencies. Two nested paths were added and two removed by resolution; total lock package paths remain901.

npm audit --omit=dev: baseline20 affected package entries (16 high/4 moderate), candidate9 (5 high/4 moderate), zero critical. Counts are advisory/dependency-graph results, not proof of exploitable production requests. Remaining: braces, chokidar, fast-glob, micromatch, postcss-nested, postcss-selector-parser, react-router, react-router-dom, tailwindcss. Reported complete fixes involve Tailwind4/Router7 and require separate compatibility/usage review. Full dependency audit also retains development/build alerts; this PR is not a zero-vulnerability certification.

The Router high-severity advisory explicitly excludes declarative BrowserRouter usage; do not claim a demonstrated exploit of this application. Current patches are preventive maintenance. References: https://github.com/remix-run/react-router/security/advisories/GHSA-2w69-qvjg-hvjx and https://github.com/cure53/DOMPurify/security/advisories/GHSA-hpcv-96wg-7vj8 .

Validation in a fresh checkout: npm ci --ignore-scripts,152 local regression tests, application TypeScript and production build passed. Dedicated PostgreSQL CI tests were not rerun locally. Existing Browserslist/Baseline and large-chunk warnings remain. Vercel preview must pass before merge.

Separate production asset scan before this release fetched all138 JS/CSS paths listed by the current service-worker precache manifest (9,620,305 bytes), zero failed downloads. No matches for the known old project ID, Lovable gateways, selected private-key/token prefixes, private-key PEM markers or service_role JWTs. This is a bounded pattern scan, not proof about all secret formats, historical/unlisted files, source maps or server-side secrets. Local source scan387 files retained only the deferred gsc-insights Lovable connector and portfolio-content defensive old-ID rejection. Preserve backups and rollback.
