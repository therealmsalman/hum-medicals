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

The `/publish` area provides free manuscript submission for signed-in authors. On Vercel, connect Upstash Redis in the Marketplace so the integration adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`; author accounts and manuscript records are then stored persistently and shown in the author workspace. There are no payment steps or submission charges.

## Professional URL and Vercel launch

The app is prepared for `https://www.hummedicals.com`. In Vercel, import the repository, add `NEXT_PUBLIC_SITE_URL=https://www.hummedicals.com` under Production environment variables, then add `hummedicals.com` and `www.hummedicals.com` in **Project ? Settings ? Domains**. Set `www.hummedicals.com` as the primary domain and follow Vercel�s displayed DNS records at your registrar. Vercel will provision HTTPS automatically after DNS verifies.

## Authentication

Sign-up and sign-in use scrypt password hashes and HTTP-only signed session cookies. Accounts and submissions use local JSON files for development, then Upstash Redis when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are available on Vercel. Set a long, unique `AUTH_SECRET` environment variable for production.

## ECG case library

The ECG library at `/ecg` includes 100 structured educational cases. Source data and case-generation templates live in `lib/ecg.ts`; each case is statically rendered with a dedicated URL, medical-learning disclaimer, differential, interpretation sequence, and references.

## AI article generator

`/ai-tools` provides a Gemini-powered educational article generator with Copy and editable Word export actions. Set `GEMINI_API_KEY` only in `.env.local` for local development or Vercel environment variables for deployment; do not commit it. Review every generated medical statement against primary guidelines and source material before publishing.
