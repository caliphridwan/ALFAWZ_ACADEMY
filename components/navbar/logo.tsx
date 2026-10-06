import Link from "next/link";
import Image from "next/image";
import { BookOpenText } from "lucide-react";

export function Logo({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
      {logoUrl ? (
        <span className="relative h-9 w-9 shrink-0">
          <Image src={logoUrl} alt="AlFawz Academy" fill className="object-contain" priority />
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <BookOpenText size={18} />
        </span>
      )}
      <span>AlFawz Academy</span>
    </Link>
  );
}
