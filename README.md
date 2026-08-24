<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ecbfd68f-86a0-4628-8391-42f7a7eafe54

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

Pushes to `main` deploy the static Angular application automatically via
`.github/workflows/deploy-pages.yml`. Enable **Settings > Pages > Source >
GitHub Actions** once in the repository settings.

The application stores its data in the browser's local storage and does not
require a server-side API. The generated SSR server is therefore not used by
the GitHub Pages deployment.
