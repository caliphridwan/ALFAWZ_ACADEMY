import Link from "next/link";
import Image from "next/image";
import { BookOpenText } from "lucide-react";

export function Logo({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
      {logoUrl ? (
        // The uploaded logo is a flat JPG (no transparency), so whatever
        // background color sits around the mark in that file is baked in —
        // wrapping it as a circular badge with a ring/shadow turns that
        // edge into a deliberate frame instead of a stray box. Swap to
        // object-contain instead of object-cover if a future transparent
        // PNG/SVG logo replaces this and gets cropped oddly by the circle.
        <span className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden ring-1 ring-border shadow-sm">
          <Image src={logoUrl} alt="AlFawz Academy" fill className="object-cover" priority />
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground ring-1 ring-border shadow-sm">
          <BookOpenText size={18} />
        </span>
      )}
      <span>AlFawz Academy</span>
    </Link>
  );
}
