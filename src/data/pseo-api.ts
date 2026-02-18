export type Industry = {
  slug: string;
  name: string;
  description: string;
  metrics: Array<{ label: string; value: number; color?: string }>;
};

export type UseCase = {
  slug: string;
  name: string;
  summary: string;
  inputLabel: string;
};

export type TriggerEvent = {
  slug: string;
  name: string;
  summary: string;
};

export type DataSource = {
  slug: string;
  name: string;
  summary: string;
};

export type Alternative = {
  slug: string;
  name: string;
  summary: string;
  replacedWorkflow: string;
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "saas",
    name: "SaaS",
    description: "Ship weekly KPI videos from product and revenue metrics.",
    metrics: [
      { label: "MRR", value: 12450, color: "#22c55e" },
      { label: "Active users", value: 3420, color: "#3b82f6" },
      { label: "Churn", value: 3.1, color: "#f59e0b" },
    ],
  },
  {
    slug: "fintech",
    name: "Fintech",
    description: "Turn portfolio and transaction data into automated reports.",
    metrics: [
      { label: "AUM", value: 48.2, color: "#22c55e" },
      { label: "Trades", value: 1280, color: "#3b82f6" },
      { label: "Net inflow", value: 6.4, color: "#a855f7" },
    ],
  },
  {
    slug: "proptech",
    name: "PropTech",
    description: "Generate listing and market updates from your property data.",
    metrics: [
      { label: "Listings", value: 214, color: "#22c55e" },
      { label: "Avg days", value: 18, color: "#3b82f6" },
      { label: "Leads", value: 1320, color: "#a855f7" },
    ],
  },
  {
    slug: "healthtech",
    name: "HealthTech",
    description: "Automate patient and outcomes updates at scale.",
    metrics: [
      { label: "Patients", value: 840, color: "#22c55e" },
      { label: "Appointments", value: 1620, color: "#3b82f6" },
      { label: "Satisfaction", value: 94, color: "#f59e0b" },
    ],
  },
  {
    slug: "edtech",
    name: "EdTech",
    description: "Turn learner progress data into shareable video summaries.",
    metrics: [
      { label: "Learners", value: 4520, color: "#22c55e" },
      { label: "Completed", value: 1280, color: "#3b82f6" },
      { label: "Completion %", value: 78, color: "#a855f7" },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Automate campaign performance videos for stakeholders.",
    metrics: [
      { label: "Campaigns", value: 42, color: "#22c55e" },
      { label: "CTR", value: 3.8, color: "#3b82f6" },
      { label: "Leads", value: 620, color: "#f59e0b" },
    ],
  },
  {
    slug: "compliance",
    name: "Compliance",
    description: "Generate audit report videos after each review cycle.",
    metrics: [
      { label: "Audits", value: 18, color: "#22c55e" },
      { label: "Findings", value: 4, color: "#ef4444" },
      { label: "Resolved", value: 12, color: "#3b82f6" },
    ],
  },
  {
    slug: "analytics",
    name: "Analytics",
    description: "Convert dashboards into concise video updates.",
    metrics: [
      { label: "Dashboards", value: 96, color: "#22c55e" },
      { label: "Queries", value: 12800, color: "#3b82f6" },
      { label: "Time saved", value: 320, color: "#a855f7" },
    ],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    description: "Ship automated sales recaps from order data.",
    metrics: [
      { label: "Revenue", value: 89200, color: "#22c55e" },
      { label: "Orders", value: 2140, color: "#3b82f6" },
      { label: "AOV", value: 41.7, color: "#a855f7" },
    ],
  },
  {
    slug: "hr",
    name: "HR",
    description: "Automate hiring and onboarding updates from HRIS data.",
    metrics: [
      { label: "Hires", value: 38, color: "#22c55e" },
      { label: "Time to fill", value: 24, color: "#3b82f6" },
      { label: "Offer accept %", value: 82, color: "#a855f7" },
    ],
  },
];

export const USE_CASES: UseCase[] = [
  {
    slug: "weekly-metrics-video",
    name: "Weekly metrics video",
    summary: "Turn weekly KPIs into a deterministic MP4 summary.",
    inputLabel: "Weekly KPIs",
  },
  {
    slug: "customer-report-video",
    name: "Customer report video",
    summary: "Automate customer-facing updates from structured data.",
    inputLabel: "Customer report data",
  },
  {
    slug: "onboarding-summary-video",
    name: "Onboarding summary video",
    summary: "Send progress videos after onboarding milestones.",
    inputLabel: "Onboarding milestones",
  },
  {
    slug: "audit-report-video",
    name: "Audit report video",
    summary: "Generate audit summaries immediately after reviews finish.",
    inputLabel: "Audit results",
  },
  {
    slug: "performance-recap-video",
    name: "Performance recap video",
    summary: "Ship quarterly or monthly performance recaps automatically.",
    inputLabel: "Performance metrics",
  },
];

export const TRIGGERS: TriggerEvent[] = [
  { slug: "weekly-report", name: "Weekly report", summary: "Create a recap whenever a weekly report is ready." },
  { slug: "audit-complete", name: "Audit complete", summary: "Generate an audit summary the moment the audit completes." },
  { slug: "campaign-ends", name: "Campaign ends", summary: "Publish a results video after each campaign finishes." },
  { slug: "onboarding-complete", name: "Onboarding complete", summary: "Send a video update once onboarding is done." },
  { slug: "trial-ended", name: "Trial ended", summary: "Summarize trial usage in a short video." },
  { slug: "invoice-paid", name: "Invoice paid", summary: "Attach a payment recap to every invoice event." },
  { slug: "goal-reached", name: "Goal reached", summary: "Celebrate milestones with a data-backed video." },
  { slug: "portfolio-rebalanced", name: "Portfolio rebalanced", summary: "Explain allocation changes right after rebalancing." },
  { slug: "listing-published", name: "Listing published", summary: "Ship listing highlights as soon as a property goes live." },
  { slug: "course-completed", name: "Course completed", summary: "Send a completion recap when learners finish." },
  { slug: "risk-detected", name: "Risk detected", summary: "Alert stakeholders with a risk summary video." },
  { slug: "anomaly-found", name: "Anomaly found", summary: "Explain anomalies with visuals for quick response." },
  { slug: "renewal-upcoming", name: "Renewal upcoming", summary: "Prepare renewal videos before the date arrives." },
  { slug: "feature-adoption", name: "Feature adoption", summary: "Show adoption progress once usage hits a threshold." },
  { slug: "compliance-review", name: "Compliance review", summary: "Provide a compliance update when reviews close." },
];

export const DATA_SOURCES: DataSource[] = [
  { slug: "postgres", name: "Postgres", summary: "Turn query results into branded video." },
  { slug: "mysql", name: "MySQL", summary: "Generate videos from MySQL metrics." },
  { slug: "stripe", name: "Stripe", summary: "Convert billing data into automated reports." },
  { slug: "google-analytics", name: "Google Analytics", summary: "Ship video recaps from GA metrics." },
  { slug: "mixpanel", name: "Mixpanel", summary: "Transform product analytics into a video summary." },
  { slug: "segment", name: "Segment", summary: "Render videos from warehouse events." },
  { slug: "snowflake", name: "Snowflake", summary: "Create videos from warehouse queries." },
  { slug: "bigquery", name: "BigQuery", summary: "Turn BigQuery results into reports." },
  { slug: "redshift", name: "Redshift", summary: "Generate branded videos from Redshift data." },
  { slug: "csv", name: "CSV", summary: "Upload CSV data and render videos on demand." },
  { slug: "webhook", name: "Webhook", summary: "Convert webhook payloads to video automatically." },
  { slug: "s3", name: "S3", summary: "Render videos from files stored in S3." },
  { slug: "salesforce", name: "Salesforce", summary: "Automate CRM report videos." },
  { slug: "hubspot", name: "HubSpot", summary: "Generate marketing updates from HubSpot data." },
  { slug: "zendesk", name: "Zendesk", summary: "Turn ticket metrics into video updates." },
  { slug: "jira", name: "Jira", summary: "Create sprint recap videos from Jira." },
  { slug: "github", name: "GitHub", summary: "Ship release videos from GitHub activity." },
  { slug: "slack", name: "Slack", summary: "Convert activity logs into quick summaries." },
  { slug: "intercom", name: "Intercom", summary: "Generate support summaries from Intercom." },
  { slug: "amplitude", name: "Amplitude", summary: "Render analytics summaries from Amplitude." },
];

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "loom-automated-video",
    name: "Loom recordings",
    summary: "Replace manual Loom recordings with automated videos.",
    replacedWorkflow: "Manual screen recordings",
  },
  {
    slug: "manual-video-report",
    name: "Manual video reports",
    summary: "Swap manual editing for deterministic JSON-based rendering.",
    replacedWorkflow: "Manual report editing",
  },
  {
    slug: "pdf-report-to-video",
    name: "PDF reports",
    summary: "Turn PDF reports into branded MP4 summaries.",
    replacedWorkflow: "Static PDF reporting",
  },
  {
    slug: "slides-to-video",
    name: "Slides exports",
    summary: "Stop exporting slides and render videos programmatically.",
    replacedWorkflow: "Manual slide decks",
  },
  {
    slug: "spreadsheet-to-video",
    name: "Spreadsheet exports",
    summary: "Generate videos directly from spreadsheet data.",
    replacedWorkflow: "CSV or spreadsheet exports",
  },
  {
    slug: "screen-recording-workflow",
    name: "Screen recording workflow",
    summary: "Replace screen recordings with API-driven videos.",
    replacedWorkflow: "Screen recording tools",
  },
];

export const ARCHITECTURE_DIAGRAM = `Data source / event
        ↓
Rendivia Render API
        ↓
Queue + Workers
        ↓
Remotion templates
        ↓
Branded MP4 + webhook`;

export function getUseCasePage(industrySlug: string, useCaseSlug: string) {
  const industry = INDUSTRIES.find((item) => item.slug === industrySlug);
  const useCase = USE_CASES.find((item) => item.slug === useCaseSlug);
  if (!industry || !useCase) return null;
  const title = `${industry.name} ${useCase.name}`;
  const description = `${useCase.summary} for ${industry.name} teams using structured data and a single API call.`;
  const jsonExample = JSON.stringify(
    {
      template: "weekly-summary-v1",
      data: {
        title: `${industry.name} ${useCase.name}`,
        metrics: industry.metrics,
      },
      brand: industry.slug,
    },
    null,
    2
  );
  return {
    title,
    description,
    inputLabel: `${industry.name} ${useCase.inputLabel}`,
    outputLabel: "Branded MP4 video",
    jsonExample,
  };
}

export function getUseCaseStaticParams() {
  return INDUSTRIES.flatMap((industry) =>
    USE_CASES.map((useCase) => ({
      industry: industry.slug,
      useCase: useCase.slug,
    }))
  );
}

export function getTriggerPage(eventSlug: string) {
  const event = TRIGGERS.find((item) => item.slug === eventSlug);
  if (!event) return null;
  const title = `When ${event.name.toLowerCase()}, generate video`;
  const description = `${event.summary} Trigger a deterministic video render via API.`;
  const jsonExample = JSON.stringify(
    {
      template: "weekly-summary-v1",
      data: {
        title: `${event.name} summary`,
        metrics: [
          { label: "Items processed", value: 128 },
          { label: "Success rate", value: 97.4 },
          { label: "Avg time", value: 42 },
        ],
      },
      brand: "acme",
    },
    null,
    2
  );
  return {
    title,
    description,
    inputLabel: `${event.name} payload`,
    outputLabel: "Branded MP4 video",
    jsonExample,
  };
}

export function getTriggerStaticParams() {
  return TRIGGERS.map((event) => ({ event: event.slug }));
}

export function getDataSourcePage(sourceSlug: string) {
  const source = DATA_SOURCES.find((item) => item.slug === sourceSlug);
  if (!source) return null;
  const title = `From ${source.name} to video`;
  const description = `${source.summary} Use Rendivia to turn ${source.name} data into branded MP4 output.`;
  const jsonExample = JSON.stringify(
    {
      template: "weekly-summary-v1",
      data: {
        title: `${source.name} metrics summary`,
        metrics: [
          { label: "Records", value: 12450 },
          { label: "Change", value: 12.4 },
          { label: "Alerts", value: 3 },
        ],
      },
      brand: "acme",
    },
    null,
    2
  );
  return {
    title,
    description,
    inputLabel: `${source.name} data`,
    outputLabel: "Branded MP4 video",
    jsonExample,
  };
}

export function getDataSourceStaticParams() {
  return DATA_SOURCES.map((source) => ({ source: source.slug }));
}

export function getAlternativePage(slug: string) {
  const alt = ALTERNATIVES.find((item) => item.slug === slug);
  if (!alt) return null;
  const title = `Replace ${alt.name} with an automated video API`;
  const description = `${alt.summary} Move from ${alt.replacedWorkflow} to JSON-driven video generation.`;
  const jsonExample = JSON.stringify(
    {
      template: "weekly-summary-v1",
      data: {
        title: "Automated report video",
        metrics: [
          { label: "Hours saved", value: 18 },
          { label: "Videos shipped", value: 42 },
          { label: "Consistency", value: 100 },
        ],
      },
      brand: "acme",
    },
    null,
    2
  );
  return {
    title,
    description,
    inputLabel: alt.replacedWorkflow,
    outputLabel: "Branded MP4 video",
    jsonExample,
  };
}

export function getAlternativeStaticParams() {
  return ALTERNATIVES.map((alt) => ({ slug: alt.slug }));
}
