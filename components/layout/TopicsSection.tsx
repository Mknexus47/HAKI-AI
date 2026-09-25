import Link from "next/link";
import {
  Home,
  Briefcase,
  ShoppingCart,
  Banknote,
  Handshake,
  Megaphone,
  ChevronRight,
} from "lucide-react";

interface Topic {
  icon: typeof Home;
  title: string;
  href: string;
}

const topics: Topic[] = [
  { icon: Home, title: "Tenant & Landlord Rights", href: "/topics/tenant" },
  { icon: Briefcase, title: "Employment Basics", href: "/topics/employment" },
  { icon: ShoppingCart, title: "Consumer Rights", href: "/topics/consumer" },
  { icon: Banknote, title: "Debt Recovery", href: "/topics/debt" },
  {
    icon: Handshake,
    title: "Small Business Agreements",
    href: "/topics/business",
  },
  {
    icon: Megaphone,
    title: "Complaint Letters",
    href: "/topics/complaints",
  },
];

export default function TopicsSection() {
  return (
    <section
      id="topics"
      aria-labelledby="topics-heading"
      className="py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="topics-heading"
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Explore Legal Topics
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Start with the MVP categories. Each topic gives you plain-language
            information and suggests the right document to generate.
          </p>
          <Link
            href="/legal-quiz"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Test your legal knowledge — take the Legal Quiz
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.title}
                href={topic.href}
                className="card-gradient group flex items-center gap-4 rounded-xl border p-6 shadow-sm"
              >
                <span
                  className="icon-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-sm"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1 text-lg font-semibold text-slate-900">
                  {topic.title}
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
