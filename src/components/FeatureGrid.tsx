interface Feature {
  title: string;
  description: string;
}

export default function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="surface-card p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900">{feature.title}</h3>
          <p className="mt-2 text-sm text-zinc-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
