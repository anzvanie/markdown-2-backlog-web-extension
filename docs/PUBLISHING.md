# GitHub & store publishing guide

## Recommended repository

Use one repository (`markdown-to-backlog-extension`) with shared `src/`, two manifests under `platform/`, `tests/`, `scripts/`, `docs/`, and generated `dist/` (gitignored). Keep `main` protected; use `feature/*` branches and Pull Requests; tag each release (`v0.0.1`).

## First push

```bash
git init
git add .
git commit -m "feat: cross-browser Markdown to Backlog converter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/markdown-to-backlog-extension.git
git push -u origin main
```

Create the empty GitHub repository before adding the remote. Never commit API tokens, passwords, private keys or signing credentials. Add a LICENSE only after choosing the license and confirming rights to all assets.

## Release workflow

1. Make changes in a branch; open PR; review and merge to `main`.
2. Run `node tests/converter.test.js` and `python scripts/build.py`.
3. Manually test both packages in Chrome, Firefox and Zen, including right-click selection, conversion, copy, and preview.
4. Increment `version` in **both** manifests before building; `scripts/build.py` reads each manifest version to name the ZIP automatically.
5. Commit, tag and push: `git tag v0.0.1 && git push origin v0.0.1`.
6. Create a GitHub Release and attach both ZIPs from `dist/`.
7. Upload Chrome ZIP to Chrome Web Store Developer Dashboard and Firefox ZIP to addons.mozilla.org Developer Hub. Both stores review packages separately.

## Chrome Web Store

- Register a developer account (one-time registration fee).
- Upload Chrome ZIP, fill Store Listing, Privacy and Distribution, and submit for review.
- Explain single purpose and permission use: `contextMenus` for selection menu, `storage` for draft/pending selection, `activeTab` + `scripting` for the toolbar selection action, `clipboardWrite` for copying.
- Prepare screenshots, icon, support contact, privacy statement and test instructions.

Official: https://developer.chrome.com/docs/webstore/register and https://developer.chrome.com/docs/webstore/publish

## Firefox Add-ons / Zen

- Register/sign in to AMO Developer Hub, submit Firefox ZIP for signing/review. Choose listing on AMO for discoverability.
- Set a stable, unique `browser_specific_settings.gecko.id` before first publication; do not change it for updates.
- Install the signed version for persistence. Zen compatibility should be verified independently; it is not guaranteed by Firefox acceptance.

Official: https://extensionworkshop.com/documentation/publish/submitting-an-add-on/

## Prepublication checklist

- Confirm functionality manually in each browser (automated tests do not cover browser APIs).
- Confirm Backlog project actually uses Backlog notation; test representative issue/wiki content.
- Check privacy declarations match actual behavior; no remote code or telemetry in this release.
- Ensure version is greater than previously published version.
- Ensure ZIP root contains `manifest.json` and store listing assets meet requirements.
- Consider automated GitHub Actions CI for tests/build; do not auto-publish before browser acceptance testing.
