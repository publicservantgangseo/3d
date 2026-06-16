# Vercel Deployment

## Build

Use the default Vercel Next.js settings.

- Install command: `npm install`
- Build command: `npm run build`
- Output: Next.js default

## Data

The deployed staff viewer reads scene JSON from `public/data/scenes/page-XX.json`.

The admin review mode can import and export JSON in the browser. It does not write directly to Vercel or the repository. After review:

1. Download the reviewed `page-XX.json`.
2. Replace the matching files in `src/data/scenes` and `public/data/scenes`.
3. Run `npm run verify`.
4. Commit and redeploy.

## Verification Before Deploy

Run:

```powershell
npm run verify
```

Expected:

- Vitest passes.
- `validate:scenes` prints `Validated 18 scene files`.
- Next.js build passes.
