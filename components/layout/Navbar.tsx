"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur",
        scrolled ? "shadow-sm" : "shadow-none"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="HAKI AI home"
          className="flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            HAKI AI
          </span>
        </Link>

        <NavigationMenu aria-label="Main navigation" className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href + link.label}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 focus:outline-none"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full px-5 py-2 shadow-sm hero-cta-primary">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-label="Mobile navigation menu">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link
                    href="/"
                    aria-label="HAKI AI home"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
                      <Scale className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      HAKI AI
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="mt-6 flex flex-col gap-1"
              >
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href + link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
