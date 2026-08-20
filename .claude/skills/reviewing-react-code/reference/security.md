# Front-end security review

## Contents

- Injection and unsafe HTML
- URLs and navigation
- Secrets and configuration
- Tokens, storage and auth state
- Cross-origin communication
- Dependencies
- Client-side trust boundaries
- Data exposure and logging
- Upload and file handling

Scope: what the browser bundle can be made to do. Anything server-side (authorisation, rate
limiting, validation of record) is a backend finding — note it, but do not accept "the client
checks it" as the control.

## Injection and unsafe HTML

- **`dangerouslySetInnerHTML`** with any value that is not a compile-time constant → XSS unless
  sanitised with a real sanitiser (DOMPurify or equivalent) on the way in. Markdown, rich-text
  editor output, a CMS field and a translation string all count as untrusted.
  `[blocking]` when the source is user or third-party content.
- Sanitising with a regex or a `replace` chain → always bypassable.
- Sanitising on write only, while another path writes the same field.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` on a ref.
- `eval`, `new Function`, `setTimeout('string')`, dynamic `import(userValue)`.
- User content injected into a `<style>` block or a CSS custom property that reaches
  `url()`/`background-image`.
- SVG uploaded or fetched then inlined → SVG carries `<script>` and event handlers.
- `<script>` content built from data, JSON embedded in HTML without escaping `</script>`.
- A React key/text interpolation is escaped by default — do not report plain `{value}` as XSS.

## URLs and navigation

- An `href`/`src` from data with no scheme check → `javascript:`, `data:text/html` and `vbscript:`
  execute. Allowlist `https:` (and `mailto:`/`tel:` when intended).
- `target="_blank"` without `rel="noopener noreferrer"` → reverse tabnabbing (modern browsers imply
  `noopener`, but the referrer still leaks).
- A redirect target taken from a query parameter and not validated against an allowlist → open
  redirect.
- `window.location = userValue`, `router.push(userValue)` with an absolute URL from data.
- Sensitive values placed in the URL (token, email, id in a shareable link) → leaks via referrer,
  history, logs, analytics.
- An iframe of third-party content without `sandbox` and an explicit `allow`.
- User-controlled `postMessage` target origin set to `'*'`.

## Secrets and configuration

- A key, token, password or private URL committed in source, in a test fixture, or in a snapshot.
- A secret behind a client-exposed env prefix (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`) → it is in
  the bundle and readable by anyone. Only publishable keys belong there.
- A server-only module imported from a client component → the bundler may inline its constants.
- Hardcoded internal hostnames, S3 buckets, staging credentials.
- A `.env` file, a `*.pem`, or a service-account JSON added to the diff.
- Source maps for production shipped publicly when the code is not meant to be readable.

Anything of this kind that is already committed: report it as `[blocking]`, and note that
rotation is required — removing the line does not undo the exposure.

## Tokens, storage and auth state

- A long-lived token in `localStorage`/`sessionStorage` → readable by any XSS. Prefer an
  `HttpOnly` cookie; if storage is a deliberate decision, it must be justified in the code.
- A token, PII or a full user object cached in `localStorage` with no expiry and no clearing on
  logout.
- Auth state in a global that is not cleared on logout, or a query cache not reset → the next user
  on a shared machine sees the previous one's data.
- Client-side route guards presented as the security control → they only hide UI; the data request
  must be authorised server-side.
- Permission flags computed in the client from a token payload that the client also decodes without
  signature verification.
- A refresh flow that retries indefinitely on 401 → request loop.

## Cross-origin communication

- `window.addEventListener('message')` without checking `event.origin` **and** the message shape →
  any framing page can drive the handler.
- `postMessage(data, '*')`.
- CORS with `Access-Control-Allow-Origin: *` combined with credentials (backend, but often
  introduced by a front-end request change).
- A `fetch` with `credentials: 'include'` to a third-party host.
- Missing CSRF token on a state-changing request when the backend uses cookie auth.
- A CSP relaxed in the diff (`unsafe-inline`, `unsafe-eval`, a wildcard host) → ask what needed it;
  inline styles from a CSS-in-JS library have a nonce-based answer.
- No `X-Frame-Options`/`frame-ancestors` for an app that must not be framed (clickjacking).

## Dependencies

Per the organisation's rules, a new third-party dependency must be assessed **before** it is
adopted, not after.

- New dependency in the diff → check that it is the real, maintained package (typosquatting on a
  one-character difference is the common attack), that the version is pinned by the lockfile, and
  that it has no install-time script fetching remote code.
- A dependency whose scope far exceeds the need (a whole framework for one helper).
- Lockfile changed without `package.json` changing, or a resolution/override added silently → say
  what it pulls in.
- `postinstall`/`prepare` scripts added.
- A GitHub Action pinned to a mutable tag instead of a commit SHA, or a new action from an
  unknown publisher — supply-chain surface in CI.
- Known-vulnerable version: run the project's audit command if one exists and quote it.

If a library shows credential-reading, network exfiltration, or obfuscated code, do not adopt it:
report the finding and propose an alternative.

## Client-side trust boundaries

- Validation implemented only in the client (price, quantity, role, id) → the request can be
  replayed by hand. The client check is UX; the server check is the control.
- A hidden or disabled field trusted as immutable.
- Business logic that must not be public shipped in the bundle (pricing rules, feature gating for
  paid plans, internal endpoints).
- Feature flags exposing unreleased data in the client payload rather than gating server-side.
- IDs enumerable from the client with no server authorisation.

## Data exposure and logging

- `console.log` of a token, a full user object, request headers, or PII → ends up in browser logs
  and in error-reporting breadcrumbs.
- An error reporter (Sentry and friends) receiving a request body or a URL with a token, with no
  scrubbing.
- Analytics events carrying PII or free-text user input.
- A verbose server error surfaced verbatim in the UI (stack traces, SQL, internal hostnames).
- Debug panels, mock toggles or seeded fixtures reachable in production.
- Autocomplete not disabled on a genuinely sensitive field; a password field without
  `type="password"`.

## Upload and file handling

- Client-side type/size check only, or type inferred from the extension.
- A blob/object URL created and never revoked.
- A user-provided filename used to build a path or a download name without sanitising `../` and
  control characters.
- A downloaded file's content type/`Content-Disposition` allowing inline rendering of HTML from a
  user upload on the app's own origin.
