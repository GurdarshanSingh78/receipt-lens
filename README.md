# Receipt Lens

Smart receipt tracking for freelancers and small business owners. Snap a photo, extract data with AI, export a clean CSV for tax time.

## What it does

- Upload any receipt image (drag & drop or camera)
- AI extracts merchant, date, amount, and category automatically
- Review and edit extracted data before saving
- Export all receipts to a CSV formatted for TurboTax/accountants
- Secure user accounts with Clerk auth
- All data stored in Supabase with row-level security

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| AI OCR | Mistral Pixtral (vision model) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Clerk account ([clerk.com](https://clerk.com))
- A Supabase project ([supabase.com](https://supabase.com))
- A Mistral API key ([console.mistral.ai](https://console.mistral.ai))

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/receipt-lens.git
cd receipt-lens
npm install
```

### 2. Set up Supabase

Create a `receipts` table with this SQL:

```sql
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

alter table receipts enable row level security;

create policy "Users can only see their own receipts"
  on receipts for all
  using (auth.uid()::text = user_id);
```

Create a public storage bucket named `receipts` and add these policies:

```sql
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow reads" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'receipts');
```

### 3. Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

MISTRAL_API_KEY=your-mistral-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## Features

- **Drag & drop upload** — Works on desktop and mobile
- **AI-powered extraction** — Mistral Pixtral reads crumpled receipts
- **Edit before save** — Review and correct any AI mistakes
- **One-click CSV export** — Formatted for tax software
- **Secure by default** — Users only see their own receipts
- **Responsive design** — Works on phone, tablet, desktop

## Roadmap

- [ ] Monthly spending charts
- [ ] Bulk receipt upload
- [ ] Stripe billing (free 50 receipts, $8/mo unlimited)
- [ ] Email reminders for tax season
- [ ] Accountant sharing link

## License

MIT
