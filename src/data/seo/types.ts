export interface SeoFaq {
  question: string;
  answer: string;
}

export interface CompetitorEntry {
  slug: string;
  name: string;
  category: string;
  homepage: string;
  shortDescription: string;
  logoPath?: string;
  screenshots?: string[];
}

export interface FeatureRow {
  feature: string;
  rendivia: string;
  competitor: string;
  note?: string;
}

export interface ComparisonEntry {
  slug: string;
  title: string;
  primaryKeyword: string;
  summary: string;
  intro: string;
  competitor: CompetitorEntry;
  whyRendivia: string[];
  featureMatrix: FeatureRow[];
  pros: {
    rendivia: string[];
    competitor: string[];
  };
  cons: {
    rendivia: string[];
    competitor: string[];
  };
  pricingNote: string;
  useCases: {
    rendivia: string[];
    competitor: string[];
  };
  faqs: SeoFaq[];
  related: string[];
}

export interface ComparisonHubEntry {
  slug: string;
  title: string;
  summary: string;
  competitorName: string;
  category: string;
}
