import { Landmark, AlignLeft, Smartphone } from "lucide-react";

interface Reason {
  icon: typeof Landmark;
  title: string;
  description: string;
}

const reasons: Reason[] = [
  {
    icon: Landmark,
    title: "Kenyan Context",
    description:
      "Tailored specifically for the Kenyan legal framework (Constitution, Employment Act, etc.).",
  },
  {
    icon: AlignLeft,
    title: "Plain Language",
    description:
      "We break down complex legal jargon into simple steps you can actually follow.",
  },
  {
    icon: Smartphone,
    title: "Accessibility",
    description:
      "Available 24/7 on any device, from anywhere in Kenya.",
  },
];

export default function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="border-y border-slate-100 bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="why-heading"
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Why HAKI AI?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600">
            Built to earn your trust — accurate, understandable, and always
            within reach.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div key={reason.title} className="text-center">
                <div
                  className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  {reason.title}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
