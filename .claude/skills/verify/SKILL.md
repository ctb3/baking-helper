---
name: verify
description: Build, launch, and drive the Dough Divider app to verify changes end-to-end.
---

# Verify baking-helper

Single-page Next.js app at `/` (pages/index.tsx). No tests, no backend.

## Launch

```bash
npm run dev   # ready in ~15-20s on WSL /mnt/c; serves http://localhost:3000
```

## Drive (headless)

No system Chromium and no sudo on this machine. Working recipe:

```bash
cd <scratchpad> && npm i playwright && npx playwright install chromium
# chromium needs libnspr4/libnss3 which can't be apt-installed without sudo;
# extract them locally instead:
mkdir libs && cd libs && apt-get download libnspr4 libnss3 libasound2t64
for d in *.deb; do dpkg -x "$d" extracted/; done
# then run scripts with:
LD_LIBRARY_PATH=$PWD/libs/extracted/usr/lib/x86_64-linux-gnu node script.mjs
```

Use viewport 390x844 (phone) — that is the target device.

## Flows worth driving

- Happy path: weight 1000, pieces 8 → readings 875g … 0g (descending by weight/pieces, 0.1g rounding).
- Validation: weight 0 → inline red error (native `min` attributes swallow negative/zero-pieces before JS).
- Wake lock: headless denies `navigator.wakeLock.request` with NotAllowedError unless you
  `context.grantPermissions(["screen-wake-lock"], { origin: "http://localhost:3000" })`.
  Granted → button reads "Screen staying awake — tap to disable"; denied → falls back to "Keep screen awake".
- Reset button clears inputs + readings.
