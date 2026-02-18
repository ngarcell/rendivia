import CodeBlock from "@/components/CodeBlock";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import { SiteFooter } from "@/components/SiteFooter";

const REQUEST_EXAMPLE = `POST /api/v1/render
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
  "webhook": {
    "url": "https://example.com/webhook",
    "secret": "your-signing-secret"
  }
}`;

const CURL_EXAMPLE = `curl -X POST https://api.rendivia.com/api/v1/render \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "template": "weekly-summary-v1",
    "data": {
      "title": "Weekly Summary",
      "metrics": [
        { "label": "Revenue", "value": 12450 },
        { "label": "Users", "value": 342 }
      ]
    },
    "brand": "acme"
  }'`;

const NODE_EXAMPLE = `const res = await fetch("https://api.rendivia.com/api/v1/render", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.RENDIVIA_API_KEY,
  },
  body: JSON.stringify({
    template: "weekly-summary-v1",
    data: {
      title: "Weekly Summary",
      metrics: [
        { label: "Revenue", value: 12450 },
        { label: "Users", value: 342 },
      ],
    },
    brand: "acme",
  }),
});

const job = await res.json();
console.log(job);`;

const TEMPLATE_LIST_EXAMPLE = `GET /api/v1/templates
{
  "templates": [
    {
      "id": "weekly-summary-v1",
      "version": 1,
      "compositionId": "DataReportVideo",
      "fields": [
        { "key": "title", "type": "string", "required": true },
        { "key": "metrics", "type": "array", "required": true }
      ]
    }
  ]
}`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Docs", href: "/docs" },
        ]}
      />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Docs
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Rendivia is a developer-first API for deterministic, branded video generation from structured data.
        </p>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Quickstart</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-600">
              <li>Create an API key in the dashboard.</li>
              <li>POST JSON to the render endpoint.</li>
              <li>Receive a webhook with the MP4 URL.</li>
            </ol>
          </div>
          <CodeBlock title="Example request" code={REQUEST_EXAMPLE} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <CodeBlock title="cURL example" code={CURL_EXAMPLE} />
          <CodeBlock title="Node.js example" code={NODE_EXAMPLE} />
        </section>

        <section id="api-reference" className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">API reference</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            <p><span className="font-semibold text-zinc-900">POST /api/v1/render</span> - queue a render job.</p>
            <p><span className="font-semibold text-zinc-900">GET /api/v1/render/:jobId</span> - fetch render status and output URL.</p>
            <p><span className="font-semibold text-zinc-900">GET /api/v1/templates</span> - list available templates.</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Templates response</h2>
            <p className="mt-3 text-sm text-zinc-600">
              Fetch template definitions to see supported fields and versions. The response includes
              metadata to validate payloads client-side.
            </p>
          </div>
          <CodeBlock title="Example response" code={TEMPLATE_LIST_EXAMPLE} />
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Authentication</h2>
            <p className="mt-3 text-sm text-zinc-600">
              Send your API key as <code className="rounded bg-zinc-100 px-1">X-API-Key</code> or
              <code className="rounded bg-zinc-100 px-1 ml-1">Authorization: Bearer</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Webhooks</h2>
            <p className="mt-3 text-sm text-zinc-600">
              Provide a webhook URL to receive completion payloads. Signatures are sent in
              <code className="rounded bg-zinc-100 px-1 ml-1">x-rendivia-signature</code>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
