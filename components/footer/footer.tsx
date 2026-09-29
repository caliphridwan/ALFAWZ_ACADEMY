import Link from "next/link";
import { BookOpenText, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

const PROGRAMS = [
  { label: "Beginners", href: "/courses/beginners-quran" },
  { label: "Tahfeez", href: "/courses/tahfeezul-quran" },
  { label: "Intermediate", href: "/courses/intermediate-tajweed" },
  { label: "Advanced", href: "/courses/advanced-studies" },
  { label: "Under-9", href: "/courses/under-9-program" },
  { label: "Diaspora", href: "/courses/diaspora-program" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-foreground">
      <div className="container py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-lg mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <BookOpenText size={18} />
            </span>
            AlFawz Academy
          </div>
          <p className="text-sm text-brand-foreground/70 max-w-xs">
            Making authentic Islamic education accessible to Muslims
            everywhere through structured, well-detailed, and engaging online
            classes.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-brand-foreground/70">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Courses", "/courses"],
              ["Sponsorship", "/sponsor"],
              ["Events", "/events"],
              ["Alumni", "/alumni"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Programs</h4>
          <ul className="space-y-2 text-sm text-brand-foreground/70">
            {PROGRAMS.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="hover:text-gold transition-colors">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-brand-foreground/70 mb-6">
            <li>
              <Link href="/sponsor" className="hover:text-gold transition-colors">
                Sponsor a Student
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold transition-colors">
                FAQs
              </Link>
            </li>
          </ul>
          <div className="flex gap-4">
            <Facebook size={18} className="opacity-70 hover:opacity-100 cursor-pointer" />
            <Instagram size={18} className="opacity-70 hover:opacity-100 cursor-pointer" />
            <Youtube size={18} className="opacity-70 hover:opacity-100 cursor-pointer" />
            <MessageCircle size={18} className="opacity-70 hover:opacity-100 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-t border-brand-foreground/10 py-6">
        <p className="container text-center text-xs text-brand-foreground/60">
          © {year} AlFawz Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
