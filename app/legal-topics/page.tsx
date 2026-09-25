import Link from "next/link";
import {
  Home,
  Briefcase,
  ShoppingCart,
  Banknote,
  Handshake,
  Megaphone,
  Scale,
  Flag,
  ChevronRight,
} from "lucide-react";
import PageShell from "@/components/layout/PageShell";

interface Topic {
  icon: typeof Home;
  title: string;
  description: string;
  href: string;
}

const topics: Topic[] = [
  {
    icon: Home,
    title: "Tenant & Landlord Rights",
    description:
      "Tenancy agreements, deposits, rent, and the lawful eviction process.",
    href: "/topics/tenant",
  },
  {
    icon: Briefcase,
    title: "Employment Basics",
    description:
      "Contracts, pay, working conditions, and protection from unfair dismissal.",
    href: "/topics/employment",
  },
  {
    icon: ShoppingCart,
    title: "Consumer Rights",
    description:
      "What you are entitled to when buying goods and services in Kenya.",
    href: "/topics/consumer",
  },
  {
    icon: Banknote,
    title: "Debt Recovery",
    description:
      "Demand letters, repayment deadlines, and safe recovery steps.",
    href: "/topics/debt",
  },
  {
    icon: Handshake,
    title: "Small Business Agreements",
    description:
      "Simple service agreements for small businesses working together.",
    href: "/topics/business",
  },
  {
    icon: Megaphone,
    title: "Complaint Letters",
    description:
      "Clear, formal complaint letters that get responses.",
    href: "/topics/complaints",
  },
  {
    icon: Scale,
    title: "Access to Justice Basics",
    description:
      "Free and affordable pathways to justice when you need them.",
    href: "/topics/access-to-justice",
  },
  {
    icon: Flag,
    title: "Reporting a Dispute",
    description:
      "Where and how to formally report different types of disputes.",
    href: "/topics/reporting-dispute",
  },
];

export default function LegalTopicsPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Legal Topics
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        The MVP legal categories covered by HAKI AI. Each topic gives you
        plain-language information, practical steps, and suggestions for the
        right document to generate.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.title}
              href={topic.href}
              className="card-gradient group flex flex-col rounded-xl border p-6 shadow-sm"
            >
              <span
                className="icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-lg font-semibold text-slate-900">
                {topic.title}
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {topic.description}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">
                Read more
                <ChevronRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
