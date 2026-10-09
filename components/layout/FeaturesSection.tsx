import { MessageSquare, FileText, ShieldCheck } from "lucide-react";

interface Feature {
  icon: typeof MessageSquare;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "AI Legal Assistant",
    description:
      "Ask questions about Kenyan law in plain English. Our AI uses curated legal information to give clear, easy-to-understand answers. Always verify with a licensed advocate.",
  },
  {
    icon: FileText,
    title: "Guided Document Generation",
    description:
      "Fill out simple, step-by-step forms to generate demand letters, rent acknowledgements, and service agreements.",
  },
  {
    icon: ShieldCheck,
    title: "Cloud-Secure & Private",
    description:
      "Built on Supabase. Your data is handled securely, and we prioritize your privacy at every step.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="features-heading"
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          >
            How It Works
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600">
            Two simple ways HAKI AI helps you — ask a legal question or
            generate a basic document.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card-gradient rounded-xl border p-8 shadow-sm"
              >
                <div className="icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
