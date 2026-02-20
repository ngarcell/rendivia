import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const heroSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  supportLine: z.string().min(1).optional(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
});

const problemSchema = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
});

const solutionSchema = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
});

const ioSchema = z.object({
  inputTitle: z.string().min(1),
  inputJsonExample: z.record(z.any()),
  outputTitle: z.string().min(1),
  outputBullets: z.array(z.string().min(1)).min(1),
});

const howItWorksSchema = z.object({
  title: z.string().min(1),
  steps: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(1),
});

const benefitsSchema = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
});

const faqSchema = z.array(
  z.object({
    q: z.string().min(1),
    a: z.string().min(1),
  })
);

const relatedSchema = z.array(
  z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
);

const ctaSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  primary: ctaSchema,
});

export const pseoPageSchema = z.object({
  type: z.enum(["use_case", "data_source", "trigger", "buyer_intent"]),
  version: z.literal(1),
  id: z.string().min(1),
  canonicalUrl: z.string().min(1),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  lastUpdated: z.string().min(1).optional(),
  cluster: z.string().min(1).optional(),
  intentSlug: z.string().min(1).optional(),
  hero: heroSchema,
  problem: problemSchema,
  solution: solutionSchema,
  io: ioSchema,
  howItWorks: howItWorksSchema,
  benefits: benefitsSchema,
  faq: faqSchema.optional(),
  related: relatedSchema,
  cta: ctaSectionSchema,
});

export type PseoPage = z.infer<typeof pseoPageSchema>;
