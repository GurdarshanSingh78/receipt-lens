# 🧾 Receipt Lens

Smart receipt tracking for freelancers and small business owners. Snap a photo, let AI extract the data, export a clean CSV at tax time.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<!-- 
  Add a real screenshot or short GIF here once you have one.
  ![Receipt Lens dashboard](./docs/screenshot.png)
-->

## What it does

- 📸 Upload any receipt image — drag & drop or camera
- 🤖 AI extracts merchant, date, amount, and category automatically
- ✏️ Review and edit extracted data before saving
- 📊 One-click CSV export, formatted for TurboTax/accountants
- 🔐 Secure accounts via Clerk, data isolated per user in Supabase
- 📱 Responsive — works on phone, tablet, and desktop

## Tech Stack

| Layer         | Tool                          |
|---------------|--------------------------------|
| Framework     | Next.js 16 (App Router)        |
| Styling       | Tailwind CSS + shadcn/ui       |
| Auth          | Clerk                          |
| Database      | Supabase (PostgreSQL)          |
| File Storage  | Supabase Storage               |
| AI OCR        | Mistral Pixtral (vision model) |
| Hosting       | Vercel                         |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) project
- A [Mistral](https://console.mistral.ai) API key

### 1. Clone and install

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/receipt-lens.git
cd receipt-lens
npm install
\`\`\`

### 2. Set up Supabase

Create the `receipts` table:

\`\`\`sql
create table receipts (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  image_url text not null,
  merchant text,
  date text,
  amount decimal(10,2),
  category text default 'Uncategorized',
  created_at timestamp with time zone default now()
);

create index receipts_user_id_idx on receipts (user_id);

alter table receipts enable row level security;
\`\`\`

> ⚠️ **Important — Clerk + Supabase RLS**
> Supabase's `auth.uid()` only resolves when you're using **Supabase Auth**. Since this project uses **Clerk**, `auth.uid()` will always be `null` — a policy like `using (auth.uid()::text = user_id)` will silently deny everyone (or, if you're calling Supabase with the service role key, RLS is bypassed entirely and the policy does nothing either way). Pick one approach:
>
> **Option A — Simplest (recommended for solo projects):** Skip Supabase RLS. Keep the table `service_role`-only, do all reads/writes from Next.js **server actions or route handlers**, and manually filter every query by the Clerk `userId` from `auth()` server-side. Secure as long as no client code touches Supabase directly with the anon key.
>
> **Option B — True RLS with Clerk:** Set up Supabase's [third-party auth integration for Clerk](https://supabase.com/docs/guides/auth/third-party/clerk) so Supabase can verify Clerk's JWT natively:
> \`\`\`sql
> create policy "Users can only see their own receipts"
>   on receipts for all
>   using ((select auth.jwt()->>'sub') = user_id);
> \`\`\`
> The example code in this repo assumes **Option A** — every query is scoped server-side by Clerk's `userId`.

Create a **private** storage bucket named `receipts` (do NOT make it public):

\`\`\`sql
create policy "Service role full access"
  on storage.objects for all
  to service_role
  using (bucket_id = 'receipts');
\`\`\`

Serve images via short-lived **signed URLs** (`createSignedUrl`) generated server-side instead of public URLs — this keeps receipt photos private even if a URL leaks.

### 3. Environment variables

Create `.env.local` (never commit this — it's already in `.gitignore`):

\`\`\`bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never expose to the client

MISTRAL_API_KEY=your-mistral-key
\`\`\`

> Note: `SUPABASE_ANON_KEY` is intentionally omitted — under Option A, all Supabase calls happen server-side with the service role key, so the client never talks to Supabase directly.

### 4. Run locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Add all environment variables under **Project Settings → Environment Variables**, then redeploy.

## Project Structure

\`\`\`
receipt-lens/
├── app/
│   ├── (auth)/sign-in, sign-up      # Clerk auth pages
│   ├── dashboard/                    # Main receipt list + upload UI
│   └── api/
│       ├── receipts/                 # CRUD route handlers (server-scoped by Clerk userId)
│       └── extract/                  # Mistral Pixtral OCR endpoint
├── components/                       # shadcn/ui + custom components
├── lib/
│   ├── supabase.ts                   # Server-only Supabase client (service role)
│   └── mistral.ts                    # Mistral API wrapper
└── types/
\`\`\`

## Features

- **Drag & drop upload** — works on desktop and mobile, including direct camera capture
- **AI-powered extraction** — Mistral Pixtral reads even crumpled or low-light receipts
- **Edit before save** — review and correct any AI mistakes before committing
- **One-click CSV export** — formatted for tax software and accountants
- **Private by default** — signed URLs and server-scoped queries keep receipts isolated per user
- **Responsive design** — phone, tablet, and desktop

## Troubleshooting

| Issue | Likely cause |
|---|---|
| Receipts from one user visible to another | You're using the anon key client-side, or RLS is misconfigured — see callout above |
| Images fail to load after upload | Bucket is private (correct!) but you're using a public URL instead of a signed URL |
| Mistral extraction returns empty fields | Low-resolution image, or prompt needs tuning for your receipt format — check `lib/mistral.ts` |
| Clerk redirects to `/dashboard` before sign-up completes | Double-check `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` matches an existing route |

## Roadmap

- [ ] Monthly spending charts
- [ ] Bulk receipt upload
- [ ] Stripe billing (free tier: 50 receipts/mo, $8/mo unlimited)
- [ ] Email reminders ahead of tax season
- [ ] Read-only accountant sharing link

## Contributing

Issues and PRs are welcome. For larger changes, please open an issue first to discuss what you'd like to change.

## License

MIT — see [LICENSE](./LICENSE).
