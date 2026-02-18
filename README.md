# Rendivia

Programmatic video generation API for SaaS products. Send structured JSON, receive deterministic branded MP4 video. **Starter → Pro → Team → Enterprise.** Built with Remotion, Next.js, Clerk, and Supabase.

## Product tiers

| Tier        | Videos/mo | API  | Trim | Brand URL | Data→Video | API keys | SSO | Support |
|------------|-----------|------|------|-----------|------------|----------|-----|--------|
| **Starter** | 10        | —    | —    | —         | —          | —        | —   | —       |
| **Pro**     | 100       | 500  | ✓    | ✓         | ✓          | ✓        | —   | —       |
| **Team**    | 500       | 5k   | ✓    | ✓         | ✓          | ✓        | ✓   | —       |
| **Enterprise** | ∞     | ∞    | ✓    | ✓         | ✓          | ✓        | ✓   | Dedicated, SLA |

- **Starter**: Captions only, one brand preset, 5 min max/video.
- **Pro**: Trim silence, audio enhancement, brand-from-URL, data-to-video, API access, 15 min/video.
- **Team**: SSO, 5 seats, 30 min/video.
- **Enterprise**: Unlimited, SSO, dedicated support, SLA, custom branding. Contact sales.

## Stack

- **Next.js** (App Router), **Clerk** (auth), **Supabase** (storage + DB), **Remotion** (caption + data-viz render), **OpenAI** (Whisper).

## Setup

1. `npm install`
2. Env in `.env.local`:
   - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - OpenAI: `OPENAI_API_KEY`
   - Remotion Lambda:
     - `REMOTION_AWS_REGION` (default `us-east-1`)
     - `REMOTION_LAMBDA_FUNCTION_NAME`
     - `REMOTION_SERVE_URL`
     - `REMOTION_RENDER_QUEUE_URL`
     - `REMOTION_WEBHOOK_URL` (optional)
     - `REMOTION_WEBHOOK_SECRET` (optional)
3. Run migrations in `supabase/migrations/` (caption_jobs, plans, subscriptions, usage, api_keys, teams).
4. Create Storage bucket `uploads` (public or RLS).
5. `npm run dev`

## Database

Run SQL in order:

- `supabase/migrations/20250203000000_caption_jobs.sql`
- `supabase/migrations/20250203100000_plans_usage_api_keys.sql`
- `supabase/migrations/20260204000000_caption_editor_lambda.sql`

To give a user Pro for testing:

```sql
insert into subscriptions (user_id, plan_id, status)
values ('user_xxx', 'pro', 'active');
```

## API

### Programmatic render API (recommended)

- **Render**: `POST /api/v1/render` (API key required)
- **Status**: `GET /api/v1/render/:jobId`
- **Templates**: `GET /api/v1/templates`

Example:

```json
{
  "template": "weekly-summary-v1",
  "data": {
    "title": "Weekly Summary",
    "metrics": [
      { "label": "Revenue", "value": 12450 },
      { "label": "Users", "value": 342 }
    ]
  },
  "brand": "acme",
  "webhook": { "url": "https://example.com/webhook", "secret": "..." }
}
```

### Legacy caption API (still supported)

- **Web**: `POST /api/caption` (Clerk session), formData: `video`, optional `trimSilence`, `brandUrl`.
- **Public API (Pro+)**: `POST /api/v1/caption`, header `X-API-Key: rnd_...` or `Authorization: Bearer rnd_...`, same formData. Create keys in Dashboard → API keys.
- **Brand-from-URL (Pro+)**: `GET /api/brand-from-url?url=https://yoursite.com`

## PSEO / marketing

- **Pricing**: `/pricing` (Starter–Enterprise).
- **Enterprise**: `/enterprise` (contact sales).
- **Tools**: `/tools` (hub); `/tools/[slug]` (e.g. `youtube-shorts-captions`, `tiktok-captions`, `spanish-subtitles`, `trim-silence-captions`). Each page targets a long-tail keyword.

## Scripts

- `npm run dev` – Next.js dev
- `npm run build` – Next.js build
- `npm run video:render` – Remotion CLI render (Root.tsx)

## Render (caption MP4)

Remotion render runs in Node (not Vercel serverless). Use Remotion Lambda or a worker for production. Locally: Dashboard → Upload → Transcribe → Render captioned video.

## Remotion Lambda worker

Start the SQS render worker:

```bash
npm run remotion:worker
```
