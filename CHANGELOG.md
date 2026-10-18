# Changelog

Notable changes to OMNITRACE are documented here.

## 0.5.1 - Matrix intro reliability and Analyst Lab

- Matrix startup intro now plays on every fresh page load and remains skippable.
- Removed stale localStorage and reduced-motion checks that could silently hide the intro.
- Saved “disable extra animations” preference no longer auto-skips the intro.
- Updated asset cache-busting and version labels to 0.5.1.
- Added a dedicated Analyst Lab with ten browser-local utilities: IOC extraction, defang/refang, Base64, URL component codec, SHA-256 text digest, Unix timestamp conversion, IPv4 CIDR calculation, source assessment checklist, relationship mapper, and quick report builder.
- Added user preferences for accent color, compact layout, and reduced motion. Preferences persist in the current browser.
- Expanded bilingual navigation and cache-busted frontend assets.
- Existing identity, IP/RDAP, DNS, passive Certificate Transparency subdomain discovery, email-domain, URL, hash, bulk IOC, and investigation-case workflows remain available.
- Added a detailed README with an illustrative interface preview, module guide, setup steps, API examples, architecture diagram, and responsible-use notes.
- Analyst utilities are assistive: outputs are not automatically verified facts.

## 0.4.1 - Reliability and packaging

- Fixed the Matrix startup intro replay behavior after upgrading from earlier builds.
- Added cache-busting asset versions so browsers pick up the current intro and theme.
- Corrected visible version labels and API health version.
- Added a single top-level `OMNITRACE/` folder to the release archive to avoid scattering files when extracting.
- Added `run.sh` and `test.sh` for repeatable local startup and verification.
- Isolated test data in a temporary SQLite database and expanded API validation/provider-mocking tests.
- Reject empty platform selections in the identity API instead of silently searching every platform.

## 0.4.0 - Matrix theme and passive intelligence

- Added passive public-IP RDAP enrichment and Certificate Transparency subdomain discovery.
- Added the Matrix-inspired black and acid-green theme with a startup terminal sequence.
