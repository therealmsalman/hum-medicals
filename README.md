# Hum Medicals

Evidence-based cardiology and clinical education built with Next.js 14, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content

Sample MDX files live in `content/papers` and `content/articles`. Each has frontmatter for title, author, date, topic, type, tags, and abstract. The current content adapter in `lib/content.ts` provides local structured content; swap it for MDX parsing (or a CMS adapter) without changing page components.

## Newsletter

`app/api/subscribe/route.ts` validates the UI request and is intentionally ready for a Mailchimp or ConvertKit call. Add credentials as Vercel environment variables; never expose them to the client.

## Deploy to Vercel

Push this folder to a Git repository, import it in Vercel, and use the detected Next.js configuration. Set the production site URL in `app/layout.tsx`, `app/robots.ts`, and `app/sitemap.ts`.

## Publishing portal

The `/publish` area provides a browser-local preview author workspace, paid submission plans, and a manuscript submission flow. For production, replace local workspace storage with a secure provider (for example, Auth.js, Clerk, or Supabase), persist submissions to a database/object store, and set `PAYMENT_CHECKOUT_URL` to a server-created hosted checkout URL from your chosen payment provider. Do not expose payment secrets or accept payments only through client-side code.

## Professional URL and Vercel launch

The app is prepared for `https://www.hummedicals.com`. In Vercel, import the repository, add `NEXT_PUBLIC_SITE_URL=https://www.hummedicals.com` under Production environment variables, then add `hummedicals.com` and `www.hummedicals.com` in **Project ? Settings ? Domains**. Set `www.hummedicals.com` as the primary domain and follow Vercel�s displayed DNS records at your registrar. Vercel will provision HTTPS automatically after DNS verifies.

## Authentication

Local sign-up and sign-in use scrypt password hashes and HTTP-only signed session cookies. Accounts are stored in `data/users.json` for local development. Before deploying to Vercel, replace this file store with a managed database/auth provider and set a long, unique `AUTH_SECRET` environment variable. Do not deploy the local JSON user store for public production use.

## ECG case library

The ECG library at `/ecg` includes 100 structured educational cases. Source data and case-generation templates live in `lib/ecg.ts`; each case is statically rendered with a dedicated URL, medical-learning disclaimer, differential, interpretation sequence, and references.

## AI article generator and Google-grounded finder

`/ai-tools` provides a Gemini-powered educational article generator and a Google Search-grounded research finder. Set `GEMINI_API_KEY` only in `.env.local` for local development or Vercel environment variables for deployment; do not commit it. The server-side route at `app/api/ai/generate/route.ts` sends requests to Gemini and returns grounding source links for finder results. Review every generated medical statement against primary guidelines and source material before publishing.
