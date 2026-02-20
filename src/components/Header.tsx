"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { trackEvent } from "@/lib/analytics";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/status", label: "Status" },
  { href: "/enterprise", label: "Contact" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden>
      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-200 ${
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1.5"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-200 ${
          open ? "opacity-0" : "top-1/2 -translate-y-1/2"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 bg-current transition-all duration-200 ${
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1.5"
        }`}
      />
    </span>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = menuPanelRef.current;
    const menuButton = menuButtonRef.current;
    if (!panel) return;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

    const focusable = getFocusable();
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButton?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const nodes = getFocusable();
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panel.contains(target)) return;
      if (menuButton?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) return;
    const previous = previousFocusRef.current;
    if (!previous) return;
    previousFocusRef.current = null;
    if (typeof previous.focus === "function") {
      previous.focus();
    }
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-[var(--surface)]/95 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/90">
      <div className="mx-auto flex h-16 min-h-[4rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="group inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-[var(--surface-muted)]"
          aria-label="Rendivia home"
        >
          <BrandLogo showTagline variant="modern" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="touch-target flex min-h-[44px] items-center py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
              onClick={() => {
                if (link.href === "/docs") {
                  trackEvent("cta_view_docs", { location: "header_nav" });
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <span className="touch-target hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 sm:inline-flex">
                Sign in
              </span>
            </SignInButton>
            <SignUpButton mode="modal">
              <span
                className="touch-target inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary-hover)]"
                onClick={() => trackEvent("cta_get_api_key", { location: "header_signup" })}
              >
                Get API key
              </span>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="touch-target inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-primary-hover)]"
              onClick={() => trackEvent("cta_get_api_key", { location: "header_dashboard" })}
            >
              Dashboard
            </Link>
            <div className="min-h-[44px] min-w-[44px]">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="touch-target -mr-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        ref={menuPanelRef}
        id="mobile-nav"
        className={`sm:hidden ${menuOpen ? "block" : "hidden"}`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="border-t border-zinc-200 bg-white px-4 py-4"
          aria-label="Main mobile"
        >
          <ul className="flex flex-col gap-0">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="touch-target flex min-h-[48px] items-center border-b border-zinc-100 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={() => {
                    if (link.href === "/docs") {
                      trackEvent("cta_view_docs", { location: "mobile_nav" });
                    }
                    setMenuOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
