import Link from "next/link";
import { Linkedin, Twitter } from "lucide-react";

const footerLinks = [
  { href: "/legal-aid", label: "Legal Aid Directory" },
  { href: "/dashboard", label: "My Dashboard" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/contact", label: "Contact Support" },
  { href: "/admin", label: "Admin Login" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold text-white">HAKI AI</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
              Legal information and document assistance platform for Kenya.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              aria-label="HAKI AI on LinkedIn"
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="#"
              aria-label="HAKI AI on Twitter / X"
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          © 2026 HAKI AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
