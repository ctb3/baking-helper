# Baking Helper

A small web app for dividing dough into equal pieces.

## Dough Divider

Enter the total dough weight (grams) and how many pieces you want. The app lists a countdown of **scale readings**: put the whole dough on the scale, pull off dough until the scale shows the next reading, and repeat — each piece you remove ends up the same weight, with no re-weighing or mental math.

Once readings are shown, the app keeps your phone screen awake (where the browser supports it) so the display doesn't time out mid-bake. Use **Reset** to start over.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Deployment

Hosted with AWS Amplify Hosting; the build is configured in `amplify.yml`. Any push to `main` deploys.

## Stack

- [Next.js](https://nextjs.org/) (Pages Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
