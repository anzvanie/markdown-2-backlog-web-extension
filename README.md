# Markdown to Backlog Notation

Cross-browser Manifest V3 extension for Chrome, Firefox and Firefox-based Zen Browser. All conversion happens locally. No analytics, network requests or remote scripts.

## Features

- Paste Markdown; convert; copy result; approximate preview.
- Select text on a webpage and use **Right click → Convert selection to Backlog notation**; opens a standalone extension window, including in Zen.
- Toolbar popup: **Use page selection** (restricted on browser internal pages).
- Warnings when Markdown has no documented equivalent in Backlog notation.

## Build

Requirements: Python 3 and Node.js (for tests).

```bash
node tests/converter.test.js
python scripts/build.py
```

The resulting ZIPs are in `dist/`, with `manifest.json` at ZIP root.

## Install

**Chrome:** Unzip Chrome package; `chrome://extensions` → Developer mode → Load unpacked → select extracted folder.

**Firefox / Zen:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select Firefox ZIP or extracted `manifest.json`. Temporary installs are removed after restart. For persistent installation, submit to AMO and install the signed add-on.

## Store publishing

See [docs/PUBLISHING.md](docs/PUBLISHING.md). Before submitting, replace the example Firefox add-on ID in `platform/firefox/manifest.json` with an ID you own and retain it for updates. Each new store release needs an incremented version. Store ZIPs must have `manifest.json` at root.

## Known limitations

- The preview is an **approximation**, not Backlog's renderer.
- External Markdown images become clickable links: `#image(ID)` is only for Wiki attachments already uploaded to Backlog.
- Markdown H4–H6 are downgraded to H3 with warning.
- Inline code is retained as plain text with warning; no documented Backlog notation equivalent verified.
- Markdown horizontal rules are replaced with a visible plain-text separator with warning.
- Table column alignment is lost with warning. Nested Markdown formatting and complex tables may require manual review.
- Checklist only renders as interactive checklist in Backlog **Issue Description**, not Comments/Wiki.
- Verify that the destination Backlog project uses **Backlog notation**, not Markdown mode.

Official formatting reference: https://nulab.com/backlog/enterprise/help-guide/users-guide/rules-to-formatting-texts-backlog/
