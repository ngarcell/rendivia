import { z } from "zod";
import type { RenderBrand } from "@/lib/brand-profile";

export type TemplateResolution = {
  width: number;
  height: number;
  fps: number;
};

export interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface TemplateDefinition<TInput> {
  id: string;
  version: string;
  description: string;
  compositionId: string;
  schema: z.ZodType<TInput>;
  example: TInput;
  fields: TemplateField[];
  resolution: TemplateResolution;
  defaultDurationSeconds: number;
  buildProps: (input: TInput, brand: RenderBrand) => Record<string, unknown>;
}

const weeklySummarySchema = z.object({
  title: z.string().min(1),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.number(),
        color: z.string().optional(),
      })
    )
    .min(1),
  durationSeconds: z.number().min(6).max(60).optional(),
});

export type WeeklySummaryInput = z.infer<typeof weeklySummarySchema>;

const weeklySummaryTemplate: TemplateDefinition<WeeklySummaryInput> = {
  id: "weekly-summary-v1",
  version: "v1",
  description: "Metrics summary with animated bars and brand styling.",
  compositionId: "DataReportVideo",
  schema: weeklySummarySchema,
  example: {
    title: "Weekly Summary",
    metrics: [
      { label: "Revenue", value: 12450, color: "#22c55e" },
      { label: "Users", value: 342, color: "#3b82f6" },
      { label: "Growth", value: 12, color: "#a855f7" },
    ],
    durationSeconds: 15,
  },
  fields: [
    { name: "title", type: "string", required: true, description: "Video title" },
    { name: "metrics", type: "array", required: true, description: "Array of {label, value, color}" },
    { name: "durationSeconds", type: "number", required: false, description: "Optional length override" },
  ],
  resolution: { width: 1080, height: 1920, fps: 30 },
  defaultDurationSeconds: 15,
  buildProps: (input, brand) => {
    const durationSeconds = input.durationSeconds ?? 15;
    return {
      title: input.title,
      data: input.metrics.map((metric) => ({
        label: metric.label,
        value: metric.value,
        color: metric.color ?? brand.colors.accent,
      })),
      brand,
      durationSeconds,
    };
  },
};

const TEMPLATE_REGISTRY = [weeklySummaryTemplate] as const;

export type TemplateId = (typeof TEMPLATE_REGISTRY)[number]["id"];

export function listTemplates() {
  return TEMPLATE_REGISTRY.map((template) => ({
    id: template.id,
    version: template.version,
    description: template.description,
    example: template.example,
    fields: template.fields,
    resolution: template.resolution,
    defaultDurationSeconds: template.defaultDurationSeconds,
  }));
}

export function getTemplateDefinition(id: string) {
  return TEMPLATE_REGISTRY.find((template) => template.id === id) ?? null;
}

export function validateTemplateInput<TInput>(
  template: TemplateDefinition<TInput>,
  input: unknown
) {
  return template.schema.safeParse(input);
}
